# Lightbox Prop Distribution Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Distribute configuration props from the top-level `LightboxRoot` into their respective compound components, dissolve `LIGHTBOX_DEFAULT_PROPS`, and remove the `Lightbox` convenience wrapper.

**Architecture:** `LightboxRoot` is stripped to modal/portal/focus concerns. Each sub-component owns its own props and defaults. The context is trimmed to shared state + handlers only (carousel indices, counts, callbacks). Both `LightboxContent` and `LightboxOverlay` handle their own `<Transition>` wrappers using `opened`/`keepMounted` from context.

**Tech Stack:** React, Mantine Core (`factory`, `useProps`, `useStyles`, `OptionalPortal`, `RemoveScroll`, `Transition`), Embla Carousel

---

## Architectural Notes

Read these before implementing — they explain non-obvious decisions.

### Why `Lightbox.tsx` is kept (not deleted)

`Lightbox.context.ts` imports `LightboxFactory` from `./Lightbox.js`, and `LightboxRoot.tsx` imports `LightboxProvider` from `../Lightbox.context.js`. If `LightboxFactory` moved into `LightboxRoot.tsx`, the import chain would be circular. Keeping `Lightbox.tsx` as a types-only file (no component export) breaks the cycle cleanly.

### Why `opened` and `keepMounted` go into context

`LightboxContent` and `LightboxOverlay` each render their own `<Transition mounted={opened} keepMounted={keepMounted}>`. Without `opened`/`keepMounted` in context, these components would need to be passed them as props — which defeats the compound component pattern. The design doc's context interface omitted these but they are "shared state" by any reasonable definition.

### Why `<Transition>` moves out of `LightboxRoot`

The design wants `LightboxContent` to own `transitionProps`. For that API to actually control the animation, `LightboxContent` must be the one calling `<Transition {...transitionProps}>`. The overlay gets a hardcoded `transition="fade" duration={250}` — the overlay should always fade regardless of content transition.

### How `initialSlide` sync works without context

`LightboxRoot` initializes `currentIndex = 0`. `LightboxSlides` passes `initialSlide` as Embla's `startIndex`. In `handleSlidesCarouselInit`, the init handler calls `setCurrentIndex(api.selectedScrollSnap())` (new addition) — this syncs `currentIndex` to the actual Embla starting position immediately. On destroy, `currentIndex` resets to `0`.

### CSS variable `--lightbox-control-size`

The `.control` CSS class uses `var(--lightbox-control-size)`. Previously this was set on `.root` via the `varsResolver`. After removing the varsResolver, `LightboxControls` sets it as an inline style on each `ActionIcon` via `getStyles("control", { style: { "--lightbox-control-size": \`${size}px\` } })`.

### CSS variable `--lightbox-z-index`

Previously used on both `.root` and `.overlay`. After the refactor:
- `.root` (rendered by `LightboxContent`): changed to hardcoded `z-index: 200`
- `.overlay` (rendered by `LightboxOverlay`): Mantine's `Overlay` handles z-index natively via its `zIndex` prop → remove the CSS rule

---

## Task 1: CSS — Fix z-index, remove CSS variable dependencies

**Files:**
- Modify: `packages/lightbox/src/Lightbox.module.css`

**Step 1: Write the failing test**

Add a test that verifies a render doesn't explode and counter shows (smoke test — the real verification is visual, but the test ensures no runtime crash):

```typescript
// In Lightbox.test.tsx — no new test needed here; existing tests cover render
// This task is purely CSS. Run existing tests after to verify nothing broke.
```

**Step 2: Edit the CSS file**

In `Lightbox.module.css`, make these two changes:

```css
/* BEFORE: */
.root {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100dvw;
  color: var(--mantine-color-white);
  z-index: var(--lightbox-z-index);   /* ← change this */
}

.overlay {
  z-index: var(--lightbox-z-index);   /* ← remove this whole rule */
}
```

```css
/* AFTER: */
.root {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100dvw;
  color: var(--mantine-color-white);
  z-index: 200;
}

.overlay {
  /* z-index managed by Mantine Overlay's zIndex prop */
}
```

**Step 3: Run tests**

```bash
cd packages/lightbox && pnpm test
```

Expected: All existing tests pass (no runtime impact from this change).

---

## Task 2: Trim the context interface

**Files:**
- Modify: `packages/lightbox/src/Lightbox.context.ts`

**Step 1: Understand what changes**

Remove from context: `transitionStyles`, `overlayProps`, `slideCarouselProps`, `thumbnailCarouselProps`, `counterLabel`.

Add to context: `slideCount` (number | null), `opened` (boolean), `keepMounted` (boolean).

Remove imports: `OverlayProps`, `LightboxSlideCarouselProps`, `LightboxThumbnailCarouselProps`.
Remove import: `CSSProperties`.

**Step 2: Write the new `Lightbox.context.ts`**

Replace the entire file:

```typescript
import {
	createSafeContext,
	type GetStylesApi,
} from "@mantine/core";
import type { EmblaCarouselType } from "embla-carousel";
import type { LightboxFactory } from "./Lightbox.js";

export interface LightboxContext {
	getStyles: GetStylesApi<LightboxFactory>;
	mergedRef: (node: HTMLDivElement | null) => void;
	opened: boolean;
	keepMounted: boolean;
	currentIndex: number;
	slideCount: number | null;
	onSlidesCarouselInit: (embla: EmblaCarouselType) => void;
	onThumbnailsCarouselInit: (embla: EmblaCarouselType) => void;
	onClose: () => void;
	onOutsideClick: () => void;
	onThumbnailClick: (index: number) => void;
	onScrollPrev: () => void;
	onScrollNext: () => void;
}

export const [LightboxProvider, useLightboxContext] =
	createSafeContext<LightboxContext>(
		"Lightbox component was not found in the tree",
	);
```

**Step 3: Run type check (expect failures — dependencies not updated yet)**

```bash
cd packages/lightbox && pnpm tsc 2>&1 | head -50
```

Expected: TypeScript errors in `LightboxRoot.tsx`, `LightboxContent.tsx`, `LightboxOverlay.tsx`, `LightboxControls.tsx`, `LightboxCounter.tsx`. That's fine — we're refactoring incrementally.

---

## Task 3: Update `Lightbox.tsx` — dissolve old prop types, update `LightboxProps`

**Files:**
- Modify: `packages/lightbox/src/Lightbox.tsx`

**Step 1: Understand what changes**

`Lightbox.tsx` becomes types-only. Changes:
- **Remove types**: `LightboxModalProps`, `LightboxPortalProps`, `LightboxSlideCarouselProps`, `LightboxThumbnailCarouselProps`
- **Update `LightboxProps`**: flatten modal/portal props directly, remove carousel/overlay/transition props
- **Remove `LightboxCssVariables`** (no more CSS vars on root) — or keep it empty for backwards compat
- **Remove `LightboxFactory.vars`** (no varsResolver needed)
- **Remove the component**: `export const Lightbox = LightboxRoot` and all static member assignments
- **Remove imports**: sub-component imports, `classes` import

**Step 2: Write the new `Lightbox.tsx`**

```typescript
import type {
	BasePortalProps,
	BoxProps,
	ElementProps,
	Factory,
	StylesApiProps,
} from "@mantine/core";
import type { LightboxContent } from "./components/LightboxContent.js";
import type { LightboxControls } from "./components/LightboxControls.js";
import type { LightboxCounter } from "./components/LightboxCounter.js";
import type { LightboxOverlay } from "./components/LightboxOverlay.js";
import type { LightboxRoot } from "./components/LightboxRoot.js";
import type { LightboxSlide } from "./components/LightboxSlide.js";
import type { LightboxSlides } from "./components/LightboxSlides.js";
import type { LightboxThumbnail } from "./components/LightboxThumbnail.js";
import type { LightboxThumbnails } from "./components/LightboxThumbnails.js";
import type { LightboxToolbar } from "./components/LightboxToolbar.js";

export type LightboxStylesNames =
	| "root"
	| "overlay"
	| "slides"
	| "slidesViewport"
	| "slidesContainer"
	| "control"
	| "slide"
	| "toolbar"
	| "closeButton"
	| "counter"
	| "thumbnails"
	| "thumbnailsViewport"
	| "thumbnailsContainer"
	| "thumbnailSlide"
	| "thumbnailButton";

export interface LightboxProps
	extends BoxProps,
		StylesApiProps<LightboxFactory>,
		ElementProps<"div">,
		BasePortalProps {
	/** Whether the lightbox is open */
	opened: boolean;
	/** Called when the lightbox requests to close */
	onClose: () => void;
	/** Whether to close when clicking outside the content, `true` by default */
	closeOnClickOutside?: boolean;
	/** Whether to keep content mounted when closed, `false` by default */
	keepMounted?: boolean;
	/** Whether to trap focus while open, `true` by default */
	trapFocus?: boolean;
	/** Whether to return focus to the trigger on close, `true` by default */
	returnFocus?: boolean;
	/** Whether to lock page scroll while open, `true` by default */
	lockScroll?: boolean;
	/** Whether to render inside a portal, `true` by default */
	withinPortal?: boolean;
}

export type LightboxFactory = Factory<{
	props: LightboxProps;
	ref: HTMLDivElement;
	stylesNames: LightboxStylesNames;
	staticComponents: {
		Root: typeof LightboxRoot;
		Overlay: typeof LightboxOverlay;
		Content: typeof LightboxContent;
		Toolbar: typeof LightboxToolbar;
		Counter: typeof LightboxCounter;
		Controls: typeof LightboxControls;
		Slides: typeof LightboxSlides;
		Thumbnails: typeof LightboxThumbnails;
		Thumbnail: typeof LightboxThumbnail;
		Slide: typeof LightboxSlide;
	};
}>;
```

Note: All sub-component imports are `type`-only to avoid circular dependency issues (the implementations import from context which imports `LightboxFactory` from this file).

**Step 3: Run type check**

```bash
cd packages/lightbox && pnpm tsc 2>&1 | head -50
```

Expected: Errors in `index.ts` (exports removed types) and `LightboxRoot.tsx` (imports from `../Lightbox.js` still referencing old types). Will be fixed in subsequent tasks.

---

## Task 4: Refactor `LightboxRoot.tsx` — flatten props, update context

**Files:**
- Modify: `packages/lightbox/src/components/LightboxRoot.tsx`

**Step 1: Understand all changes**

1. Remove imports: `LIGHTBOX_DEFAULT_PROPS`, `createVarsResolver`, `Transition`, `OverlayProps`, `TransitionOverride`, `EmblaOptionsType`, `useMemo` (if no longer needed)
2. Add `Transition` removal — `LightboxRoot` no longer renders `<Transition>`
3. Flatten `modalProps`/`portalProps` into direct props from `LightboxProps`
4. Remove: `initialSlide`, `overlayProps`, `transitionProps`, `slideCarouselProps`, `thumbnailCarouselProps`
5. New `defaultProps`: flattened modal/portal defaults
6. Remove `varsResolver`
7. State: `currentIndex` starts at 0, `slideCount` is `number | null`
8. `handleSlidesCarouselInit`: add `setCurrentIndex(api.selectedScrollSnap())` in `handleCarouselInit`
9. `handleCarouselDestroy`: reset to 0 (not `initialSlide`)
10. Context now provides: `opened`, `keepMounted`, `slideCount` (new), removes dissolved fields

**Step 2: Write the new `LightboxRoot.tsx`**

```typescript
import {
	factory,
	OptionalPortal,
	RemoveScroll,
	useProps,
	useStyles,
} from "@mantine/core";
import {
	useFocusReturn,
	useFocusTrap,
	useHotkeys,
	useMergedRef,
} from "@mantine/hooks";
import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useRef, useState } from "react";
import { LightboxProvider } from "../Lightbox.context.js";
import type { LightboxFactory, LightboxProps } from "../Lightbox.js";
import classes from "../Lightbox.module.css";

const defaultProps: Partial<LightboxProps> = {
	closeOnClickOutside: true,
	keepMounted: false,
	trapFocus: true,
	lockScroll: true,
	returnFocus: true,
	withinPortal: true,
};

export const LightboxRoot = factory<LightboxFactory>((_props, ref) => {
	const props = useProps("Lightbox", defaultProps, _props);

	const {
		opened,
		onClose,
		classNames,
		className,
		style,
		styles,
		unstyled,
		vars,
		children,
		closeOnClickOutside,
		keepMounted,
		trapFocus,
		lockScroll,
		returnFocus,
		withinPortal,
		// BasePortalProps spread
		target,
		...others
	} = props;

	const getStyles = useStyles<LightboxFactory>({
		name: "Lightbox",
		classes,
		props,
		className,
		style,
		classNames,
		styles,
		unstyled,
		vars,
	});

	const focusTrapRef = useFocusTrap(opened && !!trapFocus);
	const mergedRef = useMergedRef(ref, focusTrapRef);
	useFocusReturn({ opened, shouldReturnFocus: !!returnFocus });

	const slidesEmblaRef = useRef<EmblaCarouselType | null>(null);
	const thumbnailsEmblaRef = useRef<EmblaCarouselType | null>(null);

	const [currentIndex, setCurrentIndex] = useState(0);
	const [slideCount, setSlideCount] = useState<number | null>(null);

	useHotkeys([
		["ArrowLeft", () => opened && slidesEmblaRef.current?.scrollPrev()],
		["ArrowRight", () => opened && slidesEmblaRef.current?.scrollNext()],
		["Escape", () => opened && onClose()],
	]);

	const handleSlidesCarouselInit = useCallback(
		(embla: EmblaCarouselType) => {
			slidesEmblaRef.current = embla;

			const handleCarouselInit = (api: EmblaCarouselType) => {
				setSlideCount(api.slideNodes().length);
				setCurrentIndex(api.selectedScrollSnap());
			};

			const handleSlideSelect = (api: EmblaCarouselType) => {
				setCurrentIndex(api.selectedScrollSnap());
				thumbnailsEmblaRef.current?.scrollTo(api.selectedScrollSnap());
			};

			const handleCarouselDestroy = () => {
				setCurrentIndex(0);
				setSlideCount(null);
				thumbnailsEmblaRef.current = null;
				slidesEmblaRef.current = null;
			};

			handleCarouselInit(embla);

			embla.on("select", handleSlideSelect);
			embla.on("destroy", handleCarouselDestroy);
		},
		[],
	);

	const handleThumbnailsCarouselInit = useCallback(
		(embla: EmblaCarouselType) => {
			thumbnailsEmblaRef.current = embla;
			embla.scrollTo(currentIndex);
		},
		[currentIndex],
	);

	const handleThumbnailClick = useCallback((index: number) => {
		slidesEmblaRef.current?.scrollTo(index);
	}, []);

	const handleScrollPrev = useCallback(() => {
		slidesEmblaRef.current?.scrollPrev();
	}, []);

	const handleScrollNext = useCallback(() => {
		slidesEmblaRef.current?.scrollNext();
	}, []);

	const handleOutsideClick = useCallback(() => {
		if (!closeOnClickOutside) {
			return;
		}
		onClose();
	}, [closeOnClickOutside, onClose]);

	return (
		<OptionalPortal withinPortal={withinPortal} target={target}>
			<RemoveScroll enabled={lockScroll && opened}>
				<LightboxProvider
					value={{
						getStyles,
						mergedRef,
						opened,
						keepMounted: keepMounted ?? false,
						currentIndex,
						slideCount,
						onSlidesCarouselInit: handleSlidesCarouselInit,
						onThumbnailsCarouselInit: handleThumbnailsCarouselInit,
						onClose,
						onOutsideClick: handleOutsideClick,
						onThumbnailClick: handleThumbnailClick,
						onScrollPrev: handleScrollPrev,
						onScrollNext: handleScrollNext,
					}}
				>
					{children}
				</LightboxProvider>
			</RemoveScroll>
		</OptionalPortal>
	);
});

LightboxRoot.displayName = "LightboxRoot";
LightboxRoot.classes = classes;
```

Note: `BasePortalProps` has many fields; the minimal spread above (just `target`) may need to be expanded. Check the actual `OptionalPortal` props signature and spread all `BasePortalProps` fields that it accepts. At minimum, `target` covers the common use case.

**Step 3: Run type check**

```bash
cd packages/lightbox && pnpm tsc 2>&1 | head -50
```

**Step 4: Run tests**

```bash
cd packages/lightbox && pnpm test 2>&1 | head -80
```

Expected: Many test failures because `LightboxContent`, `LightboxOverlay`, `LightboxControls`, `LightboxCounter` still reference dissolved context fields. That's expected — continue refactoring.

---

## Task 5: Refactor `LightboxContent.tsx` — add `transitionProps`, own `<Transition>`

**Files:**
- Modify: `packages/lightbox/src/components/LightboxContent.tsx`

**Step 1: Understand changes**

`LightboxContent` no longer reads `transitionStyles` from context (removed). It now:
1. Accepts `transitionProps?: TransitionOverride` prop
2. Uses `useProps` with `defaultProps`
3. Renders its own `<Transition mounted={ctx.opened} keepMounted={ctx.keepMounted} {...transitionProps}>`
4. Gets `transitionStyles` from the render prop
5. Reads `mergedRef` from context (unchanged)

**Step 2: Write the new `LightboxContent.tsx`**

```typescript
import { Box, type BoxProps, type ElementProps, Transition, type TransitionOverride, useProps } from "@mantine/core";
import type { ReactNode } from "react";
import { useLightboxContext } from "../Lightbox.context.js";

export interface LightboxContentProps extends BoxProps, ElementProps<"div"> {
	/** Transition applied to the content panel, `{ transition: 'fade', duration: 250 }` by default */
	transitionProps?: TransitionOverride;
	children?: ReactNode;
}

const defaultProps: Partial<LightboxContentProps> = {
	transitionProps: { transition: "fade", duration: 250 },
};

export function LightboxContent(_props: LightboxContentProps) {
	const { transitionProps, children, style, ...others } =
		useProps("LightboxContent", defaultProps, _props);

	const { opened, keepMounted, mergedRef, getStyles } = useLightboxContext();

	return (
		<Transition {...transitionProps} mounted={opened} keepMounted={keepMounted}>
			{(transitionStyles) => (
				<Box
					ref={mergedRef}
					{...getStyles("root", { style: [transitionStyles, style] })}
					{...others}
				>
					{children}
				</Box>
			)}
		</Transition>
	);
}
```

**Step 3: Run type check**

```bash
cd packages/lightbox && pnpm tsc 2>&1 | head -50
```


---

## Task 6: Refactor `LightboxOverlay.tsx` — own props, own `<Transition>`

**Files:**
- Modify: `packages/lightbox/src/components/LightboxOverlay.tsx`

**Step 1: Understand changes**

`LightboxOverlay` no longer reads `overlayProps`, `transitionStyles`, or `getStyles("overlay")` from context. It now:
1. Accepts `OverlayProps` directly as its own props
2. Uses `useProps` with `defaultProps` (backgroundOpacity 0.9, color #18181B, zIndex 200, fixed true)
3. Renders its own `<Transition mounted={ctx.opened} keepMounted={ctx.keepMounted} transition="fade" duration={250}>`
4. Still calls `getStyles("overlay")` for the styles API (classNames/styles/unstyled override support)

**Step 2: Write the new `LightboxOverlay.tsx`**

```typescript
import { Overlay, type OverlayProps, Transition, useProps } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";

export type LightboxOverlayProps = OverlayProps;

const defaultProps: Partial<LightboxOverlayProps> = {
	fixed: true,
	backgroundOpacity: 0.9,
	color: "#18181B",
	zIndex: 200,
};

export function LightboxOverlay(_props: LightboxOverlayProps) {
	const { className, style, ...overlayProps } = useProps(
		"LightboxOverlay",
		defaultProps,
		_props,
	);

	const { opened, keepMounted, getStyles } = useLightboxContext();

	return (
		<Transition
			transition="fade"
			duration={250}
			mounted={opened}
			keepMounted={keepMounted}
		>
			{(transitionStyles) => (
				<Overlay
					{...overlayProps}
					{...getStyles("overlay", {
						className,
						style: [transitionStyles, style],
					})}
				/>
			)}
		</Transition>
	);
}
```

**Step 3: Run type check**

```bash
cd packages/lightbox && pnpm tsc 2>&1 | head -50
```


---

## Task 7: Refactor `LightboxSlides.tsx` — add `initialSlide` and `emblaOptions`

**Files:**
- Modify: `packages/lightbox/src/components/LightboxSlides.tsx`

**Step 1: Understand changes**

`LightboxSlides` no longer reads `slideCarouselProps` from context. It:
1. Accepts `initialSlide?: number` and `emblaOptions?: EmblaOptionsType` as its own props
2. Uses `useProps` with `defaultProps: { initialSlide: 0 }`
3. Merges them: `{ ...emblaOptions, startIndex: initialSlide }` before passing to `useEmblaCarousel`
4. Reads `onSlidesCarouselInit` and `getStyles` from context (unchanged)

**Step 2: Write the new `LightboxSlides.tsx`**

```typescript
import { Box } from "@mantine/core";
import type { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { useLightboxContext } from "../Lightbox.context.js";
import { LightboxSlideProvider } from "./LightboxSlide.context.js";

export interface LightboxSlidesProps {
	/** Initial slide index, `0` by default */
	initialSlide?: number;
	/** Options passed directly to the Embla slide carousel */
	emblaOptions?: EmblaOptionsType;
	children?: ReactNode;
}

const defaultProps: Partial<LightboxSlidesProps> = {
	initialSlide: 0,
};

export function LightboxSlides(_props: LightboxSlidesProps) {
	const { initialSlide, emblaOptions, children } = {
		...defaultProps,
		..._props,
	};

	const { onSlidesCarouselInit, getStyles } = useLightboxContext();

	const mergedEmblaOptions: EmblaOptionsType = {
		...emblaOptions,
		startIndex: initialSlide,
	};

	const [emblaRef, emblaApi] = useEmblaCarousel(mergedEmblaOptions);

	useEffect(() => {
		if (emblaApi) {
			onSlidesCarouselInit(emblaApi);
		}
	}, [emblaApi, onSlidesCarouselInit]);

	return (
		<Box {...getStyles("slides")}>
			<Box ref={emblaRef} {...getStyles("slidesViewport")}>
				<Box {...getStyles("slidesContainer")}>
					{React.Children.map(children, (child, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: index is the semantic slide position
						<LightboxSlideProvider key={index} value={{ index }}>
							{child}
						</LightboxSlideProvider>
					))}
				</Box>
			</Box>
		</Box>
	);
}
```

Note: `LightboxSlides` is a plain function component (not using Mantine's `useProps`). Using `useProps` would require registering a theme component name. Instead, simple spread with `defaultProps` is sufficient here since `LightboxSlides` doesn't need theme customization via `theme.components`.

**Step 3: Run type check**

```bash
cd packages/lightbox && pnpm tsc 2>&1 | head -50
```


---

## Task 8: Refactor `LightboxThumbnails.tsx` — add `emblaOptions`

**Files:**
- Modify: `packages/lightbox/src/components/LightboxThumbnails.tsx`

**Step 1: Write the new `LightboxThumbnails.tsx`**

```typescript
import { Box } from "@mantine/core";
import type { EmblaOptionsType } from "embla-carousel";
import type { ReactNode } from "react";
import React from "react";
import { useThumbnails } from "../hooks/useThumbnails.js";
import { useLightboxContext } from "../Lightbox.context.js";
import { LightboxThumbnailProvider } from "./LightboxThumbnail.context.js";

export interface LightboxThumbnailsProps {
	/** Options passed directly to the Embla thumbnail carousel, `{ dragFree: true }` by default */
	emblaOptions?: EmblaOptionsType;
	children?: ReactNode;
}

const defaultProps: Partial<LightboxThumbnailsProps> = {
	emblaOptions: { dragFree: true },
};

export function LightboxThumbnails(_props: LightboxThumbnailsProps) {
	const { emblaOptions, children } = { ...defaultProps, ..._props };

	const { getStyles, onThumbnailsCarouselInit } = useLightboxContext();

	const { setViewportRef, containerRef, hasOverflow } = useThumbnails({
		emblaOptions,
		onEmblaApi: onThumbnailsCarouselInit,
	});

	return (
		<Box {...getStyles("thumbnails")}>
			<Box ref={setViewportRef} {...getStyles("thumbnailsViewport")}>
				<Box
					ref={containerRef}
					{...getStyles("thumbnailsContainer")}
					data-overflow={hasOverflow || undefined}
				>
					{React.Children.map(children, (child, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: index is the semantic thumbnail position
						<LightboxThumbnailProvider key={index} value={{ index }}>
							{child}
						</LightboxThumbnailProvider>
					))}
				</Box>
			</Box>
		</Box>
	);
}
```

**Step 2: Run type check**

```bash
cd packages/lightbox && pnpm tsc 2>&1 | head -50
```


---

## Task 9: Refactor `LightboxControls.tsx` — add `size`, drop context carousel dep

**Files:**
- Modify: `packages/lightbox/src/components/LightboxControls.tsx`

**Step 1: Understand the CSS variable**

The `.control` CSS class uses `var(--lightbox-control-size)` for `width` and `height`. Previously this was set on `.root` by the varsResolver. Now `LightboxControls` sets it inline via `getStyles("control", { style: { "--lightbox-control-size": \`${size}px\` } })`.

**Step 2: Write the new `LightboxControls.tsx`**

```typescript
import { ActionIcon } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";

export interface LightboxControlsProps {
	/** Size of the prev/next navigation buttons in px, `36` by default */
	size?: number;
}

const defaultProps: Partial<LightboxControlsProps> = {
	size: 36,
};

export function LightboxControls(_props: LightboxControlsProps) {
	const { size = defaultProps.size } = _props;

	const { onScrollPrev, onScrollNext, getStyles } = useLightboxContext();

	const controlSizeStyle = {
		"--lightbox-control-size": `${size}px`,
	} as React.CSSProperties;

	return (
		<>
			<ActionIcon
				{...getStyles("control", { style: controlSizeStyle })}
				data-direction="prev"
				aria-label="Previous slide"
				size={size}
				variant="default"
				onClick={onScrollPrev}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="60%"
					height="60%"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</ActionIcon>
			<ActionIcon
				{...getStyles("control", { style: controlSizeStyle })}
				data-direction="next"
				aria-label="Next slide"
				size={size}
				variant="default"
				onClick={onScrollNext}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="60%"
					height="60%"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</ActionIcon>
		</>
	);
}
```

Note: Add `import React from "react"` or `import type { CSSProperties } from "react"` at the top for the type cast. Since the project likely has React in scope via JSX transform, you may need `import type { CSSProperties } from "react"` and use `as CSSProperties` instead.

**Step 3: Run type check**

```bash
cd packages/lightbox && pnpm tsc 2>&1 | head -50
```


---

## Task 10: Refactor `LightboxCounter.tsx` — add `formatter`, compute label locally

**Files:**
- Modify: `packages/lightbox/src/components/LightboxCounter.tsx`

**Step 1: Understand changes**

`LightboxCounter` no longer reads `counterLabel` from context (removed). It reads `currentIndex` and `slideCount` from context and computes the label locally. It accepts an optional `formatter` prop.

**Step 2: Write the new `LightboxCounter.tsx`**

```typescript
import { Text } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";

export interface LightboxCounterProps {
	/** Custom formatter for the counter label, `(i, t) => \`${i + 1} / ${t}\`` by default */
	formatter?: (index: number, total: number) => string;
}

export function LightboxCounter({ formatter }: LightboxCounterProps) {
	const { currentIndex, slideCount, getStyles } = useLightboxContext();

	if (slideCount === null) {
		return null;
	}

	const label = formatter
		? formatter(currentIndex, slideCount)
		: `${currentIndex + 1} / ${slideCount}`;

	return (
		<Text size="sm" {...getStyles("counter")}>
			{label}
		</Text>
	);
}
```

**Step 3: Run type check**

```bash
cd packages/lightbox && pnpm tsc 2>&1 | head -50
```

Expected: Should be close to clean now. `Lightbox.defaults.ts` still referenced by old `LightboxRoot` (already fixed in task 4), `index.ts` still exports old types.


---

## Task 11: Delete `Lightbox.defaults.ts`, update `index.ts`

**Files:**
- Delete: `packages/lightbox/src/Lightbox.defaults.ts`
- Modify: `packages/lightbox/src/index.ts`

**Step 1: Delete `Lightbox.defaults.ts`**

```bash
rm packages/lightbox/src/Lightbox.defaults.ts
```

**Step 2: Write the new `index.ts`**

```typescript
export type {
	LightboxContentProps,
} from "./components/LightboxContent.js";
export { LightboxContent } from "./components/LightboxContent.js";
export type { LightboxControlsProps } from "./components/LightboxControls.js";
export { LightboxControls } from "./components/LightboxControls.js";
export type { LightboxCounterProps } from "./components/LightboxCounter.js";
export { LightboxCounter } from "./components/LightboxCounter.js";
export type { LightboxOverlayProps } from "./components/LightboxOverlay.js";
export { LightboxOverlay } from "./components/LightboxOverlay.js";
export { LightboxRoot } from "./components/LightboxRoot.js";
export type {
	LightboxSlideFactory,
	LightboxSlideProps,
	LightboxSlideStylesNames,
} from "./components/LightboxSlide.js";
export { LightboxSlide } from "./components/LightboxSlide.js";
export type { LightboxSlidesProps } from "./components/LightboxSlides.js";
export { LightboxSlides } from "./components/LightboxSlides.js";
export {
	LightboxThumbnail,
	type LightboxThumbnailProps,
} from "./components/LightboxThumbnail.js";
export type { LightboxThumbnailsProps } from "./components/LightboxThumbnails.js";
export { LightboxThumbnails } from "./components/LightboxThumbnails.js";
export { LightboxToolbar } from "./components/LightboxToolbar.js";
export type {
	LightboxFactory,
	LightboxProps,
	LightboxStylesNames,
} from "./Lightbox.js";
```

Note: The `Lightbox` compound object (with `.Root`, `.Overlay`, etc. as static members) still needs to exist for tests and stories. Check if `LightboxRoot` has these statics attached — if not, add them to `LightboxRoot.tsx` (see step 3).

**Step 3: Verify and attach compound statics to `LightboxRoot`**

At the bottom of `LightboxRoot.tsx`, after `LightboxRoot.displayName = "LightboxRoot"`, add:

```typescript
// These imports need to be added at the top of LightboxRoot.tsx:
import { LightboxContent } from "./LightboxContent.js";
import { LightboxControls } from "./LightboxControls.js";
import { LightboxCounter } from "./LightboxCounter.js";
import { LightboxOverlay } from "./LightboxOverlay.js";
import { LightboxSlide } from "./LightboxSlide.js";
import { LightboxSlides } from "./LightboxSlides.js";
import { LightboxThumbnail } from "./LightboxThumbnail.js";
import { LightboxThumbnails } from "./LightboxThumbnails.js";
import { LightboxToolbar } from "./LightboxToolbar.js";

// At the bottom:
LightboxRoot.Root = LightboxRoot;
LightboxRoot.Overlay = LightboxOverlay;
LightboxRoot.Content = LightboxContent;
LightboxRoot.Toolbar = LightboxToolbar;
LightboxRoot.Counter = LightboxCounter;
LightboxRoot.Controls = LightboxControls;
LightboxRoot.Slides = LightboxSlides;
LightboxRoot.Thumbnails = LightboxThumbnails;
LightboxRoot.Thumbnail = LightboxThumbnail;
LightboxRoot.Slide = LightboxSlide;
```

Then export it as `Lightbox` from `index.ts`:

```typescript
// Add to index.ts:
export { LightboxRoot as Lightbox } from "./components/LightboxRoot.js";
```

**Step 4: Run full type check**

```bash
cd packages/lightbox && pnpm tsc 2>&1
```

Expected: Clean or very close to clean.

---

## Task 12: Update `Lightbox.test.tsx` — migrate to new API

**Files:**
- Modify: `packages/lightbox/src/Lightbox.test.tsx`

**Step 1: Run tests to see what fails**

```bash
cd packages/lightbox && pnpm test 2>&1
```

**Step 2: Understand the API changes in tests**

| Old API | New API |
|---|---|
| `rootProps: { initialSlide: 2 }` | `slidesProps: { initialSlide: 2 }` |
| `rootProps: { modalProps: { keepMounted: true } }` | `rootProps: { keepMounted: true }` |
| `rootProps: { modalProps: { closeOnClickOutside: false } }` | `rootProps: { closeOnClickOutside: false }` |
| `rootProps: { overlayProps: { backgroundOpacity: 0.5 } }` | `overlayProps: { backgroundOpacity: 0.5 }` |
| `rootProps: { transitionProps: { duration: 0 } }` | `contentProps: { transitionProps: { duration: 0 } }` |
| `rootProps: { thumbnailCarouselProps: { emblaOptions: {...} } }` | `thumbnailsProps: { emblaOptions: {...} }` |
| `slideCarouselProps: { counterFormatter: fn }` on root | `counterProps: { formatter: fn }` |

**Step 3: Write the new `Lightbox.test.tsx`**

The `renderLightbox` helper needs new options. Rewrite it:

```typescript
import { render, screen } from "@mantine-tests/core";
import { fireEvent } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Lightbox, type LightboxProps } from "./index.js";
import type { LightboxContentProps } from "./components/LightboxContent.js";
import type { LightboxControlsProps } from "./components/LightboxControls.js";
import type { LightboxCounterProps } from "./components/LightboxCounter.js";
import type { LightboxOverlayProps } from "./components/LightboxOverlay.js";
import type { LightboxSlidesProps } from "./components/LightboxSlides.js";
import type { LightboxThumbnailsProps } from "./components/LightboxThumbnails.js";

const defaultRootProps: Omit<LightboxProps, "children"> = {
	opened: true,
	onClose: () => {},
};

const defaultSlides = [
	<Lightbox.Slide key="slide-1">
		<img src="/photo-1.jpg" alt="Forest landscape slide" />
	</Lightbox.Slide>,
	<Lightbox.Slide key="slide-2">
		<img src="/photo-2.jpg" alt="Mountain view slide" />
	</Lightbox.Slide>,
	<Lightbox.Slide key="slide-3">
		<img src="/photo-3.jpg" alt="Ocean sunset slide" />
	</Lightbox.Slide>,
];

const defaultThumbnails = [
	<Lightbox.Thumbnail key="thumbnail-1">
		<img src="/photo-1.jpg" alt="Forest landscape thumbnail" />
	</Lightbox.Thumbnail>,
	<Lightbox.Thumbnail key="thumbnail-2">
		<img src="/photo-2.jpg" alt="Mountain view thumbnail" />
	</Lightbox.Thumbnail>,
	<Lightbox.Thumbnail key="thumbnail-3">
		<img src="/photo-3.jpg" alt="Ocean sunset thumbnail" />
	</Lightbox.Thumbnail>,
];

interface RenderLightboxOptions {
	rootProps?: Partial<LightboxProps>;
	overlayProps?: Partial<LightboxOverlayProps>;
	contentProps?: Partial<LightboxContentProps>;
	slidesProps?: Partial<LightboxSlidesProps>;
	thumbnailsProps?: Partial<LightboxThumbnailsProps>;
	controlsProps?: Partial<LightboxControlsProps>;
	counterProps?: Partial<LightboxCounterProps>;
	slides?: ReactNode;
	thumbnails?: ReactNode;
	withToolbar?: boolean;
	withCounter?: boolean;
	withControls?: boolean;
	withThumbnails?: boolean;
}

function renderLightbox({
	rootProps,
	overlayProps,
	contentProps,
	slidesProps,
	thumbnailsProps,
	controlsProps,
	counterProps,
	slides = defaultSlides,
	thumbnails = defaultThumbnails,
	withToolbar = true,
	withCounter = true,
	withControls = true,
	withThumbnails = true,
}: RenderLightboxOptions = {}) {
	const mergedRootProps = { ...defaultRootProps, ...rootProps };

	return render(
		<Lightbox.Root {...mergedRootProps}>
			<Lightbox.Overlay {...overlayProps} />
			<Lightbox.Content {...contentProps}>
				{withToolbar && <Lightbox.Toolbar />}
				{withCounter && <Lightbox.Counter {...counterProps} />}
				<Lightbox.Slides {...slidesProps}>{slides}</Lightbox.Slides>
				{withControls && <Lightbox.Controls {...controlsProps} />}
				{withThumbnails && (
					<Lightbox.Thumbnails {...thumbnailsProps}>{thumbnails}</Lightbox.Thumbnails>
				)}
			</Lightbox.Content>
		</Lightbox.Root>,
	);
}

describe("@mantine-bites/lightbox/Lightbox compound API", () => {
	it("should expose compound static members", () => {
		expect(Lightbox.Root).toBeDefined();
		expect(Lightbox.Overlay).toBeDefined();
		expect(Lightbox.Content).toBeDefined();
		expect(Lightbox.Toolbar).toBeDefined();
		expect(Lightbox.Counter).toBeDefined();
		expect(Lightbox.Controls).toBeDefined();
		expect(Lightbox.Slides).toBeDefined();
		expect(Lightbox.Thumbnails).toBeDefined();
		expect(Lightbox.Thumbnail).toBeDefined();
		expect(Lightbox.Slide).toBeDefined();
	});

	it("should have static classes and extend function", () => {
		expect(Lightbox.classes).toBeDefined();
		expect(Lightbox.extend).toBeDefined();
	});

	it("should not render content when closed", () => {
		renderLightbox({ rootProps: { opened: false } });
		expect(screen.queryByLabelText("Close lightbox")).not.toBeInTheDocument();
	});

	it("should keep slide content mounted when keepMounted is true", () => {
		renderLightbox({
			rootProps: { opened: false, keepMounted: true },
		});
		expect(screen.getByAltText("Forest landscape slide")).toBeInTheDocument();
	});

	it("should allow composition to hide counter", () => {
		renderLightbox({ withCounter: false });
		expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
	});

	it("should allow composition to hide thumbnails", () => {
		renderLightbox({ withThumbnails: false });
		expect(screen.queryByLabelText("Go to slide 1")).not.toBeInTheDocument();
	});

	it("should call onClose when close button is clicked", async () => {
		const onClose = jest.fn();
		renderLightbox({ rootProps: { onClose } });
		await userEvent.click(screen.getByLabelText("Close lightbox"));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("should respect closeOnClickOutside=false", () => {
		const onClose = jest.fn();
		renderLightbox({
			rootProps: { onClose, closeOnClickOutside: false },
		});
		const image = screen.getByAltText("Forest landscape slide");
		const activeSlide = image.closest("[aria-current='true']");
		if (!activeSlide) return;
		fireEvent.pointerDown(activeSlide, { pointerId: 1, clientX: 24, clientY: 24 });
		fireEvent.pointerUp(activeSlide, { pointerId: 1, clientX: 24, clientY: 24 });
		expect(onClose).not.toHaveBeenCalled();
	});

	it("should call onClose when Escape is pressed", async () => {
		const onClose = jest.fn();
		renderLightbox({ rootProps: { onClose } });
		await userEvent.keyboard("{Escape}");
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("should render at initialSlide position", async () => {
		renderLightbox({ slidesProps: { initialSlide: 2 } });
		expect(await screen.findByText("3 / 3")).toBeInTheDocument();
		expect(await screen.findByLabelText("Go to slide 3")).toHaveAttribute(
			"aria-current",
			"true",
		);
	});

	it("should reset current index when closed and reopened", () => {
		const { rerender } = renderLightbox({
			rootProps: { opened: true },
			slidesProps: { initialSlide: 1 },
		});
		expect(screen.getByText("2 / 3")).toBeInTheDocument();

		rerender(
			<Lightbox.Root {...defaultRootProps} opened={false}>
				<Lightbox.Overlay />
				<Lightbox.Content>
					<Lightbox.Toolbar />
					<Lightbox.Counter />
					<Lightbox.Slides initialSlide={0}>{defaultSlides}</Lightbox.Slides>
					<Lightbox.Thumbnails />
				</Lightbox.Content>
			</Lightbox.Root>,
		);

		rerender(
			<Lightbox.Root {...defaultRootProps} opened>
				<Lightbox.Overlay />
				<Lightbox.Content>
					<Lightbox.Toolbar />
					<Lightbox.Counter />
					<Lightbox.Slides initialSlide={0}>{defaultSlides}</Lightbox.Slides>
					<Lightbox.Thumbnails />
				</Lightbox.Content>
			</Lightbox.Root>,
		);
		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should accept overlayProps", () => {
		renderLightbox({ overlayProps: { backgroundOpacity: 0.5 } });
		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should accept transitionProps on content", () => {
		renderLightbox({ contentProps: { transitionProps: { duration: 0 } } });
		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should accept emblaOptions on thumbnails", () => {
		renderLightbox({
			thumbnailsProps: {
				emblaOptions: { dragFree: false, containScroll: "keepSnaps" },
			},
		});
		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("should render prev and next controls", () => {
		renderLightbox();
		expect(screen.getByLabelText("Previous slide")).toBeInTheDocument();
		expect(screen.getByLabelText("Next slide")).toBeInTheDocument();
	});

	it("should allow composition to hide controls", () => {
		renderLightbox({ withControls: false });
		expect(screen.queryByLabelText("Previous slide")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Next slide")).not.toBeInTheDocument();
	});

	it("should accept custom counter formatter", () => {
		renderLightbox({
			counterProps: { formatter: (i, t) => `Image ${i + 1} of ${t}` },
		});
		expect(screen.getByText("Image 1 of 3")).toBeInTheDocument();
	});
});
```

**Step 4: Run tests**

```bash
cd packages/lightbox && pnpm test 2>&1
```

Expected: All tests pass.

---

## Task 13: Update `Lightbox.story.tsx` — migrate to new API

**Files:**
- Modify: `packages/lightbox/src/Lightbox.story.tsx`

**Step 1: Update the stories**

The `DemoLightbox` wrapper currently passes `LightboxProps` to `Lightbox.Root`. After the refactor, props like `initialSlide`, `slideCarouselProps`, and `thumbnailCarouselProps` no longer exist on root.

Update `DemoLightbox` to a plain structural wrapper (no prop passthrough for dissolved props):

```typescript
import { Box, Button, Center, Image, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	type ImgHTMLAttributes,
	type PropsWithChildren,
	type SyntheticEvent,
	useState,
} from "react";
import { Lightbox } from "./index.js";

export default { title: "Lightbox" };

const sampleImages = [
	{ src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
	{ src: "https://picsum.photos/id/20/1200/800", alt: "Bird" },
	{ src: "https://picsum.photos/id/30/2400/1600", alt: "Plant" },
	{ src: "https://picsum.photos/id/40/1200/800", alt: "Leaves" },
	{ src: "https://picsum.photos/id/50/2400/1600", alt: "Desk" },
];

const Container = (props: PropsWithChildren) => (
	<Box p={40}>{props.children}</Box>
);

interface ImgWithLoaderProps extends ImgHTMLAttributes<HTMLImageElement> {
	type?: "default" | "thumbnail";
}

const ImgWithLoader = (props: ImgWithLoaderProps) => {
	const { type = "default", src, alt, style, onLoad, onError, ...rest } = props;
	const [loading, setLoading] = useState(true);

	const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
		setLoading(false);
		onLoad?.(e);
	};
	const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
		setLoading(false);
		onError?.(e);
	};

	return (
		<>
			{loading && (
				<Center pos="absolute" inset={0}>
					<Loader size={type === "thumbnail" ? 18 : 36} />
				</Center>
			)}
			<Image
				{...rest}
				src={src}
				fallbackSrc="https://placehold.co/1200x800?text=Error"
				alt={alt}
				onLoad={handleLoad}
				onError={handleError}
				opacity={loading ? 0 : 1}
				style={{ transition: "opacity 120ms linear", ...style }}
			/>
		</>
	);
};

const thumbnails = sampleImages.map((img) => (
	<Lightbox.Thumbnail key={img.src}>
		<ImgWithLoader src={img.src} alt={img.alt} type="thumbnail" />
	</Lightbox.Thumbnail>
));

const slides = sampleImages.map((img) => (
	<Lightbox.Slide key={img.src}>
		<ImgWithLoader src={img.src} alt={img.alt} />
	</Lightbox.Slide>
));

export const Default = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>
			<Lightbox.Root opened={opened} onClose={close}>
				<Lightbox.Overlay />
				<Lightbox.Content>
					<Lightbox.Toolbar />
					<Lightbox.Counter />
					<Lightbox.Slides initialSlide={1}>{slides}</Lightbox.Slides>
					<Lightbox.Controls />
					<Lightbox.Thumbnails>{thumbnails}</Lightbox.Thumbnails>
				</Lightbox.Content>
			</Lightbox.Root>
		</Container>
	);
};

export const WithLoop = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>
			<Lightbox.Root opened={opened} onClose={close}>
				<Lightbox.Overlay />
				<Lightbox.Content>
					<Lightbox.Toolbar />
					<Lightbox.Counter />
					<Lightbox.Slides emblaOptions={{ loop: true }}>{slides}</Lightbox.Slides>
					<Lightbox.Controls />
					<Lightbox.Thumbnails>{thumbnails}</Lightbox.Thumbnails>
				</Lightbox.Content>
			</Lightbox.Root>
		</Container>
	);
};

export const WithCustomCounter = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>
			<Lightbox.Root opened={opened} onClose={close}>
				<Lightbox.Overlay />
				<Lightbox.Content>
					<Lightbox.Toolbar />
					<Lightbox.Counter formatter={(i, t) => `Image ${i + 1} of ${t}`} />
					<Lightbox.Slides>{slides}</Lightbox.Slides>
					<Lightbox.Controls />
					<Lightbox.Thumbnails>{thumbnails}</Lightbox.Thumbnails>
				</Lightbox.Content>
			</Lightbox.Root>
		</Container>
	);
};

export const WithSlideTransition = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>
			<Lightbox.Root opened={opened} onClose={close}>
				<Lightbox.Overlay />
				<Lightbox.Content transitionProps={{ transition: "slide-up", duration: 300 }}>
					<Lightbox.Toolbar />
					<Lightbox.Counter />
					<Lightbox.Slides>{slides}</Lightbox.Slides>
					<Lightbox.Controls />
					<Lightbox.Thumbnails>{thumbnails}</Lightbox.Thumbnails>
				</Lightbox.Content>
			</Lightbox.Root>
		</Container>
	);
};
```

**Step 2: Run lint**

```bash
cd packages/lightbox && pnpm lint 2>&1
```

Fix any Biome lint errors.

**Step 3: Run full test suite and type check**

```bash
cd packages/lightbox && pnpm test && pnpm tsc && pnpm lint
```

Expected: All green.

---

## Task 14: Final verification

**Step 1: Run all checks from root**

```bash
pnpm test --filter @mantine-bites/lightbox
pnpm tsc --filter @mantine-bites/lightbox
pnpm lint --filter @mantine-bites/lightbox
```

Expected: All pass.

**Step 2: Build the package**

```bash
pnpm build --filter @mantine-bites/lightbox
```

Expected: Clean build with no errors.

**Step 3: Run Storybook dev to visually verify**

```bash
pnpm dev:storybook
```

Check: Default, WithLoop, WithCustomCounter, and WithSlideTransition stories all work. Overlay and content animate on open/close. Counter shows correct index. Thumbnails highlight active slide.

---

## Checklist

- [ ] CSS z-index hardcoded, overlay CSS rule removed
- [ ] Context trimmed: removed `transitionStyles`, `overlayProps`, `slideCarouselProps`, `thumbnailCarouselProps`, `counterLabel`; added `opened`, `keepMounted`, `slideCount`
- [ ] `Lightbox.tsx` updated: old prop interfaces removed, `LightboxProps` flattened
- [ ] `Lightbox.defaults.ts` deleted
- [ ] `LightboxRoot` flattened props, no varsResolver, provides `opened`/`keepMounted`/`slideCount` to context
- [ ] `LightboxContent` owns `transitionProps`, renders own `<Transition>`
- [ ] `LightboxOverlay` owns `OverlayProps`, renders own `<Transition transition="fade">`
- [ ] `LightboxSlides` owns `initialSlide` + `emblaOptions`
- [ ] `LightboxThumbnails` owns `emblaOptions`
- [ ] `LightboxControls` owns `size`, sets `--lightbox-control-size` inline
- [ ] `LightboxCounter` owns `formatter`, computes label locally
- [ ] `index.ts` updated with new exports, `Lightbox` alias exported
- [ ] `LightboxRoot` has all compound statics attached
- [ ] Tests updated and passing
- [ ] Stories updated and working
- [ ] `pnpm tsc`, `pnpm lint`, `pnpm test`, `pnpm build` all clean

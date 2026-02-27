# Inline Slides Carousel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the `@mantine/carousel` dependency from `@mantine-bites/lightbox` by replacing the slides carousel with a direct Embla implementation, consistent with how the thumbnail carousel is already built.

**Architecture:** `LightboxSlides` is rewritten to use `useEmblaCarousel` directly (no wrapper). The component renders the Embla viewport/container structure, plus inline prev/next `ActionIcon` controls. `LightboxSlide` switches from `Carousel.Slide` to a plain `Box`. All new elements are wired into the styles API (`getStyles`). Breaking changes: `LightboxCarouselOptions` becomes `EmblaOptionsType`, `controlSize` moves to a top-level prop, and selector names `carouselSlides`/`carouselSlide` are renamed to `slides`/`slide`.

**Tech Stack:** `embla-carousel-react` (already a peer dep), `@mantine/core` (`ActionIcon`, `Box`), inline SVG for chevron icons.

---

### Task 1: Update type definitions in `Lightbox.tsx`

**Files:**
- Modify: `packages/lightbox/src/Lightbox.tsx`

This is the single source of truth for the public API surface. We update types here first so subsequent tasks have correct types to reference.

**Step 1: Open the file and make all changes at once**

Replace the entire file with:

```tsx
import type {
  BasePortalProps,
  BoxProps,
  ElementProps,
  Factory,
  OverlayProps,
  StylesApiProps,
  TransitionOverride,
} from "@mantine/core";
import type { EmblaOptionsType } from "embla-carousel";
import { LightboxContent } from "./components/LightboxContent.js";
import { LightboxCounter } from "./components/LightboxCounter.js";
import { LightboxOverlay } from "./components/LightboxOverlay.js";
import { LightboxRoot } from "./components/LightboxRoot.js";
import { LightboxSlide } from "./components/LightboxSlide.js";
import { LightboxSlides } from "./components/LightboxSlides.js";
import { LightboxThumbnail } from "./components/LightboxThumbnail.js";
import { LightboxThumbnails } from "./components/LightboxThumbnails.js";
import { LightboxToolbar } from "./components/LightboxToolbar.js";
import classes from "./Lightbox.module.css";

export type LightboxCssVariables = {
  root: "--lightbox-z-index" | "--lightbox-control-size";
  overlay: "--lightbox-z-index" | "--overlay-z-index";
};

export type LightboxStylesNames =
  | "root"
  | "overlay"
  | "slides"
  | "slidesViewport"
  | "slidesContainer"
  | "slidesControl"
  | "slide"
  | "toolbar"
  | "closeButton"
  | "counter"
  | "thumbnails"
  | "thumbnailsViewport"
  | "thumbnailsContainer"
  | "thumbnailSlide"
  | "thumbnailButton";

// Breaking change: was Omit<CarouselProps, "withKeyboardEvents" | "withIndicators">
export type LightboxCarouselOptions = EmblaOptionsType;

export type LightboxThumbnailCarouselOptions = EmblaOptionsType;

export interface LightboxProps
  extends BoxProps,
    StylesApiProps<LightboxFactory>,
    ElementProps<"div"> {
  opened: boolean;
  onClose: () => void;
  keepMounted?: boolean;
  closeOnClickOutside?: boolean;
  trapFocus?: boolean;
  returnFocus?: boolean;
  lockScroll?: boolean;
  initialSlide?: number;
  /** Size of the prev/next navigation buttons in px, `36` by default */
  controlSize?: number;
  counterFormatter?: (index: number, total: number) => string;
  carouselOptions?: LightboxCarouselOptions;
  thumbnailCarouselOptions?: LightboxThumbnailCarouselOptions;
  overlayProps?: OverlayProps;
  transitionProps?: TransitionOverride;
  withinPortal?: boolean;
  portalProps?: BasePortalProps;
}

export type LightboxFactory = Factory<{
  props: LightboxProps;
  ref: HTMLDivElement;
  stylesNames: LightboxStylesNames;
  vars: LightboxCssVariables;
  staticComponents: {
    Root: typeof LightboxRoot;
    Overlay: typeof LightboxOverlay;
    Content: typeof LightboxContent;
    Toolbar: typeof LightboxToolbar;
    Counter: typeof LightboxCounter;
    Slides: typeof LightboxSlides;
    Thumbnails: typeof LightboxThumbnails;
    Thumbnail: typeof LightboxThumbnail;
    Slide: typeof LightboxSlide;
  };
}>;

export const Lightbox = LightboxRoot;

Lightbox.displayName = "Lightbox";

Lightbox.classes = classes;

Lightbox.Root = LightboxRoot;
Lightbox.Overlay = LightboxOverlay;
Lightbox.Content = LightboxContent;
Lightbox.Toolbar = LightboxToolbar;
Lightbox.Counter = LightboxCounter;
Lightbox.Slides = LightboxSlides;
Lightbox.Thumbnails = LightboxThumbnails;
Lightbox.Thumbnail = LightboxThumbnail;
Lightbox.Slide = LightboxSlide;
```

**Step 2: Run type check to confirm this file is internally consistent**

```bash
cd /path/to/repo && pnpm tsc --filter @mantine-bites/lightbox 2>&1 | head -40
```

Expected: errors only in files we haven't updated yet (not in `Lightbox.tsx` itself).

---

### Task 2: Update `Lightbox.context.ts`

**Files:**
- Modify: `packages/lightbox/src/Lightbox.context.ts`

Remove the `CarouselProps` import and update the context shape to match the new types.

**Step 1: Replace the file**

```typescript
import {
  createSafeContext,
  type GetStylesApi,
  type OverlayProps,
} from "@mantine/core";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import type { CSSProperties } from "react";
import type { LightboxFactory } from "./Lightbox.js";

export interface LightboxContext {
  getStyles: GetStylesApi<LightboxFactory>;
  transitionStyles: CSSProperties;
  overlayProps: OverlayProps;
  mergedRef: (node: HTMLDivElement | null) => void;
  carouselOptions: EmblaOptionsType | undefined;
  controlSize: number;
  onSlidesCarouselInit: (embla: EmblaCarouselType) => void;
  // Slides
  currentIndex: number;
  // Counter
  counterLabel: string | null;
  // Thumbnails
  thumbnailsCarouselOptions: EmblaOptionsType | undefined;
  onThumbnailsCarouselInit: (embla: EmblaCarouselType) => void;
  // Handlers
  onClose: () => void;
  onOutsideClick: () => void;
  onThumbnailClick: (index: number) => void;
}

export const [LightboxProvider, useLightboxContext] =
  createSafeContext<LightboxContext>(
    "Lightbox component was not found in the tree",
  );
```

---

### Task 3: Update `Lightbox.defaults.ts`

**Files:**
- Modify: `packages/lightbox/src/Lightbox.defaults.ts`

Move `controlSize` out of `carouselOptions` and make it a top-level default.

**Step 1: Replace the file**

```typescript
export const LIGHTBOX_DEFAULT_PROPS = {
  closeOnClickOutside: true,
  keepMounted: false,
  trapFocus: true,
  lockScroll: true,
  returnFocus: true,
  withinPortal: true,
  controlSize: 36,
  carouselOptions: {},
  thumbnailCarouselOptions: {
    dragFree: true,
  },
  overlayProps: {
    fixed: true,
    backgroundOpacity: 0.9,
    color: "#18181B",
    zIndex: 200,
  },
  transitionProps: {
    transition: "fade",
    duration: 250,
  },
} as const;
```

---

### Task 4: Update `LightboxRoot.tsx`

**Files:**
- Modify: `packages/lightbox/src/components/LightboxRoot.tsx`

Three changes:
1. Add `controlSize` prop and CSS variable resolver
2. Map `initialSlide` → Embla's `startIndex` in `mergedCarouselOptions`
3. Remove the `mergedCarouselOptions.getEmblaApi?.()` call (that was a Mantine Carousel-specific hook; Embla doesn't have it)
4. Pass `controlSize` through context

**Step 1: Replace the file**

```typescript
import {
  createVarsResolver,
  factory,
  OptionalPortal,
  RemoveScroll,
  Transition,
  useProps,
  useStyles,
} from "@mantine/core";
import {
  useFocusReturn,
  useFocusTrap,
  useHotkeys,
  useMergedRef,
} from "@mantine/hooks";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { useCallback, useMemo, useRef, useState } from "react";
import { LightboxProvider } from "../Lightbox.context.js";
import { LIGHTBOX_DEFAULT_PROPS } from "../Lightbox.defaults.js";
import type { LightboxFactory, LightboxProps } from "../Lightbox.js";
import classes from "../Lightbox.module.css";

const defaultProps: Partial<LightboxProps> = LIGHTBOX_DEFAULT_PROPS;

const varsResolver = createVarsResolver<LightboxFactory>(
  (_, { overlayProps, controlSize }) => ({
    root: {
      "--lightbox-z-index": String(
        overlayProps?.zIndex ?? LIGHTBOX_DEFAULT_PROPS.overlayProps.zIndex,
      ),
      "--lightbox-control-size": `${controlSize ?? LIGHTBOX_DEFAULT_PROPS.controlSize}px`,
    },
    overlay: {
      "--lightbox-z-index": String(
        overlayProps?.zIndex ?? LIGHTBOX_DEFAULT_PROPS.overlayProps.zIndex,
      ),
      "--overlay-z-index": "var(--lightbox-z-index)",
    },
  }),
);

export const LightboxRoot = factory<LightboxFactory>((_props, ref) => {
  const props = useProps("Lightbox", defaultProps, _props);

  const {
    opened,
    onClose,
    closeOnClickOutside,
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    children,
    initialSlide,
    controlSize,
    counterFormatter,
    carouselOptions,
    thumbnailCarouselOptions,
    overlayProps,
    transitionProps,
    keepMounted,
    trapFocus,
    lockScroll,
    returnFocus,
    withinPortal,
    portalProps,
  } = props;

  const getStyles = useStyles<LightboxFactory>({
    name: "Lightbox",
    classes,
    props,
    varsResolver,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
  });

  const mergedOverlayProps = {
    ...LIGHTBOX_DEFAULT_PROPS.overlayProps,
    ...overlayProps,
  };

  const mergedTransitionProps = {
    ...LIGHTBOX_DEFAULT_PROPS.transitionProps,
    ...transitionProps,
  };

  const mergedCarouselOptions = useMemo<EmblaOptionsType>(
    () => ({
      ...LIGHTBOX_DEFAULT_PROPS.carouselOptions,
      ...carouselOptions,
      startIndex: initialSlide,
    }),
    [carouselOptions, initialSlide],
  );

  const mergedThumbnailCarouselOptions = useMemo(
    () => ({
      ...LIGHTBOX_DEFAULT_PROPS.thumbnailCarouselOptions,
      ...thumbnailCarouselOptions,
    }),
    [thumbnailCarouselOptions],
  );

  const mergedControlSize =
    controlSize ?? LIGHTBOX_DEFAULT_PROPS.controlSize;

  const shouldTrapFocus = trapFocus ?? LIGHTBOX_DEFAULT_PROPS.trapFocus;
  const shouldReturnFocus = returnFocus ?? LIGHTBOX_DEFAULT_PROPS.returnFocus;
  const shouldCloseOnClickOutside =
    closeOnClickOutside ?? LIGHTBOX_DEFAULT_PROPS.closeOnClickOutside;

  const focusTrapRef = useFocusTrap(opened && shouldTrapFocus);
  const mergedRef = useMergedRef(ref, focusTrapRef);
  useFocusReturn({ opened, shouldReturnFocus });

  const slidesEmblaRef = useRef<EmblaCarouselType | null>(null);
  const thumbnailsEmblaRef = useRef<EmblaCarouselType | null>(null);

  const [currentIndex, setCurrentIndex] = useState(initialSlide ?? 0);
  const [slideCount, setSlideCount] = useState<number | null>(null);

  useHotkeys([
    ["ArrowLeft", () => opened && slidesEmblaRef.current?.scrollPrev()],
    ["ArrowRight", () => opened && slidesEmblaRef.current?.scrollNext()],
    ["Escape", () => opened && onClose()],
  ]);

  const counterLabel = useMemo(() => {
    if (slideCount === null) {
      return null;
    }

    if (counterFormatter) {
      return counterFormatter(currentIndex, slideCount);
    }

    return `${currentIndex + 1} / ${slideCount}`;
  }, [counterFormatter, currentIndex, slideCount]);

  const handleSlidesCarouselInit = useCallback(
    (embla: EmblaCarouselType) => {
      slidesEmblaRef.current = embla;

      const handleCarouselInit = (api: EmblaCarouselType) => {
        setSlideCount(api.slideNodes().length);
      };

      const handleSlideSelect = (api: EmblaCarouselType) => {
        setCurrentIndex(api.selectedScrollSnap());
        thumbnailsEmblaRef.current?.scrollTo(api.selectedScrollSnap());
      };

      const handleCarouselDestroy = () => {
        setCurrentIndex(initialSlide ?? 0);
        setSlideCount(null);
        thumbnailsEmblaRef.current = null;
        slidesEmblaRef.current = null;
      };

      handleCarouselInit(embla);

      embla.on("select", handleSlideSelect);
      embla.on("destroy", handleCarouselDestroy);
    },
    [initialSlide],
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

  const handleOutsideClick = useCallback(() => {
    if (!shouldCloseOnClickOutside) {
      return;
    }

    onClose();
  }, [shouldCloseOnClickOutside, onClose]);

  return (
    <OptionalPortal {...portalProps} withinPortal={withinPortal}>
      <Transition
        {...mergedTransitionProps}
        mounted={opened}
        keepMounted={keepMounted}
      >
        {(transitionStyles) => (
          <RemoveScroll enabled={lockScroll}>
            <LightboxProvider
              value={{
                getStyles,
                transitionStyles,
                overlayProps: mergedOverlayProps,
                mergedRef,
                carouselOptions: mergedCarouselOptions,
                controlSize: mergedControlSize,
                onSlidesCarouselInit: handleSlidesCarouselInit,
                currentIndex,
                counterLabel,
                thumbnailsCarouselOptions: mergedThumbnailCarouselOptions,
                onThumbnailsCarouselInit: handleThumbnailsCarouselInit,
                onClose,
                onOutsideClick: handleOutsideClick,
                onThumbnailClick: handleThumbnailClick,
              }}
            >
              {children}
            </LightboxProvider>
          </RemoveScroll>
        )}
      </Transition>
    </OptionalPortal>
  );
});

LightboxRoot.displayName = "LightboxRoot";

LightboxRoot.classes = classes;
```

---

### Task 5: Rewrite `LightboxSlides.tsx`

**Files:**
- Modify: `packages/lightbox/src/components/LightboxSlides.tsx`

Replace the `@mantine/carousel` `<Carousel>` with a direct Embla implementation. Uses `useEmblaCarousel` from `embla-carousel-react`. Renders viewport → container → slide children, plus prev/next `ActionIcon` buttons. Calls `onSlidesCarouselInit` via `useEffect` when the Embla API becomes available (same pattern as `useThumbnails`).

For icons we use inline SVG — `@mantine/core` only exports `CloseIcon`; no chevrons. Inline SVG is the same approach used internally by `@mantine/carousel`.

**Step 1: Replace the file**

```tsx
import { ActionIcon, Box } from "@mantine/core";
import useEmblaCarousel from "embla-carousel-react";
import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { useLightboxContext } from "../Lightbox.context.js";
import { LightboxSlideProvider } from "./LightboxSlide.context.js";

export interface LightboxSlidesProps {
  children?: ReactNode;
}

export function LightboxSlides(props: LightboxSlidesProps) {
  const { children } = props;

  const {
    carouselOptions,
    controlSize,
    onSlidesCarouselInit,
    getStyles,
  } = useLightboxContext();

  const [emblaRef, emblaApi] = useEmblaCarousel(carouselOptions);

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
            <LightboxSlideProvider key={child?.toString()} value={{ index }}>
              {child}
            </LightboxSlideProvider>
          ))}
        </Box>
      </Box>
      <ActionIcon
        {...getStyles("slidesControl")}
        data-direction="prev"
        aria-label="Previous slide"
        size={controlSize}
        variant="default"
        onClick={() => emblaApi?.scrollPrev()}
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
        {...getStyles("slidesControl")}
        data-direction="next"
        aria-label="Next slide"
        size={controlSize}
        variant="default"
        onClick={() => emblaApi?.scrollNext()}
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
    </Box>
  );
}
```

---

### Task 6: Update `LightboxSlide.tsx`

**Files:**
- Modify: `packages/lightbox/src/components/LightboxSlide.tsx`

Replace `Carousel.Slide` with a plain `Box`. The slide sizing (`flex: 0 0 100%`) moves to CSS (`.slide`). Update the `stylesNames` type from `"carouselSlide"` to `"slide"`. Remove the `@mantine/carousel` import.

**Step 1: Replace the file**

```tsx
import {
  Box,
  type BoxProps,
  type CompoundStylesApiProps,
  type ElementProps,
  type Factory,
  factory,
  useProps,
} from "@mantine/core";
import { useSlideInteractions } from "../hooks/useSlideInteractions.js";
import { useLightboxContext } from "../Lightbox.context.js";
import { useLightboxSlideContext } from "./LightboxSlide.context.js";

export type LightboxSlideStylesNames = "slide";

export interface LightboxSlideProps
  extends BoxProps,
    CompoundStylesApiProps<LightboxSlideFactory>,
    ElementProps<"div"> {}

export type LightboxSlideFactory = Factory<{
  props: LightboxSlideProps;
  ref: HTMLDivElement;
  stylesNames: LightboxSlideStylesNames;
  compound: true;
}>;

export const LightboxSlide = factory<LightboxSlideFactory>((_props, ref) => {
  const props = useProps("LightboxSlide", null, _props);

  const { className, style, classNames, styles, vars, children, ...others } = props;

  const { currentIndex, getStyles, onOutsideClick } = useLightboxContext();

  const { index } = useLightboxSlideContext();

  const {
    handleSlidePointerDown,
    handleSlidePointerMove,
    handleSlidePointerUp,
    handleSlidePointerCancel,
  } = useSlideInteractions({
    onClose: onOutsideClick,
  });

  const isActive = index === currentIndex;

  return (
    <Box
      ref={ref}
      data-active={isActive || undefined}
      onPointerDown={isActive ? handleSlidePointerDown : undefined}
      onPointerMove={isActive ? handleSlidePointerMove : undefined}
      onPointerUp={isActive ? handleSlidePointerUp : undefined}
      onPointerCancel={isActive ? handleSlidePointerCancel : undefined}
      {...getStyles("slide", {
        className,
        style,
        classNames,
        styles,
      })}
      {...others}
    >
      <Box style={{ display: "contents" }} data-lightbox-slide-content>
        {children}
      </Box>
    </Box>
  );
});
```

---

### Task 7: Update `Lightbox.module.css`

**Files:**
- Modify: `packages/lightbox/src/Lightbox.module.css`

Rename `.carouselSlides` → `.slides` and `.carouselSlide` → `.slide`. Add `position: relative` to `.slides` to contain the absolutely positioned controls. Add styles for `.slidesViewport`, `.slidesContainer`, and `.slidesControl`.

**Step 1: Replace the file**

```css
.root {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100dvw;
  color: var(--mantine-color-white);
  z-index: var(--lightbox-z-index);
}

.overlay {
  z-index: var(--lightbox-z-index);
}

.slides {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

.slidesViewport {
  overflow: hidden;
  height: 100%;
}

.slidesContainer {
  display: flex;
  height: 100%;
}

.slidesControl {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  width: var(--lightbox-control-size);
  height: var(--lightbox-control-size);

  &[data-direction="prev"] {
    left: var(--mantine-spacing-md);
  }

  &[data-direction="next"] {
    right: var(--mantine-spacing-md);
  }
}

.slide {
  flex: 0 0 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  line-height: 1;

  img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }
}

.thumbnails {
  padding: var(--mantine-spacing-md);
  max-width: 100%;
}

.thumbnailsViewport {
  overflow: hidden;
  width: 100%;
}

.thumbnailsContainer {
  display: flex;
  align-items: stretch;
  justify-content: center;

  &[data-overflow] {
    justify-content: flex-start;
  }
}

.thumbnailSlide {
  flex: 0 0 auto;
  margin-right: var(--mantine-spacing-xs);
}

.thumbnailSlide:last-child {
  margin-right: 0;
}

.thumbnailButton {
  position: relative;
  width: 94px;
  height: 76px;
  border-radius: var(--mantine-radius-sm);
  border: 2px solid transparent;
  opacity: 0.5;
  cursor: pointer;
  transition: opacity 150ms ease, border-color 150ms ease;
  flex-shrink: 0;
  overflow: hidden;
  font-size: 0;
  line-height: 1;

  &[aria-current] {
    opacity: 1;
    border-color: var(--mantine-primary-color-filled);
  }

  img {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.toolbar {
  position: absolute;
  top: var(--mantine-spacing-md);
  right: var(--mantine-spacing-md);
  z-index: 1;
}

.counter {
  position: absolute;
  top: var(--mantine-spacing-md);
  left: var(--mantine-spacing-md);
  z-index: 1;
  color: var(--mantine-color-white);
  font-weight: 500;
  user-select: none;
}
```

---

### Task 8: Remove `@mantine/carousel` from `package.json`

**Files:**
- Modify: `packages/lightbox/package.json`

**Step 1: Remove from `peerDependencies`**

Delete this line from `peerDependencies`:
```json
"@mantine/carousel": ">=8.0.0",
```

**Step 2: Remove from `devDependencies`**

Delete this line from `devDependencies`:
```json
"@mantine/carousel": "^8.3.14",
```

**Step 3: Re-install to update lockfile**

```bash
pnpm install
```

Expected: no errors, `@mantine/carousel` no longer appears in the lockfile entries for this package.

---

### Task 9: Update `Lightbox.test.tsx`

**Files:**
- Modify: `packages/lightbox/src/Lightbox.test.tsx`

The test's `defaultRootProps` currently uses `carouselOptions: { previousControlProps: ..., nextControlProps: ... }` — Mantine Carousel props that no longer exist. Remove that. The buttons are now hardcoded with `aria-label="Previous slide"` and `aria-label="Next slide"`.

**Step 1: Update `defaultRootProps`**

Change:
```typescript
const defaultRootProps: Omit<LightboxProps, "children"> = {
  opened: true,
  onClose: () => {},
  carouselOptions: {
    previousControlProps: { "aria-label": "Previous image" },
    nextControlProps: { "aria-label": "Next image" },
  },
};
```

To:
```typescript
const defaultRootProps: Omit<LightboxProps, "children"> = {
  opened: true,
  onClose: () => {},
};
```

**Step 2: Run the tests**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: all tests pass. The `closeOnClickOutside` test and others use `aria-current='true'` to find the active slide — this still works because `LightboxSlide` still sets `data-active` and the test queries by `aria-current`.

Wait — re-check: the `closeOnClickOutside` test queries `closest("[aria-current='true']")`. In the current code, `LightboxSlide` sets `data-active`, not `aria-current`. The `aria-current` attribute is on `LightboxThumbnail` (thumbnail buttons). So the `closeOnClickOutside` test is finding the active slide through `aria-current='true'` — this must be coming from somewhere in the Carousel implementation.

**Actually**: look at the test carefully. It finds `image.closest("[aria-current='true']")` and then fires pointer events on it. If `@mantine/carousel` was setting `aria-current` on the active slide, and our new `Box` doesn't, this test could silently no-op (the `if (!activeSlide) { return; }` guard). We need to add `aria-current` to the active slide.

**Step 3: Add `aria-current` to active `LightboxSlide`**

In `packages/lightbox/src/components/LightboxSlide.tsx`, update the `Box` to also set `aria-current`:

```tsx
<Box
  ref={ref}
  aria-current={isActive ? "true" : undefined}
  data-active={isActive || undefined}
  ...
>
```

**Step 4: Run tests again**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: all tests pass.

---

### Task 10: Verify everything

**Step 1: Type check**

```bash
pnpm tsc --filter @mantine-bites/lightbox
```

Expected: zero errors.

**Step 2: Lint**

```bash
pnpm lint --filter @mantine-bites/lightbox
```

Expected: zero errors (warnings acceptable).

**Step 3: Full test suite**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: all tests pass.

**Step 4: Build**

```bash
pnpm build --filter @mantine-bites/lightbox
```

Expected: build succeeds, `dist/` is populated.

**Step 5: Commit**

```bash
git add packages/lightbox/src/ packages/lightbox/package.json
git commit -m "feat(lightbox): remove @mantine/carousel, implement slides carousel in-house"
```

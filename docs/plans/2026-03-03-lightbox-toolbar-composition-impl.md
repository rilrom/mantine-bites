# Lightbox Toolbar Composition Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Decompose `LightboxToolbar` into four composable button sub-components, allow the toolbar to accept custom children, and export `useLightboxContext` for fully custom buttons.

**Architecture:** Four new compound components (`LightboxCloseButton`, `LightboxZoomButton`, `LightboxFullscreenButton`, `LightboxAutoplayButton`) each read from `LightboxContext` directly and work anywhere inside `<LightboxRoot>`. `LightboxToolbar` gains a `children` prop — when provided it renders those children; when absent it renders its existing four buttons unchanged. No breaking changes.

**Tech Stack:** React, Mantine factory pattern (`factory`, `CompoundStylesApiProps`), `useLightboxContext`, Jest + Testing Library.

---

## Context

Key files already read and understood:
- `packages/lightbox/src/components/LightboxToolbar.tsx` — monolithic toolbar
- `packages/lightbox/src/components/LightboxRoot.tsx` — provides context, lines 93–107 for Factory, lines 368–379 for static attachments
- `packages/lightbox/src/Lightbox.tsx` — lines 55–68 for Factory, lines 120–127 for static attachments
- `packages/lightbox/src/context/LightboxContext.ts` — exports `LightboxProvider`, `useLightboxContext`, interface `LightboxContext`
- `packages/lightbox/src/index.ts` — barrel exports
- `packages/lightbox/src/__tests__/Lightbox.test.tsx` — existing tests, uses `renderLightbox()` helper with `<Lightbox.Root>` as wrapper

Test command (run from repo root): `pnpm test --filter @mantine-bites/lightbox`

---

### Task 1: LightboxCloseButton

**Files:**
- Create: `packages/lightbox/src/components/LightboxCloseButton.tsx`
- Modify: `packages/lightbox/src/__tests__/Lightbox.test.tsx`

**Step 1: Write the failing tests**

Add a new `describe` block at the bottom of `packages/lightbox/src/__tests__/Lightbox.test.tsx`:

```tsx
import { LightboxCloseButton } from "../components/LightboxCloseButton.js";

describe("@mantine-bites/lightbox/LightboxCloseButton", () => {
  it("renders inside LightboxRoot", () => {
    render(
      <Lightbox.Root opened onClose={() => {}}>
        <Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
        <LightboxCloseButton />
      </Lightbox.Root>,
    );
    expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
  });

  it("calls onClose when clicked", async () => {
    const onClose = jest.fn();
    render(
      <Lightbox.Root opened onClose={onClose}>
        <Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
        <LightboxCloseButton />
      </Lightbox.Root>,
    );
    await userEvent.click(screen.getByLabelText("Close lightbox"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: FAIL — `LightboxCloseButton` module not found.

**Step 3: Create the component**

Create `packages/lightbox/src/components/LightboxCloseButton.tsx`:

```tsx
import {
	ActionIcon,
	type BoxProps,
	CloseIcon,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import { useLightboxContext } from "../context/LightboxContext.js";
import classes from "../styles/Lightbox.module.css";

export type LightboxCloseButtonStylesNames = "closeButton";

export interface LightboxCloseButtonProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxCloseButtonFactory>,
		ElementProps<"button"> {}

export type LightboxCloseButtonFactory = Factory<{
	props: LightboxCloseButtonProps;
	ref: HTMLButtonElement;
	stylesNames: LightboxCloseButtonStylesNames;
	compound: true;
}>;

export const LightboxCloseButton = factory<LightboxCloseButtonFactory>(
	(_props, ref) => {
		const props = useProps("LightboxCloseButton", null, _props);
		const { classNames, className, style, styles, vars, ...others } = props;
		const { onClose, getStyles } = useLightboxContext();

		return (
			<ActionIcon
				ref={ref}
				variant="default"
				size="lg"
				onClick={onClose}
				aria-label="Close lightbox"
				{...getStyles("closeButton", { className, style, classNames, styles })}
				{...others}
			>
				<CloseIcon />
			</ActionIcon>
		);
	},
);

LightboxCloseButton.classes = classes;
LightboxCloseButton.displayName = "LightboxCloseButton";
```

**Step 4: Run tests to verify they pass**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: All tests PASS.

---

### Task 2: LightboxFullscreenButton

**Files:**
- Create: `packages/lightbox/src/components/LightboxFullscreenButton.tsx`
- Modify: `packages/lightbox/src/__tests__/Lightbox.test.tsx`

**Step 1: Write the failing tests**

Add a new `describe` block to `Lightbox.test.tsx`:

```tsx
import { LightboxFullscreenButton } from "../components/LightboxFullscreenButton.js";

describe("@mantine-bites/lightbox/LightboxFullscreenButton", () => {
  it("renders fullscreen button inside LightboxRoot", () => {
    render(
      <Lightbox.Root opened onClose={() => {}}>
        <Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
        <LightboxFullscreenButton />
      </Lightbox.Root>,
    );
    expect(screen.getByLabelText("Enter fullscreen")).toBeInTheDocument();
  });

  it("renders nothing when withFullscreen=false", () => {
    render(
      <Lightbox.Root opened onClose={() => {}} withFullscreen={false}>
        <Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
        <LightboxFullscreenButton />
      </Lightbox.Root>,
    );
    expect(screen.queryByLabelText("Enter fullscreen")).not.toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: FAIL — module not found.

**Step 3: Create the component**

Create `packages/lightbox/src/components/LightboxFullscreenButton.tsx`:

```tsx
import {
	ActionIcon,
	type BoxProps,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import { useLightboxContext } from "../context/LightboxContext.js";
import classes from "../styles/Lightbox.module.css";
import { EnterFullscreen } from "./icons/EnterFullscreen.js";
import { ExitFullscreen } from "./icons/ExitFullscreen.js";

export type LightboxFullscreenButtonStylesNames = "fullscreenButton";

export interface LightboxFullscreenButtonProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxFullscreenButtonFactory>,
		ElementProps<"button"> {}

export type LightboxFullscreenButtonFactory = Factory<{
	props: LightboxFullscreenButtonProps;
	ref: HTMLButtonElement;
	stylesNames: LightboxFullscreenButtonStylesNames;
	compound: true;
}>;

export const LightboxFullscreenButton =
	factory<LightboxFullscreenButtonFactory>((_props, ref) => {
		const props = useProps("LightboxFullscreenButton", null, _props);
		const { classNames, className, style, styles, vars, ...others } = props;
		const { withFullscreen, isFullscreen, toggleFullscreen, getStyles } =
			useLightboxContext();

		if (!withFullscreen) {
			return null;
		}

		return (
			<ActionIcon
				ref={ref}
				variant="default"
				size="lg"
				onClick={toggleFullscreen}
				aria-label={`${isFullscreen ? "Exit" : "Enter"} fullscreen`}
				{...getStyles("fullscreenButton", {
					className,
					style,
					classNames,
					styles,
				})}
				{...others}
			>
				{isFullscreen ? <ExitFullscreen /> : <EnterFullscreen />}
			</ActionIcon>
		);
	});

LightboxFullscreenButton.classes = classes;
LightboxFullscreenButton.displayName = "LightboxFullscreenButton";
```

**Step 4: Run tests to verify they pass**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: All tests PASS.

---

### Task 3: LightboxZoomButton

**Files:**
- Create: `packages/lightbox/src/components/LightboxZoomButton.tsx`
- Modify: `packages/lightbox/src/__tests__/Lightbox.test.tsx`

**Step 1: Write the failing tests**

Add a new `describe` block to `Lightbox.test.tsx`:

```tsx
import { LightboxZoomButton } from "../components/LightboxZoomButton.js";

describe("@mantine-bites/lightbox/LightboxZoomButton", () => {
  it("renders zoom button inside LightboxRoot", () => {
    render(
      <Lightbox.Root opened onClose={() => {}}>
        <Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
        <LightboxZoomButton />
      </Lightbox.Root>,
    );
    expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
  });

  it("renders nothing when withZoom=false", () => {
    render(
      <Lightbox.Root opened onClose={() => {}} withZoom={false}>
        <Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
        <LightboxZoomButton />
      </Lightbox.Root>,
    );
    expect(screen.queryByLabelText("Zoom in")).not.toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: FAIL — module not found.

**Step 3: Create the component**

Create `packages/lightbox/src/components/LightboxZoomButton.tsx`:

```tsx
import {
	ActionIcon,
	type BoxProps,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import { useLightboxContext } from "../context/LightboxContext.js";
import classes from "../styles/Lightbox.module.css";
import { ZoomIn } from "./icons/ZoomIn.js";
import { ZoomOut } from "./icons/ZoomOut.js";

export type LightboxZoomButtonStylesNames = "zoomButton";

export interface LightboxZoomButtonProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxZoomButtonFactory>,
		ElementProps<"button"> {}

export type LightboxZoomButtonFactory = Factory<{
	props: LightboxZoomButtonProps;
	ref: HTMLButtonElement;
	stylesNames: LightboxZoomButtonStylesNames;
	compound: true;
}>;

export const LightboxZoomButton = factory<LightboxZoomButtonFactory>(
	(_props, ref) => {
		const props = useProps("LightboxZoomButton", null, _props);
		const { classNames, className, style, styles, vars, ...others } = props;
		const { withZoom, isZoomed, canZoomCurrent, toggleZoom, getStyles } =
			useLightboxContext();

		if (!withZoom) {
			return null;
		}

		return (
			<ActionIcon
				ref={ref}
				variant="default"
				size="lg"
				onClick={toggleZoom}
				disabled={!canZoomCurrent}
				aria-label={isZoomed ? "Zoom out" : "Zoom in"}
				{...getStyles("zoomButton", { className, style, classNames, styles })}
				{...others}
			>
				{isZoomed ? <ZoomOut /> : <ZoomIn />}
			</ActionIcon>
		);
	},
);

LightboxZoomButton.classes = classes;
LightboxZoomButton.displayName = "LightboxZoomButton";
```

**Step 4: Run tests to verify they pass**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: All tests PASS.

---

### Task 4: LightboxAutoplayButton

**Files:**
- Create: `packages/lightbox/src/components/LightboxAutoplayButton.tsx`
- Modify: `packages/lightbox/src/__tests__/Lightbox.test.tsx`

**Step 1: Write the failing tests**

Add a new `describe` block to `Lightbox.test.tsx`:

```tsx
import Autoplay from "embla-carousel-autoplay"; // already imported at top of file
import { LightboxAutoplayButton } from "../components/LightboxAutoplayButton.js";

describe("@mantine-bites/lightbox/LightboxAutoplayButton", () => {
  it("renders nothing without an autoplay plugin", () => {
    render(
      <Lightbox.Root opened onClose={() => {}}>
        <Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
        <LightboxAutoplayButton />
      </Lightbox.Root>,
    );
    expect(screen.queryByLabelText("Pause autoplay")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Play autoplay")).not.toBeInTheDocument();
  });

  it("renders autoplay button when autoplay plugin is active", async () => {
    render(
      <Lightbox.Root opened onClose={() => {}}>
        <Lightbox.Slides
          emblaPlugins={[Autoplay({ delay: 2000 })]}
          emblaOptions={{ loop: true }}
        >
          {defaultSlides}
        </Lightbox.Slides>
        <LightboxAutoplayButton />
      </Lightbox.Root>,
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Pause autoplay")).toBeInTheDocument(),
    );
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: FAIL — module not found.

**Step 3: Create the component**

Create `packages/lightbox/src/components/LightboxAutoplayButton.tsx`:

```tsx
import {
	ActionIcon,
	type BoxProps,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import { useLightboxContext } from "../context/LightboxContext.js";
import classes from "../styles/Lightbox.module.css";
import { Pause } from "./icons/Pause.js";
import { Play } from "./icons/Play.js";

export type LightboxAutoplayButtonStylesNames = "autoplayButton";

export interface LightboxAutoplayButtonProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxAutoplayButtonFactory>,
		ElementProps<"button"> {}

export type LightboxAutoplayButtonFactory = Factory<{
	props: LightboxAutoplayButtonProps;
	ref: HTMLButtonElement;
	stylesNames: LightboxAutoplayButtonStylesNames;
	compound: true;
}>;

export const LightboxAutoplayButton = factory<LightboxAutoplayButtonFactory>(
	(_props, ref) => {
		const props = useProps("LightboxAutoplayButton", null, _props);
		const { classNames, className, style, styles, vars, ...others } = props;
		const { canAutoPlay, isPlaying, toggleAutoPlay, getStyles } =
			useLightboxContext();

		if (!canAutoPlay) {
			return null;
		}

		return (
			<ActionIcon
				ref={ref}
				variant="default"
				size="lg"
				onClick={toggleAutoPlay}
				aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
				{...getStyles("autoplayButton", {
					className,
					style,
					classNames,
					styles,
				})}
				{...others}
			>
				{isPlaying ? <Pause /> : <Play />}
			</ActionIcon>
		);
	},
);

LightboxAutoplayButton.classes = classes;
LightboxAutoplayButton.displayName = "LightboxAutoplayButton";
```

**Step 4: Run tests to verify they pass**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: All tests PASS.

---

### Task 5: LightboxToolbar children support

**Files:**
- Modify: `packages/lightbox/src/components/LightboxToolbar.tsx`
- Modify: `packages/lightbox/src/__tests__/Lightbox.test.tsx`

**Step 1: Write the failing test**

Add to the existing `describe("@mantine-bites/lightbox/Lightbox compound API")` block:

```tsx
it("should render custom children inside toolbar when provided", () => {
  render(
    <Lightbox.Root opened onClose={() => {}}>
      <Lightbox.Toolbar>
        <button type="button">Custom button</button>
      </Lightbox.Toolbar>
      <Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
    </Lightbox.Root>,
  );
  expect(screen.getByText("Custom button")).toBeInTheDocument();
  // Default buttons should NOT render when children are provided
  expect(screen.queryByLabelText("Close lightbox")).not.toBeInTheDocument();
});

it("should render default buttons when toolbar has no children", () => {
  renderLightbox();
  expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
});
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: The "custom children" test FAILs (currently toolbar ignores children and always renders defaults).

**Step 3: Modify LightboxToolbar**

In `packages/lightbox/src/components/LightboxToolbar.tsx`, destructure `children` and use it as the override:

```tsx
// Change this line:
const { classNames, className, style, styles, vars, ...others } = props;

// To this:
const { classNames, className, style, styles, vars, children, ...others } = props;
```

Then wrap the default buttons with a `children ??` guard:

```tsx
return (
  <ActionIcon.Group
    ref={ref}
    {...getStyles("toolbar", { className, style, classNames, styles })}
    {...others}
  >
    {children ?? (
      <>
        {withFullscreen && (
          <ActionIcon
            variant="default"
            size="lg"
            onClick={toggleFullscreen}
            aria-label={`${isFullscreen ? "Exit" : "Enter"} fullscreen`}
            {...getStyles("fullscreenButton", { classNames, styles })}
          >
            {isFullscreen ? <ExitFullscreen /> : <EnterFullscreen />}
          </ActionIcon>
        )}
        {withZoom && (
          <ActionIcon
            variant="default"
            size="lg"
            onClick={toggleZoom}
            disabled={!canZoomCurrent}
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            {...getStyles("zoomButton", { classNames, styles })}
          >
            {isZoomed ? <ZoomOut /> : <ZoomIn />}
          </ActionIcon>
        )}
        {canAutoPlay && (
          <ActionIcon
            variant="default"
            size="lg"
            onClick={toggleAutoPlay}
            aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
            {...getStyles("autoplayButton", { classNames, styles })}
          >
            {isPlaying ? <Pause /> : <Play />}
          </ActionIcon>
        )}
        <ActionIcon
          variant="default"
          size="lg"
          onClick={onClose}
          aria-label="Close lightbox"
          {...getStyles("closeButton", { classNames, styles })}
        >
          <CloseIcon />
        </ActionIcon>
      </>
    )}
  </ActionIcon.Group>
);
```

**Step 4: Run tests to verify they pass**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: All tests PASS.

---

### Task 6: Wire up static components and exports

**Files:**
- Modify: `packages/lightbox/src/components/LightboxRoot.tsx`
- Modify: `packages/lightbox/src/Lightbox.tsx`
- Modify: `packages/lightbox/src/index.ts`
- Modify: `packages/lightbox/src/__tests__/Lightbox.test.tsx`

**Step 1: Write the failing test**

Add to the existing `"should expose compound static members"` test in `Lightbox.test.tsx`:

```tsx
it("should expose button static members on Lightbox", () => {
  expect(Lightbox.CloseButton).toBeDefined();
  expect(Lightbox.ZoomButton).toBeDefined();
  expect(Lightbox.FullscreenButton).toBeDefined();
  expect(Lightbox.AutoplayButton).toBeDefined();
});
```

Also add an import check test for the hook:
```tsx
it("should export useLightboxContext", () => {
  // Verified by import — if the module resolves, this passes
  expect(typeof useLightboxContext).toBe("function");
});
```

And add the import at the top of the test file:
```tsx
import { useLightboxContext } from "../index.js";
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: FAIL — `Lightbox.CloseButton` is undefined, `useLightboxContext` not exported.

**Step 3: Update LightboxRoot**

In `packages/lightbox/src/components/LightboxRoot.tsx`:

Add imports near the top (after existing component imports):
```tsx
import { LightboxAutoplayButton } from "./LightboxAutoplayButton.js";
import { LightboxCloseButton } from "./LightboxCloseButton.js";
import { LightboxFullscreenButton } from "./LightboxFullscreenButton.js";
import { LightboxZoomButton } from "./LightboxZoomButton.js";
```

Update `LightboxRootFactory` `staticComponents` (lines 97–106):
```tsx
staticComponents: {
  Root: typeof LightboxRoot;
  Toolbar: typeof LightboxToolbar;
  Counter: typeof LightboxCounter;
  Controls: typeof LightboxControls;
  Slides: typeof LightboxSlides;
  Thumbnails: typeof LightboxThumbnails;
  Thumbnail: typeof LightboxThumbnail;
  Slide: typeof LightboxSlide;
  CloseButton: typeof LightboxCloseButton;
  ZoomButton: typeof LightboxZoomButton;
  FullscreenButton: typeof LightboxFullscreenButton;
  AutoplayButton: typeof LightboxAutoplayButton;
};
```

Add static assignments at the bottom (after line 379):
```tsx
LightboxRoot.CloseButton = LightboxCloseButton;
LightboxRoot.ZoomButton = LightboxZoomButton;
LightboxRoot.FullscreenButton = LightboxFullscreenButton;
LightboxRoot.AutoplayButton = LightboxAutoplayButton;
```

**Step 4: Update Lightbox.tsx**

In `packages/lightbox/src/Lightbox.tsx`:

Add imports:
```tsx
import { LightboxAutoplayButton } from "./components/LightboxAutoplayButton.js";
import { LightboxCloseButton } from "./components/LightboxCloseButton.js";
import { LightboxFullscreenButton } from "./components/LightboxFullscreenButton.js";
import { LightboxZoomButton } from "./components/LightboxZoomButton.js";
```

Update `LightboxFactory` `staticComponents` (lines 58–67):
```tsx
staticComponents: {
  Root: typeof LightboxRoot;
  Toolbar: typeof LightboxToolbar;
  Counter: typeof LightboxCounter;
  Controls: typeof LightboxControls;
  Slides: typeof LightboxSlides;
  Slide: typeof LightboxSlide;
  Thumbnails: typeof LightboxThumbnails;
  Thumbnail: typeof LightboxThumbnail;
  CloseButton: typeof LightboxCloseButton;
  ZoomButton: typeof LightboxZoomButton;
  FullscreenButton: typeof LightboxFullscreenButton;
  AutoplayButton: typeof LightboxAutoplayButton;
};
```

Add static assignments at the bottom (after line 127):
```tsx
Lightbox.CloseButton = LightboxCloseButton;
Lightbox.ZoomButton = LightboxZoomButton;
Lightbox.FullscreenButton = LightboxFullscreenButton;
Lightbox.AutoplayButton = LightboxAutoplayButton;
```

**Step 5: Update index.ts**

In `packages/lightbox/src/index.ts`, add exports:

```ts
export type {
  LightboxAutoplayButtonFactory,
  LightboxAutoplayButtonProps,
  LightboxAutoplayButtonStylesNames,
} from "./components/LightboxAutoplayButton.js";
export { LightboxAutoplayButton } from "./components/LightboxAutoplayButton.js";
export type {
  LightboxCloseButtonFactory,
  LightboxCloseButtonProps,
  LightboxCloseButtonStylesNames,
} from "./components/LightboxCloseButton.js";
export { LightboxCloseButton } from "./components/LightboxCloseButton.js";
export type {
  LightboxFullscreenButtonFactory,
  LightboxFullscreenButtonProps,
  LightboxFullscreenButtonStylesNames,
} from "./components/LightboxFullscreenButton.js";
export { LightboxFullscreenButton } from "./components/LightboxFullscreenButton.js";
export type {
  LightboxZoomButtonFactory,
  LightboxZoomButtonProps,
  LightboxZoomButtonStylesNames,
} from "./components/LightboxZoomButton.js";
export { LightboxZoomButton } from "./components/LightboxZoomButton.js";
export type { LightboxContext } from "./context/LightboxContext.js";
export { useLightboxContext } from "./context/LightboxContext.js";
```

**Step 6: Run tests to verify they pass**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: All tests PASS.

**Step 7: Run full lint and type check**

```bash
pnpm lint --filter @mantine-bites/lightbox
pnpm tsc --filter @mantine-bites/lightbox
```

Expected: No errors.

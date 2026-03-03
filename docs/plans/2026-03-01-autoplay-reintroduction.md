# Autoplay Re-introduction Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Re-introduce Embla autoplay support from `main` into the `feat/compound-component` rewrite, adapting it to the compound API without regressions.

**Architecture:** `useAutoPlay` (ported from main) lives in `LightboxRoot` and feeds `canAutoPlay`, `isPlaying`, `toggleAutoPlay`, and `onSlidesEmblaApi` into context. `LightboxSlides` accepts an `emblaPlugins` prop (sibling to `emblaOptions`) and calls `ctx.onSlidesEmblaApi` when Embla initialises, which hooks up the autoplay subscription. The Play/Pause button renders conditionally in `LightboxToolbar` when `canAutoPlay` is true, matching the existing zoom-button pattern.

**Tech Stack:** React, Embla Carousel (`embla-carousel-react`), `embla-carousel-autoplay` (optional peer / devDep), Mantine Core, Jest + Testing Library.

---

### Task 1: Add embla-carousel-autoplay dependency

**Files:**
- Modify: `packages/lightbox/package.json`

**Step 1: Add the dependency**

In `packages/lightbox/package.json`, make one edit:

1. Add to `"devDependencies"`:
```json
"embla-carousel-autoplay": "^8.5.2"
```

**Step 2: Install**

```bash
pnpm install
```

Expected: no errors, lockfile updated.

---

### Task 2: Port icon components

**Files:**
- Create: `packages/lightbox/src/components/Pause.tsx`
- Create: `packages/lightbox/src/components/Play.tsx`

**Step 1: Create Pause.tsx**

```tsx
import type { SVGProps } from "react";

export const Pause = (props: SVGProps<SVGSVGElement>) => (
	<svg
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<rect x="6" y="4" width="4" height="16" />
		<rect x="14" y="4" width="4" height="16" />
	</svg>
);
```

**Step 2: Create Play.tsx**

```tsx
import type { SVGProps } from "react";

export const Play = (props: SVGProps<SVGSVGElement>) => (
	<svg
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="currentColor"
		stroke="none"
		{...props}
	>
		<polygon points="5 3 19 12 5 21 5 3" />
	</svg>
);
```


---

### Task 3: Port useAutoPlay hook

**Files:**
- Create: `packages/lightbox/src/hooks/useAutoPlay.ts`

**Step 1: Create the hook**

This is a near-exact port from `main`. The only rename is `canUseAutoPlay` → `canAutoPlay` for consistency with the existing `isPlaying` / `toggleAutoPlay` naming in this branch.

```ts
import type { EmblaCarouselType } from "embla-carousel";
import type { AutoplayType } from "embla-carousel-autoplay";
import { useCallback, useRef, useState } from "react";

interface UseAutoPlayOutput {
	canAutoPlay: boolean;
	isPlaying: boolean;
	toggleAutoPlay: () => void;
	notifyAutoPlayInteraction: () => void;
	handleEmblaApiForAutoPlay: (embla: EmblaCarouselType) => void;
}

export function useAutoPlay(): UseAutoPlayOutput {
	const autoplayPluginRef = useRef<AutoplayType | null>(null);
	const emblaInstanceRef = useRef<EmblaCarouselType | null>(null);

	const [canAutoPlay, setCanAutoPlay] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	const onAutoPlayPlay = useCallback(() => setIsPlaying(true), []);
	const onAutoPlayStop = useCallback(() => setIsPlaying(false), []);

	const handleEmblaApiForAutoPlay = useCallback(
		(embla: EmblaCarouselType) => {
			const plugin = embla.plugins()?.autoplay;

			if (
				!plugin ||
				typeof plugin !== "object" ||
				typeof plugin.play !== "function"
			) {
				return;
			}

			const prevEmbla = emblaInstanceRef.current;

			if (prevEmbla) {
				prevEmbla.off("autoplay:play", onAutoPlayPlay);
				prevEmbla.off("autoplay:stop", onAutoPlayStop);
			}

			emblaInstanceRef.current = embla;
			autoplayPluginRef.current = plugin;

			embla.on("autoplay:play", onAutoPlayPlay);
			embla.on("autoplay:stop", onAutoPlayStop);

			setCanAutoPlay(true);
			setIsPlaying(plugin.isPlaying());
		},
		[onAutoPlayPlay, onAutoPlayStop],
	);

	const toggleAutoPlay = useCallback(() => {
		const plugin = autoplayPluginRef.current;

		if (!plugin) {
			return;
		}

		if (isPlaying) {
			plugin.stop();
		} else {
			plugin.play();
		}
	}, [isPlaying]);

	const notifyAutoPlayInteraction = useCallback(() => {
		const embla = emblaInstanceRef.current;

		if (!embla) {
			return;
		}

		embla.emit("pointerDown");
		embla.emit("pointerUp");
	}, []);

	return {
		canAutoPlay,
		isPlaying,
		toggleAutoPlay,
		notifyAutoPlayInteraction,
		handleEmblaApiForAutoPlay,
	};
}
```


---

### Task 4: Write failing tests (TDD)

**Files:**
- Modify: `packages/lightbox/src/Lightbox.test.tsx`

**Step 1: Add the import at the top of the test file**

After the existing imports, add:
```ts
import Autoplay from "embla-carousel-autoplay";
```

**Step 2: Add three tests inside the existing `describe` block, after the last test**

```ts
it("should not render autoplay button when no autoplay plugin is configured", () => {
  renderLightbox();

  expect(screen.queryByLabelText("Pause autoplay")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Play autoplay")).not.toBeInTheDocument();
});

it("should stop autoplay when zoom toolbar button is clicked and stopOnInteraction is true", async () => {
  renderLightbox({
    slidesProps: {
      emblaPlugins: [Autoplay({ delay: 2000, stopOnInteraction: true })],
      emblaOptions: { loop: true },
    },
  });

  await waitFor(() =>
    expect(screen.getByLabelText("Pause autoplay")).toBeInTheDocument(),
  );

  await userEvent.click(screen.getByLabelText("Zoom in"));

  await waitFor(() =>
    expect(screen.getByLabelText("Play autoplay")).toBeInTheDocument(),
  );
});

it("should keep autoplay running when zoom toolbar button is clicked and stopOnInteraction is false", async () => {
  renderLightbox({
    slidesProps: {
      emblaPlugins: [Autoplay({ delay: 2000, stopOnInteraction: false })],
      emblaOptions: { loop: true },
    },
  });

  const initialAutoplayLabel = screen.queryByLabelText("Pause autoplay")
    ? "Pause autoplay"
    : "Play autoplay";

  await userEvent.click(screen.getByLabelText("Zoom in"));

  expect(screen.getByLabelText(initialAutoplayLabel)).toBeInTheDocument();
});
```

Note: `emblaPlugins` on `slidesProps` works because `RenderLightboxOptions.slidesProps` is typed as `Partial<LightboxSlidesProps>`, and we will add `emblaPlugins` to `LightboxSlidesProps` in Task 6. TypeScript will complain until then — that's expected and fine during TDD.

**Step 3: Run tests to verify they fail**

```bash
cd packages/lightbox && pnpm test -- --testPathPattern="Lightbox.test"
```

Expected: The three new tests fail. `"Pause autoplay"` / `"Play autoplay"` buttons are not found. Existing tests continue to pass.

---

### Task 5: Add autoplayButton to LightboxStylesNames

**Files:**
- Modify: `packages/lightbox/src/Lightbox.tsx`

**Step 1: Add the selector**

Find the `LightboxStylesNames` union type and add `"autoplayButton"`:

```ts
export type LightboxStylesNames =
  | "root"
  | "overlay"
  | "slides"
  | "slidesViewport"
  | "slidesContainer"
  | "control"
  | "slide"
  | "zoomContainer"
  | "zoomContent"
  | "autoplayButton"   // ← add this
  | "zoomButton"
  | "toolbar"
  | "closeButton"
  | "counter"
  | "thumbnails"
  | "thumbnailsViewport"
  | "thumbnailsContainer"
  | "thumbnail"
  | "thumbnailButton";
```

---

### Task 6: Extend LightboxContext with autoplay fields

**Files:**
- Modify: `packages/lightbox/src/Lightbox.context.ts`

**Step 1: Add the autoplay fields to `LightboxContext`**

After the `// Zoom` block (or anywhere sensible), add:

```ts
// AutoPlay
canAutoPlay: boolean;
isPlaying: boolean;
toggleAutoPlay: () => void;
onSlidesEmblaApi: (embla: EmblaCarouselType) => void;
```

The `EmblaCarouselType` import is already present in the file.

---

### Task 7: Add emblaPlugins to LightboxSlides

**Files:**
- Modify: `packages/lightbox/src/components/LightboxSlides.tsx`

**Step 1: Add EmblaPluginType import**

Add `EmblaPluginType` to the existing `embla-carousel` import:

```ts
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from "embla-carousel";
```

**Step 2: Add emblaPlugins to LightboxSlidesProps**

```ts
export interface LightboxSlidesProps {
  /** Initial slide index, `0` by default */
  initialSlide?: number;
  /** Options passed directly to the Embla slide carousel */
  emblaOptions?: EmblaOptionsType;
  /** Plugins passed directly to the Embla slide carousel */
  emblaPlugins?: EmblaPluginType[];
  children?: ReactNode;
}
```

**Step 3: Destructure emblaPlugins in the component body**

```ts
const { initialSlide = 0, emblaOptions, emblaPlugins, children } = props;
```

**Step 4: Pull onSlidesEmblaApi from context**

In the `useLightboxContext()` destructure, add `onSlidesEmblaApi`:

```ts
const {
  getStyles,
  orientation,
  isZoomedRef,
  slidesEmblaRef,
  thumbnailsEmblaRef,
  setCurrentIndex,
  setSlideCount,
  onSlidesEmblaApi,   // ← add this
} = useLightboxContext();
```

**Step 5: Pass emblaPlugins to useEmblaCarousel**

Change:
```ts
const [emblaRef, emblaApi] = useEmblaCarousel(mergedEmblaOptions);
```
To:
```ts
const [emblaRef, emblaApi] = useEmblaCarousel(mergedEmblaOptions, emblaPlugins);
```

**Step 6: Call onSlidesEmblaApi in the useEffect**

Inside the existing `useEffect`, after `slidesEmblaRef.current = emblaApi;`, add:

```ts
onSlidesEmblaApi(emblaApi);
```

Also add `onSlidesEmblaApi` to the `useEffect` dependency array.

---

### Task 8: Wire useAutoPlay in LightboxRoot

**Files:**
- Modify: `packages/lightbox/src/components/LightboxRoot.tsx`

**Step 1: Import useAutoPlay**

```ts
import { useAutoPlay } from "../hooks/useAutoPlay.js";
```

**Step 2: Call useAutoPlay in the component body**

After the `useZoom` call, add:

```ts
const {
  canAutoPlay,
  isPlaying,
  toggleAutoPlay,
  notifyAutoPlayInteraction,
  handleEmblaApiForAutoPlay,
} = useAutoPlay();
```

**Step 3: Wrap toggleZoom to notify autoplay of interaction**

The existing code has `toggleZoom` from `useZoom`. Rename the wrapped version to avoid shadowing:

```ts
const handleToggleZoom = useCallback(() => {
  notifyAutoPlayInteraction();
  toggleZoom();
}, [notifyAutoPlayInteraction, toggleZoom]);
```

**Step 4: Update the context provider value**

In the `<LightboxProvider value={...}>`, make two changes:

1. Replace `toggleZoom` with `handleToggleZoom` (so zoom interactions notify autoplay)
2. Add the autoplay fields:

```ts
// AutoPlay
canAutoPlay,
isPlaying,
toggleAutoPlay,
onSlidesEmblaApi: handleEmblaApiForAutoPlay,
```

---

### Task 9: Add Play/Pause button to LightboxToolbar

**Files:**
- Modify: `packages/lightbox/src/components/LightboxToolbar.tsx`

**Step 1: Add imports**

```ts
import { Pause } from "./Pause.js";
import { Play } from "./Play.js";
```

**Step 2: Pull autoplay state from context**

Extend the destructure from `useLightboxContext()`:

```ts
const {
  onClose,
  getStyles,
  withZoom,
  isZoomed,
  canZoomCurrent,
  toggleZoom,
  canAutoPlay,
  isPlaying,
  toggleAutoPlay,
} = useLightboxContext();
```

**Step 3: Add the Play/Pause button**

Inside `<ActionIcon.Group>`, before the zoom button:

```tsx
{canAutoPlay && (
  <ActionIcon
    variant="default"
    size="lg"
    onClick={toggleAutoPlay}
    aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
    {...getStyles("autoplayButton")}
  >
    {isPlaying ? <Pause /> : <Play />}
  </ActionIcon>
)}
```

---

### Task 10: Run tests and verify

**Step 1: Run the full test suite**

```bash
cd packages/lightbox && pnpm test
```

Expected: All tests pass, including the three new autoplay tests.

**Step 2: Run type checking**

```bash
cd packages/lightbox && pnpm tsc
```

Expected: No errors.

**Step 3: Run linting**

```bash
cd packages/lightbox && pnpm lint
```

Expected: No errors.

---


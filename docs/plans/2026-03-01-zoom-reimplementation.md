# Zoom Reimplementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Re-introduce zoom functionality into the `feat/compound-component` rewrite of `@mantine-bites/lightbox` without regressing any of the 19 existing tests.

**Architecture:** Zoom math lives in a new `utils/zoom.ts`. A ported `hooks/useZoom.ts` owns all zoom state. `LightboxRoot` calls `useZoom` and wires results into context, so both the slide (pointer handling, transform) and the toolbar (toggle button) can read zoom state independently.

**Tech Stack:** React, TypeScript, Mantine factory/compound component pattern, CSS Modules, Jest + Testing Library.

---

## Baseline

Run the current test suite first and confirm all 19 pass before touching any code:

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: **19 passed, 0 failed.**

---

## Task 1: Create `utils/zoom.ts` (TDD)

**Files:**
- Create: `packages/lightbox/src/utils/zoom.ts`
- Create: `packages/lightbox/src/utils/zoom.test.ts`

### Step 1 — Write the failing tests

Create `packages/lightbox/src/utils/zoom.test.ts`:

```ts
import {
  canZoomImageElement,
  getInitialZoomOffset,
  getTargetZoomScale,
  getZoomTransform,
  clampZoomOffset,
  DEFAULT_ZOOM_SCALE,
  ZERO_ZOOM_OFFSET,
} from "./zoom.js";

const createRect = (width: number, height: number): DOMRect =>
  ({
    x: 0, y: 0, width, height,
    top: 0, left: 0, right: width, bottom: height,
    toJSON: () => ({}),
  }) as DOMRect;

const createImage = ({
  naturalWidth,
  naturalHeight,
  renderedWidth,
  renderedHeight,
}: {
  naturalWidth: number;
  naturalHeight: number;
  renderedWidth: number;
  renderedHeight: number;
}) => {
  const image = document.createElement("img");
  Object.defineProperty(image, "naturalWidth", { configurable: true, value: naturalWidth });
  Object.defineProperty(image, "naturalHeight", { configurable: true, value: naturalHeight });
  Object.defineProperty(image, "getBoundingClientRect", {
    configurable: true,
    value: () => createRect(renderedWidth, renderedHeight),
  });
  return image;
};

describe("zoom utilities", () => {
  it("should export DEFAULT_ZOOM_SCALE as 2", () => {
    expect(DEFAULT_ZOOM_SCALE).toBe(2);
  });

  it("should export ZERO_ZOOM_OFFSET as { x: 0, y: 0 }", () => {
    expect(ZERO_ZOOM_OFFSET).toEqual({ x: 0, y: 0 });
  });

  it("should keep zoom available when image is downscaled even if viewport fill scale is 1", () => {
    const image = createImage({
      naturalWidth: 1500, naturalHeight: 1000,
      renderedWidth: 1000, renderedHeight: 667,
    });
    expect(canZoomImageElement(image)).toBe(true);
    expect(
      getTargetZoomScale({ image, containerWidth: 1000, containerHeight: 667 }),
    ).toBeCloseTo(1.5);
  });

  it("should compute zoom target from the larger viewport fill axis", () => {
    const image = createImage({
      naturalWidth: 4000, naturalHeight: 3000,
      renderedWidth: 1000, renderedHeight: 750,
    });
    expect(
      getTargetZoomScale({ image, containerWidth: 1000, containerHeight: 1000 }),
    ).toBeCloseTo(1000 / 750);
  });

  it("should clamp target zoom to available natural resolution", () => {
    const image = createImage({
      naturalWidth: 1500, naturalHeight: 1125,
      renderedWidth: 1000, renderedHeight: 750,
    });
    expect(
      getTargetZoomScale({ image, containerWidth: 2000, containerHeight: 2000 }),
    ).toBeCloseTo(1.5);
  });

  it("should center zoom around pointer position when possible", () => {
    expect(
      getInitialZoomOffset({
        containerRect: createRect(800, 600),
        imageRect: createRect(1200, 900),
        zoomScale: 2,
        pointerClientX: 500,
        pointerClientY: 350,
      }),
    ).toEqual({ x: -200, y: -100 });
  });

  it("should clamp initial pointer-based zoom offset to pan limits", () => {
    expect(
      getInitialZoomOffset({
        containerRect: createRect(800, 600),
        imageRect: createRect(1200, 900),
        zoomScale: 2,
        pointerClientX: 0,
        pointerClientY: 0,
      }),
    ).toEqual({ x: 800, y: 600 });
  });

  it("should return identity transform when not zoomed", () => {
    expect(
      getZoomTransform({ isZoomed: false, offset: { x: 50, y: 50 }, scale: 2 }),
    ).toBe("translate(0px, 0px) scale(1)");
  });

  it("should return scaled transform when zoomed", () => {
    expect(
      getZoomTransform({ isZoomed: true, offset: { x: 10, y: -20 }, scale: 2 }),
    ).toBe("translate(10px, -20px) scale(2)");
  });

  it("should clampZoomOffset to prevent panning beyond image edges", () => {
    const result = clampZoomOffset({
      containerWidth: 800, containerHeight: 600,
      imageWidth: 1000, imageHeight: 750,
      zoomScale: 2,
      nextX: 9999, nextY: 9999,
    });
    expect(result.x).toBeCloseTo((1000 * 2 - 800) / 2);
    expect(result.y).toBeCloseTo((750 * 2 - 600) / 2);
  });
});
```

### Step 2 — Run tests to confirm they fail

```bash
pnpm test --filter @mantine-bites/lightbox -- --testPathPattern=zoom.test
```

Expected: **FAIL** — module `./zoom.js` not found.

### Step 3 — Implement `utils/zoom.ts`

Create `packages/lightbox/src/utils/zoom.ts`. Copy only the zoom-math functions from `main`'s `utils/zoom.ts` — pointer utilities already live in `pointer.ts` and must NOT be duplicated:

```ts
/** Pixel offset representing a translation applied to a zoomed image. */
export interface ZoomOffset {
  x: number;
  y: number;
}

/** Default zoom scale applied when zooming in on an image. */
export const DEFAULT_ZOOM_SCALE = 2;

/** Zero-offset value representing no translation on a zoomed image. */
export const ZERO_ZOOM_OFFSET: ZoomOffset = { x: 0, y: 0 };

interface ClampZoomOffsetInput {
  containerWidth: number;
  containerHeight: number;
  imageWidth: number;
  imageHeight: number;
  zoomScale: number;
  nextX: number;
  nextY: number;
}

interface InitialZoomOffsetInput {
  containerRect: DOMRect;
  imageRect: DOMRect;
  zoomScale: number;
  pointerClientX: number;
  pointerClientY: number;
}

/**
 * Clamps a proposed zoom pan offset so the image cannot be panned beyond its
 * edges relative to the container at the given zoom scale.
 */
export const clampZoomOffset = ({
  containerWidth,
  containerHeight,
  imageWidth,
  imageHeight,
  zoomScale,
  nextX,
  nextY,
}: ClampZoomOffsetInput): ZoomOffset => {
  const scaledWidth = imageWidth * zoomScale;
  const scaledHeight = imageHeight * zoomScale;
  const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
  const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);
  return {
    x: Math.min(Math.max(nextX, -maxX), maxX),
    y: Math.min(Math.max(nextY, -maxY), maxY),
  };
};

/**
 * Calculates the initial pan offset when zooming so the clicked/tapped point
 * moves toward the viewport center, then clamps it to valid pan bounds.
 */
export const getInitialZoomOffset = ({
  containerRect,
  imageRect,
  zoomScale,
  pointerClientX,
  pointerClientY,
}: InitialZoomOffsetInput): ZoomOffset => {
  const centerX = containerRect.left + containerRect.width / 2;
  const centerY = containerRect.top + containerRect.height / 2;
  const rawOffsetX = -(pointerClientX - centerX) * zoomScale;
  const rawOffsetY = -(pointerClientY - centerY) * zoomScale;
  return clampZoomOffset({
    containerWidth: containerRect.width,
    containerHeight: containerRect.height,
    imageWidth: imageRect.width,
    imageHeight: imageRect.height,
    zoomScale,
    nextX: rawOffsetX,
    nextY: rawOffsetY,
  });
};

/**
 * Returns a CSS `transform` string that applies the zoom pan offset and scale.
 * When not zoomed, returns identity values regardless of the stored offset.
 */
export const getZoomTransform = ({
  isZoomed,
  offset,
  scale,
}: {
  isZoomed: boolean;
  offset: ZoomOffset;
  scale: number;
}) =>
  `translate(${isZoomed ? offset.x : 0}px, ${isZoomed ? offset.y : 0}px) scale(${
    isZoomed ? scale : 1
  })`;

const RESOLUTION_EPSILON = 1.01;

const getImageMeasurements = (image: HTMLImageElement) => {
  const rect = image.getBoundingClientRect();
  return {
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    renderedWidth: rect.width,
    renderedHeight: rect.height,
  };
};

/**
 * Returns the maximum zoom scale at which the image would still be rendered at
 * its native resolution (1:1 pixel ratio). Falls back to `DEFAULT_ZOOM_SCALE`
 * when image dimensions are unavailable.
 */
export const getImageMaxZoomScale = (image: HTMLImageElement) => {
  const { naturalWidth, naturalHeight, renderedWidth, renderedHeight } =
    getImageMeasurements(image);
  if (!naturalWidth || !naturalHeight || !renderedWidth || !renderedHeight) {
    return DEFAULT_ZOOM_SCALE;
  }
  return Math.min(naturalWidth / renderedWidth, naturalHeight / renderedHeight);
};

/**
 * Calculates the zoom scale that should be applied when the user triggers a
 * zoom action. Prefers a scale that fills the container viewport; falls back to
 * the native-resolution scale or `DEFAULT_ZOOM_SCALE` when the image is small.
 */
export const getTargetZoomScale = ({
  image,
  containerWidth,
  containerHeight,
}: {
  image: HTMLImageElement;
  containerWidth: number;
  containerHeight: number;
}) => {
  const { renderedWidth, renderedHeight } = getImageMeasurements(image);
  const fillWidthScale =
    renderedWidth > 0 ? containerWidth / renderedWidth : DEFAULT_ZOOM_SCALE;
  const fillHeightScale =
    renderedHeight > 0 ? containerHeight / renderedHeight : DEFAULT_ZOOM_SCALE;
  const fillViewportScale = Math.max(fillWidthScale, fillHeightScale);
  const maxZoomScale = getImageMaxZoomScale(image);
  const fallbackStepScale = Math.min(maxZoomScale, DEFAULT_ZOOM_SCALE);
  const targetScale =
    fillViewportScale > 1 ? fillViewportScale : fallbackStepScale;
  return Math.max(1, Math.min(maxZoomScale, targetScale));
};

/**
 * Returns `true` if the image has sufficient resolution to be meaningfully
 * zoomed (i.e. its max zoom scale exceeds the resolution epsilon threshold).
 */
export const canZoomImageElement = (image: HTMLImageElement) =>
  getImageMaxZoomScale(image) > RESOLUTION_EPSILON;
```

### Step 4 — Run tests to confirm they pass

```bash
pnpm test --filter @mantine-bites/lightbox -- --testPathPattern=zoom.test
```

Expected: **10 passed, 0 failed.**

### Step 5 — Run all tests to confirm no regressions

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: **29 passed, 0 failed** (19 existing + 10 new).

---

## Task 2: Create icon components

**Files:**
- Create: `packages/lightbox/src/components/ZoomIn.tsx`
- Create: `packages/lightbox/src/components/ZoomOut.tsx`

No unit tests needed — pure SVG presentational components.

### Step 1 — Create `components/ZoomIn.tsx`

```tsx
import type { SVGProps } from "react";

export const ZoomIn = (props: SVGProps<SVGSVGElement>) => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
```

### Step 2 — Create `components/ZoomOut.tsx`

```tsx
import type { SVGProps } from "react";

export const ZoomOut = (props: SVGProps<SVGSVGElement>) => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
```

---

## Task 3: Create `hooks/useZoom.ts`

**Files:**
- Create: `packages/lightbox/src/hooks/useZoom.ts`

Ported from `main` with two fixes:
1. `canZoomCurrent` initialised as `useState(false)` (not `useState(withZoom)`) — prevents false-positive flash
2. `canToggleOnRelease` removed from `dragRef` — it was always the inverse of `moved`, so `!drag.moved` is used directly

**No unit tests at this stage** — behaviour will be integration-tested in Task 9.

### Step 1 — Create `hooks/useZoom.ts`

```ts
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  canZoomImageElement,
  clampZoomOffset,
  DEFAULT_ZOOM_SCALE,
  getImageMaxZoomScale,
  getInitialZoomOffset,
  getTargetZoomScale,
  ZERO_ZOOM_OFFSET,
  type ZoomOffset,
} from "../utils/zoom.js";
import {
  getPointerCoordinate,
  hasPointerMoved,
  isImageTarget,
} from "../utils/pointer.js";

interface UseZoomInput {
  opened: boolean;
  withZoom: boolean;
}

export interface UseZoomOutput {
  isZoomed: boolean;
  isDraggingZoom: boolean;
  zoomOffset: ZoomOffset;
  zoomScale: number;
  canZoomCurrent: boolean;
  activeZoomContainerRef: RefObject<HTMLDivElement | null>;
  resetZoom: () => void;
  toggleZoom: () => void;
  updateCanZoomAvailability: () => void;
  handleZoomPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleZoomPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

/**
 * Manages all zoom and pan state for the lightbox.
 *
 * Handles pointer capture for smooth panning, tap-to-toggle zoom, offset
 * clamping within container bounds, and automatic reset on slide change or
 * window resize.
 */
export function useZoom(props: UseZoomInput): UseZoomOutput {
  const { opened, withZoom } = props;

  const [isZoomed, setIsZoomed] = useState(false);
  const [isDraggingZoom, setIsDraggingZoom] = useState(false);
  const [zoomOffset, setZoomOffset] = useState<ZoomOffset>(ZERO_ZOOM_OFFSET);
  const [zoomScale, setZoomScale] = useState(DEFAULT_ZOOM_SCALE);
  // Fix 1: start as false so button is disabled until image is confirmed zoomable.
  const [canZoomCurrent, setCanZoomCurrent] = useState(false);

  const isZoomedRef = useRef(false);
  const activeZoomContainerRef = useRef<HTMLDivElement | null>(null);
  const zoomBaseSizeRef = useRef<{ width: number; height: number } | null>(null);
  // Fix 2: canToggleOnRelease removed — !drag.moved is equivalent.
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    canPan: boolean;
    moved: boolean;
  } | null>(null);

  const resetZoom = useCallback(() => {
    setIsZoomed(false);
    setZoomOffset(ZERO_ZOOM_OFFSET);
    setZoomScale(DEFAULT_ZOOM_SCALE);
    setIsDraggingZoom(false);
    dragRef.current = null;
    zoomBaseSizeRef.current = null;
  }, []);

  const updateCanZoomAvailability = useCallback(() => {
    if (!withZoom) {
      setCanZoomCurrent(false);
      return;
    }
    const activeContainer = activeZoomContainerRef.current;
    if (!activeContainer) {
      setCanZoomCurrent(false);
      return;
    }
    const image = activeContainer.querySelector("img");
    if (!(image instanceof HTMLImageElement)) {
      setCanZoomCurrent(false);
      return;
    }
    setCanZoomCurrent(canZoomImageElement(image));
  }, [withZoom]);

  const setZoomFromOrigin = useCallback(
    (origin?: { clientX: number; clientY: number }) => {
      setIsZoomed((current) => {
        if (current) {
          setZoomOffset(ZERO_ZOOM_OFFSET);
          setZoomScale(DEFAULT_ZOOM_SCALE);
          return false;
        }
        const activeContainer = activeZoomContainerRef.current;
        if (!activeContainer) return current;
        const image = activeContainer.querySelector("img");
        if (!(image instanceof HTMLImageElement)) return current;
        const containerRect = activeContainer.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        const targetScale = getTargetZoomScale({
          image,
          containerWidth: containerRect.width,
          containerHeight: containerRect.height,
        });
        const maxZoomScale = getImageMaxZoomScale(image);
        if (maxZoomScale <= 1.01 || targetScale <= 1.01) return current;
        zoomBaseSizeRef.current = { width: imageRect.width, height: imageRect.height };
        setZoomScale(targetScale);
        setZoomOffset(
          origin
            ? getInitialZoomOffset({
                containerRect,
                imageRect,
                zoomScale: targetScale,
                pointerClientX: origin.clientX,
                pointerClientY: origin.clientY,
              })
            : ZERO_ZOOM_OFFSET,
        );
        return true;
      });
    },
    [],
  );

  const toggleZoom = useCallback(() => {
    if (!withZoom) return;
    setZoomFromOrigin();
  }, [setZoomFromOrigin, withZoom]);

  const toggleZoomAt = useCallback(
    (origin: { clientX: number; clientY: number }) => {
      if (!withZoom) return;
      setZoomFromOrigin(origin);
    },
    [setZoomFromOrigin, withZoom],
  );

  const handleZoomPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!withZoom || !canZoomCurrent) return;
      const target = event.target as HTMLElement | null;
      if (!isImageTarget(target)) return;
      const startX = getPointerCoordinate(event.clientX, 0);
      const startY = getPointerCoordinate(event.clientY, 0);
      if (isZoomed) {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        setIsDraggingZoom(true);
      }
      dragRef.current = {
        pointerId: event.pointerId,
        startX,
        startY,
        originX: zoomOffset.x,
        originY: zoomOffset.y,
        canPan: isZoomed,
        moved: false,
      };
    },
    [withZoom, canZoomCurrent, isZoomed, zoomOffset.x, zoomOffset.y],
  );

  const handleZoomPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const currentX = getPointerCoordinate(event.clientX, drag.startX);
      const currentY = getPointerCoordinate(event.clientY, drag.startY);
      const deltaX = currentX - drag.startX;
      const deltaY = currentY - drag.startY;
      if (hasPointerMoved({ startX: drag.startX, startY: drag.startY, endX: currentX, endY: currentY })) {
        drag.moved = true;
      }
      if (!drag.canPan) return;
      const containerRect = event.currentTarget.getBoundingClientRect();
      const baseSize = zoomBaseSizeRef.current;
      if (!baseSize) return;
      const nextOffset = clampZoomOffset({
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
        imageWidth: baseSize.width,
        imageHeight: baseSize.height,
        zoomScale,
        nextX: drag.originX + deltaX,
        nextY: drag.originY + deltaY,
      });
      setZoomOffset(nextOffset);
    },
    [zoomScale],
  );

  const handleZoomPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (drag.canPan) {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }
      const endX = getPointerCoordinate(event.clientX, drag.startX);
      const endY = getPointerCoordinate(event.clientY, drag.startY);
      if (hasPointerMoved({ startX: drag.startX, startY: drag.startY, endX, endY })) {
        drag.moved = true;
      }
      // Fix 2: was `drag.canToggleOnRelease && !drag.moved`; simplified to `!drag.moved`.
      const shouldToggleZoom = !drag.moved;
      dragRef.current = null;
      setIsDraggingZoom(false);
      if (shouldToggleZoom) {
        toggleZoomAt({ clientX: endX, clientY: endY });
      }
    },
    [toggleZoomAt],
  );

  useEffect(() => {
    if (!opened) resetZoom();
  }, [opened, resetZoom]);

  useEffect(() => {
    if (!withZoom) {
      resetZoom();
      setCanZoomCurrent(false);
      return;
    }
    updateCanZoomAvailability();
  }, [withZoom, resetZoom, updateCanZoomAvailability]);

  useEffect(() => {
    if (!opened) return;
    const handleResize = () => {
      if (isZoomedRef.current) resetZoom();
      requestAnimationFrame(updateCanZoomAvailability);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [opened, resetZoom, updateCanZoomAvailability]);

  useEffect(() => {
    isZoomedRef.current = isZoomed;
  }, [isZoomed]);

  useEffect(() => {
    if (!opened) {
      setCanZoomCurrent(false);
      return;
    }
    const frameId = requestAnimationFrame(updateCanZoomAvailability);
    return () => cancelAnimationFrame(frameId);
  }, [opened, updateCanZoomAvailability]);

  useEffect(() => {
    if (isZoomed && !canZoomCurrent) resetZoom();
  }, [isZoomed, canZoomCurrent, resetZoom]);

  return {
    isZoomed,
    isDraggingZoom,
    zoomOffset,
    zoomScale,
    canZoomCurrent,
    activeZoomContainerRef,
    resetZoom,
    toggleZoom,
    updateCanZoomAvailability,
    handleZoomPointerDown,
    handleZoomPointerMove,
    handleZoomPointerEnd,
  };
}
```

### Step 2 — Run all tests (no regressions expected yet)

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: **29 passed, 0 failed.**

---

## Task 4: Update types — `Lightbox.tsx` and `Lightbox.context.ts`

**Files:**
- Modify: `packages/lightbox/src/Lightbox.tsx`
- Modify: `packages/lightbox/src/Lightbox.context.ts`

### Step 1 — Update `Lightbox.tsx`

Add `"zoomContainer" | "zoomContent" | "zoomButton"` to `LightboxStylesNames` and `withZoom?: boolean` to `LightboxProps`.

In `Lightbox.tsx`, the current `LightboxStylesNames` ends with `"thumbnailButton"`. Replace the full type with:

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

In `LightboxProps`, add after `lockScroll`:

```ts
/** Whether to show the zoom toggle button in the toolbar, `false` by default */
withZoom?: boolean;
```

### Step 2 — Update `Lightbox.context.ts`

Add the zoom state fields. The import block needs `PointerEvent as ReactPointerEvent` and the `ZoomOffset` type. Full updated file:

```ts
import { createSafeContext, type GetStylesApi } from "@mantine/core";
import type { EmblaCarouselType } from "embla-carousel";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import type { LightboxFactory } from "./Lightbox.js";
import type { ZoomOffset } from "./utils/zoom.js";

export interface LightboxContext {
  getStyles: GetStylesApi<LightboxFactory>;
  opened: boolean;
  currentIndex: number;
  slideCount: number | null;
  slidesEmblaRef: RefObject<EmblaCarouselType | null>;
  thumbnailsEmblaRef: RefObject<EmblaCarouselType | null>;
  setCurrentIndex: (index: number) => void;
  setSlideCount: (count: number | null) => void;
  onClose: () => void;
  onOutsideClick: () => void;
  onThumbnailClick: (index: number) => void;
  onScrollPrev: () => void;
  onScrollNext: () => void;
  orientation: "horizontal" | "vertical";
  // Zoom
  withZoom: boolean;
  isZoomed: boolean;
  isDraggingZoom: boolean;
  canZoomCurrent: boolean;
  zoomOffset: ZoomOffset;
  zoomScale: number;
  activeZoomContainerRef: RefObject<HTMLDivElement | null>;
  toggleZoom: () => void;
  updateCanZoomAvailability: () => void;
  handleZoomPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleZoomPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

export const [LightboxProvider, useLightboxContext] =
  createSafeContext<LightboxContext>(
    "Lightbox component was not found in the tree",
  );
```

### Step 3 — Run type check

```bash
pnpm tsc --filter @mantine-bites/lightbox
```

Expected: TypeScript errors about missing context fields — **that is expected** at this stage. The errors will disappear as we update `LightboxRoot` in Task 5.

---

## Task 5: Wire `useZoom` into `LightboxRoot`

**Files:**
- Modify: `packages/lightbox/src/components/LightboxRoot.tsx`

### Step 1 — Update `LightboxRoot.tsx`

Changes:
1. Import `useZoom` and `useEffect`
2. Extract `withZoom` from props (add to destructure + `defaultProps`)
3. Call `useZoom({ opened, withZoom: withZoom ?? false })`
4. Add `useEffect` to reset zoom on slide change
5. Add all zoom fields to the context value

Replace the complete file:

```tsx
import {
  Box,
  factory,
  getDefaultZIndex,
  OptionalPortal,
  Overlay,
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
import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useRef, useState } from "react";
import { LightboxProvider } from "../Lightbox.context.js";
import type { LightboxFactory, LightboxProps } from "../Lightbox.js";
import classes from "../Lightbox.module.css";
import { useZoom } from "../hooks/useZoom.js";
import { LightboxControls } from "./LightboxControls.js";
import { LightboxCounter } from "./LightboxCounter.js";
import { LightboxSlide } from "./LightboxSlide.js";
import { LightboxSlides } from "./LightboxSlides.js";
import { LightboxThumbnail } from "./LightboxThumbnail.js";
import { LightboxThumbnails } from "./LightboxThumbnails.js";
import { LightboxToolbar } from "./LightboxToolbar.js";

const defaultProps: Partial<LightboxProps> = {
  closeOnClickOutside: true,
  keepMounted: false,
  trapFocus: true,
  lockScroll: true,
  returnFocus: true,
  withinPortal: true,
  withZoom: false,
  orientation: "horizontal",
  transitionProps: {
    transition: "fade",
    duration: 250,
  },
  overlayProps: {
    fixed: true,
    backgroundOpacity: 0.9,
    color: "#18181B",
    zIndex: getDefaultZIndex("modal"),
  },
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
    transitionProps,
    overlayProps,
    orientation,
    withZoom,
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

  const _transitionProps = {
    ...defaultProps.transitionProps,
    ...transitionProps,
  };

  const _overlayProps = { ...defaultProps.overlayProps, ...overlayProps };

  const focusTrapRef = useFocusTrap(opened && trapFocus);
  const mergedRef = useMergedRef(ref, focusTrapRef);
  useFocusReturn({ opened, shouldReturnFocus: returnFocus });

  const slidesEmblaRef = useRef<EmblaCarouselType | null>(null);
  const thumbnailsEmblaRef = useRef<EmblaCarouselType | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideCount, setSlideCount] = useState<number | null>(null);

  const {
    isZoomed,
    isDraggingZoom,
    zoomOffset,
    zoomScale,
    canZoomCurrent,
    activeZoomContainerRef,
    resetZoom,
    toggleZoom,
    updateCanZoomAvailability,
    handleZoomPointerDown,
    handleZoomPointerMove,
    handleZoomPointerEnd,
  } = useZoom({ opened, withZoom: withZoom ?? false });

  // Reset zoom whenever the user navigates to a different slide.
  useEffect(() => {
    resetZoom();
  }, [currentIndex, resetZoom]);

  useHotkeys([
    [
      "ArrowLeft",
      () =>
        orientation === "horizontal" &&
        opened &&
        slidesEmblaRef.current?.scrollPrev(),
    ],
    [
      "ArrowRight",
      () =>
        orientation === "horizontal" &&
        opened &&
        slidesEmblaRef.current?.scrollNext(),
    ],
    [
      "ArrowUp",
      () =>
        orientation === "vertical" &&
        opened &&
        slidesEmblaRef.current?.scrollPrev(),
    ],
    [
      "ArrowDown",
      () =>
        orientation === "vertical" &&
        opened &&
        slidesEmblaRef.current?.scrollNext(),
    ],
    ["Escape", () => opened && onClose()],
  ]);

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
    if (!closeOnClickOutside) return;
    onClose();
  }, [closeOnClickOutside, onClose]);

  return (
    <OptionalPortal withinPortal={withinPortal}>
      <RemoveScroll enabled={lockScroll && opened}>
        <Transition
          {..._transitionProps}
          mounted={opened}
          keepMounted={keepMounted}
        >
          {(transitionStyles) => (
            <LightboxProvider
              value={{
                getStyles,
                opened,
                currentIndex,
                slideCount,
                slidesEmblaRef,
                thumbnailsEmblaRef,
                setCurrentIndex,
                setSlideCount,
                onClose,
                onOutsideClick: handleOutsideClick,
                onThumbnailClick: handleThumbnailClick,
                onScrollPrev: handleScrollPrev,
                onScrollNext: handleScrollNext,
                orientation: orientation ?? "horizontal",
                withZoom: withZoom ?? false,
                isZoomed,
                isDraggingZoom,
                canZoomCurrent,
                zoomOffset,
                zoomScale,
                activeZoomContainerRef,
                toggleZoom,
                updateCanZoomAvailability,
                handleZoomPointerDown,
                handleZoomPointerMove,
                handleZoomPointerEnd,
              }}
            >
              <Overlay
                {..._overlayProps}
                {...getStyles("overlay", { style: transitionStyles })}
              />
              <Box
                ref={mergedRef}
                {...getStyles("root", { style: transitionStyles })}
                data-orientation={orientation}
                {...others}
              >
                {children}
              </Box>
            </LightboxProvider>
          )}
        </Transition>
      </RemoveScroll>
    </OptionalPortal>
  );
});

LightboxRoot.displayName = "LightboxRoot";
LightboxRoot.classes = classes;
LightboxRoot.Root = LightboxRoot;
LightboxRoot.Toolbar = LightboxToolbar;
LightboxRoot.Counter = LightboxCounter;
LightboxRoot.Controls = LightboxControls;
LightboxRoot.Slides = LightboxSlides;
LightboxRoot.Thumbnails = LightboxThumbnails;
LightboxRoot.Thumbnail = LightboxThumbnail;
LightboxRoot.Slide = LightboxSlide;
```

### Step 2 — Run all tests (no regressions expected)

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: **29 passed, 0 failed.**

---

## Task 6: Update `hooks/useSlideInteractions.ts`

**Files:**
- Modify: `packages/lightbox/src/hooks/useSlideInteractions.ts`

### Step 1 — Update the hook

Add zoom inputs and `handleSlideLoadCapture` output. Each pointer handler now calls the corresponding zoom handler alongside the existing outside-close logic.

Replace the complete file:

```ts
import type { PointerEvent as ReactPointerEvent, SyntheticEvent } from "react";
import { useCallback, useRef } from "react";
import {
  createOutsideClosePointerState,
  isEventTargetWithinSelector,
  type OutsideClosePointerState,
  shouldCloseFromOutsidePointerState,
  updateOutsideClosePointerState,
} from "../utils/pointer.js";

interface UseSlideInteractionsProps {
  onClose: () => void;
  onZoomPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onZoomPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
  updateCanZoomAvailability: () => void;
}

interface UseSlideInteractionsReturn {
  handleSlidePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleSlidePointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleSlidePointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleSlidePointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleSlideLoadCapture: (event: SyntheticEvent<HTMLDivElement>) => void;
}

/**
 * Combines outside-content close detection with zoom pointer event delegation
 * for a single lightbox slide element.
 *
 * Tracks whether each pointer press originated outside `[data-lightbox-slide-content]`
 * and closes the lightbox on release if the pointer did not drag. Zoom pointer
 * events are forwarded to the provided zoom handlers throughout.
 */
export function useSlideInteractions(
  props: UseSlideInteractionsProps,
): UseSlideInteractionsReturn {
  const {
    onClose,
    onZoomPointerDown,
    onZoomPointerMove,
    onZoomPointerEnd,
    updateCanZoomAvailability,
  } = props;

  const outsideClosePointerRef = useRef<OutsideClosePointerState | null>(null);

  const handleSlidePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const startedInsideContent = isEventTargetWithinSelector(
        event.target,
        "[data-lightbox-slide-content]",
      );
      outsideClosePointerRef.current = createOutsideClosePointerState({
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        startedOutsideContent: !startedInsideContent,
      });
      onZoomPointerDown(event);
    },
    [onZoomPointerDown],
  );

  const handleSlidePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const outsideClosePointer = outsideClosePointerRef.current;
      if (outsideClosePointer && outsideClosePointer.pointerId === event.pointerId) {
        outsideClosePointerRef.current = updateOutsideClosePointerState(
          outsideClosePointer,
          { clientX: event.clientX, clientY: event.clientY },
        );
      }
      onZoomPointerMove(event);
    },
    [onZoomPointerMove],
  );

  const handleSlidePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onZoomPointerEnd(event);

      const outsideClosePointer = outsideClosePointerRef.current;
      if (!outsideClosePointer || outsideClosePointer.pointerId !== event.pointerId) {
        return;
      }
      const finalizedPointer = updateOutsideClosePointerState(
        outsideClosePointer,
        { clientX: event.clientX, clientY: event.clientY },
      );
      outsideClosePointerRef.current = null;
      if (shouldCloseFromOutsidePointerState(finalizedPointer)) {
        onClose();
      }
    },
    [onClose, onZoomPointerEnd],
  );

  const handleSlidePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      outsideClosePointerRef.current = null;
      onZoomPointerEnd(event);
    },
    [onZoomPointerEnd],
  );

  const handleSlideLoadCapture = useCallback(
    (event: SyntheticEvent<HTMLDivElement>) => {
      if (event.target instanceof HTMLImageElement) {
        updateCanZoomAvailability();
      }
    },
    [updateCanZoomAvailability],
  );

  return {
    handleSlidePointerDown,
    handleSlidePointerMove,
    handleSlidePointerUp,
    handleSlidePointerCancel,
    handleSlideLoadCapture,
  };
}
```

### Step 2 — Run all tests (no regressions expected)

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: **29 passed, 0 failed.**

> If any existing test fails it is because the `LightboxSlide` component calls `useSlideInteractions` and you must update it in the next task to pass the new required props. Move to Task 7 and then re-run.

---

## Task 7: Update `components/LightboxSlide.tsx`

**Files:**
- Modify: `packages/lightbox/src/components/LightboxSlide.tsx`

### Step 1 — Update `LightboxSlide.tsx`

Replace the complete file. Key changes:
- Pull zoom state + handlers from context
- Pass zoom handlers to `useSlideInteractions`
- Render `zoomContainer` → `zoomContent` → `display:contents` structure
- Attach `activeZoomContainerRef` and data attributes on the active slide
- Attach `handleSlideLoadCapture` to the outer slide box

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
import { getZoomTransform } from "../utils/zoom.js";
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

  const {
    currentIndex,
    getStyles,
    onOutsideClick,
    withZoom,
    isZoomed,
    isDraggingZoom,
    canZoomCurrent,
    zoomOffset,
    zoomScale,
    activeZoomContainerRef,
    handleZoomPointerDown,
    handleZoomPointerMove,
    handleZoomPointerEnd,
    updateCanZoomAvailability,
  } = useLightboxContext();

  const { index } = useLightboxSlideContext();

  const {
    handleSlidePointerDown,
    handleSlidePointerMove,
    handleSlidePointerUp,
    handleSlidePointerCancel,
    handleSlideLoadCapture,
  } = useSlideInteractions({
    onClose: onOutsideClick,
    onZoomPointerDown: handleZoomPointerDown,
    onZoomPointerMove: handleZoomPointerMove,
    onZoomPointerEnd: handleZoomPointerEnd,
    updateCanZoomAvailability,
  });

  const isActive = index === currentIndex;

  return (
    <Box
      ref={ref}
      aria-current={isActive ? "true" : undefined}
      data-active={isActive || undefined}
      onPointerDown={isActive ? handleSlidePointerDown : undefined}
      onPointerMove={isActive ? handleSlidePointerMove : undefined}
      onPointerUp={isActive ? handleSlidePointerUp : undefined}
      onPointerCancel={isActive ? handleSlidePointerCancel : undefined}
      onLoadCapture={isActive ? handleSlideLoadCapture : undefined}
      {...getStyles("slide", {
        className,
        style,
        classNames,
        styles,
      })}
      {...others}
    >
      {/* zoomContainer is always rendered for layout stability; behaviour is
          gated via data attributes so CSS can apply appropriate cursors. */}
      <Box
        ref={isActive ? activeZoomContainerRef : undefined}
        data-zoom-enabled={withZoom || undefined}
        data-zoomed={(isActive && isZoomed) || undefined}
        data-can-zoom={isActive ? String(canZoomCurrent) : undefined}
        data-dragging={(isActive && isDraggingZoom) || undefined}
        {...getStyles("zoomContainer")}
      >
        <Box
          style={{
            transform: getZoomTransform({
              isZoomed: isActive && isZoomed,
              offset: zoomOffset,
              scale: zoomScale,
            }),
          }}
          {...getStyles("zoomContent")}
        >
          <Box style={{ display: "contents" }} data-lightbox-slide-content>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

LightboxSlide.classes = {} as Record<string, string>;
LightboxSlide.displayName = "LightboxSlide";
```

> **Note on `LightboxSlide.classes`:** The slide compound component uses `ctx.getStyles` (root factory styles), not its own CSS module. The current pattern assigns `classes` from the module — keep it as-is from the existing file (`import classes from "../Lightbox.module.css"` and `LightboxSlide.classes = classes`). The snippet above is simplified for clarity. Check what the file currently has and preserve it.

### Step 2 — Run all tests (no regressions expected)

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: **29 passed, 0 failed.**

---

## Task 8: Update `components/LightboxToolbar.tsx`

**Files:**
- Modify: `packages/lightbox/src/components/LightboxToolbar.tsx`

### Step 1 — Update `LightboxToolbar.tsx`

Replace the complete file:

```tsx
import { ActionIcon, CloseIcon } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";
import { ZoomIn } from "./ZoomIn.js";
import { ZoomOut } from "./ZoomOut.js";

export function LightboxToolbar() {
  const {
    onClose,
    getStyles,
    withZoom,
    isZoomed,
    canZoomCurrent,
    toggleZoom,
  } = useLightboxContext();

  return (
    <ActionIcon.Group {...getStyles("toolbar")}>
      {withZoom && (
        <ActionIcon
          variant="default"
          size="lg"
          onClick={toggleZoom}
          disabled={!canZoomCurrent}
          aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          {...getStyles("zoomButton")}
        >
          {isZoomed ? <ZoomOut /> : <ZoomIn />}
        </ActionIcon>
      )}
      <ActionIcon
        variant="default"
        size="lg"
        onClick={onClose}
        aria-label="Close lightbox"
        {...getStyles("closeButton")}
      >
        <CloseIcon />
      </ActionIcon>
    </ActionIcon.Group>
  );
}
```

### Step 2 — Run all tests (no regressions expected)

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: **29 passed, 0 failed.**

---

## Task 9: Update `Lightbox.module.css`

**Files:**
- Modify: `packages/lightbox/src/Lightbox.module.css`

### Step 1 — Update the CSS

The `.slide` rule loses its `display: flex`, `align-items`, `justify-content`, and `img` nested styles. Those move into the new `.zoomContainer`. This preserves existing visual layout while enabling the zoom container to control all image positioning.

Replace the `.slide` block and add `.zoomContainer`, `.zoomContent` after it:

```css
.slide {
  flex: 0 0 100%;
  height: 100%;
  line-height: 1;
}

.zoomContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  line-height: 1;

  img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }

  &[data-zoom-enabled] img { cursor: zoom-in; }
  &[data-zoom-enabled][data-zoomed] img { cursor: zoom-out; }
  &[data-zoom-enabled][data-can-zoom='false'] img { cursor: default; }
}

.zoomContent {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: transform 150ms ease;
  transform-origin: center;
  will-change: transform;
}

.zoomContainer[data-dragging] .zoomContent {
  transition: none;
}
```

### Step 2 — Run all tests (no regressions expected)

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: **29 passed, 0 failed.**

---

## Task 10: Add zoom integration tests (TDD)

**Files:**
- Modify: `packages/lightbox/src/Lightbox.test.tsx`

### Step 1 — Write the failing tests

Add these tests at the end of the `describe` block in `Lightbox.test.tsx`:

```ts
it("should not render zoom button by default", () => {
  renderLightbox();

  expect(screen.queryByLabelText("Zoom in")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Zoom out")).not.toBeInTheDocument();
});

it("should render zoom button when withZoom is true", () => {
  renderLightbox({ rootProps: { withZoom: true } });

  expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
});

it("should render zoom button disabled when no image has loaded", () => {
  renderLightbox({ rootProps: { withZoom: true } });

  // In JSDOM, naturalWidth/naturalHeight are 0 so canZoomImageElement returns
  // false. The button must be disabled, not hidden.
  expect(screen.getByLabelText("Zoom in")).toBeDisabled();
});
```

### Step 2 — Run tests to confirm new tests fail (existing 29 still pass)

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: **29 passed, 3 failed** — the three new tests should fail because `withZoom` is not yet plumbed or the button is missing.

> If all 32 pass immediately, the implementation from earlier tasks is complete — skip to Step 4.

### Step 3 — Diagnose and fix any failures

Read the failure messages carefully. Common causes:
- `withZoom` prop missing from `LightboxProps` → check Task 4
- Zoom button not rendered → check Task 8
- Zoom button present but enabled (unexpected) → `canZoomCurrent` initial state issue → check Task 3 fix 1

### Step 4 — Run all tests and confirm full pass

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: **32 passed, 0 failed.**

### Step 5 — Run linting and type check

```bash
pnpm lint --filter @mantine-bites/lightbox
pnpm tsc --filter @mantine-bites/lightbox
```

Expected: **zero errors** on both.

---

## Final verification

Run everything one more time to confirm a clean state:

```bash
pnpm test --filter @mantine-bites/lightbox
pnpm lint --filter @mantine-bites/lightbox
pnpm tsc --filter @mantine-bites/lightbox
```

All three must exit with zero errors before the branch is ready for PR.

# Zoom Reimplementation Design

**Date:** 2026-03-01
**Branch:** `feat/compound-component`
**Status:** Approved

## Overview

Re-introduce zoom functionality into the compound component rewrite of `@mantine-bites/lightbox`. The feature existed on `main` but was dropped during the rewrite. This document captures the agreed design decisions before implementation.

## API

`withZoom` is added as a boolean prop on `LightboxRoot` (and the `Lightbox` alias):

```tsx
<Lightbox.Root opened={opened} onClose={onClose} withZoom>
```

`withZoom` lives on the root because zoom affects two sibling subtrees: `LightboxSlides`/`LightboxSlide` (pointer handling, transform) and `LightboxToolbar` (zoom toggle button). The root context is the only shared ancestor — placing it on either sibling would require backwards context propagation.

## File Map

| File | Change |
|---|---|
| `utils/zoom.ts` | New — zoom math utilities |
| `hooks/useZoom.ts` | New — ported from `main` with improvements |
| `Lightbox.tsx` | Add `withZoom?: boolean` prop; add `"zoomContainer" \| "zoomContent" \| "zoomButton"` to `LightboxStylesNames` |
| `Lightbox.context.ts` | Add zoom state fields |
| `components/LightboxRoot.tsx` | Call `useZoom`, wire context, reset zoom on slide change |
| `components/LightboxSlide.tsx` | Inject zoom container structure, attach ref, pass handlers |
| `hooks/useSlideInteractions.ts` | Add zoom delegation + `handleSlideLoadCapture` |
| `components/LightboxToolbar.tsx` | Add conditional zoom toggle button + icons |
| `components/ZoomIn.tsx` | New — zoom in SVG icon |
| `components/ZoomOut.tsx` | New — zoom out SVG icon |
| `Lightbox.module.css` | Add `.zoomContainer`, `.zoomContent`; update `.slide` |

## Zoom State — `LightboxContext` additions

```ts
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
```

`isZoomedRef` stays internal to `useZoom` — only used by the resize handler, no need to expose via context.

## `utils/zoom.ts`

New file. Contains only zoom math — pointer utilities stay in `utils/pointer.ts`.

Exports: `ZoomOffset`, `DEFAULT_ZOOM_SCALE`, `ZERO_ZOOM_OFFSET`, `clampZoomOffset`, `getInitialZoomOffset`, `getZoomTransform`, `getImageMaxZoomScale`, `getTargetZoomScale`, `canZoomImageElement`.

## `hooks/useZoom.ts`

Ported from `main` with two improvements:

### Improvement 1: `canZoomCurrent` initial state

Main initialised as `useState(withZoom)`, causing the zoom button to flash enabled before the first availability check. Fixed to `useState(false)` — the button starts disabled and enables once the image is confirmed zoomable.

### Improvement 2: Remove `canToggleOnRelease` from `dragRef`

`canToggleOnRelease` and `moved` were always inverses after initialisation. `canToggleOnRelease` is removed; call sites use `!drag.moved` directly.

## `components/LightboxSlide.tsx` — zoom container structure

The zoom container is always rendered (regardless of `withZoom`) to avoid layout shifts. Behaviour is gated via data attributes.

```
slide Box (pointer events, flex)
└── zoomContainer Box  ← activeZoomContainerRef when active
    └── zoomContent Box  ← CSS transform applied here
        └── display:contents Box [data-lightbox-slide-content]
            └── {children}
```

Pointer events remain on the outer `slide` Box (consistent with current pattern). The `zoomContainer` and `slide` share the same bounding rect (both 100% width/height), so `event.currentTarget.getBoundingClientRect()` in pan calculations is correct.

Data attributes on `zoomContainer`:

```tsx
ref={isActive ? activeZoomContainerRef : undefined}
data-zoom-enabled={withZoom || undefined}
data-zoomed={(isActive && isZoomed) || undefined}
data-can-zoom={isActive ? String(canZoomCurrent) : undefined}
data-dragging={(isActive && isDraggingZoom) || undefined}
```

`data-zoom-enabled` is the exception — it's a feature flag, not slide state, so it sits on all slides.

## `hooks/useSlideInteractions.ts`

New inputs:
```ts
onZoomPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
onZoomPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
onZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
updateCanZoomAvailability: () => void;
```

New output:
```ts
handleSlideLoadCapture: (event: SyntheticEvent<HTMLDivElement>) => void;
```

Each pointer handler delegates to its zoom counterpart alongside outside-close logic. `handleSlideLoadCapture` calls `updateCanZoomAvailability()` when an image finishes loading. No null-checking needed — `useZoom` always returns real functions regardless of `withZoom`.

## `components/LightboxToolbar.tsx`

Zoom button added before close button:

```tsx
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
```

Button is **disabled** (not hidden) when `canZoomCurrent` is false — hiding it would cause toolbar width shifts when navigating between zoomable and non-zoomable slides.

## CSS

`.slide` loses its `img` nested styles and flex centering (moved to `.zoomContainer`). Keeps `flex: 0 0 100%`, `height: 100%`, `line-height: 1`.

```css
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

## `LightboxRoot.tsx` — zoom reset on slide change

`useZoom` is called in `LightboxRoot` (it needs `opened`). One additional `useEffect` resets zoom on slide navigation — this is a bug fix over `main`, which left `isZoomed` stale after navigation:

```ts
useEffect(() => {
  resetZoom();
}, [currentIndex, resetZoom]);
```

## Styles API

New entries in `LightboxStylesNames`: `"zoomContainer"`, `"zoomContent"`, `"zoomButton"`. All three are customisable via the styles API.

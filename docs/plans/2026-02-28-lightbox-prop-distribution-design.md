# Lightbox Prop Distribution Design

**Date:** 2026-02-28
**Status:** Approved

## Goal

Remove the top-level `<Lightbox>` convenience wrapper. Move all configuration props from `LightboxRoot` into their respective compound components. Breaking change — project is in beta.

## New Usage Pattern

```jsx
<Lightbox.Root
  opened={opened}
  onClose={onClose}
  closeOnClickOutside={false}
  trapFocus
  lockScroll
  returnFocus
  keepMounted={false}
  withinPortal
>
  <Lightbox.Overlay backgroundOpacity={0.95} color="#18181B" />
  <Lightbox.Content transitionProps={{ transition: "slide-up" }}>
    <Lightbox.Toolbar />
    <Lightbox.Slides initialSlide={1} emblaOptions={{ loop: true }}>
      <Lightbox.Slide><img src="..." /></Lightbox.Slide>
    </Lightbox.Slides>
    <Lightbox.Controls size={48} />
    <Lightbox.Counter formatter={(i, t) => `${i} of ${t}`} />
    <Lightbox.Thumbnails emblaOptions={{ dragFree: false }}>
      <Lightbox.Thumbnail><img src="..." /></Lightbox.Thumbnail>
    </Lightbox.Thumbnails>
  </Lightbox.Content>
</Lightbox.Root>
```

## Prop Distribution Map

| Current location | Prop | Moves to |
|---|---|---|
| `LightboxRoot` | `opened` | `LightboxRoot` (stays) |
| `LightboxRoot` | `onClose` | `LightboxRoot` (stays) |
| `LightboxRoot` | `initialSlide` | `LightboxSlides` |
| `modalProps` | `closeOnClickOutside` | `LightboxRoot` (flattened) |
| `modalProps` | `keepMounted` | `LightboxRoot` (flattened) |
| `modalProps` | `trapFocus` | `LightboxRoot` (flattened) |
| `modalProps` | `returnFocus` | `LightboxRoot` (flattened) |
| `modalProps` | `lockScroll` | `LightboxRoot` (flattened) |
| `portalProps` | `withinPortal` | `LightboxRoot` (flattened) |
| `portalProps` | `...BasePortalProps` | `LightboxRoot` (flattened) |
| `overlayProps` | `backgroundOpacity`, `color`, `zIndex`, etc. | `LightboxOverlay` (direct spread) |
| `transitionProps` | `transition`, `duration`, etc. | `LightboxContent` |
| `slideCarouselProps` | `controlSize` | `LightboxControls` (as `size`) |
| `slideCarouselProps` | `counterFormatter` | `LightboxCounter` (as `formatter`) |
| `slideCarouselProps` | `emblaOptions` | `LightboxSlides` |
| `thumbnailCarouselProps` | `emblaOptions` | `LightboxThumbnails` |

## Context Changes

The context is trimmed to **shared state and handlers only**. Configuration no longer leaks through it.

### Removed from context

| Removed | Reason |
|---|---|
| `transitionStyles` | `LightboxContent` computes locally from its own `transitionProps` |
| `overlayProps` | `LightboxOverlay` reads from its own props directly |
| `slideCarouselProps` | Dissolved — each consumer owns its slice |
| `thumbnailCarouselProps` | Dissolved — `LightboxThumbnails` owns its `emblaOptions` |
| `counterLabel` | `LightboxCounter` computes locally from `currentIndex` + `slideCount` + its own `formatter` |

### Stays in context

```typescript
interface LightboxContext {
  getStyles: GetStylesApi<LightboxFactory>;
  mergedRef: (node: HTMLDivElement | null) => void;
  currentIndex: number;
  slideCount: number;
  onSlidesCarouselInit: (embla: EmblaCarouselType) => void;
  onThumbnailsCarouselInit: (embla: EmblaCarouselType) => void;
  onClose: () => void;
  onOutsideClick: () => void;
  onThumbnailClick: (index: number) => void;
  onScrollPrev: () => void;
  onScrollNext: () => void;
}
```

## Per-Component Implementation Details

Each component that gains props follows the same pattern already used by `LightboxRoot`: `useProps` with local `defaultProps`. `LIGHTBOX_DEFAULT_PROPS` is dissolved entirely.

### `LightboxRoot`

Gains flattened modal/portal props. Loses all carousel/overlay/transition configuration.

```typescript
const defaultProps: Partial<LightboxRootProps> = {
  closeOnClickOutside: true,
  keepMounted: false,
  trapFocus: true,
  lockScroll: true,
  returnFocus: true,
  withinPortal: true,
};
```

### `LightboxOverlay`

Already spreads `OverlayProps`. Just gains defaults.

```typescript
const defaultProps: Partial<LightboxOverlayProps> = {
  fixed: true,
  backgroundOpacity: 0.9,
  color: "#18181B",
  zIndex: 200,
};
```

### `LightboxContent`

Gains `transitionProps`.

```typescript
const defaultProps: Partial<LightboxContentProps> = {
  transitionProps: { transition: "fade", duration: 250 },
};
```

### `LightboxSlides`

Gains `initialSlide` and `emblaOptions`. Merges them internally before passing to Embla: `{ ...emblaOptions, startIndex: initialSlide }`.

```typescript
const defaultProps: Partial<LightboxSlidesProps> = {
  initialSlide: 0,
};
```

### `LightboxThumbnails`

Gains `emblaOptions`.

```typescript
const defaultProps: Partial<LightboxThumbnailsProps> = {
  emblaOptions: { dragFree: true },
};
```

### `LightboxControls`

Gains `size` (renamed from `controlSize`). Reads handlers from context.

```typescript
const defaultProps: Partial<LightboxControlsProps> = {
  size: 36,
};
```

### `LightboxCounter`

Gains `formatter`. Reads `currentIndex` and `slideCount` from context, computes label locally.

```typescript
const defaultProps: Partial<LightboxCounterProps> = {
  // formatter is optional, falls back to `${currentIndex + 1} / ${slideCount}`
};
```

## Files to Change

- `Lightbox.tsx` — delete (top-level convenience wrapper removed)
- `Lightbox.defaults.ts` — delete (defaults dissolved into each component)
- `Lightbox.context.ts` — trim to shared state/handlers only
- `LightboxRoot.tsx` — flatten modalProps/portalProps, remove carousel/overlay/transition props
- `LightboxOverlay.tsx` — add `defaultProps`
- `LightboxContent.tsx` — add `transitionProps` prop + `defaultProps`
- `LightboxSlides.tsx` — add `initialSlide` + `emblaOptions` props, merge before Embla init
- `LightboxThumbnails.tsx` — add `emblaOptions` prop + `defaultProps`
- `LightboxControls.tsx` — add `size` prop (rename from `controlSize`), stop reading from context
- `LightboxCounter.tsx` — add `formatter` prop, compute label locally from context state
- `index.ts` — update exports (remove top-level `Lightbox` type exports, add new prop types)
- Stories + tests — update to new API

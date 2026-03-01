# Lightbox Orientation Feature Design

## Summary

Add `orientation: 'horizontal' | 'vertical'` to the Lightbox component, modeled after `@mantine/carousel`. Vertical orientation scrolls slides top-to-bottom, repositions controls to top/bottom, and moves the thumbnails strip to a vertical column on the left side.

## Prop Location

`orientation` lives on `LightboxRoot` / `Lightbox` — a single top-level prop that flows through context to all sub-components.

```tsx
<Lightbox opened={opened} onClose={close} orientation="vertical">
  <Lightbox.Controls />
  <Lightbox.Slides>...</Lightbox.Slides>
  <Lightbox.Thumbnails>...</Lightbox.Thumbnails>
</Lightbox>
```

Default: `'horizontal'`.

## Affected Files

| File | Change |
|------|--------|
| `Lightbox.tsx` | Add `orientation` to `LightboxProps` |
| `Lightbox.context.ts` | Add `orientation` to `LightboxContext` interface |
| `LightboxRoot.tsx` | Destructure `orientation`, pass to context, add `data-orientation` to root `Box`, update hotkeys |
| `LightboxSlides.tsx` | Read `orientation` from context, set embla `axis`, add `data-orientation` to container |
| `LightboxControls.tsx` | Read `orientation` from context, swap chevron SVGs for vertical |
| `LightboxThumbnails.tsx` | Read `orientation` from context, pass `data-orientation`, pass `axis` to embla |
| `useThumbnails.ts` | Update overflow detection for vertical (`scrollHeight > clientHeight`) |
| `Lightbox.module.css` | Orientation-conditional layout rules |

## Detailed Changes

### `LightboxProps` (Lightbox.tsx)

```ts
orientation?: 'horizontal' | 'vertical';
```

### `LightboxContext` (Lightbox.context.ts)

```ts
orientation: 'horizontal' | 'vertical';
```

### `LightboxRoot` (LightboxRoot.tsx)

- Default `orientation` to `'horizontal'`
- Add `data-orientation={orientation}` to root `Box`
- Pass `orientation` into `LightboxProvider`
- Update hotkeys: vertical uses `ArrowUp`/`ArrowDown`; horizontal uses `ArrowLeft`/`ArrowRight`

### `LightboxSlides` (LightboxSlides.tsx)

- Read `orientation` from `useLightboxContext()`
- Merge `axis: orientation === 'vertical' ? 'y' : 'x'` into embla options
- Add `data-orientation={orientation}` to `slidesContainer` Box

### `LightboxControls` (LightboxControls.tsx)

- Read `orientation` from context
- Render up/down chevrons for vertical, left/right chevrons for horizontal

### `LightboxThumbnails` (LightboxThumbnails.tsx)

- Read `orientation` from context
- Add `data-orientation={orientation}` to thumbnails wrapper Box
- For vertical: merge `axis: 'y'` into embla options passed to `useThumbnails`

### `useThumbnails` (hooks/useThumbnails.ts)

- Accept `orientation` in props
- Overflow check: `scrollHeight > clientHeight` when vertical, `scrollWidth > clientWidth` when horizontal

### CSS (Lightbox.module.css)

**Root layout:**
```css
.root {
  flex-direction: column; /* horizontal default */

  &[data-orientation='vertical'] {
    flex-direction: row;
  }
}
```

**Controls positioning:**
```css
.control {
  /* horizontal: left/right at vertical center (existing) */

  &[data-direction='prev'] { left: spacing-md; top: 50%; transform: translateY(-50%); }
  &[data-direction='next'] { right: spacing-md; top: 50%; transform: translateY(-50%); }

  /* vertical: top/bottom at horizontal center */
  .root[data-orientation='vertical'] & {
    &[data-direction='prev'] { top: spacing-md; left: 50%; transform: translateX(-50%); right: auto; }
    &[data-direction='next'] { bottom: spacing-md; left: 50%; transform: translateX(-50%); right: auto; top: auto; }
  }
}
```

**Thumbnails layout:**
```css
.thumbnails {
  /* horizontal: stays at bottom */
  &[data-orientation='vertical'] {
    padding: spacing-md;
    max-width: auto;
    max-height: 100%;
  }
}

.thumbnailsViewport {
  width: 100%;               /* horizontal */
  &[data-orientation='vertical'] { width: auto; height: 100%; }
}

.thumbnailsContainer {
  flex-direction: row;       /* horizontal */
  &[data-orientation='vertical'] { flex-direction: column; }
}

.thumbnailSlide {
  margin-right: spacing-xs;  /* horizontal */
  &[data-orientation='vertical'] { margin-right: 0; margin-bottom: spacing-xs; }
}
```

**Slides container:**
```css
.slidesContainer {
  flex-direction: row;       /* horizontal */
  &[data-orientation='vertical'] { flex-direction: column; }
}
```

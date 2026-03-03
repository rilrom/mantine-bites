# Lightbox Toolbar Composition

**Date:** 2026-03-03
**Branch:** feat/compound-component

## Goal

Allow consumers to compose toolbar buttons individually rather than only using the monolithic `LightboxToolbar`. Also expose `useLightboxContext` so consumers can build fully custom buttons.

## Design

### New button sub-components

Four new components, each extracted from the toolbar's existing logic:

| Component | Selector | Auto-hides when |
|---|---|---|
| `LightboxCloseButton` | `closeButton` | never |
| `LightboxZoomButton` | `zoomButton` | `!withZoom` |
| `LightboxFullscreenButton` | `fullscreenButton` | `!withFullscreen` |
| `LightboxAutoplayButton` | `autoplayButton` | `!canAutoPlay` |

Each component:
- Calls `useLightboxContext()` internally
- Uses `getStyles(selector, { classNames, styles })` from that context
- Has its own `Factory` type with `compound: true` and its single stylesName selector
- Works anywhere inside `<Lightbox.Root>` (not just inside `<Lightbox.Toolbar>`)

### `LightboxToolbar` changes

Add a `children?: React.ReactNode` prop. Behaviour:

- **No children (default):** renders the 4 built-in buttons exactly as today — fully backward-compatible
- **With children:** renders those children inside the `ActionIcon.Group` instead

The toolbar's `stylesNames` stays unchanged (`toolbar | autoplayButton | fullscreenButton | zoomButton | closeButton`) so existing `classNames`/`styles` usage on the toolbar continues to work.

```tsx
// Still works — all buttons shown
<Lightbox.Toolbar />

// Pick a subset
<Lightbox.Toolbar>
  <Lightbox.ZoomButton />
  <Lightbox.CloseButton />
</Lightbox.Toolbar>

// Add a custom button
<Lightbox.Toolbar>
  <Lightbox.CloseButton />
  <ActionIcon onClick={handleDownload}><DownloadIcon /></ActionIcon>
</Lightbox.Toolbar>

// Buttons outside the toolbar — works because they only need Lightbox.Root in the tree
<Lightbox.Root opened={opened} onClose={close}>
  <header>
    <Lightbox.CloseButton />
  </header>
  <Lightbox.Slides>…</Lightbox.Slides>
</Lightbox.Root>
```

### `useLightboxContext` export

Export `useLightboxContext` and the `LightboxContext` interface from `index.ts`. This allows consumers to build fully custom buttons with access to all lightbox state and actions.

```tsx
import { useLightboxContext } from '@mantine-bites/lightbox';

function DownloadButton() {
  const { currentIndex } = useLightboxContext();
  return (
    <ActionIcon onClick={() => download(currentIndex)}>
      <DownloadIcon />
    </ActionIcon>
  );
}
```

### Static component updates

Attach the 4 button components as static properties on both `Lightbox` and `LightboxRoot`:

```
Lightbox.CloseButton       → LightboxCloseButton
Lightbox.ZoomButton        → LightboxZoomButton
Lightbox.FullscreenButton  → LightboxFullscreenButton
Lightbox.AutoplayButton    → LightboxAutoplayButton
```

Update `LightboxFactory` and `LightboxRootFactory` `staticComponents` types accordingly.

## File changes

| File | Change |
|---|---|
| `components/LightboxCloseButton.tsx` | **New** |
| `components/LightboxZoomButton.tsx` | **New** |
| `components/LightboxFullscreenButton.tsx` | **New** |
| `components/LightboxAutoplayButton.tsx` | **New** |
| `components/LightboxToolbar.tsx` | Add `children` prop; render children when provided |
| `components/LightboxRoot.tsx` | Add 4 button staticComponents to Factory + attach |
| `Lightbox.tsx` | Add 4 button staticComponents to Factory + attach |
| `index.ts` | Export 4 new button components + types, `useLightboxContext`, `LightboxContext` |

## What stays the same

- `<Lightbox />` simple API: zero changes to props or rendering
- `<Lightbox.Toolbar />` with no children: identical output to today
- All existing `classNames`/`styles` selectors on `LightboxRoot` and `LightboxToolbar`
- No new CSS required — buttons reuse existing selectors

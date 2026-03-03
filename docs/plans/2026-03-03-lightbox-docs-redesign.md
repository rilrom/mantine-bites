# Lightbox Documentation Redesign

## Overview

Rewrite the lightbox documentation to reflect the new compound component architecture. The default documentation approach uses the `<Lightbox />` convenience wrapper. A dedicated section covers the compound component API.

All existing demo files in `apps/docs/demos/lightbox/` are replaced.

---

## MDX Structure (`apps/docs/docs/lightbox.mdx`)

Sections in order:

1. **Important** — keep existing beta warning unchanged
2. **Installation** — unchanged
3. **Usage** — interactive configurator demo
4. **Transition** — `transitionProps` demo
5. **Overlay** — `overlayProps` demo
6. **Slides** — `slidesProps` demo
7. **Thumbnails** — `thumbnailsProps` demo
8. **Controls** — `controlsProps` demo
9. **Counter** — `counterProps` demo
10. **Embla options** — `slidesProps.emblaOptions` demo
11. **Embla plugins** — `slidesProps.emblaPlugins` demo
12. **Vertical orientation** — `orientation` demo
13. **Compound components** — intro + two subsections

---

## Demo Files (`apps/docs/demos/lightbox/`)

Replace all existing files with the following:

### `Lightbox.demo.configurator.tsx`

Type: `configurator`

Renders `<Lightbox images={images} />` with a `SimpleGrid` trigger. The `Wrapper` component accepts `WrapperProps` with these controls:

| Prop | Type | Default |
|---|---|---|
| `withToolbar` | boolean | `true` |
| `withControls` | boolean | `true` |
| `withThumbnails` | boolean | `true` |
| `withCounter` | boolean | `true` |
| `withZoom` | boolean | `true` |
| `withFullscreen` | boolean | `true` |
| `closeOnClickOutside` | boolean | `true` |

`slidesProps={{ initialSlide }}` is wired up to support the grid-click-to-open behavior (not a configurator control — internal state). `orientation` and `controlsProps.size` are omitted here; they get their own dedicated sections.

---

### `Lightbox.demo.transitionProps.tsx`

Type: `code`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  transitionProps={{ transition: 'slide-up', duration: 400 }}
/>
```

Intro text: Props are forwarded to Mantine's `Transition` component. Defaults: `transition: 'fade'`, `duration: 250`.

---

### `Lightbox.demo.overlayProps.tsx`

Type: `code`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  overlayProps={{ color: '#000', backgroundOpacity: 0.85 }}
/>
```

Intro text: Props are forwarded to Mantine's `Overlay` component. Defaults: `color: '#18181B'`, `backgroundOpacity: 0.9`, `zIndex: 200`.

---

### `Lightbox.demo.slidesProps.tsx`

Type: `code`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  slidesProps={{ initialSlide: 2 }}
/>
```

Intro text: `slidesProps` is forwarded to the main slides carousel (`LightboxSlides`). Available keys: `initialSlide`, `emblaOptions`, `emblaPlugins` — the latter two are covered in their own sections below.

---

### `Lightbox.demo.thumbnailsProps.tsx`

Type: `code`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  thumbnailsProps={{ emblaOptions: { dragFree: false } }}
/>
```

Intro text: `thumbnailsProps` is forwarded to the thumbnails carousel (`LightboxThumbnails`). Default: `dragFree: true`.

---

### `Lightbox.demo.controlsProps.tsx`

Type: `code`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  controlsProps={{ size: 48 }}
/>
```

Intro text: Controls the size (in px) of the prev/next navigation buttons. Default: `36`.

---

### `Lightbox.demo.counterProps.tsx`

Type: `code`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  counterProps={{ formatter: (index, total) => `${index + 1} of ${total}` }}
/>
```

Intro text: `formatter` receives the current zero-based index and the total slide count and returns a string.

---

### `Lightbox.demo.emblaOptions.tsx`

Type: `code`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  slidesProps={{ emblaOptions: { loop: true } }}
/>
```

Intro text: `slidesProps.emblaOptions` are passed directly to the Embla carousel instance for the main slides. See the [Embla options documentation](https://www.embla-carousel.com/api/options/) for all available options. `thumbnailsProps.emblaOptions` works the same way for the thumbnail carousel.

---

### `Lightbox.demo.emblaPlugins.tsx`

Type: `code`

```tsx
import Autoplay from 'embla-carousel-autoplay';

<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  slidesProps={{ emblaPlugins: [Autoplay()] }}
/>
```

Intro text: `slidesProps.emblaPlugins` are passed to the main slides carousel. When the autoplay plugin is detected, the autoplay toggle button is automatically added to the toolbar — no additional configuration needed. See the [Embla plugins documentation](https://www.embla-carousel.com/plugins/).

---

### `Lightbox.demo.vertical.tsx`

Type: `code`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  orientation="vertical"
/>
```

Intro text: Set `orientation="vertical"` to switch both the main slides carousel and the thumbnails strip to a vertical layout. Default: `"horizontal"`.

---

### `Lightbox.demo.compoundToolbar.tsx`

Type: `code`

Demonstrates `Lightbox.Toolbar` with explicit children. A custom download `ActionIcon` is placed alongside the built-in toolbar buttons.

```tsx
<Lightbox.Root opened={opened} onClose={() => setOpened(false)}>
  <Lightbox.Slides>
    {images.map((img) => (
      <Lightbox.Slide key={img.src}>
        <img src={img.src} alt={img.alt} />
      </Lightbox.Slide>
    ))}
  </Lightbox.Slides>
  <Lightbox.Thumbnails>
    {images.map((img) => (
      <Lightbox.Thumbnail key={img.src}>
        <img src={img.src} alt={img.alt} />
      </Lightbox.Thumbnail>
    ))}
  </Lightbox.Thumbnails>
  <Lightbox.Controls />
  <Lightbox.Counter />
  <Lightbox.Toolbar>
    <Lightbox.ZoomButton />
    <Lightbox.FullscreenButton />
    <ActionIcon variant="default" aria-label="Download">
      <IconDownload />
    </ActionIcon>
    <Lightbox.CloseButton />
  </Lightbox.Toolbar>
</Lightbox.Root>
```

Intro text: Pass children to `Lightbox.Toolbar` to compose a custom set of buttons inside the `ActionIcon.Group`. The built-in button components (`ZoomButton`, `FullscreenButton`, `AutoplayButton`, `CloseButton`) can be used individually and still read from context.

---

### `Lightbox.demo.compoundFooter.tsx`

Type: `code`

Demonstrates placing custom content after `Lightbox.Thumbnails` using `useLightboxContext()` to read the current slide index and display the image caption.

```tsx
function Demo() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      {/* SimpleGrid trigger */}

      <Lightbox.Root opened={opened} onClose={() => setOpened(false)}>
        <Lightbox.Slides>
          {images.map((img) => (
            <Lightbox.Slide key={img.src}>
              <img src={img.src} alt={img.alt} />
            </Lightbox.Slide>
          ))}
        </Lightbox.Slides>
        <Lightbox.Thumbnails>
          {images.map((img) => (
            <Lightbox.Thumbnail key={img.src}>
              <img src={img.src} alt={img.alt} />
            </Lightbox.Thumbnail>
          ))}
        </Lightbox.Thumbnails>
        <Lightbox.Controls />
        <Lightbox.Counter />
        <Lightbox.Toolbar />
        <LightboxFooter images={images} />
      </Lightbox.Root>
    </>
  );
}

function LightboxFooter({ images }: { images: { src: string; alt: string }[] }) {
  const { currentIndex } = useLightboxContext();
  const image = images[currentIndex];

  return (
    <Box bg="dark.9" w="100%" p="xs">
      <Text size="sm" c="dimmed" ta="center">
        {image?.alt ?? ''}
      </Text>
    </Box>
  );
}
```

Intro text: Because `Lightbox.Root` uses a flex column layout, any element rendered after `Lightbox.Thumbnails` naturally spans the full width at the bottom of the lightbox. Use `useLightboxContext()` to access state such as `currentIndex` from any component inside `Lightbox.Root`.

---

## `data.ts` Updates

Expand `componentsProps` and `componentsStyles` to expose the full compound API in the Props and Styles API tabs:

```ts
componentsProps: [
  "Lightbox",
  "LightboxRoot",
  "LightboxSlides",
  "LightboxSlide",
  "LightboxThumbnails",
  "LightboxThumbnail",
  "LightboxToolbar",
  "LightboxControls",
  "LightboxCounter",
  "LightboxCloseButton",
  "LightboxZoomButton",
  "LightboxFullscreenButton",
  "LightboxAutoplayButton",
],
componentsStyles: [
  "Lightbox",
  "LightboxRoot",
  "LightboxSlides",
  "LightboxSlide",
  "LightboxThumbnails",
  "LightboxThumbnail",
  "LightboxToolbar",
  "LightboxControls",
  "LightboxCounter",
  "LightboxCloseButton",
  "LightboxZoomButton",
  "LightboxFullscreenButton",
  "LightboxAutoplayButton",
],
```

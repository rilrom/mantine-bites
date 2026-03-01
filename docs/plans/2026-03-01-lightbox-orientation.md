# Lightbox Orientation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `orientation: 'horizontal' | 'vertical'` to the Lightbox component so slides and thumbnails can scroll vertically, with controls repositioned and thumbnails shown as a side strip.

**Architecture:** `orientation` lives on `LightboxRoot`/`Lightbox` and flows through the existing `LightboxContext` to all sub-components. CSS uses `data-orientation` on the root element with descendant selectors to handle layout differences. Embla carousel `axis` is set to `'y'` for both the slides and thumbnails carousels when vertical.

**Tech Stack:** React, Embla Carousel (`axis` option), Mantine factory pattern, CSS modules with PostCSS nesting

---

### Task 1: Add `orientation` to props and context types

**Files:**
- Modify: `packages/lightbox/src/Lightbox.tsx`
- Modify: `packages/lightbox/src/Lightbox.context.ts`

**Step 1: Add `orientation` to `LightboxProps`**

In `Lightbox.tsx`, add the prop to the `LightboxProps` interface after `overlayProps`:

```ts
/** Carousel scroll axis, `'horizontal'` by default */
orientation?: 'horizontal' | 'vertical';
```

**Step 2: Add `orientation` to `LightboxContext`**

In `Lightbox.context.ts`, add to the `LightboxContext` interface:

```ts
orientation: 'horizontal' | 'vertical';
```

**Step 3: Run type check**

```bash
cd /Users/riley/Projects/mantine-bites
pnpm tsc --filter @mantine-bites/lightbox
```

Expected: no errors (context consumers not yet updated, but they don't destructure orientation yet)

---

### Task 2: Wire orientation through `LightboxRoot`

**Files:**
- Modify: `packages/lightbox/src/components/LightboxRoot.tsx`
- Modify: `packages/lightbox/src/Lightbox.test.tsx`

**Step 1: Write the failing tests**

Add to `Lightbox.test.tsx` inside the existing `describe` block, after the last test:

```tsx
it("should set data-orientation='horizontal' by default", () => {
  renderLightbox();
  expect(document.querySelector('[data-orientation="horizontal"]')).not.toBeNull();
});

it("should set data-orientation='vertical' when orientation is vertical", () => {
  renderLightbox({ rootProps: { orientation: 'vertical' } });
  expect(document.querySelector('[data-orientation="vertical"]')).not.toBeNull();
});
```

**Step 2: Run tests to verify they fail**

```bash
cd /Users/riley/Projects/mantine-bites
pnpm test --filter @mantine-bites/lightbox
```

Expected: both new tests FAIL — `data-orientation` attribute does not exist yet

**Step 3: Update `defaultProps` in `LightboxRoot.tsx`**

Add to the `defaultProps` object:

```ts
orientation: 'horizontal',
```

**Step 4: Destructure `orientation` in `LightboxRoot`**

In the props destructuring inside the `factory` function, add `orientation` after `overlayProps`:

```ts
orientation,
```

**Step 5: Pass `orientation` to `LightboxProvider`**

In the `LightboxProvider` value object, add:

```tsx
orientation: orientation ?? 'horizontal',
```

**Step 6: Add `data-orientation` to root `Box`**

In the `<Box>` that renders the root (the one with `{...getStyles("root", ...)}` — not the Overlay), add:

```tsx
data-orientation={orientation}
```

**Step 7: Update hotkeys for orientation**

Replace the existing `useHotkeys` call with:

```tsx
useHotkeys([
  ["ArrowLeft", () => orientation === 'horizontal' && opened && slidesEmblaRef.current?.scrollPrev()],
  ["ArrowRight", () => orientation === 'horizontal' && opened && slidesEmblaRef.current?.scrollNext()],
  ["ArrowUp", () => orientation === 'vertical' && opened && slidesEmblaRef.current?.scrollPrev()],
  ["ArrowDown", () => orientation === 'vertical' && opened && slidesEmblaRef.current?.scrollNext()],
  ["Escape", () => opened && onClose()],
]);
```

**Step 8: Run tests to verify they pass**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: all tests PASS including the two new ones

---

### Task 3: Update `LightboxSlides` for vertical embla axis

**Files:**
- Modify: `packages/lightbox/src/components/LightboxSlides.tsx`

**Step 1: Read `orientation` from context**

In `LightboxSlides.tsx`, add `orientation` to the context destructure:

```ts
const {
  getStyles,
  orientation,          // add this
  slidesEmblaRef,
  thumbnailsEmblaRef,
  setCurrentIndex,
  setSlideCount,
} = useLightboxContext();
```

**Step 2: Inject `axis` into embla options**

Replace the `mergedEmblaOptions` object:

```ts
const mergedEmblaOptions: EmblaOptionsType = {
  ...emblaOptions,
  axis: orientation === 'vertical' ? 'y' : 'x',
  startIndex: initialSlide,
};
```

Note: user-supplied `emblaOptions` is spread first so `axis` and `startIndex` always win.

**Step 3: Run tests**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: all tests PASS (no behavioral change for horizontal, new axis for vertical)

---

### Task 4: Update `LightboxControls` chevron icons for vertical

**Files:**
- Modify: `packages/lightbox/src/components/LightboxControls.tsx`
- Modify: `packages/lightbox/src/Lightbox.test.tsx`

**Step 1: Write the failing test**

Add to `Lightbox.test.tsx`:

```tsx
it("should render up and down chevrons when orientation is vertical", () => {
  renderLightbox({ rootProps: { orientation: 'vertical' } });
  const prevButton = screen.getByLabelText("Previous slide");
  const nextButton = screen.getByLabelText("Next slide");
  expect(prevButton.querySelector('polyline')).toHaveAttribute('points', '18 15 12 9 6 15');
  expect(nextButton.querySelector('polyline')).toHaveAttribute('points', '6 9 12 15 18 9');
});
```

**Step 2: Run test to verify it fails**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: FAIL — polyline points are currently the horizontal left/right values

**Step 3: Read `orientation` from context**

In `LightboxControls.tsx`, update the context destructure:

```ts
const { onScrollPrev, onScrollNext, getStyles, orientation } = useLightboxContext();
```

**Step 4: Define icon paths based on orientation**

Add above the return statement:

```tsx
const prevPoints = orientation === 'vertical' ? '18 15 12 9 6 15' : '15 18 9 12 15 6';
const nextPoints = orientation === 'vertical' ? '6 9 12 15 18 9' : '9 18 15 12 9 6';
```

**Step 5: Use the computed points in both SVGs**

Replace `<polyline points="15 18 9 12 15 6" />` with:

```tsx
<polyline points={prevPoints} />
```

Replace `<polyline points="9 18 15 12 9 6" />` with:

```tsx
<polyline points={nextPoints} />
```

**Step 6: Run tests to verify they pass**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: all tests PASS

---

### Task 5: Update `useThumbnails` overflow detection and `LightboxThumbnails`

**Files:**
- Modify: `packages/lightbox/src/hooks/useThumbnails.ts`
- Modify: `packages/lightbox/src/components/LightboxThumbnails.tsx`

**Step 1: Add `orientation` to `UseThumbnailsProps`**

In `useThumbnails.ts`, add to the interface:

```ts
interface UseThumbnailsProps {
  emblaOptions: EmblaOptionsType | undefined;
  thumbnailsEmblaRef: RefObject<EmblaCarouselType | null>;
  initialIndex: number;
  orientation: 'horizontal' | 'vertical';  // add this
}
```

**Step 2: Destructure `orientation` from props**

```ts
const { emblaOptions, thumbnailsEmblaRef, initialIndex, orientation } = props;
```

**Step 3: Update overflow detection**

Replace the `updateOverflow` function body:

```ts
const updateOverflow = () => {
  const viewport = viewportRef.current;
  const container = containerRef.current;

  if (!viewport || !container) {
    return;
  }

  if (orientation === 'vertical') {
    setHasOverflow(container.scrollHeight > viewport.clientHeight + 1);
  } else {
    setHasOverflow(container.scrollWidth > viewport.clientWidth + 1);
  }
};
```

**Step 4: Update `LightboxThumbnails` to pass `orientation` and `axis`**

In `LightboxThumbnails.tsx`:

Add `orientation` to context destructure:

```ts
const { getStyles, thumbnailsEmblaRef, currentIndex, orientation } = useLightboxContext();
```

Update `useThumbnails` call to pass `orientation`:

```ts
const { setViewportRef, containerRef, hasOverflow } = useThumbnails({
  emblaOptions: {
    ...emblaOptions,
    axis: orientation === 'vertical' ? 'y' : 'x',
  },
  thumbnailsEmblaRef,
  initialIndex: currentIndex,
  orientation,
});
```

Note: spread `emblaOptions` first so user-supplied options are preserved, then set `axis`.

**Step 5: Run tests**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: all tests PASS

---

### Task 6: Update CSS for vertical layout

**Files:**
- Modify: `packages/lightbox/src/Lightbox.module.css`

This task is all CSS — no new tests. Run the full suite at the end to verify nothing broke.

**Step 1: Add vertical root flex direction**

In `.root`, add after the existing properties:

```css
&[data-orientation='vertical'] {
  flex-direction: row;
}
```

**Step 2: Add vertical slides container direction**

In `.slidesContainer`, add:

```css
.root[data-orientation='vertical'] & {
  flex-direction: column;
  height: auto;
}
```

**Step 3: Update control positioning for vertical**

The existing `.control` block has absolute positioning for horizontal. Add vertical overrides inside `.control`:

```css
.root[data-orientation='vertical'] & {
  &[data-direction='prev'] {
    left: 50%;
    top: var(--mantine-spacing-md);
    right: auto;
    transform: translateX(-50%);
  }

  &[data-direction='next'] {
    left: 50%;
    right: auto;
    top: auto;
    bottom: var(--mantine-spacing-md);
    transform: translateX(-50%);
  }
}
```

**Step 4: Update thumbnails layout for vertical**

In `.thumbnails`, add:

```css
.root[data-orientation='vertical'] & {
  max-width: none;
  max-height: 100%;
  padding: var(--mantine-spacing-md) 0;
}
```

In `.thumbnailsViewport`, add:

```css
.root[data-orientation='vertical'] & {
  width: auto;
  height: 100%;
}
```

In `.thumbnailsContainer`, add:

```css
.root[data-orientation='vertical'] & {
  flex-direction: column;
  align-items: center;

  &[data-overflow] {
    align-items: flex-start;
  }
}
```

In `.thumbnailSlide`, add:

```css
.root[data-orientation='vertical'] & {
  margin-right: 0;
  margin-bottom: var(--mantine-spacing-xs);
}
```

After `.thumbnailSlide:last-child`, add:

```css
.root[data-orientation='vertical'] .thumbnailSlide:last-child {
  margin-bottom: 0;
}
```

**Step 5: Run full test suite**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: all tests PASS

**Step 6: Run lint and type check**

```bash
pnpm lint --filter @mantine-bites/lightbox
pnpm tsc --filter @mantine-bites/lightbox
```

Expected: no errors

---

### Task 7: Add vertical orientation Storybook story

**Files:**
- Modify: `packages/lightbox/src/Lightbox.story.tsx`

**Step 1: Read the existing story file**

Read `packages/lightbox/src/Lightbox.story.tsx` to understand the current story format.

**Step 2: Add a vertical orientation story**

Add a new story that uses `orientation="vertical"` with a `LightboxRoot`. Follow the same pattern as the existing stories. Include both `<Lightbox.Slides>` and `<Lightbox.Thumbnails>`.

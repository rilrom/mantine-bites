# Lightbox Simple API — Missing Sub-Component Props

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expose `slidesProps`, `thumbnailsProps`, `controlsProps`, and `counterProps` on the simple `Lightbox` component so consumers don't need the compound API to configure sub-component behaviour.

**Architecture:** `LightboxProps` gains four nested prop objects typed via `Pick` from the relevant sub-component prop types. The `Lightbox` factory spreads them onto the corresponding sub-components. No new types, no new files.

**Tech Stack:** TypeScript, React, Mantine factory pattern

---

### Task 1: Write failing tests

**Files:**
- Modify: `packages/lightbox/src/__tests__/LightboxSimple.test.tsx`

**Step 1: Add four tests for the new props**

Append these tests inside the existing `describe` block (after the last `it` block, before the closing `}`):

```tsx
it("should render at the slide specified by slidesProps.initialSlide", async () => {
  render(<Lightbox {...defaultProps} slidesProps={{ initialSlide: 2 }} />);
  expect(await screen.findByText("3 / 3")).toBeInTheDocument();
});

it("should accept slidesProps.emblaOptions without error", () => {
  render(
    <Lightbox
      {...defaultProps}
      slidesProps={{ emblaOptions: { loop: true } }}
    />,
  );
  expect(screen.getByText("1 / 3")).toBeInTheDocument();
});

it("should accept thumbnailsProps.emblaOptions without error", () => {
  render(
    <Lightbox
      {...defaultProps}
      thumbnailsProps={{ emblaOptions: { dragFree: false } }}
    />,
  );
  expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();
});

it("should apply counterProps.formatter", () => {
  render(
    <Lightbox
      {...defaultProps}
      counterProps={{ formatter: (i, t) => `Slide ${i + 1} of ${t}` }}
    />,
  );
  expect(screen.getByText("Slide 1 of 3")).toBeInTheDocument();
});

it("should accept controlsProps.size without error", () => {
  render(<Lightbox {...defaultProps} controlsProps={{ size: 48 }} />);
  expect(screen.getByLabelText("Previous slide")).toBeInTheDocument();
});
```

**Step 2: Run the tests to confirm they fail**

```bash
cd packages/lightbox && pnpm test --testPathPattern="LightboxSimple" 2>&1 | tail -20
```

Expected: TypeScript compile errors on `slidesProps`, `thumbnailsProps`, `controlsProps`, `counterProps` — they don't exist on `LightboxProps` yet.

---

### Task 2: Update `LightboxProps` and the factory

**Files:**
- Modify: `packages/lightbox/src/Lightbox.tsx`

**Step 1: Add imports for sub-component prop types**

At the top of `Lightbox.tsx`, add these imports alongside the existing component imports:

```ts
import type { LightboxControlsProps } from "./components/LightboxControls.js";
import type { LightboxCounterProps } from "./components/LightboxCounter.js";
import type { LightboxSlidesProps } from "./components/LightboxSlides.js";
import type { LightboxThumbnailsProps } from "./components/LightboxThumbnails.js";
```

**Step 2: Add the four props to `LightboxProps`**

Replace the existing `LightboxProps` interface:

```ts
export interface LightboxProps extends Omit<LightboxRootProps, "children"> {
	/** Array of images to display */
	images: LightboxImageData[];
	/** Show toolbar (zoom, fullscreen, close buttons), `true` by default */
	withToolbar?: boolean;
	/** Show prev/next navigation controls, `true` by default */
	withControls?: boolean;
	/** Show thumbnail strip, `true` by default */
	withThumbnails?: boolean;
	/** Show slide counter, `true` by default */
	withCounter?: boolean;
	/** Props passed to the slides carousel (`LightboxSlides`) */
	slidesProps?: Pick<LightboxSlidesProps, "initialSlide" | "emblaOptions" | "emblaPlugins">;
	/** Props passed to the thumbnails carousel (`LightboxThumbnails`) */
	thumbnailsProps?: Pick<LightboxThumbnailsProps, "emblaOptions">;
	/** Props passed to the prev/next controls (`LightboxControls`) */
	controlsProps?: Pick<LightboxControlsProps, "size">;
	/** Props passed to the slide counter (`LightboxCounter`) */
	counterProps?: Pick<LightboxCounterProps, "formatter">;
}
```

**Step 3: Destructure and forward the new props in the factory**

Replace the destructuring and JSX in the factory body:

```tsx
const {
	images,
	withToolbar,
	withControls,
	withThumbnails,
	withCounter,
	slidesProps,
	thumbnailsProps,
	controlsProps,
	counterProps,
	...rootProps
} = props;

return (
	<LightboxRoot ref={ref} {...rootProps}>
		{withToolbar && <LightboxToolbar />}
		{withCounter && <LightboxCounter {...counterProps} />}
		{withControls && <LightboxControls {...controlsProps} />}
		<LightboxSlides {...slidesProps}>
			{images.map((img) => (
				<LightboxSlide key={img.src}>
					<img src={img.src} alt={img.alt} />
				</LightboxSlide>
			))}
		</LightboxSlides>
		{withThumbnails && (
			<LightboxThumbnails {...thumbnailsProps}>
				{images.map((img) => (
					<LightboxThumbnail key={img.src}>
						<img src={img.src} alt={img.alt} />
					</LightboxThumbnail>
				))}
			</LightboxThumbnails>
		)}
	</LightboxRoot>
);
```

---

### Task 3: Verify

**Step 1: Run the simple API tests**

```bash
cd packages/lightbox && pnpm test --testPathPattern="LightboxSimple" 2>&1 | tail -20
```

Expected: All tests PASS.

**Step 2: Run the full test suite**

```bash
cd packages/lightbox && pnpm test 2>&1 | tail -20
```

Expected: All tests PASS, no regressions.

**Step 3: Type-check**

```bash
cd packages/lightbox && pnpm tsc 2>&1
```

Expected: No errors.

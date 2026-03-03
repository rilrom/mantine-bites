# Lightbox Simple API Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a data-driven `<Lightbox images={[...]} />` component alongside the existing compound component API, mirroring the Mantine Spotlight pattern.

**Architecture:** The existing `LightboxRoot` compound component is unchanged in behavior. Its type definitions (`LightboxProps`, `LightboxFactory`, `LightboxStylesNames`) are renamed to `LightboxRoot*` and moved into `LightboxRoot.tsx`. A new simple `Lightbox` component is created in `Lightbox.tsx` that wraps the compound components and accepts an `images` array. The public export `Lightbox` changes from an alias for `LightboxRoot` to the new simple component; `Lightbox.Root` exposes `LightboxRoot` for users who need the compound API.

**Tech Stack:** TypeScript, React, `@mantine/core` factory pattern (`factory`, `useProps`), Jest + `@testing-library/react`, Storybook

---

## Context

```
packages/lightbox/src/
├── Lightbox.tsx              ← currently just type defs; will become the simple component
├── components/
│   └── LightboxRoot.tsx      ← compound root; will own its own type definitions
├── __tests__/
│   └── Lightbox.test.tsx     ← compound API tests (uses Lightbox.Root throughout)
├── stories/
│   └── Lightbox.story.tsx    ← compound API stories
└── index.ts                  ← barrel exports
```

**Key facts:**
- `Lightbox.tsx` currently holds shared types (`LightboxProps`, `LightboxStylesNames`, `LightboxFactory`) used by `LightboxRoot.tsx`.
- `index.ts` currently exports `LightboxRoot as Lightbox` and these types from `./Lightbox.js`.
- All existing tests use `Lightbox.Root` (not `Lightbox` directly), so most survive the rename intact.
- The only existing test that needs updating: `"should have static classes and extend function"` references `Lightbox.classes` which won't exist on the simple component.

---

### Task 1: Write failing tests for the simple Lightbox API

**Files:**
- Create: `packages/lightbox/src/__tests__/LightboxSimple.test.tsx`

**Step 1: Create the test file**

```tsx
// packages/lightbox/src/__tests__/LightboxSimple.test.tsx
import { render, screen } from "@mantine-tests/core";
import { Lightbox, type LightboxProps } from "../index.js";

const sampleImages = [
  { src: "/photo-1.jpg", alt: "Forest" },
  { src: "/photo-2.jpg", alt: "Mountain" },
  { src: "/photo-3.jpg", alt: "Ocean" },
];

const defaultProps: LightboxProps = {
  opened: true,
  onClose: () => {},
  images: sampleImages,
};

describe("@mantine-bites/lightbox/Lightbox simple API", () => {
  it("should expose compound static members on Lightbox", () => {
    expect(Lightbox.Root).toBeDefined();
    expect(Lightbox.Toolbar).toBeDefined();
    expect(Lightbox.Counter).toBeDefined();
    expect(Lightbox.Controls).toBeDefined();
    expect(Lightbox.Slides).toBeDefined();
    expect(Lightbox.Slide).toBeDefined();
    expect(Lightbox.Thumbnails).toBeDefined();
    expect(Lightbox.Thumbnail).toBeDefined();
  });

  it("should render all image slides", () => {
    render(<Lightbox {...defaultProps} />);
    expect(screen.getByAltText("Forest")).toBeInTheDocument();
    expect(screen.getByAltText("Mountain")).toBeInTheDocument();
    expect(screen.getByAltText("Ocean")).toBeInTheDocument();
  });

  it("should render thumbnails by default", () => {
    render(<Lightbox {...defaultProps} />);
    expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();
  });

  it("should hide thumbnails when withThumbnails is false", () => {
    render(<Lightbox {...defaultProps} withThumbnails={false} />);
    expect(screen.queryByLabelText("Go to slide 1")).not.toBeInTheDocument();
  });

  it("should render counter by default", () => {
    render(<Lightbox {...defaultProps} />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("should hide counter when withCounter is false", () => {
    render(<Lightbox {...defaultProps} withCounter={false} />);
    expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
  });

  it("should render toolbar by default", () => {
    render(<Lightbox {...defaultProps} />);
    expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
  });

  it("should hide toolbar when withToolbar is false", () => {
    render(<Lightbox {...defaultProps} withToolbar={false} />);
    expect(screen.queryByLabelText("Close lightbox")).not.toBeInTheDocument();
  });

  it("should render prev/next controls by default", () => {
    render(<Lightbox {...defaultProps} />);
    expect(screen.getByLabelText("Previous slide")).toBeInTheDocument();
    expect(screen.getByLabelText("Next slide")).toBeInTheDocument();
  });

  it("should hide controls when withControls is false", () => {
    render(<Lightbox {...defaultProps} withControls={false} />);
    expect(screen.queryByLabelText("Previous slide")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next slide")).not.toBeInTheDocument();
  });

  it("should not render content when closed", () => {
    render(<Lightbox {...defaultProps} opened={false} />);
    expect(screen.queryByAltText("Forest")).not.toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
cd packages/lightbox && pnpm test -- --testPathPattern=LightboxSimple
```

Expected: TypeScript compile error — `LightboxImageData` and updated `LightboxProps` don't exist yet in exports.

---

### Task 2: Move root types into LightboxRoot.tsx

**Files:**
- Modify: `packages/lightbox/src/components/LightboxRoot.tsx`

**Step 1: Add root type definitions to the top of LightboxRoot.tsx**

Open `packages/lightbox/src/components/LightboxRoot.tsx`. Replace the two import lines at the top that currently import types from `../Lightbox.js`:

```typescript
import type { LightboxFactory, LightboxProps } from "../Lightbox.js";
```

with these inline type definitions (add them after the existing named imports, before the `defaultProps` const):

```typescript
import {
  Box,
  type BoxProps,
  type ElementProps,
  factory,
  type Factory,
  getDefaultZIndex,
  OptionalPortal,
  Overlay,
  RemoveScroll,
  type StylesApiProps,
  Transition,
  type TransitionOverride,
  useProps,
  useStyles,
  type OverlayProps,
} from "@mantine/core";
```

Then add the type definitions before `const defaultProps`:

```typescript
export type LightboxRootStylesNames =
  | "root"
  | "overlay"
  | "slides"
  | "slidesViewport"
  | "slidesContainer"
  | "control"
  | "slide"
  | "zoomContainer"
  | "zoomContent"
  | "autoplayButton"
  | "zoomButton"
  | "fullscreenButton"
  | "toolbar"
  | "closeButton"
  | "counter"
  | "thumbnails"
  | "thumbnailsViewport"
  | "thumbnailsContainer"
  | "thumbnail"
  | "thumbnailButton";

export interface LightboxRootProps
  extends BoxProps,
    StylesApiProps<LightboxRootFactory>,
    ElementProps<"div"> {
  /** Whether the lightbox is open */
  opened: boolean;
  /** Called when the lightbox requests to close */
  onClose: () => void;
  /** Whether to close when clicking outside the content, `true` by default */
  closeOnClickOutside?: boolean;
  /** Whether to keep content mounted when closed, `false` by default */
  keepMounted?: boolean;
  /** Whether to trap focus while open, `true` by default */
  trapFocus?: boolean;
  /** Whether to return focus to the trigger on close, `true` by default */
  returnFocus?: boolean;
  /** Whether to lock page scroll while open, `true` by default */
  lockScroll?: boolean;
  /** Whether to show the zoom toggle button in the toolbar, `true` by default */
  withZoom?: boolean;
  /** Whether to show the fullscreen toggle button in the toolbar, `true` by default */
  withFullscreen?: boolean;
  /** Whether to render inside a portal, `true` by default */
  withinPortal?: boolean;
  /** Props passed to the `Transition` component */
  transitionProps?: TransitionOverride;
  /** Props passed to the `Overlay` component */
  overlayProps?: OverlayProps;
  /** Layout and scroll direction of the lightbox, `'horizontal'` by default */
  orientation?: "horizontal" | "vertical";
}

export type LightboxRootFactory = Factory<{
  props: LightboxRootProps;
  ref: HTMLDivElement;
  stylesNames: LightboxRootStylesNames;
  staticComponents: {
    Root: typeof LightboxRoot;
    Toolbar: typeof LightboxToolbar;
    Counter: typeof LightboxCounter;
    Controls: typeof LightboxControls;
    Slides: typeof LightboxSlides;
    Thumbnails: typeof LightboxThumbnails;
    Thumbnail: typeof LightboxThumbnail;
    Slide: typeof LightboxSlide;
  };
}>;
```

**Step 2: Update usages within LightboxRoot.tsx**

Replace all references to the old types inside the file body:

| Old | New |
|-----|-----|
| `import type { LightboxFactory, LightboxProps } from "../Lightbox.js";` | _(delete this line)_ |
| `factory<LightboxFactory>` | `factory<LightboxRootFactory>` |
| `useStyles<LightboxFactory>` | `useStyles<LightboxRootFactory>` |
| `_props: ... Partial<LightboxProps>` (in defaultProps satisfies) | `satisfies Partial<LightboxRootProps>` |

The `useProps("Lightbox", defaultProps, _props)` call **keeps the same string name** `"Lightbox"` — this is the Mantine theme override key and must stay the same.

**Step 3: Run existing tests to verify nothing broke**

```bash
cd packages/lightbox && pnpm test -- --testPathPattern=Lightbox.test
```

Expected: All tests in `Lightbox.test.tsx` pass (compound API is unchanged).

**Step 4: Type-check**

```bash
cd packages/lightbox && pnpm tsc
```

Expected: No errors.

---

### Task 3: Implement the simple Lightbox component

**Files:**
- Modify: `packages/lightbox/src/Lightbox.tsx` (replace entire contents)
- Modify: `packages/lightbox/src/index.ts`
- Modify: `packages/lightbox/src/__tests__/Lightbox.test.tsx` (one assertion update)

**Step 1: Replace Lightbox.tsx with the simple component**

Overwrite `packages/lightbox/src/Lightbox.tsx` entirely:

```typescript
import { factory, type Factory, useProps } from "@mantine/core";
import { LightboxControls } from "./components/LightboxControls.js";
import { LightboxCounter } from "./components/LightboxCounter.js";
import {
  LightboxRoot,
  type LightboxRootProps,
} from "./components/LightboxRoot.js";
import { LightboxSlide } from "./components/LightboxSlide.js";
import { LightboxSlides } from "./components/LightboxSlides.js";
import { LightboxThumbnail } from "./components/LightboxThumbnail.js";
import { LightboxThumbnails } from "./components/LightboxThumbnails.js";
import { LightboxToolbar } from "./components/LightboxToolbar.js";

export interface LightboxImageData {
  src: string;
  alt?: string;
}

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
}

export type LightboxFactory = Factory<{
  props: LightboxProps;
  ref: HTMLDivElement;
  staticComponents: {
    Root: typeof LightboxRoot;
    Toolbar: typeof LightboxToolbar;
    Counter: typeof LightboxCounter;
    Controls: typeof LightboxControls;
    Slides: typeof LightboxSlides;
    Slide: typeof LightboxSlide;
    Thumbnails: typeof LightboxThumbnails;
    Thumbnail: typeof LightboxThumbnail;
  };
}>;

const defaultProps: Partial<LightboxProps> = {
  withToolbar: true,
  withControls: true,
  withThumbnails: true,
  withCounter: true,
};

export const Lightbox = factory<LightboxFactory>((_props, ref) => {
  const props = useProps("Lightbox", defaultProps, _props);
	
  const { images, withToolbar, withControls, withThumbnails, withCounter, ...rootProps } =
    props;

  return (
    <LightboxRoot ref={ref} {...rootProps}>
      {withToolbar && <LightboxToolbar />}
      {withCounter && <LightboxCounter />}
      {withControls && <LightboxControls />}
      <LightboxSlides>
        {images.map((img, i) => (
          <LightboxSlide key={i}>
            <img
              src={img.src}
              alt={img.alt}
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          </LightboxSlide>
        ))}
      </LightboxSlides>
      {withThumbnails && (
        <LightboxThumbnails>
          {images.map((img, i) => (
            <LightboxThumbnail key={i}>
              <img src={img.src} alt={img.alt} />
            </LightboxThumbnail>
          ))}
        </LightboxThumbnails>
      )}
    </LightboxRoot>
  );
});

Lightbox.displayName = "Lightbox";
Lightbox.Root = LightboxRoot;
Lightbox.Toolbar = LightboxToolbar;
Lightbox.Counter = LightboxCounter;
Lightbox.Controls = LightboxControls;
Lightbox.Slides = LightboxSlides;
Lightbox.Slide = LightboxSlide;
Lightbox.Thumbnails = LightboxThumbnails;
Lightbox.Thumbnail = LightboxThumbnail;
```

**Step 2: Update index.ts**

Overwrite `packages/lightbox/src/index.ts`:

```typescript
export type {
  LightboxControlsFactory,
  LightboxControlsProps,
  LightboxControlsStylesNames,
} from "./components/LightboxControls.js";
export { LightboxControls } from "./components/LightboxControls.js";
export type {
  LightboxCounterFactory,
  LightboxCounterProps,
  LightboxCounterStylesNames,
} from "./components/LightboxCounter.js";
export { LightboxCounter } from "./components/LightboxCounter.js";
export type {
  LightboxRootFactory,
  LightboxRootProps,
  LightboxRootStylesNames,
} from "./components/LightboxRoot.js";
export { LightboxRoot } from "./components/LightboxRoot.js";
export type {
  LightboxSlideFactory,
  LightboxSlideProps,
  LightboxSlideStylesNames,
} from "./components/LightboxSlide.js";
export { LightboxSlide } from "./components/LightboxSlide.js";
export type {
  LightboxSlidesFactory,
  LightboxSlidesProps,
  LightboxSlidesStylesNames,
} from "./components/LightboxSlides.js";
export { LightboxSlides } from "./components/LightboxSlides.js";
export type {
  LightboxThumbnailFactory,
  LightboxThumbnailProps,
  LightboxThumbnailStylesNames,
} from "./components/LightboxThumbnail.js";
export { LightboxThumbnail } from "./components/LightboxThumbnail.js";
export type {
  LightboxThumbnailsFactory,
  LightboxThumbnailsProps,
  LightboxThumbnailsStylesNames,
} from "./components/LightboxThumbnails.js";
export { LightboxThumbnails } from "./components/LightboxThumbnails.js";
export type {
  LightboxToolbarFactory,
  LightboxToolbarProps,
  LightboxToolbarStylesNames,
} from "./components/LightboxToolbar.js";
export { LightboxToolbar } from "./components/LightboxToolbar.js";
export type {
  LightboxFactory,
  LightboxImageData,
  LightboxProps,
} from "./Lightbox.js";
export { Lightbox } from "./Lightbox.js";
```

**Step 3: Fix the one broken test assertion in Lightbox.test.tsx**

In `packages/lightbox/src/__tests__/Lightbox.test.tsx`, find the test:

```typescript
it("should have static classes and extend function", () => {
  expect(Lightbox.classes).toBeDefined();
  expect(Lightbox.extend).toBeDefined();
});
```

Change it to:

```typescript
it("should have static classes and extend function", () => {
  expect(Lightbox.Root.classes).toBeDefined();
  expect(Lightbox.extend).toBeDefined();
});
```

(`Lightbox.extend` still exists on the simple component via the factory; `.classes` now lives on `LightboxRoot`.)

**Step 4: Run all tests**

```bash
cd packages/lightbox && pnpm test
```

Expected: All tests in both `Lightbox.test.tsx` and `LightboxSimple.test.tsx` pass.

**Step 5: Type-check**

```bash
cd packages/lightbox && pnpm tsc
```

Expected: No errors.

**Step 6: Lint**

```bash
cd packages/lightbox && pnpm lint
```

Expected: No errors (warnings acceptable).

---

### Task 4: Add Storybook story for the simple API

**Files:**
- Modify: `packages/lightbox/src/stories/Lightbox.story.tsx`

**Step 1: Add the SimpleApi story**

At the end of `packages/lightbox/src/stories/Lightbox.story.tsx`, add:

```tsx
export const SimpleApi = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Container>
      <Button onClick={open}>Open Simple Lightbox</Button>
      <Lightbox
        opened={opened}
        onClose={close}
        images={sampleImages}
      />
    </Container>
  );
};

export const SimpleApiNoThumbnails = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Container>
      <Button onClick={open}>Open (no thumbnails)</Button>
      <Lightbox
        opened={opened}
        onClose={close}
        images={sampleImages}
        withThumbnails={false}
      />
    </Container>
  );
};
```

The existing `sampleImages` array and `Container` component are already defined at the top of the file — reuse them.

**Step 2: Verify Storybook dev server picks up the story** (optional, manual)

```bash
pnpm dev:storybook
```

Open the Storybook UI and confirm "Lightbox/Simple Api" and "Lightbox/Simple Api No Thumbnails" stories render correctly.

---

## Final Verification

Run the full suite from the repo root before finishing:

```bash
pnpm test && pnpm tsc && pnpm lint
```

Expected: All pass.

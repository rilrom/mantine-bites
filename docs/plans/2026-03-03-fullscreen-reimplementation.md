# Fullscreen Reimplementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port fullscreen functionality from the `main` branch into `feat/compound-component`, adapting it to the compound component conventions.

**Architecture:** `withFullscreen` is a prop on `LightboxRoot` (defaulting to `true`), state is managed via `useFullscreen()` from `@mantine/hooks` and shared through `LightboxContext`. `LightboxToolbar` reads context and conditionally renders the enter/exit fullscreen button. An effect in `LightboxRoot` exits browser fullscreen when the lightbox closes.

**Tech Stack:** React, `@mantine/hooks` (`useFullscreen`), `@mantine/core` factory pattern, Jest + Testing Library

---

### Task 1: Add fullscreen icon components

**Files:**
- Create: `packages/lightbox/src/components/icons/EnterFullscreen.tsx`
- Create: `packages/lightbox/src/components/icons/ExitFullscreen.tsx`

**Step 1: Create EnterFullscreen icon**

File: `packages/lightbox/src/components/icons/EnterFullscreen.tsx`

```tsx
import type { SVGProps } from "react";

export const EnterFullscreen = (props: SVGProps<SVGSVGElement>) => (
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
		<polyline points="15 3 21 3 21 9" />
		<polyline points="9 21 3 21 3 15" />
		<line x1="21" y1="3" x2="14" y2="10" />
		<line x1="3" y1="21" x2="10" y2="14" />
	</svg>
);
```

**Step 2: Create ExitFullscreen icon**

File: `packages/lightbox/src/components/icons/ExitFullscreen.tsx`

```tsx
import type { SVGProps } from "react";

export const ExitFullscreen = (props: SVGProps<SVGSVGElement>) => (
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
		<polyline points="4 14 10 14 10 20" />
		<polyline points="20 10 14 10 14 4" />
		<line x1="14" y1="10" x2="21" y2="3" />
		<line x1="3" y1="21" x2="10" y2="14" />
	</svg>
);
```

---

### Task 2: Add fullscreen fields to types and context

**Files:**
- Modify: `packages/lightbox/src/Lightbox.tsx`
- Modify: `packages/lightbox/src/context/LightboxContext.ts`

**Step 1: Write failing test**

In `packages/lightbox/src/__tests__/Lightbox.test.tsx`, add to the describe block:

```tsx
it("should render fullscreen button by default", () => {
  renderLightbox();
  expect(screen.getByLabelText("Enter fullscreen")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

```bash
pnpm test --filter @mantine-bites/lightbox -- --testNamePattern="should render fullscreen button by default"
```

Expected: FAIL — button not in document.

**Step 3: Add `"fullscreenButton"` to `LightboxStylesNames` in `Lightbox.tsx`**

In `packages/lightbox/src/Lightbox.tsx`, add `"fullscreenButton"` to the union type:

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
  | "autoplayButton"
  | "zoomButton"
  | "fullscreenButton"   // <-- add this
  | "toolbar"
  | "closeButton"
  | "counter"
  | "thumbnails"
  | "thumbnailsViewport"
  | "thumbnailsContainer"
  | "thumbnail"
  | "thumbnailButton";
```

Also add `withFullscreen` prop to `LightboxProps`:

```ts
/** Whether to show the fullscreen toggle button in the toolbar, `true` by default */
withFullscreen?: boolean;
```

**Step 4: Add fullscreen fields to `LightboxContext`**

In `packages/lightbox/src/context/LightboxContext.ts`, add these three fields to `LightboxContext`:

```ts
// Fullscreen
withFullscreen: boolean;
isFullscreen: boolean;
toggleFullscreen: () => void;
```

---

### Task 3: Wire up fullscreen state in LightboxRoot

**Files:**
- Modify: `packages/lightbox/src/components/LightboxRoot.tsx`

**Step 1: Import `useFullscreen` and destructure `withFullscreen` prop**

At the top of `LightboxRoot.tsx`, add `useFullscreen` to the `@mantine/hooks` import:

```ts
import {
  useFocusReturn,
  useFocusTrap,
  useFullscreen,
  useHotkeys,
  useMergedRef,
} from "@mantine/hooks";
```

**Step 2: Add `withFullscreen` to defaultProps**

In `LightboxRoot.tsx`, the `defaultProps` object currently has `withZoom: true`. Add:

```ts
const defaultProps = {
  // ...existing props...
  withZoom: true,
  withFullscreen: true,   // <-- add this
  // ...
} satisfies Partial<LightboxProps>;
```

**Step 3: Destructure `withFullscreen` from props**

In the `LightboxRoot` factory function, add `withFullscreen` to the destructured props alongside `withZoom`:

```ts
const {
  // ...existing destructured props...
  withZoom,
  withFullscreen,
  ...others
} = props;
```

**Step 4: Call `useFullscreen` and add the close-cleanup effect**

After the existing `useAutoPlay` call, add:

```ts
const { fullscreen: isFullscreen, toggle: toggleFullscreen } = useFullscreen();

useEffect(() => {
  if (
    opened ||
    typeof document === "undefined" ||
    !document.fullscreenElement ||
    typeof document.exitFullscreen !== "function"
  ) {
    return;
  }

  void document.exitFullscreen();
}, [opened]);
```

Note: `useEffect` is already imported from React in this file.

**Step 5: Pass fullscreen values to `LightboxProvider`**

Inside the `LightboxProvider value={{...}}`, add:

```ts
withFullscreen,
isFullscreen,
toggleFullscreen,
```

**Step 6: Run the failing test to verify it still fails (toolbar not updated yet)**

```bash
pnpm test --filter @mantine-bites/lightbox -- --testNamePattern="should render fullscreen button by default"
```

Expected: still FAIL.

---

### Task 4: Update LightboxToolbar to render the fullscreen button

**Files:**
- Modify: `packages/lightbox/src/components/LightboxToolbar.tsx`

**Step 1: Add `"fullscreenButton"` to `LightboxToolbarStylesNames`**

```ts
export type LightboxToolbarStylesNames =
  | "toolbar"
  | "autoplayButton"
  | "fullscreenButton"   // <-- add this
  | "zoomButton"
  | "closeButton";
```

**Step 2: Import fullscreen icons and read fullscreen state from context**

Add to imports:

```ts
import { EnterFullscreen } from "./icons/EnterFullscreen.js";
import { ExitFullscreen } from "./icons/ExitFullscreen.js";
```

Add `withFullscreen`, `isFullscreen`, `toggleFullscreen` to the `useLightboxContext()` destructure:

```ts
const {
  onClose,
  getStyles,
  withFullscreen,
  isFullscreen,
  toggleFullscreen,
  withZoom,
  // ...rest unchanged
} = useLightboxContext();
```

**Step 3: Render fullscreen button — insert BEFORE the zoom button**

```tsx
{withFullscreen && (
  <ActionIcon
    variant="default"
    size="lg"
    onClick={toggleFullscreen}
    aria-label={`${isFullscreen ? "Exit" : "Enter"} fullscreen`}
    {...getStyles("fullscreenButton", { classNames, styles })}
  >
    {isFullscreen ? <ExitFullscreen /> : <EnterFullscreen />}
  </ActionIcon>
)}
```

The order in the toolbar group should be: fullscreen → zoom → autoplay → close.

**Step 4: Run the test — should now pass**

```bash
pnpm test --filter @mantine-bites/lightbox -- --testNamePattern="should render fullscreen button by default"
```

Expected: PASS.

---

### Task 5: Add all fullscreen tests

**Files:**
- Modify: `packages/lightbox/src/__tests__/Lightbox.test.tsx`

**Step 1: Add the fullscreen mock setup to the describe block**

Add these at the top of the `describe` block, before the first `it()`:

```ts
let fullscreenElement: Element | null = null;

const emitFullscreenChange = () => {
  fireEvent(
    document.documentElement,
    new Event("fullscreenchange", { bubbles: true }),
  );
};

const requestFullscreenMock = jest.fn(async function (this: Element) {
  fullscreenElement = this;
  emitFullscreenChange();
});

const exitFullscreenMock = jest.fn(async () => {
  fullscreenElement = null;
});
```

Add a `beforeEach` to the describe block (or update the existing one if there is one):

```ts
beforeEach(() => {
  fullscreenElement = null;
  requestFullscreenMock.mockClear();
  exitFullscreenMock.mockClear();

  Object.defineProperty(document, "fullscreenElement", {
    configurable: true,
    get: () => fullscreenElement,
  });

  Object.defineProperty(document.documentElement, "requestFullscreen", {
    configurable: true,
    value: requestFullscreenMock,
  });

  Object.defineProperty(document, "exitFullscreen", {
    configurable: true,
    value: exitFullscreenMock,
  });
});
```

**Step 2: Write all six fullscreen tests**

Add these tests to the describe block:

```tsx
it("should render fullscreen button by default", () => {
  renderLightbox();
  expect(screen.getByLabelText("Enter fullscreen")).toBeInTheDocument();
});

it("should hide fullscreen button when withFullscreen={false}", () => {
  renderLightbox({ rootProps: { withFullscreen: false } });
  expect(screen.queryByLabelText("Enter fullscreen")).not.toBeInTheDocument();
});

it("should render fullscreen button before close button", () => {
  renderLightbox();
  const fullscreenButton = screen.getByLabelText("Enter fullscreen");
  const closeButton = screen.getByLabelText("Close lightbox");
  expect(
    Boolean(
      fullscreenButton.compareDocumentPosition(closeButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ),
  ).toBe(true);
});

it("should request browser fullscreen when fullscreen button is clicked", async () => {
  renderLightbox();
  await userEvent.click(screen.getByLabelText("Enter fullscreen"));
  expect(requestFullscreenMock).toHaveBeenCalledTimes(1);
});

it("should exit browser fullscreen when fullscreen button is clicked in fullscreen mode", async () => {
  renderLightbox();
  await userEvent.click(screen.getByLabelText("Enter fullscreen"));
  await userEvent.click(screen.getByLabelText("Exit fullscreen"));
  expect(exitFullscreenMock).toHaveBeenCalledTimes(1);
});

it("should exit browser fullscreen when lightbox closes", async () => {
  const { rerender } = renderLightbox({ rootProps: { opened: true } });

  await userEvent.click(screen.getByLabelText("Enter fullscreen"));

  await waitFor(() =>
    expect(screen.getByLabelText("Exit fullscreen")).toBeInTheDocument(),
  );

  rerender(
    <Lightbox.Root {...defaultRootProps} opened={false}>
      <Lightbox.Toolbar />
      <Lightbox.Counter />
      <Lightbox.Slides>{defaultSlides}</Lightbox.Slides>
      <Lightbox.Controls />
      <Lightbox.Thumbnails>{defaultThumbnails}</Lightbox.Thumbnails>
    </Lightbox.Root>,
  );

  await waitFor(() => expect(exitFullscreenMock).toHaveBeenCalledTimes(1));
});
```

**Step 3: Run all tests**

```bash
pnpm test --filter @mantine-bites/lightbox
```

Expected: all tests pass.

---

### Task 6: Type-check and lint

**Step 1: Run TypeScript**

```bash
pnpm tsc --filter @mantine-bites/lightbox
```

Expected: no errors.

**Step 2: Run linter**

```bash
pnpm lint --filter @mantine-bites/lightbox
```

Expected: no errors.

**Step 3: Fix any issues found**

Address any TypeScript or lint errors before considering the work complete.

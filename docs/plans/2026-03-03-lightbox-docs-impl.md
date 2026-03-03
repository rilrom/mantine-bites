# Lightbox Documentation Rewrite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the lightbox documentation to reflect the new compound component architecture, defaulting to the `<Lightbox />` convenience wrapper, with a dedicated compound component section.

**Architecture:** Delete the four outdated demo files and replace them with ~12 new ones. Rewrite `lightbox.mdx` to match the new section structure. Update `data.ts` to expose all compound sub-components in the Props and Styles API tabs.

**Tech Stack:** Next.js (MDX), `@mantinex/demo` (MantineDemo type), `@mantine-bites/lightbox`, Mantine core, `embla-carousel-autoplay`

---

## Context

### File locations

| File | Path |
|---|---|
| Demo files | `apps/docs/demos/lightbox/` |
| Demo barrel | `apps/docs/demos/lightbox/index.ts` |
| MDX content | `apps/docs/docs/lightbox.mdx` |
| Page data config | `apps/docs/data.ts` |

### Demo file anatomy

Every demo file follows this exact pattern:

```tsx
import { ... } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
// 2-space indented code string shown to users
`;

const images = [
  { src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
  { src: "https://picsum.photos/id/20/1200/800", alt: "Books" },
  { src: "https://picsum.photos/id/30/2400/1600", alt: "Mug" },
  { src: "https://picsum.photos/id/40/1200/800", alt: "Cat" },
  { src: "https://picsum.photos/id/50/2400/1600", alt: "Bird" },
  { src: "https://picsum.photos/id/60/1200/800", alt: "Computer" },
];

function Demo() { /* same as code string, tabs for indentation */ }

export const exportName: MantineDemo = {
  type: "code", // or "configurator"
  component: Demo,
  code,
};
```

**Important:** The component body must be byte-for-byte identical to the `code` string, except indented with tabs (Biome formatter uses tabs). The `code` string uses 2-space indentation (what users see in docs).

### Trigger pattern (used in every demo)

All demos use a `SimpleGrid` of clickable `Image` components to trigger the lightbox:

```tsx
const [opened, setOpened] = useState(false);
const [initialSlide, setInitialSlide] = useState(0);

const open = (index: number) => {
  setInitialSlide(index);
  setOpened(true);
};

// In JSX:
<SimpleGrid cols={{ base: 2, sm: 3 }}>
  {images.map((img, index) => (
    <Image key={img.src} src={img.src} alt={img.alt} radius="md" onClick={() => open(index)} />
  ))}
</SimpleGrid>
```

### New Lightbox API (convenience wrapper)

```tsx
<Lightbox
  images={images}                          // LightboxImageData[]
  opened={opened}                          // required
  onClose={() => setOpened(false)}         // required
  withToolbar={true}                       // default true
  withControls={true}                      // default true
  withThumbnails={true}                    // default true
  withCounter={true}                       // default true
  withZoom={true}                          // inherited from LightboxRoot, default true
  withFullscreen={true}                    // inherited from LightboxRoot, default true
  closeOnClickOutside={true}               // inherited from LightboxRoot, default true
  orientation="horizontal"                 // inherited from LightboxRoot, default "horizontal"
  transitionProps={{ transition: 'fade', duration: 250 }}
  overlayProps={{ color: '#18181B', backgroundOpacity: 0.9 }}
  slidesProps={{ initialSlide: 0, emblaOptions: {}, emblaPlugins: [] }}
  thumbnailsProps={{ emblaOptions: { dragFree: true } }}
  controlsProps={{ size: 36 }}
  counterProps={{ formatter: (index, total) => `${index + 1} / ${total}` }}
/>
```

### Compound component API

```tsx
<Lightbox.Root opened={opened} onClose={() => setOpened(false)}>
  <Lightbox.Toolbar />          {/* renders zoom+fullscreen+close buttons by default */}
  <Lightbox.Counter />
  <Lightbox.Controls />
  <Lightbox.Slides initialSlide={initialSlide}>
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
</Lightbox.Root>
```

`Lightbox.Toolbar` with custom children:
```tsx
<Lightbox.Toolbar>
  <Lightbox.ZoomButton />
  <Lightbox.FullscreenButton />
  <ActionIcon variant="default" aria-label="Download">
    <IconDownload />
  </ActionIcon>
  <Lightbox.CloseButton />
</Lightbox.Toolbar>
```

`useLightboxContext()` (must be called inside `Lightbox.Root`):
```tsx
import { useLightboxContext } from "@mantine-bites/lightbox";
const { currentIndex } = useLightboxContext();
```

---

## Task 1: Delete old demo files

**Files to delete:**
- `apps/docs/demos/lightbox/Lightbox.demo.usage.tsx`
- `apps/docs/demos/lightbox/Lightbox.demo.overlayProps.tsx`
- `apps/docs/demos/lightbox/Lightbox.demo.transitionProps.tsx`
- `apps/docs/demos/lightbox/Lightbox.demo.customCounter.tsx`

**Step 1: Delete the files**

```bash
rm apps/docs/demos/lightbox/Lightbox.demo.usage.tsx
rm apps/docs/demos/lightbox/Lightbox.demo.overlayProps.tsx
rm apps/docs/demos/lightbox/Lightbox.demo.transitionProps.tsx
rm apps/docs/demos/lightbox/Lightbox.demo.customCounter.tsx
```

**Step 2: Clear the barrel exports**

Replace `apps/docs/demos/lightbox/index.ts` with an empty file (just a comment):

```ts
// Lightbox demo exports
```

(This prevents build errors from broken imports until new files are added.)

---

## Task 2: Create the configurator demo

**File:** `apps/docs/demos/lightbox/Lightbox.demo.configurator.tsx`

**Step 1: Create the file**

```tsx
import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox, type LightboxProps } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

type WrapperProps = Pick<
	LightboxProps,
	| "withToolbar"
	| "withControls"
	| "withThumbnails"
	| "withCounter"
	| "withZoom"
	| "withFullscreen"
	| "closeOnClickOutside"
>;

const images = [
	{ src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
	{ src: "https://picsum.photos/id/20/1200/800", alt: "Books" },
	{ src: "https://picsum.photos/id/30/2400/1600", alt: "Mug" },
	{ src: "https://picsum.photos/id/40/1200/800", alt: "Cat" },
	{ src: "https://picsum.photos/id/50/2400/1600", alt: "Bird" },
	{ src: "https://picsum.photos/id/60/1200/800", alt: "Computer" },
];

function Wrapper({
	withToolbar = true,
	withControls = true,
	withThumbnails = true,
	withCounter = true,
	withZoom = true,
	withFullscreen = true,
	closeOnClickOutside = true,
}: WrapperProps) {
	const [opened, setOpened] = useState(false);
	const [initialSlide, setInitialSlide] = useState(0);

	const open = (index: number) => {
		setInitialSlide(index);
		setOpened(true);
	};

	return (
		<>
			<SimpleGrid cols={{ base: 2, sm: 3 }}>
				{images.map((img, index) => (
					<Image
						key={img.src}
						src={img.src}
						alt={img.alt}
						radius="md"
						onClick={() => open(index)}
					/>
				))}
			</SimpleGrid>

			<Lightbox
				images={images}
				opened={opened}
				onClose={() => setOpened(false)}
				withToolbar={withToolbar}
				withControls={withControls}
				withThumbnails={withThumbnails}
				withCounter={withCounter}
				withZoom={withZoom}
				withFullscreen={withFullscreen}
				closeOnClickOutside={closeOnClickOutside}
				slidesProps={{ initialSlide }}
			/>
		</>
	);
}

const code = `
import { Lightbox } from '@mantine-bites/lightbox';
import { Image, SimpleGrid } from '@mantine/core';
import { useState } from 'react';

const images = [
  { src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
  { src: "https://picsum.photos/id/20/1200/800", alt: "Books" },
  { src: "https://picsum.photos/id/30/2400/1600", alt: "Mug" },
  { src: "https://picsum.photos/id/40/1200/800", alt: "Cat" },
  { src: "https://picsum.photos/id/50/2400/1600", alt: "Bird" },
  { src: "https://picsum.photos/id/60/1200/800", alt: "Computer" },
];

function Demo({{props}}) {
  const [opened, setOpened] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  const open = (index) => {
    setInitialSlide(index);
    setOpened(true);
  };

  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 3 }}>
        {images.map((img, index) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            radius="md"
            onClick={() => open(index)}
          />
        ))}
      </SimpleGrid>

      <Lightbox
        images={images}
        opened={opened}
        onClose={() => setOpened(false)}
        slidesProps={{ initialSlide }}
        {{props}}
      />
    </>
  );
}
`;

export const configurator: MantineDemo = {
	type: "configurator",
	component: Wrapper,
	code,
	centered: true,
	maxWidth: "100%",
	controls: [
		{ prop: "withToolbar", type: "boolean", initialValue: true, libraryValue: true },
		{ prop: "withControls", type: "boolean", initialValue: true, libraryValue: true },
		{ prop: "withThumbnails", type: "boolean", initialValue: true, libraryValue: true },
		{ prop: "withCounter", type: "boolean", initialValue: true, libraryValue: true },
		{ prop: "withZoom", type: "boolean", initialValue: true, libraryValue: true },
		{ prop: "withFullscreen", type: "boolean", initialValue: true, libraryValue: true },
		{ prop: "closeOnClickOutside", type: "boolean", initialValue: true, libraryValue: true },
	],
};
```

**Step 2: Add to barrel**

Replace `apps/docs/demos/lightbox/index.ts`:

```ts
export { configurator } from "./Lightbox.demo.configurator";
```

**Step 3: Type check**

```bash
pnpm tsc --filter @mantine-bites/docs
```

Expected: no errors.

---

## Task 3: Create transitionProps and overlayProps demos

### `Lightbox.demo.transitionProps.tsx`

```tsx
import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
import { Lightbox } from '@mantine-bites/lightbox';
import { Image, SimpleGrid } from '@mantine/core';
import { useState } from 'react';

const images = [
  { src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
  { src: "https://picsum.photos/id/20/1200/800", alt: "Books" },
  { src: "https://picsum.photos/id/30/2400/1600", alt: "Mug" },
  { src: "https://picsum.photos/id/40/1200/800", alt: "Cat" },
  { src: "https://picsum.photos/id/50/2400/1600", alt: "Bird" },
  { src: "https://picsum.photos/id/60/1200/800", alt: "Computer" },
];

function Demo() {
  const [opened, setOpened] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  const open = (index) => {
    setInitialSlide(index);
    setOpened(true);
  };

  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 3 }}>
        {images.map((img, index) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            radius="md"
            onClick={() => open(index)}
          />
        ))}
      </SimpleGrid>

      <Lightbox
        images={images}
        opened={opened}
        onClose={() => setOpened(false)}
        slidesProps={{ initialSlide }}
        transitionProps={{ transition: 'slide-up', duration: 400 }}
      />
    </>
  );
}
`;

const images = [
	{ src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
	{ src: "https://picsum.photos/id/20/1200/800", alt: "Books" },
	{ src: "https://picsum.photos/id/30/2400/1600", alt: "Mug" },
	{ src: "https://picsum.photos/id/40/1200/800", alt: "Cat" },
	{ src: "https://picsum.photos/id/50/2400/1600", alt: "Bird" },
	{ src: "https://picsum.photos/id/60/1200/800", alt: "Computer" },
];

function Demo() {
	const [opened, setOpened] = useState(false);
	const [initialSlide, setInitialSlide] = useState(0);

	const open = (index: number) => {
		setInitialSlide(index);
		setOpened(true);
	};

	return (
		<>
			<SimpleGrid cols={{ base: 2, sm: 3 }}>
				{images.map((img, index) => (
					<Image
						key={img.src}
						src={img.src}
						alt={img.alt}
						radius="md"
						onClick={() => open(index)}
					/>
				))}
			</SimpleGrid>

			<Lightbox
				images={images}
				opened={opened}
				onClose={() => setOpened(false)}
				slidesProps={{ initialSlide }}
				transitionProps={{ transition: "slide-up", duration: 400 }}
			/>
		</>
	);
}

export const transitionProps: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};
```

### `Lightbox.demo.overlayProps.tsx`

Same pattern, but:

```tsx
overlayProps={{ color: '#000', backgroundOpacity: 0.85 }}
```

Export name: `overlayProps`.

**Step 1: Create both files** (content as above)

**Step 2: Update barrel**

```ts
export { configurator } from "./Lightbox.demo.configurator";
export { transitionProps } from "./Lightbox.demo.transitionProps";
export { overlayProps } from "./Lightbox.demo.overlayProps";
```

**Step 3: Type check**

```bash
pnpm tsc --filter @mantine-bites/docs
```

Expected: no errors.

---

## Task 4: Create slidesProps and thumbnailsProps demos

### `Lightbox.demo.slidesProps.tsx`

Same trigger pattern. Key prop:

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  slidesProps={{ initialSlide: 2 }}
/>
```

Export name: `slidesProps`.

### `Lightbox.demo.thumbnailsProps.tsx`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  slidesProps={{ initialSlide }}
  thumbnailsProps={{ emblaOptions: { dragFree: false } }}
/>
```

Export name: `thumbnailsProps`.

**Step 1: Create both files**

**Step 2: Update barrel** (add both exports)

**Step 3: Type check**

```bash
pnpm tsc --filter @mantine-bites/docs
```

---

## Task 5: Create controlsProps and counterProps demos

### `Lightbox.demo.controlsProps.tsx`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  slidesProps={{ initialSlide }}
  controlsProps={{ size: 48 }}
/>
```

Export name: `controlsProps`.

### `Lightbox.demo.counterProps.tsx`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  slidesProps={{ initialSlide }}
  counterProps={{ formatter: (index, total) => `${index + 1} of ${total}` }}
/>
```

Export name: `counterProps`.

**Step 1: Create both files**

**Step 2: Update barrel** (add both exports)

**Step 3: Type check**

```bash
pnpm tsc --filter @mantine-bites/docs
```

---

## Task 6: Create emblaOptions and emblaPlugins demos

### `Lightbox.demo.emblaOptions.tsx`

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  slidesProps={{ initialSlide, emblaOptions: { loop: true } }}
/>
```

Export name: `emblaOptions`.

### `Lightbox.demo.emblaPlugins.tsx`

This demo uses the `embla-carousel-autoplay` package.

**Step 1: Verify `embla-carousel-autoplay` is available in the docs workspace**

```bash
cat apps/docs/package.json | grep embla
```

If `embla-carousel-autoplay` is not listed, add it:

```bash
pnpm add embla-carousel-autoplay --filter @mantine-bites/docs
```

**Step 2: Create `Lightbox.demo.emblaPlugins.tsx`**

```tsx
import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import Autoplay from "embla-carousel-autoplay";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
import { Lightbox } from '@mantine-bites/lightbox';
import { Image, SimpleGrid } from '@mantine/core';
import Autoplay from 'embla-carousel-autoplay';
import { useState } from 'react';

// ...images array...

function Demo() {
  const [opened, setOpened] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  const open = (index) => {
    setInitialSlide(index);
    setOpened(true);
  };

  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 3 }}>
        {images.map((img, index) => (
          <Image key={img.src} src={img.src} alt={img.alt} radius="md" onClick={() => open(index)} />
        ))}
      </SimpleGrid>

      <Lightbox
        images={images}
        opened={opened}
        onClose={() => setOpened(false)}
        slidesProps={{ initialSlide, emblaPlugins: [Autoplay()] }}
      />
    </>
  );
}
`;

// ...images, Demo component, export
```

Export name: `emblaPlugins`.

**Step 3: Update barrel** (add both exports)

**Step 4: Type check**

```bash
pnpm tsc --filter @mantine-bites/docs
```

---

## Task 7: Create vertical demo

**File:** `apps/docs/demos/lightbox/Lightbox.demo.vertical.tsx`

Same trigger pattern. Key prop:

```tsx
<Lightbox
  images={images}
  opened={opened}
  onClose={() => setOpened(false)}
  slidesProps={{ initialSlide }}
  orientation="vertical"
/>
```

Export name: `vertical`.

**Step 1: Create the file**

**Step 2: Update barrel** (add `vertical` export)

**Step 3: Type check**

```bash
pnpm tsc --filter @mantine-bites/docs
```

---

## Task 8: Create compound toolbar demo

**File:** `apps/docs/demos/lightbox/Lightbox.demo.compoundToolbar.tsx`

This demo uses `Lightbox.Root` directly and adds a custom download `ActionIcon` inside `Lightbox.Toolbar`.

**Imports needed:** `ActionIcon` from `@mantine/core`, `IconDownload` from `@tabler/icons-react`, `Lightbox` from `@mantine-bites/lightbox`.

**Step 1: Verify `@tabler/icons-react` is available**

```bash
cat apps/docs/package.json | grep tabler
```

It should already be present (used elsewhere in the docs app).

**Step 2: Create the file**

```tsx
import { ActionIcon, Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import { IconDownload } from "@tabler/icons-react";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
import { ActionIcon, Image, SimpleGrid } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import { IconDownload } from '@tabler/icons-react';
import { useState } from 'react';

const images = [
  { src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
  // ...
];

function Demo() {
  const [opened, setOpened] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  const open = (index) => {
    setInitialSlide(index);
    setOpened(true);
  };

  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 3 }}>
        {images.map((img, index) => (
          <Image key={img.src} src={img.src} alt={img.alt} radius="md" onClick={() => open(index)} />
        ))}
      </SimpleGrid>

      <Lightbox.Root opened={opened} onClose={() => setOpened(false)}>
        <Lightbox.Toolbar>
          <Lightbox.ZoomButton />
          <Lightbox.FullscreenButton />
          <ActionIcon variant="default" aria-label="Download">
            <IconDownload />
          </ActionIcon>
          <Lightbox.CloseButton />
        </Lightbox.Toolbar>
        <Lightbox.Counter />
        <Lightbox.Controls />
        <Lightbox.Slides initialSlide={initialSlide}>
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
      </Lightbox.Root>
    </>
  );
}
`;

const images = [
	{ src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
	{ src: "https://picsum.photos/id/20/1200/800", alt: "Books" },
	{ src: "https://picsum.photos/id/30/2400/1600", alt: "Mug" },
	{ src: "https://picsum.photos/id/40/1200/800", alt: "Cat" },
	{ src: "https://picsum.photos/id/50/2400/1600", alt: "Bird" },
	{ src: "https://picsum.photos/id/60/1200/800", alt: "Computer" },
];

function Demo() {
	const [opened, setOpened] = useState(false);
	const [initialSlide, setInitialSlide] = useState(0);

	const open = (index: number) => {
		setInitialSlide(index);
		setOpened(true);
	};

	return (
		<>
			<SimpleGrid cols={{ base: 2, sm: 3 }}>
				{images.map((img, index) => (
					<Image
						key={img.src}
						src={img.src}
						alt={img.alt}
						radius="md"
						onClick={() => open(index)}
					/>
				))}
			</SimpleGrid>

			<Lightbox.Root opened={opened} onClose={() => setOpened(false)}>
				<Lightbox.Toolbar>
					<Lightbox.ZoomButton />
					<Lightbox.FullscreenButton />
					<ActionIcon variant="default" aria-label="Download">
						<IconDownload />
					</ActionIcon>
					<Lightbox.CloseButton />
				</Lightbox.Toolbar>
				<Lightbox.Counter />
				<Lightbox.Controls />
				<Lightbox.Slides initialSlide={initialSlide}>
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
			</Lightbox.Root>
		</>
	);
}

export const compoundToolbar: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};
```

**Step 3: Update barrel** (add `compoundToolbar` export)

**Step 4: Type check**

```bash
pnpm tsc --filter @mantine-bites/docs
```

---

## Task 9: Create compound footer demo

**File:** `apps/docs/demos/lightbox/Lightbox.demo.compoundFooter.tsx`

Uses `useLightboxContext` to read `currentIndex` and display the current image alt text in a footer `Box` with `bg="dark.9"` rendered after `Lightbox.Thumbnails`.

**Note:** `useLightboxContext` must be called from a component that is rendered *inside* `Lightbox.Root` (i.e., as a child or descendant). The `LightboxFooter` component satisfies this.

**Step 1: Create the file**

```tsx
import { Box, Image, SimpleGrid, Text } from "@mantine/core";
import { Lightbox, useLightboxContext } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const images = [
	{ src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
	{ src: "https://picsum.photos/id/20/1200/800", alt: "Books" },
	{ src: "https://picsum.photos/id/30/2400/1600", alt: "Mug" },
	{ src: "https://picsum.photos/id/40/1200/800", alt: "Cat" },
	{ src: "https://picsum.photos/id/50/2400/1600", alt: "Bird" },
	{ src: "https://picsum.photos/id/60/1200/800", alt: "Computer" },
];

interface LightboxFooterProps {
	images: { src: string; alt?: string }[];
}

function LightboxFooter({ images }: LightboxFooterProps) {
	const { currentIndex } = useLightboxContext();
	const image = images[currentIndex];

	return (
		<Box bg="dark.9" w="100%" p="xs">
			<Text size="sm" c="dimmed" ta="center">
				{image?.alt ?? ""}
			</Text>
		</Box>
	);
}

function Demo() {
	const [opened, setOpened] = useState(false);
	const [initialSlide, setInitialSlide] = useState(0);

	const open = (index: number) => {
		setInitialSlide(index);
		setOpened(true);
	};

	return (
		<>
			<SimpleGrid cols={{ base: 2, sm: 3 }}>
				{images.map((img, index) => (
					<Image
						key={img.src}
						src={img.src}
						alt={img.alt}
						radius="md"
						onClick={() => open(index)}
					/>
				))}
			</SimpleGrid>

			<Lightbox.Root opened={opened} onClose={() => setOpened(false)}>
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Controls />
				<Lightbox.Slides initialSlide={initialSlide}>
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
				<LightboxFooter images={images} />
			</Lightbox.Root>
		</>
	);
}

const code = `
import { Box, Image, SimpleGrid, Text } from '@mantine/core';
import { Lightbox, useLightboxContext } from '@mantine-bites/lightbox';
import { useState } from 'react';

const images = [
  { src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
  { src: "https://picsum.photos/id/20/1200/800", alt: "Books" },
  { src: "https://picsum.photos/id/30/2400/1600", alt: "Mug" },
  { src: "https://picsum.photos/id/40/1200/800", alt: "Cat" },
  { src: "https://picsum.photos/id/50/2400/1600", alt: "Bird" },
  { src: "https://picsum.photos/id/60/1200/800", alt: "Computer" },
];

function LightboxFooter({ images }) {
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

function Demo() {
  const [opened, setOpened] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  const open = (index) => {
    setInitialSlide(index);
    setOpened(true);
  };

  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 3 }}>
        {images.map((img, index) => (
          <Image key={img.src} src={img.src} alt={img.alt} radius="md" onClick={() => open(index)} />
        ))}
      </SimpleGrid>

      <Lightbox.Root opened={opened} onClose={() => setOpened(false)}>
        <Lightbox.Toolbar />
        <Lightbox.Counter />
        <Lightbox.Controls />
        <Lightbox.Slides initialSlide={initialSlide}>
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
        <LightboxFooter images={images} />
      </Lightbox.Root>
    </>
  );
}
`;

export const compoundFooter: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};
```

**Step 2: Update barrel** (add `compoundFooter` export)

**Step 3: Type check**

```bash
pnpm tsc --filter @mantine-bites/docs
```

---

## Task 10: Final barrel state

After all demo files are created, `apps/docs/demos/lightbox/index.ts` should be:

```ts
export { configurator } from "./Lightbox.demo.configurator";
export { transitionProps } from "./Lightbox.demo.transitionProps";
export { overlayProps } from "./Lightbox.demo.overlayProps";
export { slidesProps } from "./Lightbox.demo.slidesProps";
export { thumbnailsProps } from "./Lightbox.demo.thumbnailsProps";
export { controlsProps } from "./Lightbox.demo.controlsProps";
export { counterProps } from "./Lightbox.demo.counterProps";
export { emblaOptions } from "./Lightbox.demo.emblaOptions";
export { emblaPlugins } from "./Lightbox.demo.emblaPlugins";
export { vertical } from "./Lightbox.demo.vertical";
export { compoundToolbar } from "./Lightbox.demo.compoundToolbar";
export { compoundFooter } from "./Lightbox.demo.compoundFooter";
```

---

## Task 11: Rewrite lightbox.mdx

**File:** `apps/docs/docs/lightbox.mdx`

Replace the entire file:

```mdx
import { InstallScript } from '../components/InstallScript/InstallScript';
import * as demos from '../demos/lightbox';

## Important

This plugin is in beta and is subject to BREAKING CHANGES. It is not yet recommended to use this in a production environment.

## Installation

<InstallScript packages="embla-carousel@^8.5.2 embla-carousel-react@^8.5.2 @mantine/carousel @mantine-bites/lightbox" />

After installation import package styles at the root of your application:

```tsx
import '@mantine/core/styles.css';
// ‼️ import carousel and lightbox styles after core package styles
import '@mantine/carousel/styles.css';
import '@mantine-bites/lightbox/styles.css';
```

## Usage

`@mantine-bites/lightbox` is built on top of [@mantine/carousel](https://mantine.dev/x/carousel/) which is built on top of [embla-carousel](https://www.embla-carousel.com/). Click any image to open the lightbox:

<Demo data={demos.configurator} />

## Transition

Customize the open/close animation using `transitionProps`. Props are passed to the Mantine [`Transition`](https://mantine.dev/core/transition/) component. Defaults: `transition: 'fade'`, `duration: 250`:

<Demo data={demos.transitionProps} />

## Overlay

Customize the backdrop using `overlayProps`. Props are passed to the Mantine [`Overlay`](https://mantine.dev/core/overlay/) component. Defaults: `color: '#18181B'`, `backgroundOpacity: 0.9`, `zIndex: 200`:

<Demo data={demos.overlayProps} />

## Slides

Use `slidesProps` to configure the main slides carousel. Supports `initialSlide`, `emblaOptions`, and `emblaPlugins` (covered in their own sections below):

<Demo data={demos.slidesProps} />

## Thumbnails

Use `thumbnailsProps` to configure the thumbnail strip carousel. Default: `dragFree: true`:

<Demo data={demos.thumbnailsProps} />

## Controls

Use `controlsProps` to configure the prev/next navigation buttons. `size` controls button size in px, default `36`:

<Demo data={demos.controlsProps} />

## Counter

Use `counterProps` to customize the slide counter. The `formatter` function receives the current zero-based index and the total slide count:

<Demo data={demos.counterProps} />

## Embla options

Pass options directly to the Embla carousel instance via `slidesProps.emblaOptions`. See the [Embla options documentation](https://www.embla-carousel.com/api/options/) for all available options. `thumbnailsProps.emblaOptions` works the same way for the thumbnail strip:

<Demo data={demos.emblaOptions} />

## Embla plugins

Pass plugins to the main slides carousel via `slidesProps.emblaPlugins`. See the [Embla plugins documentation](https://www.embla-carousel.com/plugins/). When the autoplay plugin is detected, an autoplay toggle button is automatically added to the toolbar:

<Demo data={demos.emblaPlugins} />

## Vertical orientation

Set `orientation="vertical"` to switch both the slides carousel and the thumbnail strip to a vertical layout:

<Demo data={demos.vertical} />

## Compound components

`<Lightbox />` is a convenience wrapper. For full control over layout and composition, use the compound components via `Lightbox.Root`. All sub-components read shared state from context, so they work wherever they are placed inside `Lightbox.Root`.

### Custom toolbar button

Pass children to `Lightbox.Toolbar` to compose a custom set of buttons. The built-in button components (`ZoomButton`, `FullscreenButton`, `AutoplayButton`, `CloseButton`) can be used individually and still read state from context:

<Demo data={demos.compoundToolbar} />

### Custom footer

Any element rendered after `Lightbox.Thumbnails` inside `Lightbox.Root` naturally spans the full width at the bottom. Use `useLightboxContext()` to read state such as `currentIndex` from any component inside `Lightbox.Root`:

<Demo data={demos.compoundFooter} />
```

**Step 1: Replace the file** (content as above)

**Step 2: Type check**

```bash
pnpm tsc --filter @mantine-bites/docs
```

---

## Task 12: Update data.ts

**File:** `apps/docs/data.ts`

Update the `componentsProps` and `componentsStyles` arrays for the `lightbox` entry:

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

**Step 1: Update the arrays**

**Step 2: Run docgen to regenerate the props tables**

```bash
pnpm docgen
```

Expected: regenerates `apps/docs/docgen.json` with entries for all new components.

**Step 3: Final type check across all packages**

```bash
pnpm tsc
```

Expected: no errors.

**Step 4: Run the docs dev server and visually verify**

```bash
pnpm dev:docs
```

Open `http://localhost:3000/lightbox` and verify:
- All 12 sections render correctly
- Configurator controls toggle props on the live demo
- All `<Demo>` components display without errors
- The compound footer demo shows the image caption updating as slides change

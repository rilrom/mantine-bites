import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox, type LightboxProps } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

type WrapperProps = Pick<
	LightboxProps,
	| "withThumbnails"
	| "withCounter"
	| "withFullscreen"
	| "withZoom"
	| "closeOnClickOutside"
> & {
	withControls?: boolean;
	controlSize?: number;
	controlsOffset?: "xs" | "sm" | "md" | "lg" | "xl";
	loop?: boolean;
};

const images = [
	{ src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
	{ src: "https://picsum.photos/id/20/1200/800", alt: "Books" },
	{ src: "https://picsum.photos/id/30/2400/1600", alt: "Mug" },
	{ src: "https://picsum.photos/id/40/1200/800", alt: "Cat" },
	{ src: "https://picsum.photos/id/50/2400/1600", alt: "Bird" },
	{ src: "https://picsum.photos/id/60/1200/800", alt: "Computer" },
];

function Wrapper({
	withThumbnails = true,
	withCounter = true,
	withFullscreen = true,
	withZoom = true,
	closeOnClickOutside = true,
	withControls = true,
	controlSize = 26,
	controlsOffset = "sm",
	loop = false,
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
				opened={opened}
				onClose={() => setOpened(false)}
				withThumbnails={withThumbnails}
				withCounter={withCounter}
				withFullscreen={withFullscreen}
				withZoom={withZoom}
				closeOnClickOutside={closeOnClickOutside}
				carouselOptions={{
					initialSlide,
					withControls,
					controlSize,
					controlsOffset,
					emblaOptions: { loop },
				}}
			>
				{images.map((img) => (
					<Lightbox.Slide
						key={img.src}
						thumbnail={<img src={img.src} alt={img.alt} />}
					>
						<img src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</Lightbox>
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

function Wrapper({
  withThumbnails = true,
  withCounter = true,
  withFullscreen = true,
  withZoom = true,
  closeOnClickOutside = true,
  withControls = true,
  controlSize = 26,
  controlsOffset = 'sm',
  loop = false,
}) {
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
        opened={opened}
        onClose={() => setOpened(false)}
        withThumbnails={withThumbnails}
        withCounter={withCounter}
        withFullscreen={withFullscreen}
        withZoom={withZoom}
        closeOnClickOutside={closeOnClickOutside}
        carouselOptions={{
          initialSlide,
          withControls,
          controlSize,
          controlsOffset,
          emblaOptions: { loop },
        }}
      >
        {images.map((img) => (
          <Lightbox.Slide key={img.src} thumbnail={<img src={img.src} alt={img.alt} />}>
            <img src={img.src} alt={img.alt} />
          </Lightbox.Slide>
        ))}
      </Lightbox>
    </>
  );
}

function Demo() {
  return <Wrapper {{props}} />;
}
`;

export const configurator: MantineDemo = {
	type: "configurator",
	component: Wrapper,
	code,
	centered: true,
	maxWidth: "100%",
	controls: [
		{
			prop: "withThumbnails",
			type: "boolean",
			initialValue: true,
			libraryValue: true,
		},
		{
			prop: "withCounter",
			type: "boolean",
			initialValue: true,
			libraryValue: true,
		},
		{
			prop: "withFullscreen",
			type: "boolean",
			initialValue: true,
			libraryValue: true,
		},
		{
			prop: "withZoom",
			type: "boolean",
			initialValue: true,
			libraryValue: true,
		},
		{
			prop: "closeOnClickOutside",
			type: "boolean",
			initialValue: true,
			libraryValue: true,
		},
		{
			prop: "withControls",
			type: "boolean",
			initialValue: true,
			libraryValue: true,
		},
		{
			prop: "controlSize",
			type: "number",
			min: 14,
			max: 48,
			initialValue: 26,
			libraryValue: 26,
		},
		{
			prop: "controlsOffset",
			type: "size",
			initialValue: "sm",
			libraryValue: "sm",
		},
		{ prop: "loop", type: "boolean", initialValue: false, libraryValue: false },
	],
};

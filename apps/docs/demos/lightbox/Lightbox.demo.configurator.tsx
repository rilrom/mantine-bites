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
import { Image, SimpleGrid } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
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
		{
			prop: "withToolbar",
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
			prop: "withZoom",
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
			prop: "closeOnClickOutside",
			type: "boolean",
			initialValue: true,
			libraryValue: true,
		},
	],
};

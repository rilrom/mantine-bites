import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox, type LightboxProps } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";
import { IMAGES } from "./_data";

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

const images = IMAGES;

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
				initialSlide={initialSlide}
			/>
		</>
	);
}

const code = `
import { Image, SimpleGrid } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import { useState } from 'react';

const images = [
  { src: "/assets/bg-1.png", alt: "Desert" },
  { src: "/assets/bg-2.png", alt: "Forest" },
  { src: "/assets/bg-3.png", alt: "Torii Gate" },
  { src: "/assets/bg-4.png", alt: "Mountain" },
  { src: "/assets/bg-5.png", alt: "Night Lake" },
  { src: "/assets/bg-6.png", alt: "Lighthouse" },
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
        initialSlide={initialSlide}
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

import { SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import NextImage from "next/image";
import {
	// type ComponentProps,
	useState,
} from "react";
import { bg1, bg2, bg3, bg4, bg5, bg6 } from "./_data";

const code = `
import { SimpleGrid } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import NextImage from 'next/image';
import {
  // type ComponentProps,
  useState,
} from 'react';

const images = [
  {
    src: "/assets/bg-1.png",
    alt: "Desert",
    width: 2400,
    height: 1600,
  },
  {
    src: "/assets/bg-2.png",
    alt: "Forest",
    width: 1200,
    height: 800,
  },
  {
    src: "/assets/bg-3.png",
    alt: "Torii Gate",
    width: 2400,
    height: 1600,
  },
  {
    src: "/assets/bg-4.png",
    alt: "Mountain",
    width: 1200,
    height: 800,
  },
  {
    src: "/assets/bg-5.png",
    alt: "Night Lake",
    width: 2400,
    height: 1600,
  },
  {
    src: "/assets/bg-6.png",
    alt: "Lighthouse",
    width: 1200,
    height: 800,
  },
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
          <div
            key={img.src}
            style={{ position: "relative", aspectRatio: "3/2" }}
          >
            <NextImage
              src={img.src}
              alt={img.alt}
              fill
              style={{ objectFit: "cover", borderRadius: 8 }}
              onClick={() => open(index)}
            />
          </div>
        ))}
      </SimpleGrid>

      <Lightbox
        images={images}
        slideImageProps={{
          component: NextImage,
          // Use renderRoot if you need more fine-grained control and better type-safety
          // renderRoot: (props: ComponentProps<typeof NextImage>) => (
          // 	<NextImage {...props} />
          // ),
        }}
        opened={opened}
        onClose={() => setOpened(false)}
        initialSlide={initialSlide}
      />
    </>
  );
}
`;

const images = [
	{
		src: bg1.src,
		alt: "Desert",
		width: 2400,
		height: 1600,
	},
	{
		src: bg2.src,
		alt: "Forest",
		width: 1200,
		height: 800,
	},
	{
		src: bg3.src,
		alt: "Torii Gate",
		width: 2400,
		height: 1600,
	},
	{
		src: bg4.src,
		alt: "Mountain",
		width: 1200,
		height: 800,
	},
	{
		src: bg5.src,
		alt: "Night Lake",
		width: 2400,
		height: 1600,
	},
	{
		src: bg6.src,
		alt: "Lighthouse",
		width: 1200,
		height: 800,
	},
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
					<div
						key={img.src}
						style={{ position: "relative", aspectRatio: "3/2" }}
					>
						<NextImage
							src={img.src}
							alt={img.alt}
							fill
							style={{ objectFit: "cover", borderRadius: 8 }}
							onClick={() => open(index)}
						/>
					</div>
				))}
			</SimpleGrid>

			<Lightbox
				images={images}
				slideImageProps={{
					component: NextImage,
					// Use renderRoot if you need more fine-grained control and better type-safety
					// renderRoot: (props: ComponentProps<typeof NextImage>) => (
					// 	<NextImage {...props} />
					// ),
				}}
				opened={opened}
				onClose={() => setOpened(false)}
				initialSlide={initialSlide}
			/>
		</>
	);
}

export const nextImage: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

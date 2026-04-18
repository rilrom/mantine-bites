import { SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import NextImage from "next/image";
import {
	// type ComponentProps,
	useState,
} from "react";

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
    src: "https://picsum.photos/id/10/2400/1600",
    alt: "Forest",
    width: 2400,
    height: 1600,
  },
  {
    src: "https://picsum.photos/id/20/1200/800",
    alt: "Books",
    width: 1200,
    height: 800,
  },
  {
    src: "https://picsum.photos/id/30/2400/1600",
    alt: "Mug",
    width: 2400,
    height: 1600,
  },
  {
    src: "https://picsum.photos/id/40/1200/800",
    alt: "Cat",
    width: 1200,
    height: 800,
  },
  {
    src: "https://picsum.photos/id/50/2400/1600",
    alt: "Bird",
    width: 2400,
    height: 1600,
  },
  {
    src: "https://picsum.photos/id/60/1200/800",
    alt: "Computer",
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
		src: "https://picsum.photos/id/10/2400/1600",
		alt: "Forest",
		width: 2400,
		height: 1600,
	},
	{
		src: "https://picsum.photos/id/20/1200/800",
		alt: "Books",
		width: 1200,
		height: 800,
	},
	{
		src: "https://picsum.photos/id/30/2400/1600",
		alt: "Mug",
		width: 2400,
		height: 1600,
	},
	{
		src: "https://picsum.photos/id/40/1200/800",
		alt: "Cat",
		width: 1200,
		height: 800,
	},
	{
		src: "https://picsum.photos/id/50/2400/1600",
		alt: "Bird",
		width: 2400,
		height: 1600,
	},
	{
		src: "https://picsum.photos/id/60/1200/800",
		alt: "Computer",
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

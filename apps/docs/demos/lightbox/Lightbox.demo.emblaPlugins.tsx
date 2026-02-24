import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState } from "react";

const code = `
import { Lightbox } from '@mantine-bites/lightbox';
import { Image, SimpleGrid } from '@mantine/core';
import Autoplay from 'embla-carousel-autoplay';
import { useRef, useState } from 'react';

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
  const autoplay = useRef(Autoplay({ delay: 2000 }));

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
        carouselOptions={{
          initialSlide,
          plugins: [autoplay.current],
          emblaOptions: { loop: true },
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
	const autoplay = useRef(Autoplay({ delay: 2000 }));

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
				carouselOptions={{
					initialSlide,
					plugins: [autoplay.current],
					emblaOptions: { loop: true },
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

export const emblaPlugins: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

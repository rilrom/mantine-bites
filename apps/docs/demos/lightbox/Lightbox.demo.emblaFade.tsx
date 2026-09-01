import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import Fade from "embla-carousel-fade";
import { useState } from "react";
import { IMAGES } from "./_data";

const code = `
import { Image, SimpleGrid } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import Fade from 'embla-carousel-fade';
import { useState } from 'react';

const fade = Fade();

const images = [
  { src: "/assets/bg-1.png", alt: "Desert" },
  { src: "/assets/bg-2.png", alt: "Forest" },
  { src: "/assets/bg-3.png", alt: "Torii Gate" },
  { src: "/assets/bg-4.png", alt: "Mountain" },
  { src: "/assets/bg-5.png", alt: "Night Lake" },
  { src: "/assets/bg-6.png", alt: "Lighthouse" },
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
        initialSlide={initialSlide}
        slidesProps={{ emblaPlugins: [fade] }}
      />
    </>
  );
}
`;

const fade = Fade();

const images = IMAGES;

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
				initialSlide={initialSlide}
				slidesProps={{ emblaPlugins: [fade] }}
			/>
		</>
	);
}

export const emblaFade: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

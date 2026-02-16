import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
import { Lightbox } from '@mantine-bites/lightbox';
import { Image, SimpleGrid } from '@mantine/core';
import { useState } from 'react';

const images = [
  { src: 'https://picsum.photos/id/10/1200/800', alt: 'Forest' },
  { src: 'https://picsum.photos/id/20/1200/800', alt: 'Bird' },
  { src: 'https://picsum.photos/id/30/1200/800', alt: 'Plant' },
  { src: 'https://picsum.photos/id/40/1200/800', alt: 'Leaves' },
];

function Demo() {
  const [opened, setOpened] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        {images.map((img, index) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            radius="md"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setInitialSlide(index);
              setOpened(true);
            }}
          />
        ))}
      </SimpleGrid>

      <Lightbox
        opened={opened}
        onClose={() => setOpened(false)}
        initialSlide={initialSlide}
        counterFormatter={(index, total) => \`Image \${index + 1} of \${total}\`}
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
	{ src: "https://picsum.photos/id/10/1200/800", alt: "Forest" },
	{ src: "https://picsum.photos/id/20/1200/800", alt: "Bird" },
	{ src: "https://picsum.photos/id/30/1200/800", alt: "Plant" },
	{ src: "https://picsum.photos/id/40/1200/800", alt: "Leaves" },
];

function Demo() {
	const [opened, setOpened] = useState(false);
	const [initialSlide, setInitialSlide] = useState(0);

	return (
		<>
			<SimpleGrid cols={{ base: 2, sm: 4 }}>
				{images.map((img, index) => (
					<Image
						key={img.src}
						src={img.src}
						alt={img.alt}
						radius="md"
						style={{ cursor: "pointer" }}
						onClick={() => {
							setInitialSlide(index);
							setOpened(true);
						}}
					/>
				))}
			</SimpleGrid>

			<Lightbox
				opened={opened}
				onClose={() => setOpened(false)}
				initialSlide={initialSlide}
				counterFormatter={(index, total) =>
					`Image ${index + 1} of ${total}`
				}
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

export const customCounter: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

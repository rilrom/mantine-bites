import { Box, Image, SimpleGrid, Text } from "@mantine/core";
import { Lightbox, useLightboxContext } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";
import { IMAGES } from "./_data";

const code = `
import { Box, Image, SimpleGrid, Text } from '@mantine/core';
import { Lightbox, useLightboxContext } from '@mantine-bites/lightbox';
import { useState } from 'react';

const images = [
  { src: "/assets/bg-1.png", alt: "Desert" },
  { src: "/assets/bg-2.png", alt: "Forest" },
  { src: "/assets/bg-3.png", alt: "Torii Gate" },
  { src: "/assets/bg-4.png", alt: "Mountain" },
  { src: "/assets/bg-5.png", alt: "Night Lake" },
  { src: "/assets/bg-6.png", alt: "Lighthouse" },
];

function LightboxFooter({ images }) {
  const { currentIndex } = useLightboxContext();

  const image = images[currentIndex];

  return (
    <Box bg="blue.7" w="100%" p="xs">
      <Text size="sm" c="white" ta="center">
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

      <Lightbox.Root
        opened={opened}
        onClose={() => setOpened(false)}
        initialSlide={initialSlide}
      >
        <Lightbox.Toolbar />
        <Lightbox.Counter />
        <Lightbox.Controls />
        <Lightbox.Slides>
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

const images = IMAGES;

interface LightboxFooterProps {
	images: { src: string; alt?: string }[];
}

function LightboxFooter({ images }: LightboxFooterProps) {
	const { currentIndex } = useLightboxContext();

	const image = images[currentIndex];

	return (
		<Box bg="blue.7" w="100%" p="xs">
			<Text size="sm" c="white" ta="center">
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

			<Lightbox.Root
				opened={opened}
				onClose={() => setOpened(false)}
				initialSlide={initialSlide}
			>
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Controls />
				<Lightbox.Slides>
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

export const compoundFooter: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

import { ActionIcon, Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { IconDownload } from "@tabler/icons-react";
import { useState } from "react";

const code = `
import { ActionIcon, Image, SimpleGrid } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import { IconDownload } from '@tabler/icons-react';
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

      <Lightbox.Root
        opened={opened}
        onClose={() => setOpened(false)}
        initialSlide={initialSlide}
      >
        <Lightbox.Toolbar>
          <Lightbox.ZoomButton />
          <Lightbox.FullscreenButton />
          <ActionIcon variant="default" size="lg" aria-label="Download">
            <IconDownload />
          </ActionIcon>
          <Lightbox.CloseButton />
        </Lightbox.Toolbar>
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

			<Lightbox.Root
				opened={opened}
				onClose={() => setOpened(false)}
				initialSlide={initialSlide}
			>
				<Lightbox.Toolbar>
					<Lightbox.ZoomButton />
					<Lightbox.FullscreenButton />
					<ActionIcon variant="default" size="lg" aria-label="Download">
						<IconDownload />
					</ActionIcon>
					<Lightbox.CloseButton />
				</Lightbox.Toolbar>
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
			</Lightbox.Root>
		</>
	);
}

export const compoundToolbar: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

import { Box, Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
import { Lightbox } from '@mantine-bites/lightbox';
import { Box, Image, SimpleGrid } from '@mantine/core';
import { useState } from 'react';

const slides: ({ src: string; alt: string } | null)[] = [
  { src: 'https://picsum.photos/id/10/1200/800', alt: 'Forest' },
  null,
  { src: 'https://picsum.photos/id/30/1200/800', alt: 'Plant' },
  { src: 'https://picsum.photos/id/40/1200/800', alt: 'Leaves' },
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
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        {slides.map((slide, index) =>
          slide ? (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              radius="md"
              style={{ cursor: 'pointer' }}
              onClick={() => open(index)}
            />
          ) : (
            <Box
              key="placeholder"
              bg="dark.6"
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '3 / 2',
                borderRadius: 'var(--mantine-radius-md)',
                color: 'var(--mantine-color-dimmed)',
              }}
              onClick={() => open(index)}
            >
              Text content
            </Box>
          )
        )}
      </SimpleGrid>

      <Lightbox opened={opened} onClose={() => setOpened(false)} initialSlide={initialSlide}>
        {slides.map((slide) =>
          slide ? (
            <Lightbox.Slide key={slide.src} thumbnail={<img src={slide.src} alt={slide.alt} />}>
              <img src={slide.src} alt={slide.alt} />
            </Lightbox.Slide>
          ) : (
            <Lightbox.Slide key="placeholder">
              <div style={{ color: 'white', fontSize: 24 }}>
                This slide has no thumbnail – a placeholder is shown instead
              </div>
            </Lightbox.Slide>
          )
        )}
      </Lightbox>
    </>
  );
}
`;

const slides: ({ src: string; alt: string } | null)[] = [
	{ src: "https://picsum.photos/id/10/1200/800", alt: "Forest" },
	null,
	{ src: "https://picsum.photos/id/30/1200/800", alt: "Plant" },
	{ src: "https://picsum.photos/id/40/1200/800", alt: "Leaves" },
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
			<SimpleGrid cols={{ base: 2, sm: 4 }}>
				{slides.map((slide, index) =>
					slide ? (
						<Image
							key={slide.src}
							src={slide.src}
							alt={slide.alt}
							radius="md"
							style={{ cursor: "pointer" }}
							onClick={() => open(index)}
						/>
					) : (
						<Box
							key="placeholder"
							bg="dark.6"
							style={{
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								aspectRatio: "3 / 2",
								borderRadius: "var(--mantine-radius-md)",
								color: "var(--mantine-color-dimmed)",
							}}
							onClick={() => open(index)}
						>
							Text content
						</Box>
					),
				)}
			</SimpleGrid>

			<Lightbox
				opened={opened}
				onClose={() => setOpened(false)}
				initialSlide={initialSlide}
			>
				{slides.map((slide) =>
					slide ? (
						<Lightbox.Slide
							key={slide.src}
							thumbnail={<img src={slide.src} alt={slide.alt} />}
						>
							<img src={slide.src} alt={slide.alt} />
						</Lightbox.Slide>
					) : (
						<Lightbox.Slide key="placeholder">
							<div style={{ color: "white", fontSize: 24 }}>
								This slide has no thumbnail – a placeholder is shown instead
							</div>
						</Lightbox.Slide>
					),
				)}
			</Lightbox>
		</>
	);
}

export const placeholderThumbnails: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

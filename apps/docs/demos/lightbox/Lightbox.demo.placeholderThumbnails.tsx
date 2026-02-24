import { Box, Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
import { Lightbox } from '@mantine-bites/lightbox';
import { Box, Image, SimpleGrid } from '@mantine/core';
import { useState } from 'react';

const slides: ({ src: string; alt: string } | null)[] = [
  { src: 'https://picsum.photos/id/10/2400/1600', alt: 'Forest' },
  null,
  { src: 'https://picsum.photos/id/30/2400/1600', alt: 'Mug' },
  { src: 'https://picsum.photos/id/40/1200/800', alt: 'Cat' },
  { src: 'https://picsum.photos/id/50/2400/1600', alt: 'Bird' },
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
        {slides.map((slide, index) =>
          slide ? (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              radius="md"
              onClick={() => open(index)}
            />
          ) : (
            <Box
              key="placeholder"
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "3 / 2",
                border: "1px dashed var(--mantine-color-default-border)",
                borderRadius: "var(--mantine-radius-md)",
                color: "var(--mantine-color-dimmed)",
                backgroundColor: "var(--mantine-color-default)",
              }}
              onClick={() => open(index)}
            >
              Text-only slide
            </Box>
          )
        )}
      </SimpleGrid>

      <Lightbox
        opened={opened}
        onClose={() => setOpened(false)}
        carouselOptions={{ initialSlide }}
      >
        {slides.map((slide) =>
          slide ? (
            <Lightbox.Slide key={slide.src} thumbnail={<img src={slide.src} alt={slide.alt} />}>
              <img src={slide.src} alt={slide.alt} />
            </Lightbox.Slide>
          ) : (
            <Lightbox.Slide key="placeholder">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--mantine-color-dimmed)",
                  fontSize: 24,
                  textAlign: "center",
                  padding: "2rem",
                  border: "1px dashed var(--mantine-color-default-border)",
                  borderRadius: "var(--mantine-radius-md)",
                  backgroundColor: "var(--mantine-color-default)",
                  maxWidth: 600,
                  margin: "0 1rem",
                }}
              >
                Text-only slide with a placeholder thumbnail image
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
	{ src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
	null,
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
				{slides.map((slide, index) =>
					slide ? (
						<Image
							key={slide.src}
							src={slide.src}
							alt={slide.alt}
							radius="md"
							onClick={() => open(index)}
						/>
					) : (
						<Box
							key="placeholder"
							style={{
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								aspectRatio: "3 / 2",
								border: "1px dashed var(--mantine-color-default-border)",
								borderRadius: "var(--mantine-radius-md)",
								color: "var(--mantine-color-dimmed)",
								backgroundColor: "var(--mantine-color-default)",
							}}
							onClick={() => open(index)}
						>
							Text-only slide
						</Box>
					),
				)}
			</SimpleGrid>

			<Lightbox
				opened={opened}
				onClose={() => setOpened(false)}
				carouselOptions={{ initialSlide }}
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
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "var(--mantine-color-dimmed)",
									fontSize: 24,
									textAlign: "center",
									padding: "2rem",
									border: "1px dashed var(--mantine-color-default-border)",
									borderRadius: "var(--mantine-radius-md)",
									backgroundColor: "var(--mantine-color-default)",
									maxWidth: 600,
									margin: "0 1rem",
								}}
							>
								Text-only slide with a placeholder thumbnail image
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

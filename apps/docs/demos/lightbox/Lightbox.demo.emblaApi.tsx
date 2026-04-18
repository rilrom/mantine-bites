import { Box, Button, Group, Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useRef, useState } from "react";

const code = `
import { Box, Button, Group, Image, SimpleGrid } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import { useCallback, useRef, useState } from 'react';

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

  const emblaApiRef = useRef(null);
  const progressBarRef = useRef(null);

  const open = (index) => {
    setInitialSlide(index);
    setOpened(true);
  };

  const handleEmblaApi = useCallback((embla) => {
    emblaApiRef.current = embla;

    const onScroll = (api) => {
      if (progressBarRef.current) {
        progressBarRef.current.style.width =
          Math.max(0, api.scrollProgress()) * 100 + '%';
      }
    };

    embla.on('scroll', onScroll);
    embla.on('reInit', onScroll);

    onScroll(embla);
  }, []);

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
        <Lightbox.Slides getEmblaApi={handleEmblaApi}>
          {images.map((img) => (
            <Lightbox.Slide key={img.src}>
              <img src={img.src} alt={img.alt} />
            </Lightbox.Slide>
          ))}
        </Lightbox.Slides>
        <Group w="100%" px="md" py="xs" gap="sm">
          <Button
            variant="subtle"
            c="white"
            size="xs"
            onClick={() => emblaApiRef.current?.scrollTo(0)}
          >
            First
          </Button>
          <Box
            flex={1}
            h={8}
            bg="dark.5"
            style={{ borderRadius: 4, overflow: 'hidden' }}
          >
            <div
              ref={progressBarRef}
              style={{
                height: '100%',
                width: '0%',
                backgroundColor: 'var(--mantine-primary-color-filled)',
                borderRadius: 'inherit',
              }}
            />
          </Box>
          <Button
            variant="subtle"
            c="white"
            size="xs"
            onClick={() => emblaApiRef.current?.scrollTo(images.length - 1)}
          >
            Last
          </Button>
        </Group>
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

	const emblaApiRef = useRef<EmblaCarouselType | null>(null);
	const progressBarRef = useRef<HTMLDivElement | null>(null);

	const open = (index: number) => {
		setInitialSlide(index);
		setOpened(true);
	};

	const handleEmblaApi = useCallback((embla: EmblaCarouselType) => {
		emblaApiRef.current = embla;

		const onScroll = (api: EmblaCarouselType) => {
			if (progressBarRef.current) {
				progressBarRef.current.style.width = `${Math.max(0, api.scrollProgress()) * 100}%`;
			}
		};

		embla.on("scroll", onScroll);
		embla.on("reInit", onScroll);

		onScroll(embla);
	}, []);

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
				<Lightbox.Slides getEmblaApi={handleEmblaApi}>
					{images.map((img) => (
						<Lightbox.Slide key={img.src}>
							<img src={img.src} alt={img.alt} />
						</Lightbox.Slide>
					))}
				</Lightbox.Slides>
				<Group w="100%" px="md" py="xs" gap="sm">
					<Button
						variant="subtle"
						c="white"
						size="xs"
						onClick={() => emblaApiRef.current?.scrollTo(0)}
					>
						First
					</Button>
					<Box
						flex={1}
						h={8}
						bg="dark.5"
						style={{ borderRadius: 4, overflow: "hidden" }}
					>
						<div
							ref={progressBarRef}
							style={{
								height: "100%",
								width: "0%",
								backgroundColor: "var(--mantine-primary-color-filled)",
								borderRadius: "inherit",
							}}
						/>
					</Box>
					<Button
						variant="subtle"
						c="white"
						size="xs"
						onClick={() => emblaApiRef.current?.scrollTo(images.length - 1)}
					>
						Last
					</Button>
				</Group>
			</Lightbox.Root>
		</>
	);
}

export const emblaApi: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

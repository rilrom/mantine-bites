import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
import { Image, SimpleGrid } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import { useState } from 'react';

const images = [
  {
    src: "https://picsum.photos/id/10/2400/1600",
    alt: "Forest",
    caption: (
      <>
        A peaceful forest scene
        <br />
        <em>Photographed in the Pacific Northwest</em>
      </>
    ),
  },
  {
    src: "https://picsum.photos/id/20/1200/800",
    alt: "Books",
    caption: "A stack of books",
  },
  {
    src: "https://picsum.photos/id/30/2400/1600",
    alt: "Mug",
    caption: "Coffee break",
  },
  {
    src: "https://picsum.photos/id/40/1200/800",
    alt: "Cat",
    caption: "A curious cat",
  },
  {
    src: "https://picsum.photos/id/50/2400/1600",
    alt: "Bird",
  },
  {
    src: "https://picsum.photos/id/60/1200/800",
    alt: "Computer",
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
        slidesProps={{ initialSlide }}
      />
    </>
  );
}
`;

const images = [
	{
		src: "https://picsum.photos/id/10/2400/1600",
		alt: "Forest",
		caption: (
			<>
				A peaceful forest scene
				<br />
				<em>Photographed in the Pacific Northwest</em>
			</>
		),
	},
	{
		src: "https://picsum.photos/id/20/1200/800",
		alt: "Books",
		caption: "A stack of books",
	},
	{
		src: "https://picsum.photos/id/30/2400/1600",
		alt: "Mug",
		caption: "Coffee break",
	},
	{
		src: "https://picsum.photos/id/40/1200/800",
		alt: "Cat",
		caption: "A curious cat",
	},
	{
		src: "https://picsum.photos/id/50/2400/1600",
		alt: "Bird",
	},
	{
		src: "https://picsum.photos/id/60/1200/800",
		alt: "Computer",
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
				slidesProps={{ initialSlide }}
			/>
		</>
	);
}

export const caption: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

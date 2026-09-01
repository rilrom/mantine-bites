import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";
import { bg1, bg2, bg3, bg4, bg5, bg6 } from "./_data";

const code = `
import { Image, SimpleGrid } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import { useState } from 'react';

const images = [
  {
    src: "/assets/bg-1.png",
    alt: "Desert",
    caption: (
      <>
        A peaceful desert scene
        <br />
        <em>Photographed at sunset</em>
      </>
    ),
  },
  { src: "/assets/bg-2.png", alt: "Forest", caption: "Sunlight through the forest trees" },
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
              {img.caption && <Lightbox.Caption>{img.caption}</Lightbox.Caption>}
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
	{
		src: bg1.src,
		alt: "Desert",
		caption: (
			<>
				A peaceful desert scene
				<br />
				<em>Photographed at sunset</em>
			</>
		),
	},
	{
		src: bg2.src,
		alt: "Forest",
		caption: "Sunlight through the forest trees",
	},
	{ src: bg3.src, alt: "Torii Gate" },
	{ src: bg4.src, alt: "Mountain" },
	{ src: bg5.src, alt: "Night Lake" },
	{ src: bg6.src, alt: "Lighthouse" },
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
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Controls />
				<Lightbox.Slides>
					{images.map((img) => (
						<Lightbox.Slide key={img.src}>
							<img src={img.src} alt={img.alt} />
							{img.caption && (
								<Lightbox.Caption>{img.caption}</Lightbox.Caption>
							)}
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

export const compoundComponent: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

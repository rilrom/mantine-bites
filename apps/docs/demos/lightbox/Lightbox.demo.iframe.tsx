import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
import { Image, SimpleGrid } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import { useState } from 'react';

const videos = [
  {
    id: "YE7VzlLtp-4",
    title: "Big Buck Bunny",
    thumbnail: "https://img.youtube.com/vi/YE7VzlLtp-4/hqdefault.jpg",
  },
  {
    id: "XSGBVzeBUbk",
    title: "Elephants Dream",
    thumbnail: "https://img.youtube.com/vi/XSGBVzeBUbk/hqdefault.jpg",
  },
  {
    id: "eRsGyueVLvQ",
    title: "Sintel",
    thumbnail: "https://img.youtube.com/vi/eRsGyueVLvQ/hqdefault.jpg",
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
        {videos.map((video, index) => (
          <Image
            key={video.id}
            src={video.thumbnail}
            alt={video.title}
            radius="md"
            style={{ cursor: 'pointer' }}
            onClick={() => open(index)}
          />
        ))}
      </SimpleGrid>

      <Lightbox.Root opened={opened} onClose={() => setOpened(false)} withZoom={false}>
        <Lightbox.Toolbar />
        <Lightbox.Counter />
        <Lightbox.Controls />
        <Lightbox.Slides initialSlide={initialSlide}>
          {videos.map((video) => (
            <Lightbox.Slide key={video.id}>
              <iframe
                src={\`https://www.youtube.com/embed/\${video.id}\`}
                title={video.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
              />
              <Lightbox.Caption>{video.title}</Lightbox.Caption>
            </Lightbox.Slide>
          ))}
        </Lightbox.Slides>
        <Lightbox.Thumbnails>
          {videos.map((video) => (
            <Lightbox.Thumbnail key={video.id}>
              <img src={video.thumbnail} alt={video.title} />
            </Lightbox.Thumbnail>
          ))}
        </Lightbox.Thumbnails>
      </Lightbox.Root>
    </>
  );
}
`;

const videos = [
	{
		id: "YE7VzlLtp-4",
		title: "Big Buck Bunny",
		thumbnail: "https://img.youtube.com/vi/YE7VzlLtp-4/hqdefault.jpg",
	},
	{
		id: "XSGBVzeBUbk",
		title: "Elephants Dream",
		thumbnail: "https://img.youtube.com/vi/XSGBVzeBUbk/hqdefault.jpg",
	},
	{
		id: "eRsGyueVLvQ",
		title: "Sintel",
		thumbnail: "https://img.youtube.com/vi/eRsGyueVLvQ/hqdefault.jpg",
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
				{videos.map((video, index) => (
					<Image
						key={video.id}
						src={video.thumbnail}
						alt={video.title}
						radius="md"
						style={{ cursor: "pointer" }}
						onClick={() => open(index)}
					/>
				))}
			</SimpleGrid>

			<Lightbox.Root
				opened={opened}
				onClose={() => setOpened(false)}
				withZoom={false}
			>
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Controls />
				<Lightbox.Slides initialSlide={initialSlide}>
					{videos.map((video) => (
						<Lightbox.Slide key={video.id}>
							<iframe
								src={`https://www.youtube.com/embed/${video.id}`}
								title={video.title}
								style={{ width: "100%", height: "100%", border: "none" }}
								allowFullScreen
							/>
							<Lightbox.Caption>{video.title}</Lightbox.Caption>
						</Lightbox.Slide>
					))}
				</Lightbox.Slides>
				<Lightbox.Thumbnails>
					{videos.map((video) => (
						<Lightbox.Thumbnail key={video.id}>
							<img src={video.thumbnail} alt={video.title} />
						</Lightbox.Thumbnail>
					))}
				</Lightbox.Thumbnails>
			</Lightbox.Root>
		</>
	);
}

export const iframe: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

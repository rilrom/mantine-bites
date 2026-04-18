import { Image, SimpleGrid } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
import { Image, SimpleGrid } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import { useState } from 'react';

const youtubeVideos = [
  {
    id: "Tn6-PIqc4UM",
    title: "React in 100 Seconds",
    thumbnail: "https://img.youtube.com/vi/Tn6-PIqc4UM/hqdefault.jpg",
  },
  {
    id: "OEV8gMkCHXQ",
    title: "CSS in 100 Seconds",
    thumbnail: "https://img.youtube.com/vi/OEV8gMkCHXQ/hqdefault.jpg",
  },
  {
    id: "zQnBQ4tB3ZA",
    title: "TypeScript in 100 Seconds",
    thumbnail: "https://img.youtube.com/vi/zQnBQ4tB3ZA/hqdefault.jpg",
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
        {youtubeVideos.map((video, index) => (
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

      <Lightbox.Root
        opened={opened}
        onClose={() => setOpened(false)}
        initialSlide={initialSlide}
        withZoom={false}
      >
        <Lightbox.Toolbar />
        <Lightbox.Counter />
        <Lightbox.Controls />
        <Lightbox.Slides>
          {youtubeVideos.map((video) => (
            <Lightbox.Slide key={video.id}>
              <div
                style={{
                  width: '100%',
                  maxWidth: 900,
                  aspectRatio: '16 / 9',
                }}
              >
                <iframe
                  src={\`https://www.youtube.com/embed/\${video.id}\`}
                  title={video.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: 8,
                  }}
                  allowFullScreen
                />
              </div>
              <Lightbox.Caption>{video.title}</Lightbox.Caption>
            </Lightbox.Slide>
          ))}
        </Lightbox.Slides>
        <Lightbox.Thumbnails>
          {youtubeVideos.map((video) => (
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

const youtubeVideos = [
	{
		id: "Tn6-PIqc4UM",
		title: "React in 100 Seconds",
		thumbnail: "https://img.youtube.com/vi/Tn6-PIqc4UM/hqdefault.jpg",
	},
	{
		id: "OEV8gMkCHXQ",
		title: "CSS in 100 Seconds",
		thumbnail: "https://img.youtube.com/vi/OEV8gMkCHXQ/hqdefault.jpg",
	},
	{
		id: "zQnBQ4tB3ZA",
		title: "TypeScript in 100 Seconds",
		thumbnail: "https://img.youtube.com/vi/zQnBQ4tB3ZA/hqdefault.jpg",
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
				{youtubeVideos.map((video, index) => (
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
				initialSlide={initialSlide}
				withZoom={false}
			>
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Controls />
				<Lightbox.Slides>
					{youtubeVideos.map((video) => (
						<Lightbox.Slide key={video.id}>
							<div
								style={{
									width: "100%",
									maxWidth: 900,
									aspectRatio: "16 / 9",
								}}
							>
								<iframe
									src={`https://www.youtube.com/embed/${video.id}`}
									title={video.title}
									style={{
										width: "100%",
										height: "100%",
										border: "none",
										borderRadius: 8,
									}}
									allowFullScreen
								/>
							</div>
							<Lightbox.Caption>{video.title}</Lightbox.Caption>
						</Lightbox.Slide>
					))}
				</Lightbox.Slides>
				<Lightbox.Thumbnails>
					{youtubeVideos.map((video) => (
						<Lightbox.Thumbnail key={video.id}>
							<img src={video.thumbnail} alt={video.title} />
						</Lightbox.Thumbnail>
					))}
				</Lightbox.Thumbnails>
			</Lightbox.Root>
		</>
	);
}

export const videos: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

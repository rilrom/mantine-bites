import { Card, SimpleGrid, Text, Title } from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
import { Card, SimpleGrid, Text, Title } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import { useState } from 'react';

const locations = [
  {
    city: "London",
    country: "United Kingdom",
    landmark: "Big Ben & Westminster",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-0.13%2C51.49%2C-0.10%2C51.52",
  },
  {
    city: "Paris",
    country: "France",
    landmark: "Eiffel Tower",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=2.27%2C48.84%2C2.32%2C48.87",
  },
  {
    city: "New York",
    country: "United States",
    landmark: "Central Park",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-74.01%2C40.70%2C-73.97%2C40.73",
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
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        {locations.map((location, index) => (
          <Card
            key={location.city}
            withBorder
            radius="md"
            style={{ cursor: 'pointer' }}
            onClick={() => open(index)}
          >
            <Title order={4}>{location.city}</Title>
            <Text size="sm" c="dimmed">
              {location.country}
            </Text>
            <Text size="sm" mt="xs">
              {location.landmark}
            </Text>
          </Card>
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
          {locations.map((location) => (
            <Lightbox.Slide key={location.city}>
              <iframe
                src={location.mapUrl}
                title={location.city}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
              <Lightbox.Caption>
                {location.city} — {location.landmark}
              </Lightbox.Caption>
            </Lightbox.Slide>
          ))}
        </Lightbox.Slides>
      </Lightbox.Root>
    </>
  );
}
`;

const locations = [
	{
		city: "London",
		country: "United Kingdom",
		landmark: "Big Ben & Westminster",
		mapUrl:
			"https://www.openstreetmap.org/export/embed.html?bbox=-0.13%2C51.49%2C-0.10%2C51.52",
	},
	{
		city: "Paris",
		country: "France",
		landmark: "Eiffel Tower",
		mapUrl:
			"https://www.openstreetmap.org/export/embed.html?bbox=2.27%2C48.84%2C2.32%2C48.87",
	},
	{
		city: "New York",
		country: "United States",
		landmark: "Central Park",
		mapUrl:
			"https://www.openstreetmap.org/export/embed.html?bbox=-74.01%2C40.70%2C-73.97%2C40.73",
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
			<SimpleGrid cols={{ base: 1, sm: 3 }}>
				{locations.map((location, index) => (
					<Card
						key={location.city}
						withBorder
						radius="md"
						style={{ cursor: "pointer" }}
						onClick={() => open(index)}
					>
						<Title order={4}>{location.city}</Title>
						<Text size="sm" c="dimmed">
							{location.country}
						</Text>
						<Text size="sm" mt="xs">
							{location.landmark}
						</Text>
					</Card>
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
					{locations.map((location) => (
						<Lightbox.Slide key={location.city}>
							<iframe
								src={location.mapUrl}
								title={location.city}
								style={{ width: "100%", height: "100%", border: "none" }}
							/>
							<Lightbox.Caption>
								{location.city} — {location.landmark}
							</Lightbox.Caption>
						</Lightbox.Slide>
					))}
				</Lightbox.Slides>
			</Lightbox.Root>
		</>
	);
}

export const map: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

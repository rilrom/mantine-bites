import {
	Badge,
	Box,
	Card,
	Divider,
	Group,
	SimpleGrid,
	Text,
	Title,
} from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import type { MantineDemo } from "@mantinex/demo";
import { useState } from "react";

const code = `
import { Badge, Box, Card, Divider, Group, SimpleGrid, Text, Title } from '@mantine/core';
import { Lightbox } from '@mantine-bites/lightbox';
import { useState } from 'react';

const members = [
  {
    name: "Alice Chen",
    role: "Engineering Lead",
    skills: ["TypeScript", "React", "Node.js"],
    bio: "Alice has 10 years of experience building scalable web applications. She leads a team of 8 engineers and is passionate about developer experience and open source software. Outside of work she enjoys hiking and contributing to OSS projects.",
  },
  {
    name: "Marco Rossi",
    role: "Design Systems",
    skills: ["Figma", "CSS", "Accessibility"],
    bio: "Marco specialises in design systems and component libraries. He has helped several companies establish consistent UI languages across their products. He is particularly focused on accessibility and inclusive design.",
  },
  {
    name: "Priya Nair",
    role: "Product Manager",
    skills: ["Strategy", "Analytics", "User Research"],
    bio: "Priya bridges the gap between user needs and technical capabilities. With a background in UX research she brings data-driven insight to every product decision. She is currently leading the team's migration to a new analytics platform.",
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
        {members.map((member, index) => (
          <Card
            key={member.name}
            withBorder
            radius="md"
            style={{ cursor: 'pointer' }}
            onClick={() => open(index)}
          >
            <Text fw={600}>{member.name}</Text>
            <Text size="sm" c="dimmed">{member.role}</Text>
          </Card>
        ))}
      </SimpleGrid>

      <Lightbox.Root opened={opened} onClose={() => setOpened(false)} withZoom={false}>
        <Lightbox.Toolbar />
        <Lightbox.Counter />
        <Lightbox.Controls />
        <Lightbox.Slides initialSlide={initialSlide}>
          {members.map((member) => (
            <Lightbox.Slide key={member.name}>
              <Box p="xl" maw={560} w="100%">
                <Title order={2}>{member.name}</Title>
                <Text size="lg" c="dimmed" mb="md">{member.role}</Text>
                <Divider mb="md" />
                <Text mb="lg">{member.bio}</Text>
                <Group gap="xs">
                  {member.skills.map((skill) => (
                    <Badge key={skill} variant="light">{skill}</Badge>
                  ))}
                </Group>
              </Box>
              <Lightbox.Caption>{member.name} — {member.role}</Lightbox.Caption>
            </Lightbox.Slide>
          ))}
        </Lightbox.Slides>
      </Lightbox.Root>
    </>
  );
}
`;

const members = [
	{
		name: "Alice Chen",
		role: "Engineering Lead",
		skills: ["TypeScript", "React", "Node.js"],
		bio: "Alice has 10 years of experience building scalable web applications. She leads a team of 8 engineers and is passionate about developer experience and open source software. Outside of work she enjoys hiking and contributing to OSS projects.",
	},
	{
		name: "Marco Rossi",
		role: "Design Systems",
		skills: ["Figma", "CSS", "Accessibility"],
		bio: "Marco specialises in design systems and component libraries. He has helped several companies establish consistent UI languages across their products. He is particularly focused on accessibility and inclusive design.",
	},
	{
		name: "Priya Nair",
		role: "Product Manager",
		skills: ["Strategy", "Analytics", "User Research"],
		bio: "Priya bridges the gap between user needs and technical capabilities. With a background in UX research she brings data-driven insight to every product decision. She is currently leading the team's migration to a new analytics platform.",
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
				{members.map((member, index) => (
					<Card
						key={member.name}
						withBorder
						radius="md"
						style={{ cursor: "pointer" }}
						onClick={() => open(index)}
					>
						<Text fw={600}>{member.name}</Text>
						<Text size="sm" c="dimmed">
							{member.role}
						</Text>
					</Card>
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
					{members.map((member) => (
						<Lightbox.Slide key={member.name}>
							<Box p="xl" maw={560} w="100%">
								<Title order={2}>{member.name}</Title>
								<Text size="lg" c="dimmed" mb="md">
									{member.role}
								</Text>
								<Divider mb="md" />
								<Text mb="lg">{member.bio}</Text>
								<Group gap="xs">
									{member.skills.map((skill) => (
										<Badge key={skill} variant="light">
											{skill}
										</Badge>
									))}
								</Group>
							</Box>
							<Lightbox.Caption>
								{member.name} — {member.role}
							</Lightbox.Caption>
						</Lightbox.Slide>
					))}
				</Lightbox.Slides>
			</Lightbox.Root>
		</>
	);
}

export const htmlContent: MantineDemo = {
	type: "code",
	component: Demo,
	code,
};

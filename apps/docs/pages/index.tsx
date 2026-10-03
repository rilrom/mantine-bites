import {
	Anchor,
	Card,
	Container,
	SimpleGrid,
	Text,
	Title,
} from "@mantine/core";
import Link from "next/link";
import { Shell } from "../components/Shell";
import { PACKAGES_DATA } from "../data";

export default function HomePage() {
	return (
		<Shell>
			<Container size="lg" py="xl">
				<Title order={1} mb="lg">
					Packages
				</Title>
				<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
					{Object.entries(PACKAGES_DATA).map(([slug, data]) => (
						<Anchor
							key={slug}
							component={Link}
							href={`/${slug}`}
							underline="never"
						>
							<Card padding="lg" radius="md" withBorder>
								<Title order={3} size="h4">
									{data.packageName}
								</Title>
								<Text c="dimmed" size="sm" mt="xs">
									{data.packageDescription}
								</Text>
							</Card>
						</Anchor>
					))}
				</SimpleGrid>

				<Title order={2} mt={48} mb="lg">
					Tools
				</Title>
				<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
					<Anchor component={Link} href="/form-builder" underline="never">
						<Card padding="lg" radius="md" withBorder>
							<Title order={3} size="h4">
								Form Builder
							</Title>
							<Text c="dimmed" size="sm" mt="xs">
								Build a form visually and copy the generated @mantine/form code
							</Text>
						</Card>
					</Anchor>
				</SimpleGrid>
			</Container>
		</Shell>
	);
}

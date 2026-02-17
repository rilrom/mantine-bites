import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { PropsWithChildren } from "react";
import { Lightbox } from "./index.js";

export default { title: "Lightbox" };

const sampleImages = [
	{ src: "https://picsum.photos/id/10/1200/800", alt: "Forest" },
	{ src: "https://picsum.photos/id/20/1200/800", alt: "Bird" },
	{ src: "https://picsum.photos/id/30/1200/800", alt: "Plant" },
	{ src: "https://picsum.photos/id/40/1200/800", alt: "Leaves" },
	{ src: "https://picsum.photos/id/50/1200/800", alt: "Desk" },
];

const Container = (props: PropsWithChildren) => {
	const { children } = props;

	return <div style={{ padding: 40 }}>{children}</div>;
};

const PlaceholderCard = (props: PropsWithChildren) => {
	const { children } = props;

	return (
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
			{children}
		</div>
	);
};

export function Default() {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>

			<Lightbox opened={opened} onClose={close}>
				{sampleImages.map((img) => (
					<Lightbox.Slide
						key={img.src}
						thumbnail={<img src={img.src} alt={img.alt} />}
					>
						<img src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</Lightbox>
		</Container>
	);
}

export function WithLoop() {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>

			<Lightbox
				opened={opened}
				onClose={close}
				carouselOptions={{
					emblaOptions: {
						loop: true,
					},
				}}
			>
				{sampleImages.map((img) => (
					<Lightbox.Slide
						key={img.src}
						thumbnail={<img src={img.src} alt={img.alt} />}
					>
						<img src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</Lightbox>
		</Container>
	);
}

export function WithPlaceholderThumbnails() {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>

			<Lightbox opened={opened} onClose={close}>
				<Lightbox.Slide
					thumbnail={
						<img src="https://picsum.photos/id/10/1200/800" alt="Forest" />
					}
				>
					<img src="https://picsum.photos/id/10/1200/800" alt="Forest" />
				</Lightbox.Slide>

				<Lightbox.Slide>
					<PlaceholderCard>
						Text-only slide with a placeholder thumbnail image
					</PlaceholderCard>
				</Lightbox.Slide>

				<Lightbox.Slide
					thumbnail={
						<img
							src="https://picsum.photos/id/30/200/200"
							alt="Plant thumbnail"
						/>
					}
				>
					<img src="https://picsum.photos/id/30/1200/800" alt="Plant" />
				</Lightbox.Slide>

				<Lightbox.Slide
					thumbnail={
						<img
							src="https://picsum.photos/id/40/200/200"
							alt="Plant thumbnail"
						/>
					}
				>
					<PlaceholderCard>
						Text-only slide with a thumbnail image
					</PlaceholderCard>
				</Lightbox.Slide>

				<Lightbox.Slide
					thumbnail={
						<img src="https://picsum.photos/id/50/1200/800" alt="Desk" />
					}
				>
					<img src="https://picsum.photos/id/50/1200/800" alt="Desk" />
				</Lightbox.Slide>
			</Lightbox>
		</Container>
	);
}

export function WithCustomCounter() {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>

			<Lightbox
				opened={opened}
				onClose={close}
				counterFormatter={(index, total) => `Image ${index + 1} of ${total}`}
			>
				{sampleImages.map((img) => (
					<Lightbox.Slide
						key={img.src}
						thumbnail={<img src={img.src} alt={img.alt} />}
					>
						<img src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</Lightbox>
		</Container>
	);
}

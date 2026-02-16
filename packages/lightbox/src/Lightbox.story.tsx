import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Lightbox } from "./index.js";

export default { title: "Lightbox" };

const sampleImages = [
	{ src: "https://picsum.photos/id/10/1200/800", alt: "Forest" },
	{ src: "https://picsum.photos/id/20/1200/800", alt: "Bird" },
	{ src: "https://picsum.photos/id/30/1200/800", alt: "Plant" },
	{ src: "https://picsum.photos/id/40/1200/800", alt: "Leaves" },
	{ src: "https://picsum.photos/id/50/1200/800", alt: "Desk" },
];

export function FullExample() {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<div style={{ padding: 40 }}>
			<Button onClick={open}>Open Lightbox</Button>

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
		</div>
	);
}

export function WithoutLoop() {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<div style={{ padding: 40 }}>
			<Button onClick={open}>Open Non-Looping Lightbox</Button>

			<Lightbox opened={opened} onClose={close} loop={false}>
				{sampleImages.map((img) => (
					<Lightbox.Slide
						key={img.src}
						thumbnail={<img src={img.src} alt={img.alt} />}
					>
						<img src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</Lightbox>
		</div>
	);
}

export function Minimal() {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<div style={{ padding: 40 }}>
			<Button onClick={open}>Open Minimal Lightbox</Button>

			<Lightbox
				opened={opened}
				onClose={close}
				withControls={false}
				withThumbnails={false}
				withCounter={false}
				loop={false}
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
		</div>
	);
}

export function WithPlaceholderThumbnails() {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<div style={{ padding: 40 }}>
			<Button onClick={open}>Open Lightbox (Mixed Thumbnails)</Button>

			<Lightbox opened={opened} onClose={close}>
				<Lightbox.Slide
					thumbnail={
						<img src="https://picsum.photos/id/10/1200/800" alt="Forest" />
					}
				>
					<img src="https://picsum.photos/id/10/1200/800" alt="Forest" />
				</Lightbox.Slide>

				<Lightbox.Slide>
					<div style={{ color: "white", fontSize: 24 }}>
						This slide has no image — placeholder thumbnail
					</div>
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

				<Lightbox.Slide>
					<div style={{ color: "white", fontSize: 24 }}>
						Another text-only slide
					</div>
				</Lightbox.Slide>

				<Lightbox.Slide
					thumbnail={
						<img src="https://picsum.photos/id/50/1200/800" alt="Desk" />
					}
				>
					<img src="https://picsum.photos/id/50/1200/800" alt="Desk" />
				</Lightbox.Slide>
			</Lightbox>
		</div>
	);
}

export function WithCustomCounter() {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<div style={{ padding: 40 }}>
			<Button onClick={open}>Open with Custom Counter</Button>

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
		</div>
	);
}

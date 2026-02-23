import { Box, Button, Center, Flex, Image, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Autoplay from "embla-carousel-autoplay";
import {
	type ImgHTMLAttributes,
	type PropsWithChildren,
	type SyntheticEvent,
	useRef,
	useState,
} from "react";
import { Lightbox } from "./index.js";

export default { title: "Lightbox" };

const sampleImages = [
	{ src: "https://picsum.photos/id/10/2400/1600", alt: "Forest" },
	{ src: "https://picsum.photos/id/20/1200/800", alt: "Bird" },
	{ src: "https://picsum.photos/id/30/2400/1600", alt: "Plant" },
	{ src: "https://picsum.photos/id/40/1200/800", alt: "Leaves" },
	{ src: "https://picsum.photos/id/50/2400/1600", alt: "Desk" },
];

const Container = (props: PropsWithChildren) => {
	const { children } = props;

	return <Box p={40}>{children}</Box>;
};

const PlaceholderCard = ({ children }: PropsWithChildren) => {
	return (
		<Flex
			align="center"
			justify="center"
			c="dimmed"
			fz={24}
			ta="center"
			p="2rem"
			maw={600}
			mx="1rem"
			bg="var(--mantine-color-default)"
			bd="1px dashed var(--mantine-color-default-border)"
			bdrs="md"
		>
			{children}
		</Flex>
	);
};

interface ImgWithLoaderProps extends ImgHTMLAttributes<HTMLImageElement> {
	type?: "default" | "thumbnail";
}

const ImgWithLoader = (props: ImgWithLoaderProps) => {
	const { type = "default", src, alt, style, onLoad, onError, ...rest } = props;

	const [loading, setLoading] = useState(true);

	const handleLoad = (e: SyntheticEvent<HTMLImageElement, Event>) => {
		setLoading(false);
		onLoad?.(e);
	};

	const handleError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
		setLoading(false);
		onError?.(e);
	};

	return (
		<>
			{loading && (
				<Center pos="absolute" inset={0}>
					<Loader size={type === "thumbnail" ? 18 : 36} />
				</Center>
			)}

			<Image
				{...rest}
				src={src}
				fallbackSrc="https://placehold.co/1200x800?text=Error"
				alt={alt}
				onLoad={handleLoad}
				onError={handleError}
				opacity={loading ? 0 : 1}
				style={{ transition: "opacity 120ms linear", ...style }}
			/>
		</>
	);
};

export const Default = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>

			<Lightbox opened={opened} onClose={close}>
				{sampleImages.map((img) => (
					<Lightbox.Slide
						key={img.src}
						thumbnail={
							<ImgWithLoader src={img.src} alt={img.alt} type="thumbnail" />
						}
					>
						<ImgWithLoader src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</Lightbox>
		</Container>
	);
};

export const WithLoop = () => {
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
						thumbnail={
							<ImgWithLoader src={img.src} alt={img.alt} type="thumbnail" />
						}
					>
						<ImgWithLoader src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</Lightbox>
		</Container>
	);
};

export const WithPlaceholderThumbnails = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>

			<Lightbox opened={opened} onClose={close}>
				<Lightbox.Slide
					thumbnail={
						<ImgWithLoader
							src={sampleImages[0]?.src}
							alt={sampleImages[0]?.alt}
							type="thumbnail"
						/>
					}
				>
					<ImgWithLoader
						src={sampleImages[0]?.src}
						alt={sampleImages[0]?.alt}
					/>
				</Lightbox.Slide>

				<Lightbox.Slide>
					<PlaceholderCard>
						Text-only slide with a placeholder thumbnail image
					</PlaceholderCard>
				</Lightbox.Slide>

				<Lightbox.Slide
					thumbnail={
						<ImgWithLoader
							src={sampleImages[1]?.src}
							alt={sampleImages[1]?.alt}
							type="thumbnail"
						/>
					}
				>
					<ImgWithLoader
						src={sampleImages[1]?.src}
						alt={sampleImages[1]?.alt}
					/>
				</Lightbox.Slide>

				<Lightbox.Slide
					thumbnail={
						<ImgWithLoader
							src={sampleImages[2]?.src}
							alt={sampleImages[2]?.alt}
							type="thumbnail"
						/>
					}
				>
					<PlaceholderCard>
						Text-only slide with a thumbnail image
					</PlaceholderCard>
				</Lightbox.Slide>

				<Lightbox.Slide
					thumbnail={
						<ImgWithLoader
							src={sampleImages[3]?.src}
							alt={sampleImages[3]?.alt}
							type="thumbnail"
						/>
					}
				>
					<ImgWithLoader
						src={sampleImages[3]?.src}
						alt={sampleImages[3]?.alt}
					/>
				</Lightbox.Slide>
			</Lightbox>
		</Container>
	);
};

export const WithCustomCounter = () => {
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
						thumbnail={
							<ImgWithLoader src={img.src} alt={img.alt} type="thumbnail" />
						}
					>
						<ImgWithLoader src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</Lightbox>
		</Container>
	);
};

export const WithAutoPlay = () => {
	const [opened, { open, close }] = useDisclosure(false);

	const autoplay = useRef(Autoplay());

	return (
		<Container>
			<Button onClick={open}>Open</Button>

			<Lightbox
				opened={opened}
				onClose={close}
				carouselOptions={{
					plugins: [autoplay.current],
					emblaOptions: {
						loop: true,
					},
				}}
			>
				{sampleImages.map((img) => (
					<Lightbox.Slide
						key={img.src}
						thumbnail={
							<ImgWithLoader src={img.src} alt={img.alt} type="thumbnail" />
						}
					>
						<ImgWithLoader src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</Lightbox>
		</Container>
	);
};

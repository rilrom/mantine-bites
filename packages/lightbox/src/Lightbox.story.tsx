import { Box, Button, Center, Image, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	type ImgHTMLAttributes,
	type PropsWithChildren,
	type SyntheticEvent,
	useState,
} from "react";
import { Lightbox, type LightboxProps } from "./index.js";

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

interface DemoLightboxProps extends LightboxProps {
	children: PropsWithChildren["children"];
}

function DemoLightbox({ children, ...props }: DemoLightboxProps) {
	return (
		<Lightbox.Root {...props}>
			<Lightbox.Overlay />
			<Lightbox.Content>
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Slides>{children}</Lightbox.Slides>
				<Lightbox.Controls />
				<Lightbox.Thumbnails>
					{sampleImages.map((img) => (
						<Lightbox.Thumbnail key={img.src}>
							<ImgWithLoader src={img.src} alt={img.alt} type="thumbnail" />
						</Lightbox.Thumbnail>
					))}
				</Lightbox.Thumbnails>
			</Lightbox.Content>
		</Lightbox.Root>
	);
}

export const Default = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>

			<DemoLightbox opened={opened} onClose={close} initialSlide={1}>
				{sampleImages.map((img) => (
					<Lightbox.Slide key={img.src}>
						<ImgWithLoader src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</DemoLightbox>
		</Container>
	);
};

export const WithLoop = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>

			<DemoLightbox
				opened={opened}
				onClose={close}
				slideCarouselProps={{
					emblaOptions: { loop: true },
				}}
			>
				{sampleImages.map((img) => (
					<Lightbox.Slide key={img.src}>
						<ImgWithLoader src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</DemoLightbox>
		</Container>
	);
};

export const WithCustomCounter = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>

			<DemoLightbox
				opened={opened}
				onClose={close}
				slideCarouselProps={{
					counterFormatter: (index, total) => `Image ${index + 1} of ${total}`,
				}}
			>
				{sampleImages.map((img) => (
					<Lightbox.Slide key={img.src}>
						<ImgWithLoader src={img.src} alt={img.alt} />
					</Lightbox.Slide>
				))}
			</DemoLightbox>
		</Container>
	);
};

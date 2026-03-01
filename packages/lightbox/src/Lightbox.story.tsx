import { Box, Button, Center, Image, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	type ImgHTMLAttributes,
	type PropsWithChildren,
	type SyntheticEvent,
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

const Container = (props: PropsWithChildren) => (
	<Box p={40}>{props.children}</Box>
);

interface ImgWithLoaderProps extends ImgHTMLAttributes<HTMLImageElement> {
	type?: "default" | "thumbnail";
}

const ImgWithLoader = (props: ImgWithLoaderProps) => {
	const { type = "default", src, alt, style, onLoad, onError, ...rest } = props;
	const [loading, setLoading] = useState(true);

	const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
		setLoading(false);
		onLoad?.(e);
	};
	const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
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

const thumbnails = sampleImages.map((img) => (
	<Lightbox.Thumbnail key={img.src}>
		<ImgWithLoader src={img.src} alt={img.alt} type="thumbnail" />
	</Lightbox.Thumbnail>
));

const slides = sampleImages.map((img) => (
	<Lightbox.Slide key={img.src}>
		<ImgWithLoader src={img.src} alt={img.alt} />
	</Lightbox.Slide>
));

export const Default = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>
			<Lightbox.Root opened={opened} onClose={close}>
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Slides initialSlide={1}>{slides}</Lightbox.Slides>
				<Lightbox.Controls />
				<Lightbox.Thumbnails>{thumbnails}</Lightbox.Thumbnails>
			</Lightbox.Root>
		</Container>
	);
};

export const WithLoop = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>
			<Lightbox.Root opened={opened} onClose={close}>
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Slides emblaOptions={{ loop: true }}>
					{slides}
				</Lightbox.Slides>
				<Lightbox.Controls />
				<Lightbox.Thumbnails>{thumbnails}</Lightbox.Thumbnails>
			</Lightbox.Root>
		</Container>
	);
};

export const WithCustomCounter = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>
			<Lightbox.Root opened={opened} onClose={close}>
				<Lightbox.Toolbar />
				<Lightbox.Counter formatter={(i, t) => `Image ${i + 1} of ${t}`} />
				<Lightbox.Slides>{slides}</Lightbox.Slides>
				<Lightbox.Controls />
				<Lightbox.Thumbnails>{thumbnails}</Lightbox.Thumbnails>
			</Lightbox.Root>
		</Container>
	);
};

export const Vertical = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<Container>
			<Button onClick={open}>Open</Button>
			<Lightbox.Root opened={opened} onClose={close} orientation="vertical">
				<Lightbox.Toolbar />
				<Lightbox.Counter />
				<Lightbox.Slides>{slides}</Lightbox.Slides>
				<Lightbox.Controls />
				<Lightbox.Thumbnails>{thumbnails}</Lightbox.Thumbnails>
			</Lightbox.Root>
		</Container>
	);
};

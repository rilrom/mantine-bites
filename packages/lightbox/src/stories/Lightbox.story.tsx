import { Box, Button, Center, Image, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import {
	type ImgHTMLAttributes,
	type PropsWithChildren,
	type SyntheticEvent,
	useState,
} from "react";
import bg1 from "../../../../apps/docs/assets/bg-1.png";
import bg2 from "../../../../apps/docs/assets/bg-2.png";
import bg3 from "../../../../apps/docs/assets/bg-3.png";
import bg4 from "../../../../apps/docs/assets/bg-4.png";
import bg5 from "../../../../apps/docs/assets/bg-5.png";
import bg6 from "../../../../apps/docs/assets/bg-6.png";
import { Lightbox } from "../index.js";

const sampleImages = [
	{
		src: bg1,
		alt: "Desert",
		caption: "A desert landscape at sunset",
	},
	{
		src: bg2,
		alt: "Forest",
		caption: "Sunlight through the forest trees",
	},
	{
		src: bg3,
		alt: "Torii Gate",
		caption: "A traditional Japanese torii gate on water",
	},
	{
		src: bg4,
		alt: "Mountain",
		caption: "Cherry blossoms near Mount Fuji",
	},
	{
		src: bg5,
		alt: "Night Lake",
		caption: "A quiet lake under the full moon",
	},
	{
		src: bg6,
		alt: "Lighthouse",
		caption: "A lighthouse guiding ships at night",
	},
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

export default {
	title: "Lightbox",
	argTypes: {
		orientation: {
			control: "inline-radio",
			options: ["horizontal", "vertical"],
			table: { category: "Carousel" },
		},
		loop: {
			control: "boolean",
			table: { category: "Carousel" },
		},
		enableAutoplay: {
			control: "boolean",
			table: { category: "Carousel" },
		},
		autoplayDelay: {
			control: { type: "range", min: 500, max: 5000, step: 500 },
			table: { category: "Carousel" },
			if: { arg: "enableAutoplay" },
		},
		transition: {
			control: "select",
			options: ["scroll", "fade"],
			table: { category: "Carousel" },
		},
		withZoom: {
			control: "boolean",
			table: { category: "Toolbar" },
		},
		withFullscreen: {
			control: "boolean",
			table: { category: "Toolbar" },
		},
		withToolbar: {
			control: "boolean",
			table: { category: "Sections" },
		},
		withControls: {
			control: "boolean",
			table: { category: "Sections" },
		},
		withThumbnails: {
			control: "boolean",
			table: { category: "Sections" },
		},
		withCounter: {
			control: "boolean",
			table: { category: "Sections" },
		},
		withCaptions: {
			control: "boolean",
			table: { category: "Sections" },
		},
		closeOnClickOutside: {
			control: "boolean",
			table: { category: "Behavior" },
		},
		counterFormat: {
			control: "inline-radio",
			options: ["default", "verbose"],
			table: { category: "Counter" },
		},
	},
};

interface PlaygroundArgs {
	orientation: "horizontal" | "vertical";
	loop: boolean;
	enableAutoplay: boolean;
	autoplayDelay: number;
	transition: "scroll" | "fade";
	withZoom: boolean;
	withFullscreen: boolean;
	withToolbar: boolean;
	withControls: boolean;
	withThumbnails: boolean;
	withCounter: boolean;
	withCaptions: boolean;
	closeOnClickOutside: boolean;
	counterFormat: "default" | "verbose";
}

export const Playground = {
	args: {
		orientation: "horizontal",
		loop: false,
		enableAutoplay: false,
		autoplayDelay: 2000,
		transition: "scroll",
		withZoom: true,
		withFullscreen: true,
		withToolbar: true,
		withControls: true,
		withThumbnails: true,
		withCounter: true,
		withCaptions: true,
		closeOnClickOutside: true,
		counterFormat: "default",
	} satisfies PlaygroundArgs,
	render: (args: PlaygroundArgs) => {
		const [opened, { open, close }] = useDisclosure(false);

		const emblaOptions = { loop: args.loop };

		const emblaPlugins = [
			...(args.enableAutoplay ? [Autoplay({ delay: args.autoplayDelay })] : []),
			...(args.transition === "fade" ? [Fade()] : []),
		];

		const formatter =
			args.counterFormat === "verbose"
				? (i: number, t: number) => `Image ${i + 1} of ${t}`
				: undefined;

		const thumbnails = sampleImages.map((img) => (
			<Lightbox.Thumbnail key={img.src}>
				<ImgWithLoader src={img.src} alt={img.alt} type="thumbnail" />
			</Lightbox.Thumbnail>
		));

		const slides = sampleImages.map((img) => (
			<Lightbox.Slide key={img.src}>
				<ImgWithLoader src={img.src} alt={img.alt} />
				{args.withCaptions && img.caption && (
					<Lightbox.Caption>{img.caption}</Lightbox.Caption>
				)}
			</Lightbox.Slide>
		));

		return (
			<Container>
				<Button onClick={open}>Open</Button>
				<Lightbox.Root
					opened={opened}
					onClose={close}
					orientation={args.orientation}
					withZoom={args.withZoom}
					withFullscreen={args.withFullscreen}
					closeOnClickOutside={args.closeOnClickOutside}
				>
					{args.withToolbar && <Lightbox.Toolbar />}
					{args.withCounter && <Lightbox.Counter formatter={formatter} />}
					<Lightbox.Slides
						emblaOptions={emblaOptions}
						emblaPlugins={emblaPlugins}
					>
						{slides}
					</Lightbox.Slides>
					{args.withControls && <Lightbox.Controls />}
					{args.withThumbnails && (
						<Lightbox.Thumbnails>{thumbnails}</Lightbox.Thumbnails>
					)}
				</Lightbox.Root>
			</Container>
		);
	},
};

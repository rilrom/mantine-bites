import {
	type Factory,
	factory,
	Image,
	type ImageProps,
	useProps,
} from "@mantine/core";
import { LightboxAutoplayButton } from "./components/LightboxAutoplayButton.js";
import { LightboxCaption } from "./components/LightboxCaption.js";
import { LightboxCloseButton } from "./components/LightboxCloseButton.js";
import {
	LightboxControls,
	type LightboxControlsProps,
} from "./components/LightboxControls.js";
import {
	LightboxCounter,
	type LightboxCounterProps,
} from "./components/LightboxCounter.js";
import { LightboxFullscreenButton } from "./components/LightboxFullscreenButton.js";
import {
	LightboxRoot,
	type LightboxRootProps,
} from "./components/LightboxRoot.js";
import { LightboxSlide } from "./components/LightboxSlide.js";
import {
	LightboxSlides,
	type LightboxSlidesProps,
} from "./components/LightboxSlides.js";
import { LightboxThumbnail } from "./components/LightboxThumbnail.js";
import {
	LightboxThumbnails,
	type LightboxThumbnailsProps,
} from "./components/LightboxThumbnails.js";
import { LightboxToolbar } from "./components/LightboxToolbar.js";
import { LightboxZoomButton } from "./components/LightboxZoomButton.js";

type LightboxImageBaseProps = Omit<
	ImageProps,
	| "src"
	| "fallbackSrc"
	| "fit"
	| "w"
	| "width"
	| "h"
	| "height"
	| "miw"
	| "minWidth"
	| "mih"
	| "minHeight"
	| "maw"
	| "maxWidth"
	| "mah"
	| "maxHeight"
>;

export type LightboxImageProps = LightboxImageBaseProps & {
	component?: any;
	renderRoot?: (props: any) => React.ReactNode;
};

export interface LightboxImageData {
	/** URL for the slide image */
	src: string;
	/** URL used as a fallback if the slide image cannot be loaded */
	fallbackSrc?: string;
	/** Alt text for the slide image */
	alt?: string;
	/** Optional caption displayed below the slide image */
	caption?: React.ReactNode;
	/** URL for the thumbnail image, falls back to `src` if omitted */
	thumbnailSrc?: string;
	/** URL used as a fallback if the thumbnail image cannot be loaded */
	fallbackThumbnailSrc?: string;
	/** Alt text for the thumbnail image, falls back to `alt` if omitted */
	thumbnailAlt?: string;
	/** Pre-defined width of the image, only applicable when using next/image */
	width?: number;
	/** Pre-defined height of the image, only applicable when using next/image */
	height?: number;
}

export interface LightboxProps extends Omit<LightboxRootProps, "children"> {
	/** Array of images to display */
	images: LightboxImageData[];
	/** Show toolbar (zoom, fullscreen, close buttons), `true` by default */
	withToolbar?: boolean;
	/** Show prev/next navigation controls, `true` by default */
	withControls?: boolean;
	/** Show thumbnail strip, `true` by default */
	withThumbnails?: boolean;
	/** Show slide counter, `true` by default */
	withCounter?: boolean;
	/** Props passed to the slides carousel (`LightboxSlides`) */
	slidesProps?: Pick<
		LightboxSlidesProps,
		"initialSlide" | "emblaOptions" | "emblaPlugins" | "getEmblaApi"
	>;
	/** Props passed to the thumbnails carousel (`LightboxThumbnails`) */
	thumbnailsProps?: Pick<
		LightboxThumbnailsProps,
		"emblaOptions" | "getEmblaApi"
	>;
	/** Props passed to the prev/next controls (`LightboxControls`) */
	controlsProps?: Pick<LightboxControlsProps, "size">;
	/** Props passed to the slide counter (`LightboxCounter`) */
	counterProps?: Pick<LightboxCounterProps, "formatter">;
	/** Props passed to the slide `Image` component  */
	slideImageProps?: LightboxImageProps;
	/** Props passed to the thumbnail `Image` component  */
	thumbnailImageProps?: LightboxImageProps;
}

export type LightboxFactory = Factory<{
	props: LightboxProps;
	ref: HTMLDivElement;
	staticComponents: {
		Root: typeof LightboxRoot;
		Toolbar: typeof LightboxToolbar;
		Counter: typeof LightboxCounter;
		Controls: typeof LightboxControls;
		Slides: typeof LightboxSlides;
		Slide: typeof LightboxSlide;
		Caption: typeof LightboxCaption;
		Thumbnails: typeof LightboxThumbnails;
		Thumbnail: typeof LightboxThumbnail;
		CloseButton: typeof LightboxCloseButton;
		ZoomButton: typeof LightboxZoomButton;
		FullscreenButton: typeof LightboxFullscreenButton;
		AutoplayButton: typeof LightboxAutoplayButton;
	};
}>;

const defaultProps = {
	withToolbar: true,
	withControls: true,
	withThumbnails: true,
	withCounter: true,
} satisfies Partial<LightboxProps>;

export const Lightbox = factory<LightboxFactory>((_props, ref) => {
	const props = useProps("Lightbox", defaultProps, _props);

	const {
		images,
		withToolbar,
		withControls,
		withThumbnails,
		withCounter,
		slidesProps,
		thumbnailsProps,
		controlsProps,
		counterProps,
		slideImageProps,
		thumbnailImageProps,
		...rootProps
	} = props;

	return (
		<LightboxRoot ref={ref} {...rootProps}>
			{withToolbar && <LightboxToolbar />}
			{withCounter && <LightboxCounter {...counterProps} />}
			{withControls && <LightboxControls {...controlsProps} />}
			<LightboxSlides {...slidesProps}>
				{images.map((img) => (
					<LightboxSlide key={img.src}>
						<Image
							src={img.src}
							fallbackSrc={img.fallbackSrc}
							alt={img.alt ?? ""}
							width={img.width}
							height={img.height}
							{...slideImageProps}
						/>
						{img.caption && <LightboxCaption>{img.caption}</LightboxCaption>}
					</LightboxSlide>
				))}
			</LightboxSlides>
			{withThumbnails && (
				<LightboxThumbnails {...thumbnailsProps}>
					{images.map((img) => (
						<LightboxThumbnail key={img.src}>
							<Image
								src={img.thumbnailSrc ?? img.src}
								fallbackSrc={img.fallbackThumbnailSrc}
								alt={img.thumbnailAlt ?? img.alt ?? ""}
								width={img.width}
								height={img.height}
								{...thumbnailImageProps}
							/>
						</LightboxThumbnail>
					))}
				</LightboxThumbnails>
			)}
		</LightboxRoot>
	);
});

Lightbox.displayName = "Lightbox";

Lightbox.Root = LightboxRoot;
Lightbox.Toolbar = LightboxToolbar;
Lightbox.Counter = LightboxCounter;
Lightbox.Controls = LightboxControls;
Lightbox.Slides = LightboxSlides;
Lightbox.Slide = LightboxSlide;
Lightbox.Caption = LightboxCaption;
Lightbox.Thumbnails = LightboxThumbnails;
Lightbox.Thumbnail = LightboxThumbnail;
Lightbox.CloseButton = LightboxCloseButton;
Lightbox.ZoomButton = LightboxZoomButton;
Lightbox.FullscreenButton = LightboxFullscreenButton;
Lightbox.AutoplayButton = LightboxAutoplayButton;

import { type Factory, factory, useProps } from "@mantine/core";
import { LightboxAutoplayButton } from "./components/LightboxAutoplayButton.js";
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

export interface LightboxImageData {
	src: string;
	alt?: string;
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
		"initialSlide" | "emblaOptions" | "emblaPlugins"
	>;
	/** Props passed to the thumbnails carousel (`LightboxThumbnails`) */
	thumbnailsProps?: Pick<LightboxThumbnailsProps, "emblaOptions">;
	/** Props passed to the prev/next controls (`LightboxControls`) */
	controlsProps?: Pick<LightboxControlsProps, "size">;
	/** Props passed to the slide counter (`LightboxCounter`) */
	counterProps?: Pick<LightboxCounterProps, "formatter">;
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
						<img src={img.src} alt={img.alt} />
					</LightboxSlide>
				))}
			</LightboxSlides>
			{withThumbnails && (
				<LightboxThumbnails {...thumbnailsProps}>
					{images.map((img) => (
						<LightboxThumbnail key={img.src}>
							<img src={img.src} alt={img.alt} />
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
Lightbox.Thumbnails = LightboxThumbnails;
Lightbox.Thumbnail = LightboxThumbnail;
Lightbox.CloseButton = LightboxCloseButton;
Lightbox.ZoomButton = LightboxZoomButton;
Lightbox.FullscreenButton = LightboxFullscreenButton;
Lightbox.AutoplayButton = LightboxAutoplayButton;

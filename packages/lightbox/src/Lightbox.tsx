import type {
	BasePortalProps,
	BoxProps,
	ElementProps,
	Factory,
	OverlayProps,
	StylesApiProps,
	TransitionOverride,
} from "@mantine/core";
import type { EmblaOptionsType } from "embla-carousel";
import { LightboxContent } from "./components/LightboxContent.js";
import { LightboxControls } from "./components/LightboxControls.js";
import { LightboxCounter } from "./components/LightboxCounter.js";
import { LightboxOverlay } from "./components/LightboxOverlay.js";
import { LightboxRoot } from "./components/LightboxRoot.js";
import { LightboxSlide } from "./components/LightboxSlide.js";
import { LightboxSlides } from "./components/LightboxSlides.js";
import { LightboxThumbnail } from "./components/LightboxThumbnail.js";
import { LightboxThumbnails } from "./components/LightboxThumbnails.js";
import { LightboxToolbar } from "./components/LightboxToolbar.js";
import classes from "./Lightbox.module.css";

export type LightboxCssVariables = {
	root: "--lightbox-z-index" | "--lightbox-control-size";
	overlay: "--lightbox-z-index" | "--overlay-z-index";
};

export type LightboxStylesNames =
	| "root"
	| "overlay"
	| "slides"
	| "slidesViewport"
	| "slidesContainer"
	| "control"
	| "slide"
	| "toolbar"
	| "closeButton"
	| "counter"
	| "thumbnails"
	| "thumbnailsViewport"
	| "thumbnailsContainer"
	| "thumbnailSlide"
	| "thumbnailButton";

export interface LightboxModalProps {
	/** Whether to keep the lightbox content mounted when closed, `false` by default */
	keepMounted?: boolean;
	/** Whether to close the lightbox when clicking outside the content, `true` by default */
	closeOnClickOutside?: boolean;
	/** Whether to trap focus inside the lightbox while open, `true` by default */
	trapFocus?: boolean;
	/** Whether to return focus to the trigger element on close, `true` by default */
	returnFocus?: boolean;
	/** Whether to lock page scroll while the lightbox is open, `true` by default */
	lockScroll?: boolean;
}

export interface LightboxPortalProps extends BasePortalProps {
	/** Whether to render the lightbox inside a portal, `true` by default */
	withinPortal?: boolean;
}

export interface LightboxSlideCarouselProps {
	/** Size of the prev/next navigation buttons in px, `36` by default */
	controlSize?: number;
	/** Custom formatter for the counter label */
	counterFormatter?: (index: number, total: number) => string;
	/** Options passed directly to the Embla slide carousel */
	emblaOptions?: EmblaOptionsType;
}

export interface LightboxThumbnailCarouselProps {
	/** Options passed directly to the Embla thumbnail carousel */
	emblaOptions?: EmblaOptionsType;
}

export interface LightboxProps
	extends BoxProps,
		StylesApiProps<LightboxFactory>,
		ElementProps<"div"> {
	opened: boolean;
	onClose: () => void;
	initialSlide?: number;
	modalProps?: LightboxModalProps;
	portalProps?: LightboxPortalProps;
	slideCarouselProps?: LightboxSlideCarouselProps;
	thumbnailCarouselProps?: LightboxThumbnailCarouselProps;
	overlayProps?: OverlayProps;
	transitionProps?: TransitionOverride;
}

export type LightboxFactory = Factory<{
	props: LightboxProps;
	ref: HTMLDivElement;
	stylesNames: LightboxStylesNames;
	vars: LightboxCssVariables;
	staticComponents: {
		Root: typeof LightboxRoot;
		Overlay: typeof LightboxOverlay;
		Content: typeof LightboxContent;
		Toolbar: typeof LightboxToolbar;
		Counter: typeof LightboxCounter;
		Controls: typeof LightboxControls;
		Slides: typeof LightboxSlides;
		Thumbnails: typeof LightboxThumbnails;
		Thumbnail: typeof LightboxThumbnail;
		Slide: typeof LightboxSlide;
	};
}>;

export const Lightbox = LightboxRoot;

Lightbox.displayName = "Lightbox";

Lightbox.classes = classes;

Lightbox.Root = LightboxRoot;
Lightbox.Overlay = LightboxOverlay;
Lightbox.Content = LightboxContent;
Lightbox.Toolbar = LightboxToolbar;
Lightbox.Counter = LightboxCounter;
Lightbox.Controls = LightboxControls;
Lightbox.Slides = LightboxSlides;
Lightbox.Thumbnails = LightboxThumbnails;
Lightbox.Thumbnail = LightboxThumbnail;
Lightbox.Slide = LightboxSlide;

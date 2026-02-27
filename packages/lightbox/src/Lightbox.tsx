import type { CarouselProps } from "@mantine/carousel";
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
	root: "--lightbox-z-index";
	overlay: "--lightbox-z-index" | "--overlay-z-index";
};

export type LightboxStylesNames =
	| "root"
	| "overlay"
	| "slides"
	| "slide"
	| "toolbar"
	| "closeButton"
	| "counter"
	| "thumbnails"
	| "thumbnailsViewport"
	| "thumbnailsContainer"
	| "thumbnailSlide"
	| "thumbnailButton";

export type LightboxCarouselOptions = Omit<
	CarouselProps,
	"withKeyboardEvents" | "withIndicators"
>;

export type LightboxThumbnailEmblaOptions = EmblaOptionsType;

export interface LightboxProps
	extends BoxProps,
		StylesApiProps<LightboxFactory>,
		ElementProps<"div"> {
	opened: boolean;
	onClose: () => void;
	keepMounted?: boolean;
	closeOnClickOutside?: boolean;
	trapFocus?: boolean;
	returnFocus?: boolean;
	lockScroll?: boolean;
	initialSlide?: number;
	counterFormatter?: (index: number, total: number) => string;
	carouselOptions?: LightboxCarouselOptions;
	thumbnailEmblaOptions?: LightboxThumbnailEmblaOptions;
	overlayProps?: OverlayProps;
	transitionProps?: TransitionOverride;
	withinPortal?: boolean;
	portalProps?: BasePortalProps;
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
Lightbox.Slides = LightboxSlides;
Lightbox.Thumbnails = LightboxThumbnails;
Lightbox.Thumbnail = LightboxThumbnail;
Lightbox.Slide = LightboxSlide;

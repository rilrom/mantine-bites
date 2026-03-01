import type {
	BasePortalProps,
	BoxProps,
	ElementProps,
	Factory,
	OverlayProps,
	StylesApiProps,
	TransitionOverride,
} from "@mantine/core";
import type { LightboxControls } from "./components/LightboxControls.js";
import type { LightboxCounter } from "./components/LightboxCounter.js";
import type { LightboxRoot } from "./components/LightboxRoot.js";
import type { LightboxSlide } from "./components/LightboxSlide.js";
import type { LightboxSlides } from "./components/LightboxSlides.js";
import type { LightboxThumbnail } from "./components/LightboxThumbnail.js";
import type { LightboxThumbnails } from "./components/LightboxThumbnails.js";
import type { LightboxToolbar } from "./components/LightboxToolbar.js";

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

export interface LightboxProps
	extends BoxProps,
		StylesApiProps<LightboxFactory>,
		ElementProps<"div"> {
	/** Whether the lightbox is open */
	opened: boolean;
	/** Called when the lightbox requests to close */
	onClose: () => void;
	/** Whether to close when clicking outside the content, `true` by default */
	closeOnClickOutside?: boolean;
	/** Whether to keep content mounted when closed, `false` by default */
	keepMounted?: boolean;
	/** Whether to trap focus while open, `true` by default */
	trapFocus?: boolean;
	/** Whether to return focus to the trigger on close, `true` by default */
	returnFocus?: boolean;
	/** Whether to lock page scroll while open, `true` by default */
	lockScroll?: boolean;
	/** Whether to render inside a portal, `true` by default */
	withinPortal?: boolean;
	/** Props passed to the `Transition` component */
	transitionProps?: TransitionOverride;
	/** Props passed to the `Overlay` component */
	overlayProps?: OverlayProps;
	/** Layout and scroll direction of the lightbox, `'horizontal'` by default */
	orientation?: "horizontal" | "vertical";
}

export type LightboxFactory = Factory<{
	props: LightboxProps;
	ref: HTMLDivElement;
	stylesNames: LightboxStylesNames;
	staticComponents: {
		Root: typeof LightboxRoot;
		Toolbar: typeof LightboxToolbar;
		Counter: typeof LightboxCounter;
		Controls: typeof LightboxControls;
		Slides: typeof LightboxSlides;
		Thumbnails: typeof LightboxThumbnails;
		Thumbnail: typeof LightboxThumbnail;
		Slide: typeof LightboxSlide;
	};
}>;

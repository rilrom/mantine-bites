import type { LightboxFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxStylesApi: StylesApiData<LightboxFactory> = {
	selectors: {
		root: "Root element that wraps the lightbox content and is rendered inside the portal.",
		overlay: "Backdrop element displayed behind the lightbox when it is open.",
		slides:
			"Carousel viewport element that contains and manages all slide items.",
		slide: "Individual slide element rendered within the carousel.",
		toolbar:
			"Container element that groups action controls such as zoom, fullscreen, and close.",
		closeButton: "Control element that triggers the lightbox close action.",
		counter:
			"Element that displays the current slide index and total slide count.",
		thumbnails:
			"Container element that renders the thumbnail navigation strip.",
		thumbnailsViewport:
			"Viewport element that clips the thumbnail strip for embla scrolling.",
		thumbnailsContainer:
			"Inner embla container element that holds thumbnail slide items.",
		thumbnailSlide:
			"Individual slide wrapper element for each thumbnail in the strip.",
		thumbnailButton:
			"Interactive element representing a single slide thumbnail.",
	},

	vars: {
		root: {
			"--lightbox-z-index":
				"Defines the stacking order of the lightbox root element.",
		},
		overlay: {
			"--lightbox-z-index":
				"Defines the stacking order of the overlay element.",
			"--overlay-z-index":
				"Alias variable referencing --lightbox-z-index for overlay layering.",
		},
	},

	modifiers: [
		{
			modifier: "data-overflow",
			selector: "thumbnailsContainer",
			condition:
				"Applied when thumbnail content overflows the viewport and alignment switches to start.",
		},
		{
			modifier: "data-active",
			selector: "thumbnailButton",
			condition:
				"Applied when the thumbnail corresponds to the currently active slide.",
		},
	],
};

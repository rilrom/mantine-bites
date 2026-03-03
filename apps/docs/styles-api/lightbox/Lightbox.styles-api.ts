import type { LightboxRootFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxStylesApi: StylesApiData<LightboxRootFactory> = {
	selectors: {
		root: "Root element that wraps the lightbox content and is rendered inside the portal.",
		overlay: "Backdrop element displayed behind the lightbox when it is open.",
		slides: "Outer wrapper element for the slide carousel area.",
		slidesViewport:
			"Viewport element that clips the slide carousel for embla scrolling.",
		slidesContainer:
			"Inner embla container element that holds all slide items.",
		slide: "Individual slide element rendered within the carousel.",
		zoomContainer:
			"Wrapper element that manages zoom state and cursor behavior for each slide.",
		zoomContent:
			"Inner element that applies the CSS transform for zoom and pan.",
		control:
			"Prev/next navigation button rendered on either side of the carousel.",
		toolbar:
			"Container element that groups action controls such as zoom, fullscreen, and close.",
		closeButton: "Control element that triggers the lightbox close action.",
		zoomButton:
			"Control element that toggles zoom in and out on the current slide.",
		fullscreenButton: "Control element that toggles browser fullscreen mode.",
		autoplayButton: "Control element that starts and pauses slide autoplay.",
		counter:
			"Element that displays the current slide index and total slide count.",
		thumbnails: "Outer wrapper element for the thumbnail navigation strip.",
		thumbnailsViewport:
			"Viewport element that clips the thumbnail strip for embla scrolling.",
		thumbnailsContainer:
			"Inner embla container element that holds thumbnail slide items.",
		thumbnail:
			"Individual slide wrapper element for each thumbnail in the strip.",
		thumbnailButton:
			"Interactive element representing a single slide thumbnail.",
	},

	vars: {},

	modifiers: [
		{
			modifier: "data-orientation",
			selector: ["root", "slidesContainer"],
			value: '"horizontal" | "vertical"',
			condition: "Set to the current layout orientation of the lightbox.",
		},
		{
			modifier: "data-direction",
			selector: "control",
			value: '"prev" | "next"',
			condition:
				"Identifies whether the control scrolls to the previous or next slide.",
		},
		{
			modifier: "data-active",
			selector: "slide",
			condition:
				"Applied to the slide that is currently visible in the carousel.",
		},
		{
			modifier: "data-zoom-enabled",
			selector: "zoomContainer",
			condition: "Applied when the zoom feature is enabled on the lightbox.",
		},
		{
			modifier: "data-zoomed",
			selector: "zoomContainer",
			condition:
				"Applied when the active slide is currently in a zoomed state.",
		},
		{
			modifier: "data-can-zoom",
			selector: "zoomContainer",
			value: '"true" | "false"',
			condition:
				"Set to whether the current slide image is large enough to zoom.",
		},
		{
			modifier: "data-dragging",
			selector: "zoomContainer",
			condition: "Applied while the user is actively dragging a zoomed image.",
		},
		{
			modifier: "data-overflow",
			selector: "thumbnailsContainer",
			condition:
				"Applied when thumbnail content overflows the viewport and alignment switches to start.",
		},
	],
};

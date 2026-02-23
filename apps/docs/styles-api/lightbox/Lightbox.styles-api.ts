import type { LightboxFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxStylesApi: StylesApiData<LightboxFactory> = {
	selectors: {
		root: "Root element that wraps the lightbox content and is rendered inside the portal.",
		overlay: "Backdrop element displayed behind the lightbox when it is open.",
		slides:
			"Carousel viewport element that contains and manages all slide items.",
		slide: "Individual slide element rendered within the carousel.",
		zoomContainer:
			"Interactive viewport element responsible for handling zoom and pan interactions.",
		zoomContent:
			"Inner transform element that applies scaling and translation for zoom and pan.",
		toolbar:
			"Container element that groups action controls such as zoom, fullscreen, and close.",
		fullscreenButton: "Control element that toggles fullscreen mode.",
		zoomButton: "Control element that toggles zoom mode for the active slide.",
		autoplayButton:
			"Control element that toggles autoplay mode. The embla carousel autoplay plugin must be enabled.",
		closeButton: "Control element that triggers the lightbox close action.",
		counter:
			"Element that displays the current slide index and total slide count.",
		thumbnails:
			"Container element that renders the thumbnail navigation strip.",
		thumbnailButton:
			"Interactive element representing a single slide thumbnail.",
		thumbnailPlaceholder:
			"Element displayed when a slide does not provide a custom thumbnail.",
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
			modifier: "data-active",
			selector: "thumbnailButton",
			condition:
				"Applied when the thumbnail corresponds to the currently active slide.",
		},
		{
			modifier: "data-active",
			selector: "zoomContainer",
			condition:
				"Applied when the zoom container belongs to the currently active slide.",
		},
		{
			modifier: "data-zoomed",
			selector: "zoomContainer",
			condition: "Applied when the active slide is currently zoomed.",
		},
		{
			modifier: "data-can-zoom",
			selector: "zoomContainer",
			value: "false",
			condition:
				"Applied when the active slide does not support zoom interactions.",
		},
		{
			modifier: "data-dragging",
			selector: "zoomContainer",
			condition: "Applied while the user is actively panning a zoomed slide.",
		},
	],
};

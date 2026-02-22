import type { LightboxFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxStylesApi: StylesApiData<LightboxFactory> = {
	selectors: {
		root: "Wraps the lightbox component inside the portal",
		overlay: "Backdrop component when lightbox is open",
		slides: "Carousel container that holds all slides",
		slide: "Individual slide within the carousel",
		zoomContainer:
			"Interactive viewport wrapper that handles image zoom and pan gestures",
		zoomContent: "Transform container used to apply zoom scale and pan offset",
		toolbar: "Toolbar area containing various action buttons",
		fullscreenButton: "Fullscreen toggle button in the toolbar",
		zoomButton: "Zoom toggle button in the toolbar",
		closeButton: "Close button in the toolbar",
		counter: "Slide counter text",
		thumbnails: "Container for the thumbnail strip",
		thumbnailButton: "Individual thumbnail button",
		thumbnailPlaceholder:
			"Placeholder shown when a slide has no `thumbnail` prop",
	},

	vars: {},

	modifiers: [
		{
			modifier: "data-active",
			selector: "thumbnailButton",
			condition: "Thumbnail corresponds to the currently active slide",
		},
		{
			modifier: "data-active",
			selector: "zoomContainer",
			condition: "Zoom container corresponds to the currently active slide",
		},
		{
			modifier: "data-zoomed",
			selector: "zoomContainer",
			condition: "Active slide is currently zoomed in",
		},
		{
			modifier: "data-can-zoom",
			selector: "zoomContainer",
			value: "false",
			condition: "Active slide cannot be zoomed",
		},
		{
			modifier: "data-dragging",
			selector: "zoomContainer",
			condition: "User is currently panning a zoomed slide",
		},
	],
};

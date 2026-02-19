import type { LightboxFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxStylesApi: StylesApiData<LightboxFactory> = {
	selectors: {
		root: "Root element, wraps the entire lightbox content inside the modal",
		slides: "Carousel container that holds all slides",
		slide: "Individual slide within the carousel",
		toolbar: "Toolbar area containing various action buttons",
		fullscreenButton: "Fullscreen toggle button in the toolbar",
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
	],
};

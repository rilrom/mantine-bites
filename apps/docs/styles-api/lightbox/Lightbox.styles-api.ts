import type { LightboxFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxStylesApi: StylesApiData<LightboxFactory> = {
	selectors: {
		root: "Root element, wraps the entire lightbox content inside the modal",
		slides: "Carousel container that holds all slides",
		slide: "Individual slide within the carousel",
		toolbar: "Toolbar area containing the close button",
		closeButton: "Close button in the toolbar",
		control: "Previous/next navigation arrow button",
		counter: "Slide counter text",
		thumbnails: "Container for the thumbnail strip",
		thumbnailButton: "Individual thumbnail button",
		thumbnailPlaceholder:
			"Placeholder shown when a slide has no `thumbnail` prop",
	},

	vars: {
		root: {
			"--lightbox-color":
				"Controls the text/icon `color` throughout the lightbox, `var(--mantine-color-white)` by default",
			"--lightbox-thumbnail-size":
				"Controls thumbnail `width` and `height`, `48px` by default",
			"--lightbox-thumbnail-radius":
				"Controls thumbnail `border-radius`, `var(--mantine-radius-sm)` by default",
			"--lightbox-thumbnail-highlight":
				"Controls active thumbnail `border-color`, `var(--mantine-primary-color-filled)` by default",
		},
	},

	modifiers: [
		{
			modifier: "data-position",
			selector: "control",
			value: "`previous` or `next`",
			condition: "Always set based on the control's position",
		},
		{
			modifier: "data-active",
			selector: "thumbnailButton",
			condition: "Thumbnail corresponds to the currently active slide",
		},
	],
};

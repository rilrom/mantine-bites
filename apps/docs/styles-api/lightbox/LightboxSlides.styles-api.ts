import type { LightboxSlidesFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxSlidesStylesApi: StylesApiData<LightboxSlidesFactory> = {
	selectors: {
		slides: "Outer wrapper element for the slide carousel area.",
		slidesViewport:
			"Viewport element that clips the slide carousel for embla scrolling.",
		slidesContainer:
			"Inner embla container element that holds all slide items.",
	},

	vars: {},

	modifiers: [
		{
			modifier: "data-orientation",
			selector: "slidesContainer",
			value: '"horizontal" | "vertical"',
			condition: "Set to the current layout orientation of the lightbox.",
		},
	],
};

import type { LightboxToolbarFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxToolbarStylesApi: StylesApiData<LightboxToolbarFactory> = {
	selectors: {
		toolbar: "Root element that groups the toolbar action controls.",
		fullscreenButton: "Control element that toggles browser fullscreen mode.",
		zoomButton:
			"Control element that toggles zoom in and out on the current slide.",
		autoplayButton: "Control element that starts and pauses slide autoplay.",
		closeButton: "Control element that triggers the lightbox close action.",
	},

	vars: {},
};

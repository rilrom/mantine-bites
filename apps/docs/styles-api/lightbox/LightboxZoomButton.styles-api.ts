import type { LightboxZoomButtonFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxZoomButtonStylesApi: StylesApiData<LightboxZoomButtonFactory> =
	{
		selectors: {
			zoomButton:
				"Root element that toggles zoom in and out on the current slide.",
		},

		vars: {},
	};

import type { LightboxCloseButtonFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxCloseButtonStylesApi: StylesApiData<LightboxCloseButtonFactory> =
	{
		selectors: {
			closeButton: "Root element that triggers the lightbox close action.",
		},

		vars: {},
	};

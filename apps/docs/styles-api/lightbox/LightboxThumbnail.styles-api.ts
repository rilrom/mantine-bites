import type { LightboxThumbnailFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxThumbnailStylesApi: StylesApiData<LightboxThumbnailFactory> =
	{
		selectors: {
			thumbnail: "Slide wrapper element for each thumbnail in the strip.",
			thumbnailButton:
				"Interactive button element representing a single slide thumbnail.",
		},

		vars: {},
	};

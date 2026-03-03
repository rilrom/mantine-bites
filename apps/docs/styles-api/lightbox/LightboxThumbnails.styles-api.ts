import type { LightboxThumbnailsFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxThumbnailsStylesApi: StylesApiData<LightboxThumbnailsFactory> =
	{
		selectors: {
			thumbnails: "Outer wrapper element for the thumbnail navigation strip.",
			thumbnailsViewport:
				"Viewport element that clips the thumbnail strip for embla scrolling.",
			thumbnailsContainer:
				"Inner embla container element that holds thumbnail slide items.",
		},

		vars: {},

		modifiers: [
			{
				modifier: "data-overflow",
				selector: "thumbnailsContainer",
				condition:
					"Applied when thumbnail content overflows the viewport and alignment switches to start.",
			},
		],
	};

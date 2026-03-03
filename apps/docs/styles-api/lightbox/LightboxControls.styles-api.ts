import type { LightboxControlsFactory } from "@mantine-bites/lightbox";
import type { StylesApiData } from "../../components/styles-api.types";

export const LightboxControlsStylesApi: StylesApiData<LightboxControlsFactory> =
	{
		selectors: {
			control:
				"Prev/next navigation button rendered on either side of the carousel.",
		},

		vars: {},

		modifiers: [
			{
				modifier: "data-direction",
				selector: "control",
				value: '"prev" | "next"',
				condition:
					"Identifies whether the control scrolls to the previous or next slide.",
			},
		],
	};

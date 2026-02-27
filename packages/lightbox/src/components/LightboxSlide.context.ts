import { createSafeContext } from "@mantine/core";

export interface LightboxSlideContext {
	index: number;
}

export const [LightboxSlideProvider, useLightboxSlideContext] =
	createSafeContext<LightboxSlideContext>(
		"LightboxSlide component was not found in the tree",
	);

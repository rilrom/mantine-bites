import { createSafeContext, type GetStylesApi } from "@mantine/core";
import type { LightboxFactory } from "./Lightbox.js";

export interface LightboxContext {
	getStyles: GetStylesApi<LightboxFactory>;
}

export const [LightboxProvider, useLightboxContext] =
	createSafeContext<LightboxContext>(
		"Lightbox component was not found in the tree",
	);

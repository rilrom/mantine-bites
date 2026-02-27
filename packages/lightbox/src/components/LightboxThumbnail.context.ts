import { createSafeContext } from "@mantine/core";

export interface LightboxThumbnailContext {
	index: number;
}

export const [LightboxThumbnailProvider, useLightboxThumbnailContext] =
	createSafeContext<LightboxThumbnailContext>(
		"LightboxThumbnail component was not found in the tree",
	);

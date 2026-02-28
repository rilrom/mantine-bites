import { createSafeContext, type GetStylesApi } from "@mantine/core";
import type { EmblaCarouselType } from "embla-carousel";
import type { LightboxFactory } from "./Lightbox.js";

export interface LightboxContext {
	getStyles: GetStylesApi<LightboxFactory>;
	opened: boolean;
	currentIndex: number;
	slideCount: number | null;
	onSlidesCarouselInit: (
		embla: EmblaCarouselType,
		initialIndex: number,
	) => void;
	onThumbnailsCarouselInit: (embla: EmblaCarouselType) => void;
	onClose: () => void;
	onOutsideClick: () => void;
	onThumbnailClick: (index: number) => void;
	onScrollPrev: () => void;
	onScrollNext: () => void;
}

export const [LightboxProvider, useLightboxContext] =
	createSafeContext<LightboxContext>(
		"Lightbox component was not found in the tree",
	);

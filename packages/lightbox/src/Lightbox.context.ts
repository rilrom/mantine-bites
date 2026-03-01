import { createSafeContext, type GetStylesApi } from "@mantine/core";
import type { EmblaCarouselType } from "embla-carousel";
import type { RefObject } from "react";
import type { LightboxFactory } from "./Lightbox.js";

export interface LightboxContext {
	getStyles: GetStylesApi<LightboxFactory>;
	opened: boolean;
	currentIndex: number;
	slideCount: number | null;
	slidesEmblaRef: RefObject<EmblaCarouselType | null>;
	thumbnailsEmblaRef: RefObject<EmblaCarouselType | null>;
	setCurrentIndex: (index: number) => void;
	setSlideCount: (count: number | null) => void;
	onClose: () => void;
	onOutsideClick: () => void;
	onThumbnailClick: (index: number) => void;
	onScrollPrev: () => void;
	onScrollNext: () => void;
	orientation: "horizontal" | "vertical";
}

export const [LightboxProvider, useLightboxContext] =
	createSafeContext<LightboxContext>(
		"Lightbox component was not found in the tree",
	);

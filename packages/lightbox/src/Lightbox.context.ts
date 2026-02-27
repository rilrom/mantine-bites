import {
	createSafeContext,
	type GetStylesApi,
	type OverlayProps,
} from "@mantine/core";
import type { EmblaCarouselType } from "embla-carousel";
import type { CSSProperties } from "react";
import type {
	LightboxFactory,
	LightboxSlideCarouselProps,
	LightboxThumbnailCarouselProps,
} from "./Lightbox.js";

export interface LightboxContext {
	getStyles: GetStylesApi<LightboxFactory>;
	transitionStyles: CSSProperties;
	overlayProps: OverlayProps;
	mergedRef: (node: HTMLDivElement | null) => void;
	slideCarouselProps: LightboxSlideCarouselProps;
	onSlidesCarouselInit: (embla: EmblaCarouselType) => void;
	// Slides
	currentIndex: number;
	// Counter
	counterLabel: string | null;
	// Thumbnails
	thumbnailCarouselProps: LightboxThumbnailCarouselProps;
	onThumbnailsCarouselInit: (embla: EmblaCarouselType) => void;
	// Handlers
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

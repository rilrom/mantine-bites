import type { CarouselProps } from "@mantine/carousel";
import {
	createSafeContext,
	type GetStylesApi,
	type OverlayProps,
} from "@mantine/core";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import type { CSSProperties } from "react";
import type { LightboxCarouselOptions, LightboxFactory } from "./Lightbox.js";

export interface LightboxContext {
	getStyles: GetStylesApi<LightboxFactory>;
	transitionStyles: CSSProperties;
	overlayProps: OverlayProps;
	mergedRef: (node: HTMLDivElement | null) => void;
	carouselOptions: LightboxCarouselOptions;
	onSlidesCarouselInit: CarouselProps["getEmblaApi"];
	// Slides
	currentIndex: number;
	// Counter
	counterLabel: string | null;
	// Thumbnails
	thumbnailsCarouselOptions: EmblaOptionsType | undefined;
	onThumbnailsCarouselInit: (embla: EmblaCarouselType) => void;
	// Handlers
	onClose: () => void;
	onOutsideClick: () => void;
	onThumbnailClick: (index: number) => void;
}

export const [LightboxProvider, useLightboxContext] =
	createSafeContext<LightboxContext>(
		"Lightbox component was not found in the tree",
	);

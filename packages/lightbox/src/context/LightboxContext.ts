import { createSafeContext, type GetStylesApi } from "@mantine/core";
import type { EmblaCarouselType } from "embla-carousel";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import type { LightboxRootFactory } from "../components/LightboxRoot.js";
import type { ZoomOffset } from "../utils/zoom.js";

export interface LightboxContext {
	getStyles: GetStylesApi<LightboxRootFactory>;
	opened: boolean;
	currentIndex: number;
	initialSlideRef: RefObject<number>;
	slideCount: number | null;
	slidesEmblaRef: RefObject<EmblaCarouselType | null>;
	thumbnailsEmblaRef: RefObject<EmblaCarouselType | null>;
	setCurrentIndex: (index: number) => void;
	setSlideCount: (count: number | null) => void;
	onClose: () => void;
	onOutsideClick: () => void;
	onThumbnailClick: (index: number) => void;
	slidesEmblaApi: EmblaCarouselType | null;
	onScrollPrev: () => void;
	onScrollNext: () => void;
	orientation: "horizontal" | "vertical";
	// AutoPlay
	canAutoPlay: boolean;
	isPlaying: boolean;
	toggleAutoPlay: () => void;
	onSlidesEmblaApi: (embla: EmblaCarouselType) => void;
	// Fullscreen
	withFullscreen: boolean;
	isFullscreen: boolean;
	toggleFullscreen: () => void;
	// Zoom
	withZoom: boolean;
	isZoomed: boolean;
	isZoomedRef: RefObject<boolean>;
	isDraggingZoom: boolean;
	canZoomCurrent: boolean;
	zoomOffset: ZoomOffset;
	zoomScale: number;
	activeZoomContainerRef: RefObject<HTMLDivElement | null>;
	toggleZoom: () => void;
	updateCanZoomAvailability: () => void;
	handleZoomPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
	panZoom: (direction: "up" | "down" | "left" | "right") => void;
}

export const [LightboxProvider, useLightboxContext] =
	createSafeContext<LightboxContext>(
		"Lightbox component was not found in the tree",
	);

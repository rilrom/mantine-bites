import { createSafeContext, type GetStylesApi } from "@mantine/core";
import type {
	ReactElement,
	PointerEvent as ReactPointerEvent,
	RefObject,
} from "react";
import type { LightboxFactory } from "./Lightbox.js";
import type { LightboxSlideProps } from "./LightboxSlide.js";
import type { ZoomOffset } from "./utils/zoom.js";

export interface LightboxContext {
	getStyles: GetStylesApi<LightboxFactory>;
	// Slides
	slides: ReactElement<Pick<LightboxSlideProps, "children" | "thumbnail">>[];
	currentIndex: number;
	// Feature flags
	withFullscreen: boolean | undefined;
	withZoom: boolean | undefined;
	// Fullscreen
	isFullscreen: boolean;
	canUseFullscreen: boolean;
	onToggleFullscreen: () => void;
	// AutoPlay
	canUseAutoPlay: boolean;
	isPlaying: boolean;
	onToggleAutoPlay: () => void;
	onToggleZoom: () => void;
	// Zoom
	isZoomed: boolean;
	isDraggingZoom: boolean;
	canZoomCurrent: boolean;
	zoomOffset: ZoomOffset;
	zoomScale: number;
	activeZoomContainerRef: RefObject<HTMLDivElement | null>;
	updateCanZoomAvailability: () => void;
	handleZoomPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
	// Handlers
	onClose: () => void;
	handleOutsideClick: () => void;
	onThumbnailClick: (index: number) => void;
}

export const [LightboxProvider, useLightboxContext] =
	createSafeContext<LightboxContext>(
		"Lightbox component was not found in the tree",
	);

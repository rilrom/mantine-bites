import type { EmblaCarouselType } from "embla-carousel";
import {
	Children,
	isValidElement,
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import type { LightboxCarouselOptions } from "../Lightbox.js";
import { useCarouselOptions } from "./useCarouselOptions.js";
import { useFullscreen } from "./useFullscreen.js";
import { useKeyboardNavigation } from "./useKeyboardNavigation.js";
import { useZoom } from "./useZoom.js";

interface UseLightboxInput {
	opened: boolean;
	children: ReactNode;
	carouselOptions: LightboxCarouselOptions | undefined;
	counterFormatter: ((index: number, total: number) => string) | undefined;
}

export function useLightbox(props: UseLightboxInput) {
	const { opened, children, carouselOptions, counterFormatter } = props;

	const emblaRef = useRef<EmblaCarouselType | null>(null);
	const [currentIndex, setCurrentIndex] = useState(
		carouselOptions?.initialSlide ?? 0,
	);

	const { isFullscreen, canUseFullscreen, toggleFullscreen } = useFullscreen({
		opened,
	});

	const {
		isZoomed,
		isDraggingZoom,
		zoomOffset,
		zoomScale,
		canZoomCurrent,
		isZoomedRef,
		activeZoomContainerRef,
		resetZoom,
		toggleZoom,
		updateCanZoomAvailability,
		handleZoomPointerDown,
		handleZoomPointerMove,
		handleZoomPointerEnd,
	} = useZoom({ opened });

	const slides = Children.toArray(children).filter(
		isValidElement,
	) as ReactElement<{
		children?: ReactNode;
		thumbnail?: ReactNode;
	}>[];

	const total = slides.length;

	const counterText = counterFormatter
		? counterFormatter(currentIndex, total)
		: `${currentIndex + 1} / ${total}`;

	const handleEmblaApi = useCallback(
		(embla: EmblaCarouselType) => {
			emblaRef.current = embla;
			carouselOptions?.getEmblaApi?.(embla);
		},
		[carouselOptions?.getEmblaApi],
	);

	const handleSlideChange = useCallback(
		(index: number) => {
			setCurrentIndex(index);
			resetZoom();
			requestAnimationFrame(updateCanZoomAvailability);
			carouselOptions?.onSlideChange?.(index);
		},
		[carouselOptions?.onSlideChange, resetZoom, updateCanZoomAvailability],
	);

	const handleThumbnailClick = useCallback(
		(index: number) => {
			if (isZoomed) {
				resetZoom();
			}

			emblaRef.current?.scrollTo(index);
		},
		[isZoomed, resetZoom],
	);

	const mergedCarouselOptions = useCarouselOptions({
		carouselOptions,
		isZoomedRef,
	});

	useKeyboardNavigation({ opened, emblaRef });

	useEffect(() => {
		if (!opened) {
			setCurrentIndex(carouselOptions?.initialSlide ?? 0);
		}
	}, [opened, carouselOptions?.initialSlide]);

	return {
		slides,
		currentIndex,
		counterText,
		isFullscreen,
		canUseFullscreen,
		toggleFullscreen,
		isZoomed,
		isDraggingZoom,
		zoomOffset,
		zoomScale,
		canZoomCurrent,
		activeZoomContainerRef,
		toggleZoom,
		updateCanZoomAvailability,
		handleZoomPointerDown,
		handleZoomPointerMove,
		handleZoomPointerEnd,
		handleEmblaApi,
		handleSlideChange,
		handleThumbnailClick,
		mergedCarouselOptions,
	};
}

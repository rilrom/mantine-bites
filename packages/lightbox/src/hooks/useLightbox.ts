import { useFocusReturn, useFocusTrap, useMergedRef } from "@mantine/hooks";
import type { EmblaCarouselType } from "embla-carousel";
import {
	Children,
	type ForwardedRef,
	isValidElement,
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { LIGHTBOX_DEFAULT_PROPS } from "../Lightbox.defaults.js";
import type { LightboxCarouselOptions } from "../Lightbox.js";
import { useCarouselOptions } from "./useCarouselOptions.js";
import { useFullscreen } from "./useFullscreen.js";
import { useKeyboardNavigation } from "./useKeyboardNavigation.js";
import { useZoom } from "./useZoom.js";

interface UseLightboxInput {
	ref: ForwardedRef<HTMLDivElement>;
	opened: boolean;
	onClose: () => void;
	closeOnClickOutside: boolean | undefined;
	trapFocus: boolean | undefined;
	returnFocus: boolean | undefined;
	children: ReactNode;
	carouselOptions: LightboxCarouselOptions | undefined;
	counterFormatter: ((index: number, total: number) => string) | undefined;
}

export function useLightbox(props: UseLightboxInput) {
	const {
		ref,
		opened,
		onClose,
		closeOnClickOutside,
		trapFocus,
		returnFocus,
		children,
		carouselOptions,
		counterFormatter,
	} = props;

	const shouldCloseOnClickOutside =
		closeOnClickOutside ?? LIGHTBOX_DEFAULT_PROPS.closeOnClickOutside;

	const shouldTrapFocus = trapFocus ?? LIGHTBOX_DEFAULT_PROPS.trapFocus;

	const shouldReturnFocus = returnFocus ?? LIGHTBOX_DEFAULT_PROPS.returnFocus;

	const focusTrapRef = useFocusTrap(opened && shouldTrapFocus);

	const mergedRef = useMergedRef(ref, focusTrapRef);

	useFocusReturn({ opened, shouldReturnFocus });

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

	const handleOutsideClick = useCallback(() => {
		if (!shouldCloseOnClickOutside) {
			return;
		}

		onClose();
	}, [shouldCloseOnClickOutside, onClose]);

	const mergedCarouselOptions = useCarouselOptions({
		carouselOptions,
		isZoomedRef,
	});

	useKeyboardNavigation({ opened, emblaRef, onClose });

	useEffect(() => {
		if (!opened) {
			setCurrentIndex(carouselOptions?.initialSlide ?? 0);
		}
	}, [opened, carouselOptions?.initialSlide]);

	return {
		mergedRef,
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
		handleOutsideClick,
		mergedCarouselOptions,
	};
}

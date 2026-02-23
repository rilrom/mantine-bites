import type { CarouselProps } from "@mantine/carousel";
import { useFocusReturn, useFocusTrap, useMergedRef } from "@mantine/hooks";
import type { EmblaCarouselType } from "embla-carousel";
import {
	Children,
	type ForwardedRef,
	isValidElement,
	type ReactElement,
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { LIGHTBOX_DEFAULT_PROPS } from "../Lightbox.defaults.js";
import type { LightboxCarouselOptions } from "../Lightbox.js";
import type { LightboxSlideProps } from "../LightboxSlide.js";
import type { ZoomOffset } from "../utils/zoom.js";
import { useAutoPlay } from "./useAutoPlay.js";
import {
	type UseCarouselOptionsOutput,
	useCarouselOptions,
} from "./useCarouselOptions.js";
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

interface UseLightboxOutput {
	mergedRef: (node: HTMLDivElement | null) => void;
	slides: ReactElement<Pick<LightboxSlideProps, "children" | "thumbnail">>[];
	currentIndex: number;
	counterText: string;
	isFullscreen: boolean;
	canUseFullscreen: boolean;
	toggleFullscreen: () => void;
	isZoomed: boolean;
	isDraggingZoom: boolean;
	zoomOffset: ZoomOffset;
	zoomScale: number;
	canZoomCurrent: boolean;
	activeZoomContainerRef: RefObject<HTMLDivElement | null>;
	toggleZoom: () => void;
	updateCanZoomAvailability: () => void;
	handleZoomPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleEmblaApi: CarouselProps["getEmblaApi"];
	handleSlideChange: (index: number) => void;
	handleThumbnailClick: (index: number) => void;
	handleOutsideClick: () => void;
	isPlaying: boolean;
	canUseAutoPlay: boolean;
	toggleAutoPlay: () => void;
	mergedCarouselOptions: UseCarouselOptionsOutput;
}

export function useLightbox(props: UseLightboxInput): UseLightboxOutput {
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

	const {
		canUseAutoPlay,
		isPlaying,
		toggleAutoPlay,
		handleEmblaApiForAutoPlay,
	} = useAutoPlay();

	const slides = Children.toArray(children).filter(
		isValidElement,
	) as ReactElement<Pick<LightboxSlideProps, "children" | "thumbnail">>[];

	const total = slides.length;

	const counterText = counterFormatter
		? counterFormatter(currentIndex, total)
		: `${currentIndex + 1} / ${total}`;

	const handleEmblaApi = useCallback(
		(embla: EmblaCarouselType) => {
			emblaRef.current = embla;
			handleEmblaApiForAutoPlay(embla);
			carouselOptions?.getEmblaApi?.(embla);
		},
		[carouselOptions?.getEmblaApi, handleEmblaApiForAutoPlay],
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
		isPlaying,
		canUseAutoPlay,
		toggleAutoPlay,
		mergedCarouselOptions,
	};
}

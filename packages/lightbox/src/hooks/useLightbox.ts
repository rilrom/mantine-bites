import type { CarouselProps } from "@mantine/carousel";
import {
	useFocusReturn,
	useFocusTrap,
	useFullscreen,
	useHotkeys,
	useMergedRef,
} from "@mantine/hooks";
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
import type {
	LightboxCarouselOptions,
	LightboxThumbnailEmblaOptions,
} from "../Lightbox.js";
import type { LightboxSlideProps } from "../LightboxSlide.js";
import type { ZoomOffset } from "../utils/zoom.js";
import { useAutoPlay } from "./useAutoPlay.js";

import { useZoom } from "./useZoom.js";

interface UseLightboxInput {
	ref: ForwardedRef<HTMLDivElement>;
	opened: boolean;
	withZoom: boolean | undefined;
	onClose: () => void;
	closeOnClickOutside: boolean | undefined;
	trapFocus: boolean | undefined;
	returnFocus: boolean | undefined;
	children: ReactNode;
	carouselOptions: LightboxCarouselOptions | undefined;
	thumbnailEmblaOptions: LightboxThumbnailEmblaOptions | undefined;
	counterFormatter: ((index: number, total: number) => string) | undefined;
}

interface UseLightboxOutput {
	mergedRef: (node: HTMLDivElement | null) => void;
	slides: ReactElement<Pick<LightboxSlideProps, "children" | "thumbnail">>[];
	currentIndex: number;
	counterText: string;
	isFullscreen: boolean;
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
	handleThumbnailsEmblaApi: (embla: EmblaCarouselType) => void;
	handleSlideChange: (index: number) => void;
	handleThumbnailClick: (index: number) => void;
	handleOutsideClick: () => void;
	isPlaying: boolean;
	canUseAutoPlay: boolean;
	toggleAutoPlay: () => void;
	mergedCarouselOptions: LightboxCarouselOptions;
	mergedThumbnailEmblaOptions: LightboxThumbnailEmblaOptions;
}

export function useLightbox(props: UseLightboxInput): UseLightboxOutput {
	const {
		ref,
		opened,
		withZoom,
		onClose,
		closeOnClickOutside,
		trapFocus,
		returnFocus,
		children,
		carouselOptions,
		thumbnailEmblaOptions,
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
	const thumbnailsEmblaRef = useRef<EmblaCarouselType | null>(null);
	const [currentIndex, setCurrentIndex] = useState(
		carouselOptions?.initialSlide ?? 0,
	);
	const initialSlide = carouselOptions?.initialSlide ?? 0;

	const { fullscreen: isFullscreen, toggle: toggleFullscreen } =
		useFullscreen();

	useHotkeys([
		["ArrowLeft", () => opened && emblaRef.current?.scrollPrev()],
		["ArrowRight", () => opened && emblaRef.current?.scrollNext()],
		["Escape", () => opened && onClose()],
	]);

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
	} = useZoom({
		opened,
		withZoom: withZoom ?? LIGHTBOX_DEFAULT_PROPS.withZoom,
	});

	const {
		canUseAutoPlay,
		isPlaying,
		toggleAutoPlay,
		notifyAutoPlayInteraction,
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

			thumbnailsEmblaRef.current?.scrollTo(index);
		},
		[carouselOptions?.onSlideChange, resetZoom, updateCanZoomAvailability],
	);

	const handleThumbnailsEmblaApi = useCallback(
		(embla: EmblaCarouselType) => {
			thumbnailsEmblaRef.current = embla;

			embla.scrollTo(currentIndex);
		},
		[currentIndex],
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

	const handleToolbarZoomToggle = useCallback(() => {
		notifyAutoPlayInteraction();
		toggleZoom();
	}, [notifyAutoPlayInteraction, toggleZoom]);

	const mergedCarouselOptions: LightboxCarouselOptions = {
		...carouselOptions,
		emblaOptions: {
			...carouselOptions?.emblaOptions,
			watchDrag: (
				emblaApi: EmblaCarouselType,
				event: MouseEvent | TouchEvent,
			) => {
				if (isZoomedRef.current) {
					return false;
				}

				const configuredWatchDrag = carouselOptions?.emblaOptions?.watchDrag;

				if (typeof configuredWatchDrag === "function") {
					return configuredWatchDrag(emblaApi, event);
				}

				return configuredWatchDrag ?? true;
			},
		},
	};

	const mergedThumbnailEmblaOptions: LightboxThumbnailEmblaOptions = {
		...thumbnailEmblaOptions,
	};

	useEffect(() => {
		if (!opened) {
			setCurrentIndex(initialSlide);

			return;
		}

		setCurrentIndex(initialSlide);

		emblaRef.current?.scrollTo(initialSlide);

		thumbnailsEmblaRef.current?.scrollTo(initialSlide);
	}, [opened, initialSlide]);

	useEffect(() => {
		if (opened) {
			thumbnailsEmblaRef.current?.scrollTo(currentIndex);
		}
	}, [opened, currentIndex]);

	// If we are in fullscreen mode, we want to exit out of it when closing the lightbox
	useEffect(() => {
		if (
			opened ||
			typeof document === "undefined" ||
			!document.fullscreenElement ||
			typeof document.exitFullscreen !== "function"
		) {
			return;
		}

		void document.exitFullscreen();
	}, [opened]);

	// If dragFree is enabled, we want to ensure the whole image is scrolled into viewport before zooming
	useEffect(() => {
		if (isZoomed) {
			emblaRef.current?.scrollTo(currentIndex);
		}
	}, [isZoomed, currentIndex]);

	return {
		mergedRef,
		slides,
		currentIndex,
		counterText,
		isFullscreen,
		toggleFullscreen,
		isZoomed,
		isDraggingZoom,
		zoomOffset,
		zoomScale,
		canZoomCurrent,
		activeZoomContainerRef,
		toggleZoom: handleToolbarZoomToggle,
		updateCanZoomAvailability,
		handleZoomPointerDown,
		handleZoomPointerMove,
		handleZoomPointerEnd,
		handleEmblaApi,
		handleThumbnailsEmblaApi,
		handleSlideChange,
		handleThumbnailClick,
		handleOutsideClick,
		isPlaying,
		canUseAutoPlay,
		toggleAutoPlay,
		mergedCarouselOptions,
		mergedThumbnailEmblaOptions,
	};
}

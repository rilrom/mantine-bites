import type { CarouselProps } from "@mantine/carousel";
import {
	useFocusReturn,
	useFocusTrap,
	useHotkeys,
	useMergedRef,
} from "@mantine/hooks";
import type { EmblaCarouselType } from "embla-carousel";
import {
	type ForwardedRef,
	useCallback,
	useMemo,
	useRef,
	useState,
} from "react";
import { LIGHTBOX_DEFAULT_PROPS } from "../Lightbox.defaults.js";
import type {
	LightboxCarouselOptions,
	LightboxThumbnailEmblaOptions,
} from "../Lightbox.js";

interface UseLightboxInput {
	ref: ForwardedRef<HTMLDivElement>;
	opened: boolean;
	initialSlide: number | undefined;
	onClose: () => void;
	closeOnClickOutside: boolean | undefined;
	trapFocus: boolean | undefined;
	returnFocus: boolean | undefined;
	carouselOptions: LightboxCarouselOptions | undefined;
	thumbnailEmblaOptions: LightboxThumbnailEmblaOptions | undefined;
	counterFormatter: ((index: number, total: number) => string) | undefined;
}

export interface UseLightboxOutput {
	mergedRef: (node: HTMLDivElement | null) => void;
	currentIndex: number;
	counterText: string | null;
	handleEmblaApi: CarouselProps["getEmblaApi"];
	handleThumbnailsEmblaApi: (embla: EmblaCarouselType) => void;
	handleThumbnailClick: (index: number) => void;
	handleOutsideClick: () => void;
	mergedCarouselOptions: LightboxCarouselOptions;
	mergedThumbnailEmblaOptions: LightboxThumbnailEmblaOptions;
}

export function useLightbox(props: UseLightboxInput): UseLightboxOutput {
	const {
		ref,
		opened,
		initialSlide,
		onClose,
		closeOnClickOutside,
		trapFocus,
		returnFocus,
		carouselOptions,
		thumbnailEmblaOptions,
		counterFormatter,
	} = props;

	const shouldCloseOnClickOutside =
		closeOnClickOutside ?? LIGHTBOX_DEFAULT_PROPS.closeOnClickOutside;

	const shouldTrapFocus = trapFocus ?? LIGHTBOX_DEFAULT_PROPS.trapFocus;

	const shouldReturnFocus = returnFocus ?? LIGHTBOX_DEFAULT_PROPS.returnFocus;

	const mergedBaseCarouselOptions = useMemo<LightboxCarouselOptions>(
		() => ({
			...LIGHTBOX_DEFAULT_PROPS.carouselOptions,
			...carouselOptions,
			initialSlide,
		}),
		[carouselOptions, initialSlide],
	);

	const mergedThumbnailEmblaOptions = useMemo<LightboxThumbnailEmblaOptions>(
		() => ({
			...LIGHTBOX_DEFAULT_PROPS.thumbnailEmblaOptions,
			...thumbnailEmblaOptions,
		}),
		[thumbnailEmblaOptions],
	);

	const focusTrapRef = useFocusTrap(opened && shouldTrapFocus);

	const mergedRef = useMergedRef(ref, focusTrapRef);

	useFocusReturn({ opened, shouldReturnFocus });

	const slidesEmblaRef = useRef<EmblaCarouselType | null>(null);
	const thumbnailsEmblaRef = useRef<EmblaCarouselType | null>(null);

	const [currentIndex, setCurrentIndex] = useState(
		mergedBaseCarouselOptions?.initialSlide ?? 0,
	);
	const [total, setTotal] = useState<number | null>(null);

	useHotkeys([
		["ArrowLeft", () => opened && slidesEmblaRef.current?.scrollPrev()],
		["ArrowRight", () => opened && slidesEmblaRef.current?.scrollNext()],
		["Escape", () => opened && onClose()],
	]);

	const counterText = useMemo(() => {
		if (total === null) {
			return null;
		}

		if (counterFormatter) {
			return counterFormatter(currentIndex, total);
		}

		return `${currentIndex + 1} / ${total}`;
	}, [counterFormatter, currentIndex, total]);

	const handleEmblaApi = useCallback(
		(embla: EmblaCarouselType) => {
			slidesEmblaRef.current = embla;

			const onInit = (api: EmblaCarouselType) => {
				setTotal(api.slideNodes().length);
				mergedBaseCarouselOptions.getEmblaApi?.(api);
			};

			const onSelect = (api: EmblaCarouselType) => {
				setCurrentIndex(api.selectedScrollSnap());
				thumbnailsEmblaRef.current?.scrollTo(api.selectedScrollSnap());
			};

			const onDestroy = () => {
				setCurrentIndex(mergedBaseCarouselOptions?.initialSlide ?? 0);
				setTotal(null);
				thumbnailsEmblaRef.current = null;
				slidesEmblaRef.current = null;
			};

			onInit(embla);

			embla.on("select", onSelect);
			embla.on("destroy", onDestroy);
		},
		[mergedBaseCarouselOptions],
	);

	const handleThumbnailsEmblaApi = useCallback(
		(embla: EmblaCarouselType) => {
			thumbnailsEmblaRef.current = embla;

			embla.scrollTo(currentIndex);
		},
		[currentIndex],
	);

	const handleThumbnailClick = useCallback((index: number) => {
		slidesEmblaRef.current?.scrollTo(index);
	}, []);

	const handleOutsideClick = useCallback(() => {
		if (!shouldCloseOnClickOutside) {
			return;
		}

		onClose();
	}, [shouldCloseOnClickOutside, onClose]);

	const mergedCarouselOptions = mergedBaseCarouselOptions;

	return {
		mergedRef,
		currentIndex,
		counterText,
		handleEmblaApi,
		handleThumbnailsEmblaApi,
		handleThumbnailClick,
		handleOutsideClick,
		mergedCarouselOptions,
		mergedThumbnailEmblaOptions,
	};
}

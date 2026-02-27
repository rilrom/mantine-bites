import {
	createVarsResolver,
	factory,
	OptionalPortal,
	RemoveScroll,
	Transition,
	useProps,
	useStyles,
} from "@mantine/core";
import {
	useFocusReturn,
	useFocusTrap,
	useHotkeys,
	useMergedRef,
} from "@mantine/hooks";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { useCallback, useMemo, useRef, useState } from "react";
import { LightboxProvider } from "../Lightbox.context.js";
import { LIGHTBOX_DEFAULT_PROPS } from "../Lightbox.defaults.js";
import type { LightboxFactory, LightboxProps } from "../Lightbox.js";
import classes from "../Lightbox.module.css";

const defaultProps: Partial<LightboxProps> = {
	modalProps: LIGHTBOX_DEFAULT_PROPS.modalProps,
	portalProps: LIGHTBOX_DEFAULT_PROPS.portalProps,
	overlayProps: LIGHTBOX_DEFAULT_PROPS.overlayProps,
	transitionProps: LIGHTBOX_DEFAULT_PROPS.transitionProps,
	thumbnailCarouselProps: LIGHTBOX_DEFAULT_PROPS.thumbnailCarouselProps,
};

const varsResolver = createVarsResolver<LightboxFactory>(
	(_, { overlayProps, slideCarouselProps }) => ({
		root: {
			"--lightbox-z-index": String(
				overlayProps?.zIndex ?? LIGHTBOX_DEFAULT_PROPS.overlayProps.zIndex,
			),
			"--lightbox-control-size": `${slideCarouselProps?.controlSize ?? LIGHTBOX_DEFAULT_PROPS.slideCarouselProps.controlSize}px`,
		},
		overlay: {
			"--lightbox-z-index": String(
				overlayProps?.zIndex ?? LIGHTBOX_DEFAULT_PROPS.overlayProps.zIndex,
			),
			"--overlay-z-index": "var(--lightbox-z-index)",
		},
	}),
);

export const LightboxRoot = factory<LightboxFactory>((_props, ref) => {
	const props = useProps("Lightbox", defaultProps, _props);

	const {
		opened,
		onClose,
		classNames,
		className,
		style,
		styles,
		unstyled,
		vars,
		children,
		initialSlide,
		modalProps,
		portalProps,
		slideCarouselProps,
		thumbnailCarouselProps,
		overlayProps,
		transitionProps,
	} = props;

	const getStyles = useStyles<LightboxFactory>({
		name: "Lightbox",
		classes,
		props,
		varsResolver,
		className,
		style,
		classNames,
		styles,
		unstyled,
		vars,
	});

	const {
		keepMounted = LIGHTBOX_DEFAULT_PROPS.modalProps.keepMounted,
		closeOnClickOutside = LIGHTBOX_DEFAULT_PROPS.modalProps.closeOnClickOutside,
		trapFocus = LIGHTBOX_DEFAULT_PROPS.modalProps.trapFocus,
		lockScroll = LIGHTBOX_DEFAULT_PROPS.modalProps.lockScroll,
		returnFocus = LIGHTBOX_DEFAULT_PROPS.modalProps.returnFocus,
	} = modalProps ?? {};

	const {
		withinPortal = LIGHTBOX_DEFAULT_PROPS.portalProps.withinPortal,
		...restPortalProps
	} = portalProps ?? {};

	const mergedOverlayProps = {
		...LIGHTBOX_DEFAULT_PROPS.overlayProps,
		...overlayProps,
	};

	const mergedTransitionProps = {
		...LIGHTBOX_DEFAULT_PROPS.transitionProps,
		...transitionProps,
	};

	const mergedSlideCarouselProps = useMemo(
		() => ({
			...slideCarouselProps,
			controlSize:
				slideCarouselProps?.controlSize ??
				LIGHTBOX_DEFAULT_PROPS.slideCarouselProps.controlSize,
			emblaOptions: {
				...slideCarouselProps?.emblaOptions,
				startIndex: initialSlide,
			},
		}),
		[slideCarouselProps, initialSlide],
	);

	const mergedThumbnailCarouselProps = useMemo(
		() => ({
			emblaOptions: {
				...LIGHTBOX_DEFAULT_PROPS.thumbnailCarouselProps.emblaOptions,
				...thumbnailCarouselProps?.emblaOptions,
			},
		}),
		[thumbnailCarouselProps],
	);

	const { counterFormatter } = slideCarouselProps ?? {};

	const focusTrapRef = useFocusTrap(opened && trapFocus);
	const mergedRef = useMergedRef(ref, focusTrapRef);
	useFocusReturn({ opened, shouldReturnFocus: returnFocus });

	const slidesEmblaRef = useRef<EmblaCarouselType | null>(null);
	const thumbnailsEmblaRef = useRef<EmblaCarouselType | null>(null);

	const [currentIndex, setCurrentIndex] = useState(initialSlide ?? 0);
	const [slideCount, setSlideCount] = useState<number | null>(null);

	useHotkeys([
		["ArrowLeft", () => opened && slidesEmblaRef.current?.scrollPrev()],
		["ArrowRight", () => opened && slidesEmblaRef.current?.scrollNext()],
		["Escape", () => opened && onClose()],
	]);

	const counterLabel = useMemo(() => {
		if (slideCount === null) {
			return null;
		}

		if (counterFormatter) {
			return counterFormatter(currentIndex, slideCount);
		}

		return `${currentIndex + 1} / ${slideCount}`;
	}, [counterFormatter, currentIndex, slideCount]);

	const handleSlidesCarouselInit = useCallback(
		(embla: EmblaCarouselType) => {
			slidesEmblaRef.current = embla;

			const handleCarouselInit = (api: EmblaCarouselType) => {
				setSlideCount(api.slideNodes().length);
			};

			const handleSlideSelect = (api: EmblaCarouselType) => {
				setCurrentIndex(api.selectedScrollSnap());
				thumbnailsEmblaRef.current?.scrollTo(api.selectedScrollSnap());
			};

			const handleCarouselDestroy = () => {
				setCurrentIndex(initialSlide ?? 0);
				setSlideCount(null);
				thumbnailsEmblaRef.current = null;
				slidesEmblaRef.current = null;
			};

			handleCarouselInit(embla);

			embla.on("select", handleSlideSelect);
			embla.on("destroy", handleCarouselDestroy);
		},
		[initialSlide],
	);

	const handleThumbnailsCarouselInit = useCallback(
		(embla: EmblaCarouselType) => {
			thumbnailsEmblaRef.current = embla;

			embla.scrollTo(currentIndex);
		},
		[currentIndex],
	);

	const handleThumbnailClick = useCallback((index: number) => {
		slidesEmblaRef.current?.scrollTo(index);
	}, []);

	const handleScrollPrev = useCallback(() => {
		slidesEmblaRef.current?.scrollPrev();
	}, []);

	const handleScrollNext = useCallback(() => {
		slidesEmblaRef.current?.scrollNext();
	}, []);

	const handleOutsideClick = useCallback(() => {
		if (!closeOnClickOutside) {
			return;
		}

		onClose();
	}, [closeOnClickOutside, onClose]);

	return (
		<OptionalPortal {...restPortalProps} withinPortal={withinPortal}>
			<Transition
				{...mergedTransitionProps}
				mounted={opened}
				keepMounted={keepMounted}
			>
				{(transitionStyles) => (
					<RemoveScroll enabled={lockScroll}>
						<LightboxProvider
							value={{
								getStyles,
								transitionStyles,
								overlayProps: mergedOverlayProps,
								mergedRef,
								slideCarouselProps: mergedSlideCarouselProps,
								onSlidesCarouselInit: handleSlidesCarouselInit,
								currentIndex,
								counterLabel,
								thumbnailCarouselProps: mergedThumbnailCarouselProps,
								onThumbnailsCarouselInit: handleThumbnailsCarouselInit,
								onClose,
								onOutsideClick: handleOutsideClick,
								onThumbnailClick: handleThumbnailClick,
								onScrollPrev: handleScrollPrev,
								onScrollNext: handleScrollNext,
							}}
						>
							{children}
						</LightboxProvider>
					</RemoveScroll>
				)}
			</Transition>
		</OptionalPortal>
	);
});

LightboxRoot.displayName = "LightboxRoot";

LightboxRoot.classes = classes;

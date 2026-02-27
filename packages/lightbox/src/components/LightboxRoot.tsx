import type { CarouselProps } from "@mantine/carousel";
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
import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useMemo, useRef, useState } from "react";
import { LightboxProvider } from "../Lightbox.context.js";
import { LIGHTBOX_DEFAULT_PROPS } from "../Lightbox.defaults.js";
import type { LightboxFactory, LightboxProps } from "../Lightbox.js";
import classes from "../Lightbox.module.css";

const defaultProps: Partial<LightboxProps> = LIGHTBOX_DEFAULT_PROPS;

const varsResolver = createVarsResolver<LightboxFactory>(
	(_, { overlayProps }) => ({
		root: {
			"--lightbox-z-index": String(
				overlayProps?.zIndex ?? LIGHTBOX_DEFAULT_PROPS.overlayProps.zIndex,
			),
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
		closeOnClickOutside,
		classNames,
		className,
		style,
		styles,
		unstyled,
		vars,
		children,
		initialSlide,
		counterFormatter,
		carouselOptions,
		thumbnailEmblaOptions,
		overlayProps,
		transitionProps,
		keepMounted,
		trapFocus,
		lockScroll,
		returnFocus,
		withinPortal,
		portalProps,
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

	const mergedOverlayProps = {
		...LIGHTBOX_DEFAULT_PROPS.overlayProps,
		...overlayProps,
	};

	const mergedTransitionProps = {
		...LIGHTBOX_DEFAULT_PROPS.transitionProps,
		...transitionProps,
	};

	const mergedCarouselOptions = useMemo<CarouselProps>(
		() => ({
			...LIGHTBOX_DEFAULT_PROPS.carouselOptions,
			...carouselOptions,
			initialSlide,
		}),
		[carouselOptions, initialSlide],
	);

	const mergedThumbnailEmblaOptions = useMemo(
		() => ({
			...LIGHTBOX_DEFAULT_PROPS.thumbnailEmblaOptions,
			...thumbnailEmblaOptions,
		}),
		[thumbnailEmblaOptions],
	);

	const shouldTrapFocus = trapFocus ?? LIGHTBOX_DEFAULT_PROPS.trapFocus;
	const shouldReturnFocus = returnFocus ?? LIGHTBOX_DEFAULT_PROPS.returnFocus;
	const shouldCloseOnClickOutside =
		closeOnClickOutside ?? LIGHTBOX_DEFAULT_PROPS.closeOnClickOutside;

	const focusTrapRef = useFocusTrap(opened && shouldTrapFocus);
	const mergedRef = useMergedRef(ref, focusTrapRef);
	useFocusReturn({ opened, shouldReturnFocus });

	const slidesEmblaRef = useRef<EmblaCarouselType | null>(null);
	const thumbnailsEmblaRef = useRef<EmblaCarouselType | null>(null);

	const [currentIndex, setCurrentIndex] = useState(
		mergedCarouselOptions?.initialSlide ?? 0,
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
				mergedCarouselOptions.getEmblaApi?.(api);
			};

			const onSelect = (api: EmblaCarouselType) => {
				setCurrentIndex(api.selectedScrollSnap());
				thumbnailsEmblaRef.current?.scrollTo(api.selectedScrollSnap());
			};

			const onDestroy = () => {
				setCurrentIndex(mergedCarouselOptions?.initialSlide ?? 0);
				setTotal(null);
				thumbnailsEmblaRef.current = null;
				slidesEmblaRef.current = null;
			};

			onInit(embla);

			embla.on("select", onSelect);
			embla.on("destroy", onDestroy);
		},
		[mergedCarouselOptions],
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

	return (
		<OptionalPortal {...portalProps} withinPortal={withinPortal}>
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
								mergedCarouselOptions,
								onCarouselEmblaApi: handleEmblaApi,
								currentIndex,
								counterText,
								emblaOptions: mergedThumbnailEmblaOptions,
								onEmblaApi: handleThumbnailsEmblaApi,
								onClose,
								handleOutsideClick,
								onThumbnailClick: handleThumbnailClick,
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

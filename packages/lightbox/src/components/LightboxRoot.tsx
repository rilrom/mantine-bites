import {
	Box,
	factory,
	getDefaultZIndex,
	OptionalPortal,
	Overlay,
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
import { useCallback, useRef, useState } from "react";
import { LightboxProvider } from "../Lightbox.context.js";
import type { LightboxFactory, LightboxProps } from "../Lightbox.js";
import classes from "../Lightbox.module.css";
import { LightboxControls } from "./LightboxControls.js";
import { LightboxCounter } from "./LightboxCounter.js";
import { LightboxSlide } from "./LightboxSlide.js";
import { LightboxSlides } from "./LightboxSlides.js";
import { LightboxThumbnail } from "./LightboxThumbnail.js";
import { LightboxThumbnails } from "./LightboxThumbnails.js";
import { LightboxToolbar } from "./LightboxToolbar.js";

const defaultProps: Partial<LightboxProps> = {
	closeOnClickOutside: true,
	keepMounted: false,
	trapFocus: true,
	lockScroll: true,
	returnFocus: true,
	withinPortal: true,
	transitionProps: {
		transition: "fade",
		duration: 250,
	},
	overlayProps: {
		fixed: true,
		backgroundOpacity: 0.9,
		color: "#18181B",
		zIndex: getDefaultZIndex("modal"),
	},
};

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
		closeOnClickOutside,
		keepMounted,
		trapFocus,
		lockScroll,
		returnFocus,
		withinPortal,
		transitionProps,
		overlayProps,
		...others
	} = props;

	const getStyles = useStyles<LightboxFactory>({
		name: "Lightbox",
		classes,
		props,
		className,
		style,
		classNames,
		styles,
		unstyled,
		vars,
	});

	const _transitionProps = {
		...defaultProps.transitionProps,
		...transitionProps,
	};

	const _overlayProps = { ...defaultProps.overlayProps, ...overlayProps };

	const focusTrapRef = useFocusTrap(opened && trapFocus);
	const mergedRef = useMergedRef(ref, focusTrapRef);
	useFocusReturn({ opened, shouldReturnFocus: returnFocus });

	const slidesEmblaRef = useRef<EmblaCarouselType | null>(null);
	const thumbnailsEmblaRef = useRef<EmblaCarouselType | null>(null);

	const [currentIndex, setCurrentIndex] = useState(0);
	const [slideCount, setSlideCount] = useState<number | null>(null);

	useHotkeys([
		["ArrowLeft", () => opened && slidesEmblaRef.current?.scrollPrev()],
		["ArrowRight", () => opened && slidesEmblaRef.current?.scrollNext()],
		["Escape", () => opened && onClose()],
	]);

	const handleSlidesCarouselInit = useCallback(
		(embla: EmblaCarouselType, initialIndex: number) => {
			slidesEmblaRef.current = embla;

			const handleCarouselInit = (api: EmblaCarouselType) => {
				setSlideCount(api.slideNodes().length);
				setCurrentIndex(initialIndex);
			};

			const handleSlideSelect = (api: EmblaCarouselType) => {
				setCurrentIndex(api.selectedScrollSnap());
				thumbnailsEmblaRef.current?.scrollTo(api.selectedScrollSnap());
			};

			const handleCarouselDestroy = () => {
				setCurrentIndex(0);
				setSlideCount(null);
				thumbnailsEmblaRef.current = null;
				slidesEmblaRef.current = null;
			};

			handleCarouselInit(embla);

			embla.on("select", handleSlideSelect);
			embla.on("destroy", handleCarouselDestroy);
		},
		[],
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
		<OptionalPortal withinPortal={withinPortal}>
			<RemoveScroll enabled={lockScroll && opened}>
				<Transition
					{..._transitionProps}
					mounted={opened}
					keepMounted={keepMounted}
				>
					{(transitionStyles) => (
						<LightboxProvider
							value={{
								getStyles,
								opened,
								currentIndex,
								slideCount,
								onSlidesCarouselInit: handleSlidesCarouselInit,
								onThumbnailsCarouselInit: handleThumbnailsCarouselInit,
								onClose,
								onOutsideClick: handleOutsideClick,
								onThumbnailClick: handleThumbnailClick,
								onScrollPrev: handleScrollPrev,
								onScrollNext: handleScrollNext,
							}}
						>
							<Overlay
								{..._overlayProps}
								{...getStyles("overlay", { style: transitionStyles })}
							/>
							<Box
								ref={mergedRef}
								{...getStyles("root", { style: transitionStyles })}
								{...others}
							>
								{children}
							</Box>
						</LightboxProvider>
					)}
				</Transition>
			</RemoveScroll>
		</OptionalPortal>
	);
});

LightboxRoot.displayName = "LightboxRoot";

LightboxRoot.classes = classes;

LightboxRoot.Root = LightboxRoot;
LightboxRoot.Toolbar = LightboxToolbar;
LightboxRoot.Counter = LightboxCounter;
LightboxRoot.Controls = LightboxControls;
LightboxRoot.Slides = LightboxSlides;
LightboxRoot.Thumbnails = LightboxThumbnails;
LightboxRoot.Thumbnail = LightboxThumbnail;
LightboxRoot.Slide = LightboxSlide;

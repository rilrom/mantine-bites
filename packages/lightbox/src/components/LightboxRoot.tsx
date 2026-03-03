import {
	Box,
	type BoxProps,
	type ElementProps,
	type Factory,
	factory,
	getDefaultZIndex,
	OptionalPortal,
	Overlay,
	type OverlayProps,
	RemoveScroll,
	type StylesApiProps,
	Transition,
	type TransitionOverride,
	useProps,
	useStyles,
} from "@mantine/core";
import {
	useFocusReturn,
	useFocusTrap,
	useFullscreen,
	useHotkeys,
	useMergedRef,
} from "@mantine/hooks";
import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useRef, useState } from "react";
import { LightboxProvider } from "../context/LightboxContext.js";
import { useAutoPlay } from "../hooks/useAutoPlay.js";
import { useZoom } from "../hooks/useZoom.js";
import classes from "../styles/Lightbox.module.css";
import { LightboxAutoplayButton } from "./LightboxAutoplayButton.js";
import { LightboxCloseButton } from "./LightboxCloseButton.js";
import { LightboxControls } from "./LightboxControls.js";
import { LightboxCounter } from "./LightboxCounter.js";
import { LightboxFullscreenButton } from "./LightboxFullscreenButton.js";
import { LightboxSlide } from "./LightboxSlide.js";
import { LightboxSlides } from "./LightboxSlides.js";
import { LightboxThumbnail } from "./LightboxThumbnail.js";
import { LightboxThumbnails } from "./LightboxThumbnails.js";
import { LightboxToolbar } from "./LightboxToolbar.js";
import { LightboxZoomButton } from "./LightboxZoomButton.js";

export type LightboxRootStylesNames =
	| "root"
	| "overlay"
	| "slides"
	| "slidesViewport"
	| "slidesContainer"
	| "control"
	| "slide"
	| "zoomContainer"
	| "zoomContent"
	| "autoplayButton"
	| "zoomButton"
	| "fullscreenButton"
	| "toolbar"
	| "closeButton"
	| "counter"
	| "thumbnails"
	| "thumbnailsViewport"
	| "thumbnailsContainer"
	| "thumbnail"
	| "thumbnailButton";

export interface LightboxRootProps
	extends BoxProps,
		StylesApiProps<LightboxRootFactory>,
		ElementProps<"div"> {
	/** Whether the lightbox is open */
	opened: boolean;
	/** Called when the lightbox requests to close */
	onClose: () => void;
	/** Whether to close when clicking outside the content, `true` by default */
	closeOnClickOutside?: boolean;
	/** Whether to keep content mounted when closed, `false` by default */
	keepMounted?: boolean;
	/** Whether to trap focus while open, `true` by default */
	trapFocus?: boolean;
	/** Whether to return focus to the trigger on close, `true` by default */
	returnFocus?: boolean;
	/** Whether to lock page scroll while open, `true` by default */
	lockScroll?: boolean;
	/** Whether to show the zoom toggle button in the toolbar, `true` by default */
	withZoom?: boolean;
	/** Whether to show the fullscreen toggle button in the toolbar, `true` by default */
	withFullscreen?: boolean;
	/** Whether to render inside a portal, `true` by default */
	withinPortal?: boolean;
	/** Props passed to the `Transition` component */
	transitionProps?: TransitionOverride;
	/** Props passed to the `Overlay` component */
	overlayProps?: OverlayProps;
	/** Layout and scroll direction of the lightbox, `'horizontal'` by default */
	orientation?: "horizontal" | "vertical";
}

export type LightboxRootFactory = Factory<{
	props: LightboxRootProps;
	ref: HTMLDivElement;
	stylesNames: LightboxRootStylesNames;
	staticComponents: {
		Root: typeof LightboxRoot;
		Toolbar: typeof LightboxToolbar;
		Counter: typeof LightboxCounter;
		Controls: typeof LightboxControls;
		Slides: typeof LightboxSlides;
		Thumbnails: typeof LightboxThumbnails;
		Thumbnail: typeof LightboxThumbnail;
		Slide: typeof LightboxSlide;
		CloseButton: typeof LightboxCloseButton;
		ZoomButton: typeof LightboxZoomButton;
		FullscreenButton: typeof LightboxFullscreenButton;
		AutoplayButton: typeof LightboxAutoplayButton;
	};
}>;

const defaultProps = {
	closeOnClickOutside: true,
	keepMounted: false,
	trapFocus: true,
	lockScroll: true,
	returnFocus: true,
	withinPortal: true,
	withZoom: true,
	withFullscreen: true,
	orientation: "horizontal",
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
} satisfies Partial<LightboxRootProps>;

export const LightboxRoot = factory<LightboxRootFactory>((_props, ref) => {
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
		orientation,
		withZoom,
		withFullscreen,
		...others
	} = props;

	const getStyles = useStyles<LightboxRootFactory>({
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

	const {
		isZoomed,
		isZoomedRef,
		isDraggingZoom,
		zoomOffset,
		zoomScale,
		canZoomCurrent,
		activeZoomContainerRef,
		resetZoom,
		toggleZoom,
		updateCanZoomAvailability,
		handleZoomPointerDown,
		handleZoomPointerMove,
		handleZoomPointerEnd,
	} = useZoom({ opened, withZoom });

	const {
		canAutoPlay,
		isPlaying,
		toggleAutoPlay,
		notifyAutoPlayInteraction,
		handleEmblaApiForAutoPlay,
	} = useAutoPlay();

	const { fullscreen: isFullscreen, toggle: toggleFullscreen } =
		useFullscreen();

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

	useHotkeys([
		[
			"ArrowLeft",
			() =>
				orientation === "horizontal" &&
				opened &&
				slidesEmblaRef.current?.scrollPrev(),
		],
		[
			"ArrowRight",
			() =>
				orientation === "horizontal" &&
				opened &&
				slidesEmblaRef.current?.scrollNext(),
		],
		[
			"ArrowUp",
			() =>
				orientation === "vertical" &&
				opened &&
				slidesEmblaRef.current?.scrollPrev(),
		],
		[
			"ArrowDown",
			() =>
				orientation === "vertical" &&
				opened &&
				slidesEmblaRef.current?.scrollNext(),
		],
		["Escape", () => opened && onClose()],
	]);

	const handleSlideChange = useCallback(
		(index: number) => {
			setCurrentIndex(index);
			resetZoom();
			requestAnimationFrame(updateCanZoomAvailability);
		},
		[resetZoom, updateCanZoomAvailability],
	);

	const handleThumbnailClick = useCallback(
		(index: number) => {
			notifyAutoPlayInteraction();
			slidesEmblaRef.current?.scrollTo(index);

			resetZoom();
		},
		[notifyAutoPlayInteraction, resetZoom],
	);

	const handleScrollPrev = useCallback(() => {
		notifyAutoPlayInteraction();
		slidesEmblaRef.current?.scrollPrev();
	}, [notifyAutoPlayInteraction]);

	const handleScrollNext = useCallback(() => {
		notifyAutoPlayInteraction();
		slidesEmblaRef.current?.scrollNext();
	}, [notifyAutoPlayInteraction]);

	const handleOutsideClick = useCallback(() => {
		if (!closeOnClickOutside) {
			return;
		}

		onClose();
	}, [closeOnClickOutside, onClose]);

	const handleToggleZoom = useCallback(() => {
		notifyAutoPlayInteraction();
		toggleZoom();
	}, [notifyAutoPlayInteraction, toggleZoom]);

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
								slidesEmblaRef,
								thumbnailsEmblaRef,
								setCurrentIndex: handleSlideChange,
								setSlideCount,
								onClose,
								onOutsideClick: handleOutsideClick,
								onThumbnailClick: handleThumbnailClick,
								onScrollPrev: handleScrollPrev,
								onScrollNext: handleScrollNext,
								orientation,
								canAutoPlay,
								isPlaying,
								toggleAutoPlay,
								onSlidesEmblaApi: handleEmblaApiForAutoPlay,
								withFullscreen,
								isFullscreen,
								toggleFullscreen,
								withZoom,
								isZoomed,
								isZoomedRef,
								isDraggingZoom,
								canZoomCurrent,
								zoomOffset,
								zoomScale,
								activeZoomContainerRef,
								toggleZoom: handleToggleZoom,
								updateCanZoomAvailability,
								handleZoomPointerDown,
								handleZoomPointerMove,
								handleZoomPointerEnd,
							}}
						>
							<Overlay
								{..._overlayProps}
								{...getStyles("overlay", { style: transitionStyles })}
							/>
							<Box
								ref={mergedRef}
								{...getStyles("root", { style: transitionStyles })}
								data-orientation={orientation}
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
LightboxRoot.CloseButton = LightboxCloseButton;
LightboxRoot.ZoomButton = LightboxZoomButton;
LightboxRoot.FullscreenButton = LightboxFullscreenButton;
LightboxRoot.AutoplayButton = LightboxAutoplayButton;

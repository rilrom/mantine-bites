import { Carousel, type CarouselProps } from "@mantine/carousel";
import {
	type BasePortalProps,
	Box,
	type BoxProps,
	createVarsResolver,
	type ElementProps,
	type Factory,
	factory,
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
import type { EmblaOptionsType } from "embla-carousel";
import { LightboxCounter } from "./components/LightboxCounter.js";
import { LightboxSlides } from "./components/LightboxSlides.js";
import { LightboxThumbnails } from "./components/LightboxThumbnails.js";
import { LightboxToolbar } from "./components/LightboxToolbar.js";
import { useLightbox } from "./hooks/useLightbox.js";
import { LightboxProvider } from "./Lightbox.context.js";
import { LIGHTBOX_DEFAULT_PROPS } from "./Lightbox.defaults.js";
import classes from "./Lightbox.module.css";
import { LightboxSlide } from "./LightboxSlide.js";

export type LightboxCssVariables = {
	root: "--lightbox-z-index";
	overlay: "--lightbox-z-index" | "--overlay-z-index";
};

export type LightboxStylesNames =
	| "root"
	| "overlay"
	| "slides"
	| "slide"
	| "zoomContainer"
	| "zoomContent"
	| "toolbar"
	| "fullscreenButton"
	| "zoomButton"
	| "closeButton"
	| "autoplayButton"
	| "counter"
	| "thumbnails"
	| "thumbnailsViewport"
	| "thumbnailsContainer"
	| "thumbnailSlide"
	| "thumbnailButton"
	| "thumbnailPlaceholder";

export type LightboxCarouselOptions = Omit<
	CarouselProps,
	"withKeyboardEvents" | "withIndicators"
>;

export type LightboxThumbnailEmblaOptions = EmblaOptionsType;

export interface LightboxProps
	extends BoxProps,
		StylesApiProps<LightboxFactory>,
		ElementProps<"div"> {
	/**
	 * Controls whether the lightbox is visible.
	 */
	opened: boolean;

	/**
	 * Callback invoked when the lightbox requests to close.
	 */
	onClose: () => void;

	/**
	 * Keeps the lightbox mounted in the DOM when it is not visible.
	 * @default false
	 */
	keepMounted?: boolean;

	/**
	 * Closes the lightbox when a pointer interaction occurs outside its content area.
	 * @default true
	 */
	closeOnClickOutside?: boolean;

	/**
	 * Constrains keyboard focus to elements within the lightbox while it is open.
	 * @default true
	 */
	trapFocus?: boolean;

	/**
	 * Restores focus to the previously focused element after the lightbox closes.
	 * @default true
	 */
	returnFocus?: boolean;

	/**
	 * Prevents background document scrolling while the lightbox is open.
	 * @default true
	 */
	lockScroll?: boolean;

	/**
	 * Renders thumbnail previews for navigating between slides.
	 * @default true
	 */
	withThumbnails?: boolean;

	/**
	 * Displays the current slide index and total slide count.
	 * @default true
	 */
	withCounter?: boolean;

	/**
	 * Shows a control that toggles fullscreen mode for the lightbox.
	 * @default true
	 */
	withFullscreen?: boolean;

	/**
	 * Shows a control that toggles zoom functionality for the active slide.
	 * @default true
	 */
	withZoom?: boolean;

	/**
	 * Formats the slide counter output based on the current index and total count.
	 * @default (index, total) => `${index + 1} / ${total}`
	 */
	counterFormatter?: (index: number, total: number) => string;

	/**
	 * Configuration options forwarded to the underlying Carousel instance.
	 */
	carouselOptions?: LightboxCarouselOptions;

	/**
	 * Configuration options used by the thumbnail strip Embla instance.
	 */
	thumbnailEmblaOptions?: LightboxThumbnailEmblaOptions;

	/**
	 * Props forwarded to the Overlay component that renders the backdrop.
	 */
	overlayProps?: OverlayProps;

	/**
	 * Transition configuration applied to the lightbox content container.
	 */
	transitionProps?: TransitionOverride;

	/**
	 * Renders the lightbox inside a React Portal instead of the current DOM hierarchy.
	 * @default true
	 */
	withinPortal?: boolean;

	/**
	 * Props forwarded to the Portal component when portal rendering is enabled.
	 */
	portalProps?: BasePortalProps;
}

export type LightboxFactory = Factory<{
	props: LightboxProps;
	ref: HTMLDivElement;
	stylesNames: LightboxStylesNames;
	vars: LightboxCssVariables;
	staticComponents: {
		Slide: typeof LightboxSlide;
	};
}>;

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

export const Lightbox = factory<LightboxFactory>((_props, ref) => {
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
		withThumbnails,
		withCounter,
		withFullscreen,
		withZoom,
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

	const _carouselOptions = {
		...LIGHTBOX_DEFAULT_PROPS.carouselOptions,
		...carouselOptions,
	};

	const _thumbnailEmblaOptions = {
		...LIGHTBOX_DEFAULT_PROPS.thumbnailEmblaOptions,
		...thumbnailEmblaOptions,
	};

	const _overlayProps = {
		...LIGHTBOX_DEFAULT_PROPS.overlayProps,
		...overlayProps,
	};

	const _transitionProps = {
		...LIGHTBOX_DEFAULT_PROPS.transitionProps,
		...transitionProps,
	};

	const {
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
		toggleZoom,
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
	} = useLightbox({
		ref,
		opened,
		withZoom,
		onClose,
		closeOnClickOutside,
		trapFocus,
		returnFocus,
		children,
		carouselOptions: _carouselOptions,
		thumbnailEmblaOptions: _thumbnailEmblaOptions,
		counterFormatter,
	});

	return (
		<OptionalPortal {...portalProps} withinPortal={withinPortal}>
			<Transition
				{..._transitionProps}
				mounted={opened}
				keepMounted={keepMounted}
			>
				{(transitionStyles) => (
					<RemoveScroll enabled={lockScroll}>
						<Overlay
							{..._overlayProps}
							{...getStyles("overlay", {
								className: _overlayProps.className,
								style: [transitionStyles, overlayProps?.style],
							})}
						/>
						<LightboxProvider
							value={{
								getStyles,
								slides,
								currentIndex,
								counterText,
								withFullscreen,
								withZoom,
								isFullscreen,
								onToggleFullscreen: toggleFullscreen,
								onToggleZoom: toggleZoom,
								isZoomed,
								isDraggingZoom,
								canZoomCurrent,
								zoomOffset,
								zoomScale,
								activeZoomContainerRef,
								updateCanZoomAvailability,
								handleZoomPointerDown,
								handleZoomPointerMove,
								handleZoomPointerEnd,
								onClose,
								handleOutsideClick,
								onThumbnailClick: handleThumbnailClick,
								emblaOptions: mergedThumbnailEmblaOptions,
								onEmblaApi: handleThumbnailsEmblaApi,
								canUseAutoPlay,
								isPlaying,
								onToggleAutoPlay: toggleAutoPlay,
							}}
						>
							<Box
								ref={mergedRef}
								{...getStyles("root", { style: transitionStyles })}
							>
								<LightboxToolbar />

								{withCounter && <LightboxCounter />}

								<Carousel
									includeGapInSize={false}
									slideSize="100%"
									height="100%"
									{...mergedCarouselOptions}
									{...getStyles("slides")}
									withIndicators={false}
									withKeyboardEvents={false}
									onSlideChange={handleSlideChange}
									getEmblaApi={handleEmblaApi}
								>
									<LightboxSlides />
								</Carousel>

								{withThumbnails && <LightboxThumbnails />}
							</Box>
						</LightboxProvider>
					</RemoveScroll>
				)}
			</Transition>
		</OptionalPortal>
	);
});

Lightbox.displayName = "Lightbox";

Lightbox.classes = classes;

Lightbox.Slide = LightboxSlide;

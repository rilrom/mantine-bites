import { Carousel, type CarouselProps } from "@mantine/carousel";
import {
	Box,
	type BoxProps,
	createVarsResolver,
	type ElementProps,
	type Factory,
	factory,
	OptionalPortal,
	Overlay,
	type OverlayProps,
	type PortalProps,
	RemoveScroll,
	type StylesApiProps,
	Text,
	Transition,
	type TransitionProps,
	useProps,
	useStyles,
} from "@mantine/core";
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
	| "counter"
	| "thumbnails"
	| "thumbnailButton"
	| "thumbnailPlaceholder";

export type LightboxCarouselOptions = Omit<
	CarouselProps,
	"withKeyboardEvents" | "withIndicators"
>;

export interface LightboxProps
	extends BoxProps,
		StylesApiProps<LightboxFactory>,
		ElementProps<"div"> {
	/** Controls lightbox visibility */
	opened: boolean;

	/** Called when lightbox should close */
	onClose: () => void;

	/** Determines whether outside click should call `onClose`, `true` by default */
	closeOnClickOutside?: boolean;

	/** Determines whether thumbnail images should be displayed, `true` by default */
	withThumbnails?: boolean;

	/** Determines whether the slide counter should be displayed, `true` by default */
	withCounter?: boolean;

	/** Determines whether fullscreen toggle button should be displayed, `true` by default */
	withFullscreen?: boolean;

	/** Determines whether zoom toggle button should be displayed, `true` by default */
	withZoom?: boolean;

	/** Custom counter format function, `"1 / 3"` by default */
	counterFormatter?: (index: number, total: number) => string;

	/** Props passed to the underlying `Carousel` component */
	carouselOptions?: LightboxCarouselOptions;

	/** Props passed to the `Overlay` component */
	overlayProps?: OverlayProps;

	/** Props passed to the `Transition` component */
	transitionProps?: Omit<
		TransitionProps,
		"mounted" | "keepMounted" | "children"
	>;

	/** Determines whether the lightbox should be kept in the DOM when closed, `false` by default */
	keepMounted?: boolean;

	/** Determines whether focus should be trapped within the lightbox, `true` by default */
	trapFocus?: boolean;

	/** Determines whether scroll should be locked when lightbox is opened, `true` by default */
	lockScroll?: boolean;

	/** Determines whether focus should be returned to the last active element when lightbox is closed, `true` by default */
	returnFocus?: boolean;

	/** Determines whether the lightbox should be rendered inside a `Portal`, `true` by default */
	withinPortal?: boolean;

	/** Props passed to the `Portal` component */
	portalProps?: Omit<PortalProps, "withinPortal" | "children">;
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
	} = useLightbox({
		ref,
		opened,
		onClose,
		closeOnClickOutside,
		trapFocus,
		returnFocus,
		children,
		carouselOptions: _carouselOptions,
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
								withFullscreen,
								withZoom,
								isFullscreen,
								canUseFullscreen,
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
							}}
						>
							<Box
								ref={mergedRef}
								{...getStyles("root", { style: transitionStyles })}
							>
								<LightboxToolbar />

								{withCounter && (
									<Text size="sm" {...getStyles("counter")}>
										{counterText}
									</Text>
								)}

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

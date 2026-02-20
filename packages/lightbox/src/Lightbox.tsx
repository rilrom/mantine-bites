import { Carousel, type CarouselProps } from "@mantine/carousel";
import {
	Box,
	type BoxProps,
	type ElementProps,
	type Factory,
	factory,
	Modal,
	type ModalProps,
	type StylesApiProps,
	Text,
	useProps,
	useStyles,
} from "@mantine/core";
import { LightboxSlides } from "./components/LightboxSlides.js";
import { LightboxThumbnails } from "./components/LightboxThumbnails.js";
import { LightboxToolbar } from "./components/LightboxToolbar.js";
import { useLightbox } from "./hooks/useLightbox.js";
import { LightboxProvider } from "./Lightbox.context.js";
import classes from "./Lightbox.module.css";
import { LightboxSlide } from "./LightboxSlide.js";

export type LightboxStylesNames =
	| "root"
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

export type LightboxCarouselOptions = Omit<CarouselProps, "withKeyboardEvents">;

export type LightboxModalOptions = Omit<
	ModalProps,
	"fullScreen" | "title" | "withCloseButton" | "opened" | "onClose"
>;

export interface LightboxProps
	extends BoxProps,
		StylesApiProps<LightboxFactory>,
		ElementProps<"div", "onChange"> {
	/** Controls lightbox visibility */
	opened: boolean;

	/** Called when lightbox should close */
	onClose: () => void;

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

	/** Props passed to the underlying `Modal` component */
	modalOptions?: LightboxModalOptions;
}

export type LightboxFactory = Factory<{
	props: LightboxProps;
	ref: HTMLDivElement;
	stylesNames: LightboxStylesNames;
	staticComponents: {
		Slide: typeof LightboxSlide;
	};
}>;

const defaultProps: Partial<LightboxProps> = {
	withThumbnails: true,
	withCounter: true,
	withFullscreen: true,
	withZoom: true,
	carouselOptions: {
		controlSize: 36,
	},
};

export const Lightbox = factory<LightboxFactory>((_props, ref) => {
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
		withThumbnails,
		withCounter,
		withFullscreen,
		withZoom,
		counterFormatter,
		carouselOptions,
		modalOptions,
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

	const {
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
		mergedCarouselOptions,
	} = useLightbox({
		opened,
		children,
		carouselOptions,
		counterFormatter,
	});

	return (
		<Modal
			centered
			radius={0}
			padding={0}
			xOffset={0}
			yOffset={0}
			{...modalOptions}
			opened={opened}
			onClose={onClose}
			fullScreen={true}
			title={undefined}
			withCloseButton={false}
			overlayProps={{
				backgroundOpacity: 0.95,
				color: "#18181B",
				...modalOptions?.overlayProps,
			}}
			styles={{
				...modalOptions?.styles,
				inner: {
					...modalOptions?.styles?.inner,
					left: 0,
					right: 0,
				},
				content: {
					...modalOptions?.styles?.content,
					background: "transparent",
				},
			}}
		>
			<LightboxProvider value={{ getStyles }}>
				<Box ref={ref} {...getStyles("root")} {...others}>
					<LightboxToolbar
						withFullscreen={withFullscreen}
						withZoom={withZoom}
						isFullscreen={isFullscreen}
						canUseFullscreen={canUseFullscreen}
						onToggleFullscreen={toggleFullscreen}
						isZoomed={isZoomed}
						canZoomCurrent={canZoomCurrent}
						onToggleZoom={toggleZoom}
						onClose={onClose}
						getStyles={getStyles}
					/>

					{withCounter && (
						<Text size="sm" {...getStyles("counter")}>
							{counterText}
						</Text>
					)}

					<Carousel
						slideGap={0}
						includeGapInSize={false}
						withIndicators={false}
						slideSize="100%"
						height="100%"
						{...mergedCarouselOptions}
						{...getStyles("slides")}
						withKeyboardEvents={false}
						onSlideChange={handleSlideChange}
						getEmblaApi={handleEmblaApi}
					>
						<LightboxSlides
							slides={slides}
							currentIndex={currentIndex}
							isZoomed={isZoomed}
							isDraggingZoom={isDraggingZoom}
							canZoomCurrent={canZoomCurrent}
							zoomOffset={zoomOffset}
							zoomScale={zoomScale}
							activeZoomContainerRef={activeZoomContainerRef}
							updateCanZoomAvailability={updateCanZoomAvailability}
							handleZoomPointerDown={handleZoomPointerDown}
							handleZoomPointerMove={handleZoomPointerMove}
							handleZoomPointerEnd={handleZoomPointerEnd}
							getStyles={getStyles}
						/>
					</Carousel>

					{withThumbnails && (
						<LightboxThumbnails
							slides={slides}
							currentIndex={currentIndex}
							onThumbnailClick={handleThumbnailClick}
							getStyles={getStyles}
						/>
					)}
				</Box>
			</LightboxProvider>
		</Modal>
	);
});

Lightbox.displayName = "Lightbox";

Lightbox.classes = classes;

Lightbox.Slide = LightboxSlide;

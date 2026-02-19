import { Carousel, type CarouselProps } from "@mantine/carousel";
import {
	ActionIcon,
	Box,
	type BoxProps,
	CloseIcon,
	type ElementProps,
	type Factory,
	factory,
	Modal,
	type ModalProps,
	type StylesApiProps,
	Text,
	UnstyledButton,
	useProps,
	useStyles,
} from "@mantine/core";
import type { EmblaCarouselType } from "embla-carousel";
import {
	Children,
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { EnterFullscreen } from "./components/EnterFullscreen.js";
import { ExitFullscreen } from "./components/ExitFullscreen.js";
import { QuestionMark } from "./components/QuestionMark.js";
import { ZoomIn } from "./components/ZoomIn.js";
import { ZoomOut } from "./components/ZoomOut.js";
import { useZoom } from "./hooks/useZoom.js";
import { LightboxProvider } from "./Lightbox.context.js";
import classes from "./Lightbox.module.css";
import { LightboxSlide } from "./LightboxSlide.js";
import {
	canToggleBrowserFullscreen,
	exitBrowserFullscreenIfActive,
	isBrowserFullscreen,
	toggleBrowserFullscreen,
} from "./utils/fullscreen.js";
import { getZoomTransform } from "./utils/zoom.js";

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

	const emblaRef = useRef<EmblaCarouselType | null>(null);

	const [currentIndex, setCurrentIndex] = useState(
		carouselOptions?.initialSlide ?? 0,
	);

	const [isFullscreen, setIsFullscreen] = useState(isBrowserFullscreen);

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

	const slides = Children.toArray(children).filter(isValidElement);

	const total = slides.length;

	const canUseFullscreen = canToggleBrowserFullscreen();

	const counterText = counterFormatter
		? counterFormatter(currentIndex, total)
		: `${currentIndex + 1} / ${total}`;

	const handleEmblaApi = useCallback(
		(embla: EmblaCarouselType) => {
			emblaRef.current = embla;
			carouselOptions?.getEmblaApi?.(embla);
		},
		[carouselOptions?.getEmblaApi],
	);

	const toggleFullscreen = useCallback(async () => {
		if (!canUseFullscreen) {
			return;
		}

		await toggleBrowserFullscreen();
	}, [canUseFullscreen]);

	const handleSlideChange = useCallback(
		(index: number) => {
			setCurrentIndex(index);
			resetZoom();
			requestAnimationFrame(updateCanZoomAvailability);
			carouselOptions?.onSlideChange?.(index);
		},
		[carouselOptions?.onSlideChange, resetZoom, updateCanZoomAvailability],
	);

	useEffect(() => {
		if (!opened) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft") {
				emblaRef.current?.scrollPrev();
			} else if (event.key === "ArrowRight") {
				emblaRef.current?.scrollNext();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [opened]);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(isBrowserFullscreen());
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () =>
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, []);

	useEffect(() => {
		if (!opened) {
			setCurrentIndex(carouselOptions?.initialSlide ?? 0);

			void exitBrowserFullscreenIfActive();
		}
	}, [opened, carouselOptions?.initialSlide]);

	const renderedSlides = slides.map((slide, index) => {
		const isActive = index === currentIndex;
		const isActiveAndZoomed = isActive && isZoomed;

		const typedSlide = slide as ReactElement<{ children?: ReactNode }>;
		const slideProps = typedSlide.props;

		return cloneElement(typedSlide, {
			children: (
				<Box
					ref={isActive ? activeZoomContainerRef : undefined}
					{...getStyles("zoomContainer")}
					data-active={isActive || undefined}
					data-zoomed={isActiveAndZoomed || undefined}
					data-can-zoom={isActive ? String(canZoomCurrent) : undefined}
					data-dragging={(isDraggingZoom && isActiveAndZoomed) || undefined}
					onPointerDown={(event) =>
						handleZoomPointerDown(
							event,
							isActive,
							isActiveAndZoomed,
							isActive ? canZoomCurrent : false,
						)
					}
					onPointerMove={(event) =>
						handleZoomPointerMove(event, isActiveAndZoomed)
					}
					onPointerUp={handleZoomPointerEnd}
					onPointerCancel={handleZoomPointerEnd}
					onLoadCapture={(event) => {
						if (isActive && event.target instanceof HTMLImageElement) {
							updateCanZoomAvailability();
						}
					}}
				>
					<Box
						{...getStyles("zoomContent")}
						style={{
							transform: getZoomTransform({
								isZoomed: isActiveAndZoomed,
								offset: zoomOffset,
								scale: zoomScale,
							}),
						}}
					>
						{slideProps.children}
					</Box>
				</Box>
			),
		});
	});

	const mergedCarouselOptions = useMemo(
		() => ({
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
		}),
		[carouselOptions, isZoomedRef],
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
					<ActionIcon.Group {...getStyles("toolbar")}>
						{withFullscreen && (
							<ActionIcon
								variant="default"
								size="lg"
								onClick={toggleFullscreen}
								aria-label={`${isFullscreen ? "Exit" : "Enter"} fullscreen`}
								disabled={!canUseFullscreen}
								{...getStyles("fullscreenButton")}
							>
								{isFullscreen ? <ExitFullscreen /> : <EnterFullscreen />}
							</ActionIcon>
						)}

						{withZoom && (
							<ActionIcon
								variant="default"
								size="lg"
								onClick={toggleZoom}
								aria-label={isZoomed ? "Zoom out" : "Zoom in"}
								disabled={!canZoomCurrent}
								{...getStyles("zoomButton")}
							>
								{isZoomed ? <ZoomOut /> : <ZoomIn />}
							</ActionIcon>
						)}

						<ActionIcon
							variant="default"
							size="lg"
							onClick={onClose}
							aria-label="Close lightbox"
							{...getStyles("closeButton")}
						>
							<CloseIcon />
						</ActionIcon>
					</ActionIcon.Group>

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
						{renderedSlides}
					</Carousel>

					{withThumbnails && (
						<Box {...getStyles("thumbnails")}>
							{slides.map((slide, i) => {
								const { thumbnail } = slide.props as {
									thumbnail?: ReactNode;
								};

								return (
									<UnstyledButton
										key={slide.key ?? i}
										onClick={() => handleThumbnailClick(i)}
										aria-label={`Go to slide ${i + 1}`}
										aria-current={i === currentIndex ? "true" : undefined}
										data-active={i === currentIndex || undefined}
										{...getStyles("thumbnailButton")}
									>
										{thumbnail ?? (
											<Box {...getStyles("thumbnailPlaceholder")}>
												<QuestionMark />
											</Box>
										)}
									</UnstyledButton>
								);
							})}
						</Box>
					)}
				</Box>
			</LightboxProvider>
		</Modal>
	);
});

Lightbox.displayName = "Lightbox";

Lightbox.classes = classes;

Lightbox.Slide = LightboxSlide;

import { Carousel } from "@mantine/carousel";
import {
	ActionIcon,
	Box,
	type BoxProps,
	CloseIcon,
	createVarsResolver,
	type ElementProps,
	type Factory,
	factory,
	Modal,
	type StylesApiProps,
	Text,
	UnstyledButton,
	useProps,
	useStyles,
} from "@mantine/core";
import type { EmblaCarouselType } from "embla-carousel";
import {
	Children,
	isValidElement,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { LightboxProvider } from "./Lightbox.context.js";
import classes from "./Lightbox.module.css";
import { LightboxSlide } from "./LightboxSlide.js";

export type LightboxStylesNames =
	| "root"
	| "slides"
	| "slide"
	| "toolbar"
	| "closeButton"
	| "control"
	| "counter"
	| "thumbnails"
	| "thumbnailButton"
	| "thumbnailPlaceholder";

export type LightboxCssVariables = {
	root:
		| "--lightbox-color"
		| "--lightbox-thumbnail-size"
		| "--lightbox-thumbnail-radius"
		| "--lightbox-thumbnail-highlight";
};

export interface LightboxProps
		extends BoxProps,
			StylesApiProps<LightboxFactory>,
			ElementProps<"div", "onChange"> {
		/** Controls lightbox visibility */
		opened: boolean;

		/** Called when lightbox should close */
		onClose: () => void;

		/** Initial slide index, `0` by default */
		initialSlide?: number;

		/** Called when active slide changes */
		onSlideChange?: (index: number) => void;

		/** Whether navigation wraps around, `true` by default */
		loop?: boolean;

		/** Show prev/next arrow controls, `true` by default */
		withControls?: boolean;

		/** Show thumbnail strip, `true` by default */
		withThumbnails?: boolean;

		/** Show slide counter, `true` by default */
		withCounter?: boolean;

		/** Enable zoom (WIP), `true` by default */
		withZoom?: boolean;

		/** Enable fullscreen (WIP), `true` by default */
		withFullscreen?: boolean;

		/** Enable autoplay (WIP), `true` by default */
		withAutoPlay?: boolean;

		/** Custom counter format function, default: `"1 / 3"` */
		counterFormatter?: (index: number, total: number) => string;

		/** Custom previous control icon */
		previousControlIcon?: ReactNode;

		/** Custom next control icon */
		nextControlIcon?: ReactNode;
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

const defaultProps: Partial<LightboxProps> = {
	loop: true,
	withControls: true,
	withThumbnails: true,
	withCounter: true,
};

const varsResolver = createVarsResolver<LightboxFactory>((_theme) => ({
	root: {
		"--lightbox-color": "var(--mantine-color-white)",
		"--lightbox-thumbnail-size": "48px",
		"--lightbox-thumbnail-radius": "var(--mantine-radius-sm)",
		"--lightbox-thumbnail-highlight": "var(--mantine-primary-color-filled)",
	},
}));

const QuestionMark = () => (
	<svg
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
		<path d="M12 17h.01" />
	</svg>
);

const ChevronLeft = () => (
	<svg
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="m15 18-6-6 6-6" />
	</svg>
);

const ChevronRight = () => (
	<svg
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="m9 18 6-6-6-6" />
	</svg>
);

export const Lightbox = factory<LightboxFactory>((_props, ref) => {
	const props = useProps("Lightbox", defaultProps, _props);
	const {
		classNames,
		className,
		style,
		styles,
		unstyled,
		vars,
		opened,
		onClose,
		initialSlide,
		onSlideChange,
		loop,
		withControls,
		withThumbnails,
		withCounter,
		withZoom: _withZoom,
		withFullscreen: _withFullscreen,
		withAutoPlay: _withAutoPlay,
		counterFormatter,
		previousControlIcon,
		nextControlIcon,
		children,
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
		varsResolver,
	});

	const slides = Children.toArray(children).filter(isValidElement);
	const total = slides.length;

	const emblaRef = useRef<EmblaCarouselType | null>(null);

	const [currentIndex, setCurrentIndex] = useState(initialSlide ?? 0);
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);

	const handleSlideChange = useCallback(
		(index: number) => {
			setCurrentIndex(index);
			onSlideChange?.(index);
		},
		[onSlideChange],
	);

	const updateCanScroll = useCallback(() => {
		const api = emblaRef.current;
		if (api) {
			setCanScrollPrev(api.canScrollPrev());
			setCanScrollNext(api.canScrollNext());
		}
	}, []);

	const handleEmblaApi = useCallback(
		(api: EmblaCarouselType) => {
			emblaRef.current = api;
			updateCanScroll();
			api.on("select", updateCanScroll);
			api.on("init", updateCanScroll);
		},
		[updateCanScroll],
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

	const counterText = counterFormatter
		? counterFormatter(currentIndex, total)
		: `${currentIndex + 1} / ${total}`;

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			fullScreen={true}
			withCloseButton={false}
			radius={0}
			padding={0}
			xOffset={0}
			yOffset={0}
			styles={{
				inner: {
					left: 0,
					right: 0,
				},
				content: {
					background: "transparent",
				},
			}}
			overlayProps={{
				style: {
					backgroundColor: "rgba(24, 24, 27, .95)",
				},
			}}
		>
			<LightboxProvider value={{ getStyles }}>
				<Box ref={ref} {...getStyles("root")} {...others}>
					<ActionIcon.Group {...getStyles("toolbar")}>
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

					{withControls && (
						<ActionIcon
							variant="filled"
							color="gray"
							size="xl"
							radius="xl"
							onClick={() => emblaRef.current?.scrollPrev()}
							disabled={!canScrollPrev}
							aria-label="Previous image"
							data-position="previous"
							{...getStyles("control")}
						>
							{previousControlIcon ?? <ChevronLeft />}
						</ActionIcon>
					)}

					<Carousel
						withControls={false}
						height="100%"
						slideSize="100%"
						slideGap={0}
						emblaOptions={{ loop }}
						initialSlide={initialSlide}
						onSlideChange={handleSlideChange}
						getEmblaApi={handleEmblaApi}
						{...getStyles("slides")}
					>
						{children}
					</Carousel>

					{withControls && (
						<ActionIcon
							variant="filled"
							color="gray"
							size="xl"
							radius="xl"
							onClick={() => emblaRef.current?.scrollNext()}
							disabled={!canScrollNext}
							aria-label="Next image"
							data-position="next"
							{...getStyles("control")}
						>
							{nextControlIcon ?? <ChevronRight />}
						</ActionIcon>
					)}

					{withThumbnails && (
						<Box {...getStyles("thumbnails")}>
							{slides.map((slide, i) => {
								const { thumbnail } = slide.props as {
									thumbnail?: ReactNode;
								};

								return (
									<UnstyledButton
										key={slide.key ?? i}
										onClick={() => emblaRef.current?.scrollTo(i)}
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

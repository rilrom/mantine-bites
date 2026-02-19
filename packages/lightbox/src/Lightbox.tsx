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
	isValidElement,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { QuestionMark } from "./components/QuestionMark.js";
import { LightboxProvider } from "./Lightbox.context.js";
import classes from "./Lightbox.module.css";
import { LightboxSlide } from "./LightboxSlide.js";

export type LightboxStylesNames =
	| "root"
	| "slides"
	| "slide"
	| "toolbar"
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

	const slides = Children.toArray(children).filter(isValidElement);

	const total = slides.length;

	const counterText = counterFormatter
		? counterFormatter(currentIndex, total)
		: `${currentIndex + 1} / ${total}`;

	const handleSlideChange = useCallback(
		(index: number) => {
			setCurrentIndex(index);
			carouselOptions?.onSlideChange?.(index);
		},
		[carouselOptions?.onSlideChange],
	);

	const handleEmblaApi = useCallback(
		(embla: EmblaCarouselType) => {
			emblaRef.current = embla;
			carouselOptions?.getEmblaApi?.(embla);
		},
		[carouselOptions?.getEmblaApi],
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
						{...carouselOptions}
						{...getStyles("slides")}
						withKeyboardEvents={false}
						onSlideChange={handleSlideChange}
						getEmblaApi={handleEmblaApi}
					>
						{children}
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

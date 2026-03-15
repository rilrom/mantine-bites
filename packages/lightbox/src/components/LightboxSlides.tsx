import {
	Box,
	type BoxProps,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import type {
	EmblaCarouselType,
	EmblaOptionsType,
	EmblaPluginType,
} from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useEffect, useRef } from "react";
import { useLightboxContext } from "../context/LightboxContext.js";
import { LightboxSlideProvider } from "../context/LightboxSlideContext.js";
import classes from "../styles/Lightbox.module.css";

export type LightboxSlidesStylesNames =
	| "slides"
	| "slidesViewport"
	| "slidesContainer";

export interface LightboxSlidesProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxSlidesFactory>,
		ElementProps<"div"> {
	/** Initial slide index, `0` by default */
	initialSlide?: number;
	/** Options passed directly to the Embla slide carousel */
	emblaOptions?: EmblaOptionsType;
	/** Plugins passed directly to the Embla slide carousel */
	emblaPlugins?: EmblaPluginType[];
	/** Called when the slides Embla carousel is initialized, provides access to the Embla API */
	getEmblaApi?: (embla: EmblaCarouselType) => void;
}

const defaultProps = {
	initialSlide: 0,
} satisfies Partial<LightboxSlidesProps>;

export type LightboxSlidesFactory = Factory<{
	props: LightboxSlidesProps;
	ref: HTMLDivElement;
	stylesNames: LightboxSlidesStylesNames;
	compound: true;
}>;

export const LightboxSlides = factory<LightboxSlidesFactory>((_props, ref) => {
	const props = useProps("LightboxSlides", defaultProps, _props);

	const {
		classNames,
		className,
		style,
		styles,
		vars,
		initialSlide,
		emblaOptions,
		emblaPlugins,
		getEmblaApi,
		children,
		...others
	} = props;

	const {
		getStyles,
		orientation,
		isZoomedRef,
		slidesEmblaRef,
		thumbnailsEmblaRef,
		initialSlideRef,
		setCurrentIndex,
		setSlideCount,
		onSlidesEmblaApi,
	} = useLightboxContext();

	// We need to pass initialSlide to thumbnails to ensure embla scrolls to the correct thumbnail on mount.
	// TODO: in v2, move initialSlide to LightboxRoot instead of LightboxSlides.
	initialSlideRef.current = initialSlide;

	const getEmblaApiRef = useRef(getEmblaApi);
	getEmblaApiRef.current = getEmblaApi;

	const watchDrag = useCallback(
		(emblaApi: EmblaCarouselType, event: MouseEvent | TouchEvent) => {
			if (isZoomedRef.current) {
				return false;
			}

			const target = event.target;
			if (
				target instanceof Element &&
				target.closest("[data-lightbox-caption]")
			) {
				return false;
			}

			const configuredWatchDrag = emblaOptions?.watchDrag;

			if (typeof configuredWatchDrag === "function") {
				return configuredWatchDrag(emblaApi, event);
			}

			return configuredWatchDrag ?? true;
		},
		[isZoomedRef, emblaOptions?.watchDrag],
	);

	const mergedEmblaOptions: EmblaOptionsType = {
		...emblaOptions,
		axis: orientation === "vertical" ? "y" : "x",
		startIndex: initialSlide,
		watchDrag,
	};

	const [emblaRef, emblaApi] = useEmblaCarousel(
		mergedEmblaOptions,
		emblaPlugins,
	);

	useEffect(() => {
		if (!emblaApi) {
			return;
		}

		slidesEmblaRef.current = emblaApi;
		onSlidesEmblaApi(emblaApi);
		getEmblaApiRef.current?.(emblaApi);

		setSlideCount(emblaApi.slideNodes().length);
		setCurrentIndex(initialSlide);

		const handleSlideSelect = (api: EmblaCarouselType) => {
			const newIndex = api.selectedScrollSnap();

			setCurrentIndex(newIndex);

			thumbnailsEmblaRef.current?.scrollTo(newIndex);
		};

		const handleCarouselDestroy = () => {
			setCurrentIndex(0);
			setSlideCount(null);

			thumbnailsEmblaRef.current = null;
			slidesEmblaRef.current = null;
		};

		emblaApi.on("select", handleSlideSelect);
		emblaApi.on("reInit", handleSlideSelect);
		emblaApi.on("destroy", handleCarouselDestroy);
	}, [
		emblaApi,
		initialSlide,
		slidesEmblaRef,
		thumbnailsEmblaRef,
		setCurrentIndex,
		setSlideCount,
		onSlidesEmblaApi,
	]);

	return (
		<Box
			ref={ref}
			{...getStyles("slides", { className, style, classNames, styles })}
			{...others}
		>
			<Box ref={emblaRef} {...getStyles("slidesViewport")}>
				<Box {...getStyles("slidesContainer")} data-orientation={orientation}>
					{React.Children.map(children, (child, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: index is the semantic slide position
						<LightboxSlideProvider key={index} value={{ index }}>
							{child}
						</LightboxSlideProvider>
					))}
				</Box>
			</Box>
		</Box>
	);
});

LightboxSlides.classes = classes;

LightboxSlides.displayName = "LightboxSlides";

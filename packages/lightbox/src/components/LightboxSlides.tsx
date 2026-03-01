import { Box, useProps } from "@mantine/core";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { useLightboxContext } from "../Lightbox.context.js";
import { LightboxSlideProvider } from "./LightboxSlide.context.js";

export interface LightboxSlidesProps {
	/** Initial slide index, `0` by default */
	initialSlide?: number;
	/** Options passed directly to the Embla slide carousel */
	emblaOptions?: EmblaOptionsType;
	children?: ReactNode;
}

const defaultProps: Partial<LightboxSlidesProps> = {
	initialSlide: 0,
};

export function LightboxSlides(_props: LightboxSlidesProps) {
	const props = useProps("LightboxSlides", defaultProps, _props);

	const { initialSlide = 0, emblaOptions, children } = props;

	const {
		getStyles,
		orientation,
		slidesEmblaRef,
		thumbnailsEmblaRef,
		setCurrentIndex,
		setSlideCount,
	} = useLightboxContext();

	const mergedEmblaOptions: EmblaOptionsType = {
		...emblaOptions,
		axis: orientation === "vertical" ? "y" : "x",
		startIndex: initialSlide,
	};

	const [emblaRef, emblaApi] = useEmblaCarousel(mergedEmblaOptions);

	useEffect(() => {
		if (!emblaApi) {
			return;
		}

		slidesEmblaRef.current = emblaApi;

		setSlideCount(emblaApi.slideNodes().length);
		setCurrentIndex(initialSlide);

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

		emblaApi.on("select", handleSlideSelect);
		emblaApi.on("destroy", handleCarouselDestroy);
	}, [
		emblaApi,
		initialSlide,
		slidesEmblaRef,
		thumbnailsEmblaRef,
		setCurrentIndex,
		setSlideCount,
	]);

	return (
		<Box {...getStyles("slides")}>
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
}

import { Box, useProps } from "@mantine/core";
import type { EmblaOptionsType } from "embla-carousel";
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

	const { onSlidesCarouselInit, getStyles } = useLightboxContext();

	const mergedEmblaOptions: EmblaOptionsType = {
		...emblaOptions,
		startIndex: initialSlide,
	};

	const [emblaRef, emblaApi] = useEmblaCarousel(mergedEmblaOptions);

	useEffect(() => {
		if (emblaApi) {
			onSlidesCarouselInit(emblaApi, initialSlide);
		}
	}, [emblaApi, onSlidesCarouselInit, initialSlide]);

	return (
		<Box {...getStyles("slides")}>
			<Box ref={emblaRef} {...getStyles("slidesViewport")}>
				<Box {...getStyles("slidesContainer")}>
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

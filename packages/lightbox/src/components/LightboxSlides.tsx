import { Box } from "@mantine/core";
import useEmblaCarousel from "embla-carousel-react";
import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { useLightboxContext } from "../Lightbox.context.js";
import { LightboxSlideProvider } from "./LightboxSlide.context.js";

export interface LightboxSlidesProps {
	children?: ReactNode;
}

export function LightboxSlides(props: LightboxSlidesProps) {
	const { children } = props;

	const { slideCarouselProps, onSlidesCarouselInit, getStyles } =
		useLightboxContext();

	const [emblaRef, emblaApi] = useEmblaCarousel(
		slideCarouselProps.emblaOptions,
	);

	useEffect(() => {
		if (emblaApi) {
			onSlidesCarouselInit(emblaApi);
		}
	}, [emblaApi, onSlidesCarouselInit]);

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

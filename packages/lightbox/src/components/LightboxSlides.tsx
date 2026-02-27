import { Carousel } from "@mantine/carousel";
import type { ReactNode } from "react";
import React from "react";
import { useLightboxContext } from "../Lightbox.context.js";
import { LightboxSlideProvider } from "./LightboxSlide.context.js";

export interface LightboxSlidesProps {
	children?: ReactNode;
}

export function LightboxSlides(props: LightboxSlidesProps) {
	const { children } = props;

	const { mergedCarouselOptions, onSlidesEmblaApi, getStyles } =
		useLightboxContext();

	return (
		<Carousel
			includeGapInSize={false}
			slideSize="100%"
			height="100%"
			{...mergedCarouselOptions}
			{...getStyles("slides")}
			withIndicators={false}
			withKeyboardEvents={false}
			getEmblaApi={onSlidesEmblaApi}
		>
			{React.Children.map(children, (child, index) => (
				<LightboxSlideProvider key={child?.toString()} value={{ index }}>
					{child}
				</LightboxSlideProvider>
			))}
		</Carousel>
	);
}

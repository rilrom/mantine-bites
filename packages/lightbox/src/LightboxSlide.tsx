import { Carousel } from "@mantine/carousel";
import {
	type BoxProps,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import type { ReactNode } from "react";
import { useLightboxContext } from "./Lightbox.context.js";
import classes from "./Lightbox.module.css";

export type LightboxSlideStylesNames = "slide";

export interface LightboxSlideProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxSlideFactory>,
		ElementProps<"div"> {
	/** Thumbnail content for this slide, shows a placeholder if omitted */
	thumbnail?: ReactNode;
}

export type LightboxSlideFactory = Factory<{
	props: LightboxSlideProps;
	ref: HTMLDivElement;
	stylesNames: LightboxSlideStylesNames;
	compound: true;
}>;

export const LightboxSlide = factory<LightboxSlideFactory>((props, ref) => {
	const { classNames, className, style, styles, vars, thumbnail, ...others } =
		useProps("LightboxSlide", null, props);

	const ctx = useLightboxContext();

	return (
		<Carousel.Slide
			ref={ref}
			{...ctx.getStyles("slide", { className, style, classNames, styles })}
			{...others}
		/>
	);
});

LightboxSlide.classes = classes;

LightboxSlide.displayName = "LightboxSlide";

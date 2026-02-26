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
	/** Content rendered as the slide thumbnail in the lightbox navigation, or a default placeholder if omitted. */
	thumbnail?: ReactNode;
}

export type LightboxSlideFactory = Factory<{
	props: LightboxSlideProps;
	ref: HTMLDivElement;
	stylesNames: LightboxSlideStylesNames;
	compound: true;
}>;

export const LightboxSlide = factory<LightboxSlideFactory>((_props, ref) => {
	const props = useProps("LightboxSlide", null, _props);

	const { classNames, className, style, styles, vars, thumbnail, ...others } =
		props;

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

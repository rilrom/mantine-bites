import {
	Box,
	type BoxProps,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import { useLightboxContext } from "../context/LightboxContext.js";
import classes from "../styles/Lightbox.module.css";

export type LightboxCaptionStylesNames = "caption";

export interface LightboxCaptionProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxCaptionFactory>,
		ElementProps<"div"> {
	/** Caption displayed below the slide image */
	children?: React.ReactNode;
}

export type LightboxCaptionFactory = Factory<{
	props: LightboxCaptionProps;
	ref: HTMLDivElement;
	stylesNames: LightboxCaptionStylesNames;
	compound: true;
}>;

export const LightboxCaption = factory<LightboxCaptionFactory>((_props) => {
	const props = useProps("LightboxCaption", null, _props);

	const { className, style, classNames, styles, vars, children, ...others } =
		props;

	const { getStyles } = useLightboxContext();

	return (
		<Box
			data-lightbox-caption
			{...getStyles("caption", { className, style, classNames, styles })}
			{...others}
		>
			{children}
		</Box>
	);
});

LightboxCaption.displayName = "LightboxCaption";
LightboxCaption.classes = classes;

import {
	Box,
	type BoxProps,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	UnstyledButton,
	useProps,
} from "@mantine/core";
import { useLightboxContext } from "../context/LightboxContext.js";
import { useLightboxThumbnailContext } from "../context/LightboxThumbnailContext.js";
import classes from "../styles/Lightbox.module.css";

export type LightboxThumbnailStylesNames = "thumbnail" | "thumbnailButton";

export interface LightboxThumbnailProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxThumbnailFactory>,
		ElementProps<"div"> {}

export type LightboxThumbnailFactory = Factory<{
	props: LightboxThumbnailProps;
	ref: HTMLDivElement;
	stylesNames: LightboxThumbnailStylesNames;
	compound: true;
}>;

export const LightboxThumbnail = factory<LightboxThumbnailFactory>(
	(_props, ref) => {
		const props = useProps("LightboxThumbnail", null, _props);

		const { classNames, className, style, styles, vars, children, ...others } =
			props;

		const { currentIndex, onThumbnailClick, getStyles } = useLightboxContext();

		const { index } = useLightboxThumbnailContext();

		return (
			<Box
				ref={ref}
				{...getStyles("thumbnail", { className, style, classNames, styles })}
				{...others}
			>
				<UnstyledButton
					{...getStyles("thumbnailButton", { classNames, styles })}
					onClick={() => onThumbnailClick(index)}
					aria-label={`Go to slide ${index + 1}`}
					aria-current={index === currentIndex || undefined}
				>
					{children}
				</UnstyledButton>
			</Box>
		);
	},
);

LightboxThumbnail.classes = classes;

LightboxThumbnail.displayName = "LightboxThumbnail";

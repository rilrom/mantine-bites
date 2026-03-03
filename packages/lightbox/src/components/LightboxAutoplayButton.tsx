import {
	ActionIcon,
	type BoxProps,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import { useLightboxContext } from "../context/LightboxContext.js";
import classes from "../styles/Lightbox.module.css";
import { Pause } from "./icons/Pause.js";
import { Play } from "./icons/Play.js";

export type LightboxAutoplayButtonStylesNames = "autoplayButton";

export interface LightboxAutoplayButtonProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxAutoplayButtonFactory>,
		ElementProps<"button"> {}

export type LightboxAutoplayButtonFactory = Factory<{
	props: LightboxAutoplayButtonProps;
	ref: HTMLButtonElement;
	stylesNames: LightboxAutoplayButtonStylesNames;
	compound: true;
}>;

export const LightboxAutoplayButton = factory<LightboxAutoplayButtonFactory>(
	(_props, ref) => {
		const props = useProps("LightboxAutoplayButton", null, _props);

		const { classNames, className, style, styles, vars, ...others } = props;

		const { canAutoPlay, isPlaying, toggleAutoPlay, getStyles } =
			useLightboxContext();

		if (!canAutoPlay) {
			return null;
		}

		return (
			<ActionIcon
				ref={ref}
				variant="default"
				size="lg"
				onClick={toggleAutoPlay}
				aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
				{...getStyles("autoplayButton", {
					className,
					style,
					classNames,
					styles,
				})}
				{...others}
			>
				{isPlaying ? <Pause /> : <Play />}
			</ActionIcon>
		);
	},
);

LightboxAutoplayButton.classes = classes;

LightboxAutoplayButton.displayName = "LightboxAutoplayButton";

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
import { EnterFullscreen } from "./icons/EnterFullscreen.js";
import { ExitFullscreen } from "./icons/ExitFullscreen.js";

export type LightboxFullscreenButtonStylesNames = "fullscreenButton";

export interface LightboxFullscreenButtonProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxFullscreenButtonFactory>,
		ElementProps<"button"> {}

export type LightboxFullscreenButtonFactory = Factory<{
	props: LightboxFullscreenButtonProps;
	ref: HTMLButtonElement;
	stylesNames: LightboxFullscreenButtonStylesNames;
	compound: true;
}>;

export const LightboxFullscreenButton =
	factory<LightboxFullscreenButtonFactory>((_props, ref) => {
		const props = useProps("LightboxFullscreenButton", null, _props);

		const { classNames, className, style, styles, vars, ...others } = props;

		const { withFullscreen, isFullscreen, toggleFullscreen, getStyles } =
			useLightboxContext();

		if (!withFullscreen) {
			return null;
		}

		return (
			<ActionIcon
				ref={ref}
				variant="default"
				size="lg"
				onClick={toggleFullscreen}
				aria-label={`${isFullscreen ? "Exit" : "Enter"} fullscreen`}
				{...getStyles("fullscreenButton", {
					className,
					style,
					classNames,
					styles,
				})}
				{...others}
			>
				{isFullscreen ? <ExitFullscreen /> : <EnterFullscreen />}
			</ActionIcon>
		);
	});

LightboxFullscreenButton.classes = classes;

LightboxFullscreenButton.displayName = "LightboxFullscreenButton";

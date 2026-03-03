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
import { ZoomIn } from "./icons/ZoomIn.js";
import { ZoomOut } from "./icons/ZoomOut.js";

export type LightboxZoomButtonStylesNames = "zoomButton";

export interface LightboxZoomButtonProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxZoomButtonFactory>,
		ElementProps<"button"> {}

export type LightboxZoomButtonFactory = Factory<{
	props: LightboxZoomButtonProps;
	ref: HTMLButtonElement;
	stylesNames: LightboxZoomButtonStylesNames;
	compound: true;
}>;

export const LightboxZoomButton = factory<LightboxZoomButtonFactory>(
	(_props, ref) => {
		const props = useProps("LightboxZoomButton", null, _props);

		const { classNames, className, style, styles, vars, ...others } = props;

		const { withZoom, isZoomed, canZoomCurrent, toggleZoom, getStyles } =
			useLightboxContext();

		if (!withZoom) {
			return null;
		}

		return (
			<ActionIcon
				ref={ref}
				variant="default"
				size="lg"
				onClick={toggleZoom}
				disabled={!canZoomCurrent}
				aria-label={isZoomed ? "Zoom out" : "Zoom in"}
				{...getStyles("zoomButton", { className, style, classNames, styles })}
				{...others}
			>
				{isZoomed ? <ZoomOut /> : <ZoomIn />}
			</ActionIcon>
		);
	},
);

LightboxZoomButton.classes = classes;

LightboxZoomButton.displayName = "LightboxZoomButton";

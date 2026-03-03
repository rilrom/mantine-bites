import {
	ActionIcon,
	type BoxProps,
	CloseIcon,
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
import { Pause } from "./icons/Pause.js";
import { Play } from "./icons/Play.js";
import { ZoomIn } from "./icons/ZoomIn.js";
import { ZoomOut } from "./icons/ZoomOut.js";

export type LightboxToolbarStylesNames =
	| "toolbar"
	| "autoplayButton"
	| "fullscreenButton"
	| "zoomButton"
	| "closeButton";

export interface LightboxToolbarProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxToolbarFactory>,
		ElementProps<"div"> {}

export type LightboxToolbarFactory = Factory<{
	props: LightboxToolbarProps;
	ref: HTMLDivElement;
	stylesNames: LightboxToolbarStylesNames;
	compound: true;
}>;

export const LightboxToolbar = factory<LightboxToolbarFactory>(
	(_props, ref) => {
		const props = useProps("LightboxToolbar", null, _props);

		const { classNames, className, style, styles, vars, children, ...others } =
			props;

		const {
			onClose,
			getStyles,
			withFullscreen,
			isFullscreen,
			toggleFullscreen,
			withZoom,
			isZoomed,
			canZoomCurrent,
			toggleZoom,
			canAutoPlay,
			isPlaying,
			toggleAutoPlay,
		} = useLightboxContext();

		return (
			<ActionIcon.Group
				ref={ref}
				{...getStyles("toolbar", { className, style, classNames, styles })}
				{...others}
			>
				{children ?? (
					<>
						{withFullscreen && (
							<ActionIcon
								variant="default"
								size="lg"
								onClick={toggleFullscreen}
								aria-label={`${isFullscreen ? "Exit" : "Enter"} fullscreen`}
								{...getStyles("fullscreenButton", { classNames, styles })}
							>
								{isFullscreen ? <ExitFullscreen /> : <EnterFullscreen />}
							</ActionIcon>
						)}
						{withZoom && (
							<ActionIcon
								variant="default"
								size="lg"
								onClick={toggleZoom}
								disabled={!canZoomCurrent}
								aria-label={isZoomed ? "Zoom out" : "Zoom in"}
								{...getStyles("zoomButton", { classNames, styles })}
							>
								{isZoomed ? <ZoomOut /> : <ZoomIn />}
							</ActionIcon>
						)}
						{canAutoPlay && (
							<ActionIcon
								variant="default"
								size="lg"
								onClick={toggleAutoPlay}
								aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
								{...getStyles("autoplayButton", { classNames, styles })}
							>
								{isPlaying ? <Pause /> : <Play />}
							</ActionIcon>
						)}
						<ActionIcon
							variant="default"
							size="lg"
							onClick={onClose}
							aria-label="Close lightbox"
							{...getStyles("closeButton", { classNames, styles })}
						>
							<CloseIcon />
						</ActionIcon>
					</>
				)}
			</ActionIcon.Group>
		);
	},
);

LightboxToolbar.classes = classes;

LightboxToolbar.displayName = "LightboxToolbar";

import { ActionIcon, CloseIcon } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";
import { EnterFullscreen } from "./EnterFullscreen.js";
import { ExitFullscreen } from "./ExitFullscreen.js";
import { Pause } from "./Pause.js";
import { Play } from "./Play.js";
import { ZoomIn } from "./ZoomIn.js";
import { ZoomOut } from "./ZoomOut.js";

export function LightboxToolbar() {
	const {
		getStyles,
		withFullscreen,
		withZoom,
		isFullscreen,
		onToggleFullscreen,
		isZoomed,
		canZoomCurrent,
		onToggleZoom,
		canUseAutoPlay,
		isPlaying,
		onToggleAutoPlay,
		onClose,
	} = useLightboxContext();

	return (
		<ActionIcon.Group {...getStyles("toolbar")}>
			{withFullscreen && (
				<ActionIcon
					variant="default"
					size="lg"
					onClick={onToggleFullscreen}
					aria-label={`${isFullscreen ? "Exit" : "Enter"} fullscreen`}
					{...getStyles("fullscreenButton")}
				>
					{isFullscreen ? <ExitFullscreen /> : <EnterFullscreen />}
				</ActionIcon>
			)}

			{withZoom && (
				<ActionIcon
					variant="default"
					size="lg"
					onClick={onToggleZoom}
					aria-label={isZoomed ? "Zoom out" : "Zoom in"}
					disabled={!canZoomCurrent}
					{...getStyles("zoomButton")}
				>
					{isZoomed ? <ZoomOut /> : <ZoomIn />}
				</ActionIcon>
			)}

			{canUseAutoPlay && (
				<ActionIcon
					variant="default"
					size="lg"
					onClick={onToggleAutoPlay}
					aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
					{...getStyles("autoplayButton")}
				>
					{isPlaying ? <Pause /> : <Play />}
				</ActionIcon>
			)}

			<ActionIcon
				variant="default"
				size="lg"
				onClick={onClose}
				aria-label="Close lightbox"
				{...getStyles("closeButton")}
			>
				<CloseIcon />
			</ActionIcon>
		</ActionIcon.Group>
	);
}

import { ActionIcon, CloseIcon } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";
import { EnterFullscreen } from "./EnterFullscreen.js";
import { ExitFullscreen } from "./ExitFullscreen.js";
import { Pause } from "./Pause.js";
import { Play } from "./Play.js";
import { ZoomIn } from "./ZoomIn.js";
import { ZoomOut } from "./ZoomOut.js";

export function LightboxToolbar() {
	const ctx = useLightboxContext();

	return (
		<ActionIcon.Group {...ctx.getStyles("toolbar")}>
			{ctx.withFullscreen && (
				<ActionIcon
					variant="default"
					size="lg"
					onClick={ctx.onToggleFullscreen}
					aria-label={`${ctx.isFullscreen ? "Exit" : "Enter"} fullscreen`}
					{...ctx.getStyles("fullscreenButton")}
				>
					{ctx.isFullscreen ? <ExitFullscreen /> : <EnterFullscreen />}
				</ActionIcon>
			)}

			{ctx.withZoom && (
				<ActionIcon
					variant="default"
					size="lg"
					onClick={ctx.onToggleZoom}
					aria-label={ctx.isZoomed ? "Zoom out" : "Zoom in"}
					disabled={!ctx.canZoomCurrent}
					{...ctx.getStyles("zoomButton")}
				>
					{ctx.isZoomed ? <ZoomOut /> : <ZoomIn />}
				</ActionIcon>
			)}

			{ctx.canUseAutoPlay && (
				<ActionIcon
					variant="default"
					size="lg"
					onClick={ctx.onToggleAutoPlay}
					aria-label={ctx.isPlaying ? "Pause autoplay" : "Play autoplay"}
					{...ctx.getStyles("autoplayButton")}
				>
					{ctx.isPlaying ? <Pause /> : <Play />}
				</ActionIcon>
			)}

			<ActionIcon
				variant="default"
				size="lg"
				onClick={ctx.onClose}
				aria-label="Close lightbox"
				{...ctx.getStyles("closeButton")}
			>
				<CloseIcon />
			</ActionIcon>
		</ActionIcon.Group>
	);
}

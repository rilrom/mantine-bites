import { ActionIcon, CloseIcon } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";
import { EnterFullscreen } from "./EnterFullscreen.js";
import { ExitFullscreen } from "./ExitFullscreen.js";
import { ZoomIn } from "./ZoomIn.js";
import { ZoomOut } from "./ZoomOut.js";

export function LightboxToolbar() {
	const {
		getStyles,
		withFullscreen,
		withZoom,
		isFullscreen,
		canUseFullscreen,
		onToggleFullscreen,
		isZoomed,
		canZoomCurrent,
		onToggleZoom,
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
					disabled={!canUseFullscreen}
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

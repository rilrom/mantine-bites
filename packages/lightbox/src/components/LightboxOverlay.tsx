import { Overlay } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";

export function LightboxOverlay() {
	const { overlayProps, transitionStyles, getStyles } = useLightboxContext();

	return (
		<Overlay
			{...overlayProps}
			{...getStyles("overlay", {
				className: overlayProps.className,
				style: [transitionStyles, overlayProps.style],
			})}
		/>
	);
}

import { ActionIcon, CloseIcon } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";

export function LightboxToolbar() {
	const { onClose, getStyles } = useLightboxContext();

	return (
		<ActionIcon.Group {...getStyles("toolbar")}>
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

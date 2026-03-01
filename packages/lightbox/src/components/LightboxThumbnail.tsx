import { Box, UnstyledButton } from "@mantine/core";
import type { ReactNode } from "react";
import { useLightboxContext } from "../Lightbox.context.js";
import { useLightboxThumbnailContext } from "./LightboxThumbnail.context.js";

export interface LightboxThumbnailProps {
	children?: ReactNode;
}

export function LightboxThumbnail(props: LightboxThumbnailProps) {
	const { children } = props;

	const { currentIndex, onThumbnailClick, getStyles } = useLightboxContext();

	const { index } = useLightboxThumbnailContext();

	return (
		<Box {...getStyles("thumbnail")}>
			<UnstyledButton
				{...getStyles("thumbnailButton")}
				onClick={() => onThumbnailClick(index)}
				aria-label={`Go to slide ${index + 1}`}
				aria-current={index === currentIndex || undefined}
			>
				{children}
			</UnstyledButton>
		</Box>
	);
}

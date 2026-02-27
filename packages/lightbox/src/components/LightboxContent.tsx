import { Box, type BoxProps, type ElementProps } from "@mantine/core";
import type { ReactNode } from "react";
import { useLightboxContext } from "../Lightbox.context.js";

export interface LightboxContentProps extends BoxProps, ElementProps<"div"> {
	children?: ReactNode;
}

export function LightboxContent({
	children,
	style,
	...others
}: LightboxContentProps) {
	const { transitionStyles, mergedRef, getStyles } = useLightboxContext();

	return (
		<Box
			ref={mergedRef}
			{...getStyles("root", { style: [transitionStyles, style] })}
			{...others}
		>
			{children}
		</Box>
	);
}

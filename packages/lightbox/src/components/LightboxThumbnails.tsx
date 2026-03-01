import { Box, useProps } from "@mantine/core";
import type { EmblaOptionsType } from "embla-carousel";
import type { ReactNode } from "react";
import React from "react";
import { useThumbnails } from "../hooks/useThumbnails.js";
import { useLightboxContext } from "../Lightbox.context.js";
import { LightboxThumbnailProvider } from "./LightboxThumbnail.context.js";

export interface LightboxThumbnailsProps {
	/** Options passed directly to the Embla thumbnail carousel, `{ dragFree: true }` by default */
	emblaOptions?: EmblaOptionsType;
	children?: ReactNode;
}

const defaultProps: Partial<LightboxThumbnailsProps> = {
	emblaOptions: { dragFree: true },
};

export function LightboxThumbnails(_props: LightboxThumbnailsProps) {
	const props = useProps("LightboxThumbnails", defaultProps, _props);

	const { emblaOptions, children } = props;

	const { getStyles, thumbnailsEmblaRef, currentIndex } = useLightboxContext();

	const { setViewportRef, containerRef, hasOverflow } = useThumbnails({
		emblaOptions,
		thumbnailsEmblaRef,
		initialIndex: currentIndex,
	});

	return (
		<Box {...getStyles("thumbnails")}>
			<Box ref={setViewportRef} {...getStyles("thumbnailsViewport")}>
				<Box
					ref={containerRef}
					{...getStyles("thumbnailsContainer")}
					data-overflow={hasOverflow || undefined}
				>
					{React.Children.map(children, (child, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: index is the semantic thumbnail position
						<LightboxThumbnailProvider key={index} value={{ index }}>
							{child}
						</LightboxThumbnailProvider>
					))}
				</Box>
			</Box>
		</Box>
	);
}

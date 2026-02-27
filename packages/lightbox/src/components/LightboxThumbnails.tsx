import { Box } from "@mantine/core";
import type { ReactNode } from "react";
import React from "react";
import { useThumbnails } from "../hooks/useThumbnails.js";
import { useLightboxContext } from "../Lightbox.context.js";
import { LightboxThumbnailProvider } from "./LightboxThumbnail.context.js";

export interface LightboxThumbnailsProps {
	children?: ReactNode;
}

export function LightboxThumbnails(props: LightboxThumbnailsProps) {
	const { children } = props;

	const { thumbnailCarouselProps, getStyles, onThumbnailsCarouselInit } =
		useLightboxContext();

	const { setViewportRef, containerRef, hasOverflow } = useThumbnails({
		emblaOptions: thumbnailCarouselProps.emblaOptions,
		onEmblaApi: onThumbnailsCarouselInit,
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

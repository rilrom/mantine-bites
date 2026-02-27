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

	const { thumbnailsCarouselOptions, getStyles, onThumbnailsCarouselInit } =
		useLightboxContext();

	const { setViewportRef, containerRef, hasOverflow } = useThumbnails({
		emblaOptions: thumbnailsCarouselOptions,
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
						<LightboxThumbnailProvider
							key={child?.toString()}
							value={{ index }}
						>
							{child}
						</LightboxThumbnailProvider>
					))}
				</Box>
			</Box>
		</Box>
	);
}

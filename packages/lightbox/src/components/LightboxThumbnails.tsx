import { Box, useProps } from "@mantine/core";
import type { EmblaOptionsType } from "embla-carousel";
import type { ReactNode } from "react";
import React, { useEffect, useRef } from "react";
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
		emblaOptions: {
			...emblaOptions,
			axis: "x",
		},
		thumbnailsEmblaRef,
		initialIndex: currentIndex,
	});

	const thumbnailsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = thumbnailsRef.current;
		if (!el) return;

		const root = el.closest<HTMLElement>("[data-orientation]");
		if (!root) return;

		const update = () => {
			root.style.setProperty(
				"--lightbox-thumbnails-height",
				`${el.offsetHeight}px`,
			);
		};

		update();

		const observer = new ResizeObserver(update);
		observer.observe(el);

		return () => {
			observer.disconnect();
			root.style.removeProperty("--lightbox-thumbnails-height");
		};
	}, []);

	return (
		<Box ref={thumbnailsRef} {...getStyles("thumbnails")}>
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

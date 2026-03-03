import {
	Box,
	type BoxProps,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import { useMergedRef } from "@mantine/hooks";
import type { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLightboxContext } from "../context/LightboxContext.js";
import { LightboxThumbnailProvider } from "../context/LightboxThumbnailContext.js";
import classes from "../styles/Lightbox.module.css";

export type LightboxThumbnailsStylesNames =
	| "thumbnails"
	| "thumbnailsViewport"
	| "thumbnailsContainer";

export interface LightboxThumbnailsProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxThumbnailsFactory>,
		ElementProps<"div"> {
	/** Options passed directly to the Embla thumbnail carousel, `{ dragFree: true }` by default */
	emblaOptions?: EmblaOptionsType;
}

const defaultProps = {
	emblaOptions: { dragFree: true },
} satisfies Partial<LightboxThumbnailsProps>;

export type LightboxThumbnailsFactory = Factory<{
	props: LightboxThumbnailsProps;
	ref: HTMLDivElement;
	stylesNames: LightboxThumbnailsStylesNames;
	compound: true;
}>;

export const LightboxThumbnails = factory<LightboxThumbnailsFactory>(
	(_props, ref) => {
		const props = useProps("LightboxThumbnails", defaultProps, _props);

		const {
			classNames,
			className,
			style,
			styles,
			vars,
			emblaOptions,
			children,
			...others
		} = props;

		const { getStyles, thumbnailsEmblaRef, currentIndex } =
			useLightboxContext();

		const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

		const viewportRef = useRef<HTMLDivElement | null>(null);
		const containerRef = useRef<HTMLDivElement | null>(null);
		const initialIndexRef = useRef(currentIndex);
		const thumbnailsRef = useRef<HTMLDivElement>(null);

		const mergedRef = useMergedRef(ref, thumbnailsRef);

		const [hasOverflow, setHasOverflow] = useState(false);

		const setViewportRef = useCallback(
			(node: HTMLDivElement | null) => {
				viewportRef.current = node;
				emblaRef(node);
			},
			[emblaRef],
		);

		useEffect(() => {
			if (!emblaApi) {
				return;
			}

			thumbnailsEmblaRef.current = emblaApi;

			emblaApi.scrollTo(initialIndexRef.current);
		}, [emblaApi, thumbnailsEmblaRef]);

		useEffect(() => {
			const updateOverflow = () => {
				const viewport = viewportRef.current;
				const container = containerRef.current;

				if (!viewport || !container) {
					return;
				}

				setHasOverflow(container.scrollWidth > viewport.clientWidth + 1);
			};

			updateOverflow();

			if (typeof ResizeObserver === "undefined") {
				window.addEventListener("resize", updateOverflow);

				return () => window.removeEventListener("resize", updateOverflow);
			}

			const observer = new ResizeObserver(updateOverflow);

			const viewport = viewportRef.current;
			const container = containerRef.current;

			if (viewport) {
				observer.observe(viewport);
			}

			if (container) {
				observer.observe(container);
			}

			return () => observer.disconnect();
		}, []);

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
			<Box
				ref={mergedRef}
				{...getStyles("thumbnails", { className, style, classNames, styles })}
				{...others}
			>
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
	},
);

LightboxThumbnails.classes = classes;

LightboxThumbnails.displayName = "LightboxThumbnails";

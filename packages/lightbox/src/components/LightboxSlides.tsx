import { Box, type GetStylesApi } from "@mantine/core";
import {
	cloneElement,
	type ReactElement,
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
	type RefObject,
} from "react";
import type { LightboxFactory } from "../Lightbox.js";
import type { ZoomOffset } from "../utils/zoom.js";
import { getZoomTransform } from "../utils/zoom.js";

interface LightboxSlidesProps {
	slides: ReactElement<{ children?: ReactNode }>[];
	currentIndex: number;
	isZoomed: boolean;
	isDraggingZoom: boolean;
	canZoomCurrent: boolean;
	zoomOffset: ZoomOffset;
	zoomScale: number;
	activeZoomContainerRef: RefObject<HTMLDivElement | null>;
	updateCanZoomAvailability: () => void;
	handleZoomPointerDown: (
		event: ReactPointerEvent<HTMLDivElement>,
		isActive: boolean,
		isActiveAndZoomed: boolean,
		canZoom: boolean,
	) => void;
	handleZoomPointerMove: (
		event: ReactPointerEvent<HTMLDivElement>,
		isActiveAndZoomed: boolean,
	) => void;
	handleZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
	getStyles: GetStylesApi<LightboxFactory>;
}

export function LightboxSlides(props: LightboxSlidesProps) {
	const {
		slides,
		currentIndex,
		isZoomed,
		isDraggingZoom,
		canZoomCurrent,
		zoomOffset,
		zoomScale,
		activeZoomContainerRef,
		updateCanZoomAvailability,
		handleZoomPointerDown,
		handleZoomPointerMove,
		handleZoomPointerEnd,
		getStyles,
	} = props;

	return (
		<>
			{slides.map((slide, index) => {
				const isActive = index === currentIndex;
				const isActiveAndZoomed = isActive && isZoomed;
				const slideProps = slide.props;

				return cloneElement(slide, {
					children: (
						<Box
							ref={isActive ? activeZoomContainerRef : undefined}
							{...getStyles("zoomContainer")}
							data-active={isActive || undefined}
							data-zoomed={isActiveAndZoomed || undefined}
							data-can-zoom={isActive ? String(canZoomCurrent) : undefined}
							data-dragging={(isDraggingZoom && isActiveAndZoomed) || undefined}
							onPointerDown={(event) =>
								handleZoomPointerDown(
									event,
									isActive,
									isActiveAndZoomed,
									isActive ? canZoomCurrent : false,
								)
							}
							onPointerMove={(event) =>
								handleZoomPointerMove(event, isActiveAndZoomed)
							}
							onPointerUp={handleZoomPointerEnd}
							onPointerCancel={handleZoomPointerEnd}
							onLoadCapture={(event) => {
								if (isActive && event.target instanceof HTMLImageElement) {
									updateCanZoomAvailability();
								}
							}}
						>
							<Box
								{...getStyles("zoomContent")}
								style={{
									transform: getZoomTransform({
										isZoomed: isActiveAndZoomed,
										offset: zoomOffset,
										scale: zoomScale,
									}),
								}}
							>
								{slideProps.children}
							</Box>
						</Box>
					),
				});
			})}
		</>
	);
}

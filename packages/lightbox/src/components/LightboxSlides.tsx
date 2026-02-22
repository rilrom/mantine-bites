import { Box } from "@mantine/core";
import {
	cloneElement,
	type ReactElement,
	type PointerEvent as ReactPointerEvent,
	type RefObject,
} from "react";
import { useSlideInteractions } from "../hooks/useSlideInteractions.js";
import { useLightboxContext } from "../Lightbox.context.js";
import type { LightboxSlideProps } from "../LightboxSlide.js";
import { getZoomTransform, type ZoomOffset } from "../utils/zoom.js";

interface LightboxSlidesProps {
	slides: ReactElement<Pick<LightboxSlideProps, "children">>[];
	currentIndex: number;
	isZoomed: boolean;
	isDraggingZoom: boolean;
	canZoomCurrent: boolean;
	zoomOffset: ZoomOffset;
	zoomScale: number;
	activeZoomContainerRef: RefObject<HTMLDivElement | null>;
	updateCanZoomAvailability: () => void;
	handleZoomPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
	onClose: () => void;
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
		onClose,
	} = props;

	const { getStyles } = useLightboxContext();

	const {
		handleSlidePointerDown,
		handleSlidePointerMove,
		handleSlidePointerUp,
		handleSlidePointerCancel,
		handleSlideLoadCapture,
	} = useSlideInteractions({
		onClose,
		onZoomPointerDown: handleZoomPointerDown,
		onZoomPointerMove: handleZoomPointerMove,
		onZoomPointerEnd: handleZoomPointerEnd,
		updateCanZoomAvailability,
	});

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
							onPointerDown={isActive ? handleSlidePointerDown : undefined}
							onPointerMove={isActive ? handleSlidePointerMove : undefined}
							onPointerUp={isActive ? handleSlidePointerUp : undefined}
							onPointerCancel={isActive ? handleSlidePointerCancel : undefined}
							onLoadCapture={isActive ? handleSlideLoadCapture : undefined}
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
								<Box
									style={{ display: "contents" }}
									data-lightbox-slide-content
								>
									{slideProps.children}
								</Box>
							</Box>
						</Box>
					),
				});
			})}
		</>
	);
}

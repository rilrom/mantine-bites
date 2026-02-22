import { Box } from "@mantine/core";
import { cloneElement } from "react";
import { useSlideInteractions } from "../hooks/useSlideInteractions.js";
import { useLightboxContext } from "../Lightbox.context.js";
import { getZoomTransform } from "../utils/zoom.js";

export function LightboxSlides() {
	const {
		getStyles,
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
		handleOutsideClick,
	} = useLightboxContext();

	const {
		handleSlidePointerDown,
		handleSlidePointerMove,
		handleSlidePointerUp,
		handleSlidePointerCancel,
		handleSlideLoadCapture,
	} = useSlideInteractions({
		onClose: handleOutsideClick,
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

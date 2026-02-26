import { Box } from "@mantine/core";
import { cloneElement } from "react";
import { useSlideInteractions } from "../hooks/useSlideInteractions.js";
import { useLightboxContext } from "../Lightbox.context.js";
import { getZoomTransform } from "../utils/zoom.js";

export function LightboxSlides() {
	const ctx = useLightboxContext();

	const {
		handleSlidePointerDown,
		handleSlidePointerMove,
		handleSlidePointerUp,
		handleSlidePointerCancel,
		handleSlideLoadCapture,
	} = useSlideInteractions({
		onClose: ctx.handleOutsideClick,
		onZoomPointerDown: ctx.handleZoomPointerDown,
		onZoomPointerMove: ctx.handleZoomPointerMove,
		onZoomPointerEnd: ctx.handleZoomPointerEnd,
		updateCanZoomAvailability: ctx.updateCanZoomAvailability,
	});

	return (
		<>
			{ctx.slides.map((slide, index) => {
				const isActive = index === ctx.currentIndex;

				const isActiveAndZoomed = isActive && ctx.isZoomed;

				const slideProps = slide.props;

				return cloneElement(slide, {
					children: (
						<Box
							ref={isActive ? ctx.activeZoomContainerRef : undefined}
							{...ctx.getStyles("zoomContainer")}
							data-active={isActive || undefined}
							data-zoomed={isActiveAndZoomed || undefined}
							data-can-zoom={isActive ? String(ctx.canZoomCurrent) : undefined}
							data-dragging={
								(ctx.isDraggingZoom && isActiveAndZoomed) || undefined
							}
							onPointerDown={isActive ? handleSlidePointerDown : undefined}
							onPointerMove={isActive ? handleSlidePointerMove : undefined}
							onPointerUp={isActive ? handleSlidePointerUp : undefined}
							onPointerCancel={isActive ? handleSlidePointerCancel : undefined}
							onLoadCapture={isActive ? handleSlideLoadCapture : undefined}
						>
							<Box
								{...ctx.getStyles("zoomContent")}
								style={{
									transform: getZoomTransform({
										isZoomed: isActiveAndZoomed,
										offset: ctx.zoomOffset,
										scale: ctx.zoomScale,
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

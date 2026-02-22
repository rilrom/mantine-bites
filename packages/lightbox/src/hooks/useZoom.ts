import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	canZoomImageElement,
	clampZoomOffset,
	DEFAULT_ZOOM_SCALE,
	getImageMaxZoomScale,
	getPointerCoordinate,
	getTargetZoomScale,
	hasPointerMoved,
	isImageTarget,
	ZERO_ZOOM_OFFSET,
	type ZoomOffset,
} from "../utils/zoom.js";

interface UseZoomInput {
	opened: boolean;
}

interface UseZoomOutput {
	isZoomed: boolean;
	isDraggingZoom: boolean;
	zoomOffset: ZoomOffset;
	zoomScale: number;
	canZoomCurrent: boolean;
	isZoomedRef: RefObject<boolean>;
	activeZoomContainerRef: RefObject<HTMLDivElement | null>;
	resetZoom: () => void;
	toggleZoom: () => void;
	updateCanZoomAvailability: () => void;
	handleZoomPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

/**
 * Manages all zoom and pan state for the lightbox.
 *
 * Handles pointer capture for smooth panning, tap-to-toggle zoom, offset
 * clamping within container bounds, and automatic reset on slide change or
 * window resize.
 */
export function useZoom(props: UseZoomInput): UseZoomOutput {
	const { opened } = props;

	const [isZoomed, setIsZoomed] = useState(false);
	const [isDraggingZoom, setIsDraggingZoom] = useState(false);
	const [zoomOffset, setZoomOffset] = useState<ZoomOffset>(ZERO_ZOOM_OFFSET);
	const [zoomScale, setZoomScale] = useState(DEFAULT_ZOOM_SCALE);
	const [canZoomCurrent, setCanZoomCurrent] = useState(true);

	const isZoomedRef = useRef(false);
	const activeZoomContainerRef = useRef<HTMLDivElement | null>(null);
	const zoomBaseSizeRef = useRef<{ width: number; height: number } | null>(
		null,
	);
	const dragRef = useRef<{
		pointerId: number;
		startX: number;
		startY: number;
		originX: number;
		originY: number;
		canPan: boolean;
		canToggleOnRelease: boolean;
		moved: boolean;
	} | null>(null);

	const resetZoom = useCallback(() => {
		setIsZoomed(false);
		setZoomOffset(ZERO_ZOOM_OFFSET);
		setZoomScale(DEFAULT_ZOOM_SCALE);
		setIsDraggingZoom(false);
		dragRef.current = null;
		zoomBaseSizeRef.current = null;
	}, []);

	const updateCanZoomAvailability = useCallback(() => {
		const activeContainer = activeZoomContainerRef.current;

		if (!activeContainer) {
			setCanZoomCurrent(false);
			return;
		}

		const image = activeContainer.querySelector("img");

		if (!(image instanceof HTMLImageElement)) {
			setCanZoomCurrent(false);
			return;
		}

		setCanZoomCurrent(canZoomImageElement(image));
	}, []);

	const toggleZoom = useCallback(() => {
		setIsZoomed((current) => {
			if (current) {
				setZoomOffset(ZERO_ZOOM_OFFSET);
				setZoomScale(DEFAULT_ZOOM_SCALE);
				return false;
			}

			const activeContainer = activeZoomContainerRef.current;

			if (!activeContainer) {
				return current;
			}

			const image = activeContainer.querySelector("img");

			if (!(image instanceof HTMLImageElement)) {
				return current;
			}

			const containerRect = activeContainer.getBoundingClientRect();
			const imageRect = image.getBoundingClientRect();
			const targetScale = getTargetZoomScale({
				image,
				containerWidth: containerRect.width,
				containerHeight: containerRect.height,
			});
			const maxZoomScale = getImageMaxZoomScale(image);

			if (maxZoomScale <= 1.01 || targetScale <= 1.01) {
				return current;
			}

			zoomBaseSizeRef.current = {
				width: imageRect.width,
				height: imageRect.height,
			};
			setZoomScale(targetScale);
			return true;
		});
	}, []);

	const handleZoomPointerDown = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (!canZoomCurrent) {
				return;
			}

			const target = event.target as HTMLElement | null;

			if (!isImageTarget(target)) {
				return;
			}

			const startX = getPointerCoordinate(event.clientX, 0);
			const startY = getPointerCoordinate(event.clientY, 0);

			if (isZoomed) {
				event.currentTarget.setPointerCapture?.(event.pointerId);
				setIsDraggingZoom(true);
			}

			dragRef.current = {
				pointerId: event.pointerId,
				startX,
				startY,
				originX: zoomOffset.x,
				originY: zoomOffset.y,
				canPan: isZoomed,
				canToggleOnRelease: true,
				moved: false,
			};
		},
		[canZoomCurrent, isZoomed, zoomOffset.x, zoomOffset.y],
	);

	const handleZoomPointerMove = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const drag = dragRef.current;

			if (!drag || drag.pointerId !== event.pointerId) {
				return;
			}

			const currentX = getPointerCoordinate(event.clientX, drag.startX);
			const currentY = getPointerCoordinate(event.clientY, drag.startY);
			const deltaX = currentX - drag.startX;
			const deltaY = currentY - drag.startY;

			if (
				hasPointerMoved({
					startX: drag.startX,
					startY: drag.startY,
					endX: currentX,
					endY: currentY,
				})
			) {
				drag.moved = true;
				drag.canToggleOnRelease = false;
			}

			if (!drag.canPan) {
				return;
			}

			const containerRect = event.currentTarget.getBoundingClientRect();
			const baseSize = zoomBaseSizeRef.current;

			if (!baseSize) {
				return;
			}

			const nextOffset = clampZoomOffset({
				containerWidth: containerRect.width,
				containerHeight: containerRect.height,
				imageWidth: baseSize.width,
				imageHeight: baseSize.height,
				zoomScale,
				nextX: drag.originX + deltaX,
				nextY: drag.originY + deltaY,
			});

			setZoomOffset(nextOffset);
		},
		[zoomScale],
	);

	const handleZoomPointerEnd = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const drag = dragRef.current;

			if (!drag || drag.pointerId !== event.pointerId) {
				return;
			}

			if (drag.canPan) {
				event.currentTarget.releasePointerCapture?.(event.pointerId);
			}

			const endX = getPointerCoordinate(event.clientX, drag.startX);
			const endY = getPointerCoordinate(event.clientY, drag.startY);

			if (
				hasPointerMoved({
					startX: drag.startX,
					startY: drag.startY,
					endX,
					endY,
				})
			) {
				drag.moved = true;
				drag.canToggleOnRelease = false;
			}

			const shouldToggleZoom = drag.canToggleOnRelease && !drag.moved;

			dragRef.current = null;
			setIsDraggingZoom(false);

			if (shouldToggleZoom) {
				toggleZoom();
			}
		},
		[toggleZoom],
	);

	useEffect(() => {
		if (!opened) {
			resetZoom();
		}
	}, [opened, resetZoom]);

	useEffect(() => {
		if (!opened) {
			return;
		}

		const handleResize = () => {
			if (isZoomedRef.current) {
				resetZoom();
			}

			requestAnimationFrame(updateCanZoomAvailability);
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [opened, resetZoom, updateCanZoomAvailability]);

	useEffect(() => {
		isZoomedRef.current = isZoomed;
	}, [isZoomed]);

	useEffect(() => {
		if (!opened) {
			setCanZoomCurrent(false);
			return;
		}

		const frameId = requestAnimationFrame(updateCanZoomAvailability);

		return () => cancelAnimationFrame(frameId);
	}, [opened, updateCanZoomAvailability]);

	useEffect(() => {
		if (isZoomed && !canZoomCurrent) {
			resetZoom();
		}
	}, [isZoomed, canZoomCurrent, resetZoom]);

	return {
		isZoomed,
		isDraggingZoom,
		zoomOffset,
		zoomScale,
		canZoomCurrent,
		isZoomedRef,
		activeZoomContainerRef,
		resetZoom,
		toggleZoom,
		updateCanZoomAvailability,
		handleZoomPointerDown,
		handleZoomPointerMove,
		handleZoomPointerEnd,
	};
}

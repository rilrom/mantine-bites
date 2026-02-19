import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	canZoomImageElement,
	clampZoomOffset,
	DEFAULT_ZOOM_SCALE,
	getImageMaxZoomScale,
	getTargetZoomScale,
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
}

const DRAG_MOVE_THRESHOLD = 2;

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
		(
			event: ReactPointerEvent<HTMLDivElement>,
			isActive: boolean,
			isActiveAndZoomed: boolean,
			canZoom: boolean,
		) => {
			if (!isActive || !canZoom) {
				return;
			}

			const target = event.target as HTMLElement | null;

			if (!isImageTarget(target)) {
				return;
			}

			const startX = Number.isFinite(event.clientX) ? event.clientX : 0;
			const startY = Number.isFinite(event.clientY) ? event.clientY : 0;

			if (isActiveAndZoomed) {
				event.currentTarget.setPointerCapture?.(event.pointerId);
				setIsDraggingZoom(true);
			}

			dragRef.current = {
				pointerId: event.pointerId,
				startX,
				startY,
				originX: zoomOffset.x,
				originY: zoomOffset.y,
				canPan: isActiveAndZoomed,
				canToggleOnRelease: true,
				moved: false,
			};
		},
		[zoomOffset.x, zoomOffset.y],
	);

	const handleZoomPointerMove = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>, isActiveAndZoomed: boolean) => {
			const drag = dragRef.current;

			if (!drag || drag.pointerId !== event.pointerId) {
				return;
			}

			const currentX = Number.isFinite(event.clientX)
				? event.clientX
				: drag.startX;
			const currentY = Number.isFinite(event.clientY)
				? event.clientY
				: drag.startY;
			const deltaX = currentX - drag.startX;
			const deltaY = currentY - drag.startY;

			if (
				Math.abs(deltaX) > DRAG_MOVE_THRESHOLD ||
				Math.abs(deltaY) > DRAG_MOVE_THRESHOLD
			) {
				drag.moved = true;
				drag.canToggleOnRelease = false;
			}

			if (!isActiveAndZoomed || !drag.canPan) {
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

			const endX = Number.isFinite(event.clientX) ? event.clientX : drag.startX;
			const endY = Number.isFinite(event.clientY) ? event.clientY : drag.startY;
			const endDeltaX = endX - drag.startX;
			const endDeltaY = endY - drag.startY;

			if (
				Math.abs(endDeltaX) > DRAG_MOVE_THRESHOLD ||
				Math.abs(endDeltaY) > DRAG_MOVE_THRESHOLD
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

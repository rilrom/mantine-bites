import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	getPointerCoordinate,
	hasPointerMoved,
	isImageTarget,
} from "../utils/pointer.js";
import {
	canZoomImageElement,
	clampZoomOffset,
	DEFAULT_ZOOM_SCALE,
	getImageMaxZoomScale,
	getInitialZoomOffset,
	getPinchGeometry,
	getPinchZoom,
	getTargetZoomScale,
	getZoomTransform,
	MIN_ZOOM_SCALE,
	type PinchPoint,
	type PinchStart,
	ZERO_ZOOM_OFFSET,
	type ZoomOffset,
	type ZoomSize,
} from "../utils/zoom.js";

interface UseZoomInput {
	opened: boolean;
	withZoom: boolean;
}

export interface UseZoomOutput {
	isZoomed: boolean;
	isZoomedRef: RefObject<boolean>;
	isDraggingZoom: boolean;
	zoomOffset: ZoomOffset;
	zoomScale: number;
	canZoomCurrent: boolean;
	activeZoomContainerRef: RefObject<HTMLDivElement | null>;
	activeZoomContentRef: RefObject<HTMLDivElement | null>;
	resetZoom: () => void;
	toggleZoom: () => void;
	updateCanZoomAvailability: () => void;
	handleZoomPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
	panZoom: (direction: "up" | "down" | "left" | "right") => void;
}

const PAN_STEP_RATIO = 0.2;

const PAN_DELTA: Record<
	"up" | "down" | "left" | "right",
	[x: number, y: number]
> = {
	left: [-1, 0],
	right: [1, 0],
	up: [0, 1],
	down: [0, -1],
};

export function useZoom(props: UseZoomInput): UseZoomOutput {
	const { opened, withZoom } = props;

	const [isZoomed, setIsZoomed] = useState(false);
	const [isDraggingZoom, setIsDraggingZoom] = useState(false);
	const [zoomOffset, setZoomOffset] = useState<ZoomOffset>(ZERO_ZOOM_OFFSET);
	const [zoomScale, setZoomScale] = useState(DEFAULT_ZOOM_SCALE);
	const [canZoomCurrent, setCanZoomCurrent] = useState(false);

	const isZoomedRef = useRef(false);
	const zoomScaleRef = useRef(DEFAULT_ZOOM_SCALE);
	const zoomOffsetRef = useRef<ZoomOffset>(ZERO_ZOOM_OFFSET);
	const activeZoomContainerRef = useRef<HTMLDivElement | null>(null);
	const activeZoomContentRef = useRef<HTMLDivElement | null>(null);
	const zoomBaseSizeRef = useRef<ZoomSize | null>(null);
	const dragRef = useRef<{
		pointerId: number;
		startX: number;
		startY: number;
		originX: number;
		originY: number;
		canPan: boolean;
		moved: boolean;
	} | null>(null);
	const pointersRef = useRef(new Map<number, PinchPoint>());
	const pinchRef = useRef<{
		start: PinchStart;
		scale: number;
		offset: ZoomOffset;
	} | null>(null);

	// Drag and pinch moves only write the DOM so they skip re-rendering every context consumer.
	// commitZoom writes the transform here too, so the DOM never keeps a value React has moved past.
	const previewZoom = useCallback(
		(zoomed: boolean, scale: number, offset: ZoomOffset) => {
			isZoomedRef.current = zoomed;
			zoomScaleRef.current = scale;
			zoomOffsetRef.current = offset;

			const content = activeZoomContentRef.current;

			if (content) {
				content.style.transform = getZoomTransform({
					isZoomed: zoomed,
					offset,
					scale,
				});
			}
		},
		[],
	);

	const commitZoom = useCallback(
		(zoomed: boolean, scale: number, offset: ZoomOffset) => {
			previewZoom(zoomed, scale, offset);
			setIsZoomed(zoomed);
			setZoomScale(scale);
			setZoomOffset(offset);
		},
		[previewZoom],
	);

	const clearZoom = useCallback(() => {
		commitZoom(false, DEFAULT_ZOOM_SCALE, ZERO_ZOOM_OFFSET);
		setIsDraggingZoom(false);
	}, [commitZoom]);

	const resetZoom = useCallback(() => {
		clearZoom();
		setCanZoomCurrent(false);
		dragRef.current = null;
		pinchRef.current = null;
		pointersRef.current.clear();
		zoomBaseSizeRef.current = null;
	}, [clearZoom]);

	const updateCanZoomAvailability = useCallback(() => {
		if (!withZoom) {
			setCanZoomCurrent(false);
			return;
		}

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
	}, [withZoom]);

	const setZoomFromOrigin = useCallback(
		(origin?: { clientX: number; clientY: number }) => {
			if (isZoomedRef.current) {
				commitZoom(false, DEFAULT_ZOOM_SCALE, ZERO_ZOOM_OFFSET);
				return;
			}

			const activeContainer = activeZoomContainerRef.current;

			if (!activeContainer) {
				return;
			}

			const image = activeContainer.querySelector("img");

			if (!(image instanceof HTMLImageElement)) {
				return;
			}

			const containerRect = activeContainer.getBoundingClientRect();
			const imageRect = image.getBoundingClientRect();
			const targetScale = getTargetZoomScale({
				image,
				containerWidth: containerRect.width,
				containerHeight: containerRect.height,
			});
			const maxZoomScale = getImageMaxZoomScale(image);

			if (maxZoomScale <= MIN_ZOOM_SCALE || targetScale <= MIN_ZOOM_SCALE) {
				return;
			}

			zoomBaseSizeRef.current = {
				width: imageRect.width,
				height: imageRect.height,
			};
			commitZoom(
				true,
				targetScale,
				origin
					? getInitialZoomOffset({
							containerRect,
							imageRect,
							zoomScale: targetScale,
							pointerClientX: origin.clientX,
							pointerClientY: origin.clientY,
						})
					: ZERO_ZOOM_OFFSET,
			);
		},
		[commitZoom],
	);

	const toggleZoom = useCallback(() => {
		if (!withZoom) {
			return;
		}

		setZoomFromOrigin();
	}, [setZoomFromOrigin, withZoom]);

	const toggleZoomAt = useCallback(
		(origin: { clientX: number; clientY: number }) => {
			if (!withZoom) {
				return;
			}

			setZoomFromOrigin(origin);
		},
		[setZoomFromOrigin, withZoom],
	);

	const startPinch = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
		const container = activeZoomContainerRef.current;
		const image = container?.querySelector("img");
		const geometry = getPinchGeometry(pointersRef.current.values());

		if (!container || !(image instanceof HTMLImageElement) || !geometry) {
			return;
		}

		const zoomed = isZoomedRef.current;

		if (!zoomed || !zoomBaseSizeRef.current) {
			const imageRect = image.getBoundingClientRect();
			zoomBaseSizeRef.current = {
				width: imageRect.width,
				height: imageRect.height,
			};
		}

		const containerRect = container.getBoundingClientRect();
		const scale = zoomed ? zoomScaleRef.current : 1;
		const offset = zoomed ? zoomOffsetRef.current : ZERO_ZOOM_OFFSET;

		pinchRef.current = {
			start: {
				...geometry,
				containerRect,
				imageSize: zoomBaseSizeRef.current,
				maxScale: getTargetZoomScale({
					image,
					containerWidth: containerRect.width,
					containerHeight: containerRect.height,
					renderedSize: zoomBaseSizeRef.current,
				}),
				scale,
				offset,
			},
			scale,
			offset,
		};
		dragRef.current = null;
		event.currentTarget.setPointerCapture?.(event.pointerId);
		setIsDraggingZoom(true);
	}, []);

	const handleZoomPointerDown = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (event.isPrimary) {
				pointersRef.current.clear();
				pinchRef.current = null;
			}

			if (!withZoom || !canZoomCurrent) {
				return;
			}

			const target = event.target;
			const container = activeZoomContainerRef.current;

			if (
				!container ||
				!(target instanceof Node) ||
				!container.contains(target)
			) {
				return;
			}

			const pointers = pointersRef.current;

			if (pointers.size >= 2) {
				return;
			}

			const startX = getPointerCoordinate(event.clientX, 0);
			const startY = getPointerCoordinate(event.clientY, 0);

			pointers.set(event.pointerId, { x: startX, y: startY });

			if (pointers.size === 2) {
				startPinch(event);
				return;
			}

			if (!isImageTarget(target)) {
				return;
			}

			const zoomed = isZoomedRef.current;

			if (zoomed) {
				event.currentTarget.setPointerCapture?.(event.pointerId);
				event.currentTarget.style.cursor = "grabbing";
				setIsDraggingZoom(true);
			}

			dragRef.current = {
				pointerId: event.pointerId,
				startX,
				startY,
				originX: zoomOffsetRef.current.x,
				originY: zoomOffsetRef.current.y,
				canPan: zoomed,
				moved: false,
			};
		},
		[withZoom, canZoomCurrent, startPinch],
	);

	const handleZoomPointerMove = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const pointers = pointersRef.current;
			const pointer = pointers.get(event.pointerId);

			if (pointer) {
				pointer.x = getPointerCoordinate(event.clientX, pointer.x);
				pointer.y = getPointerCoordinate(event.clientY, pointer.y);
			}

			const pinch = pinchRef.current;

			if (pinch) {
				const geometry = getPinchGeometry(pointers.values());

				if (!pointer || !geometry) {
					return;
				}

				const { scale, offset } = getPinchZoom(pinch.start, geometry);

				pinch.scale = scale;
				pinch.offset = offset;

				if (isZoomedRef.current) {
					previewZoom(true, scale, offset);
				} else {
					commitZoom(true, scale, offset);
				}
				return;
			}

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
				zoomScale: zoomScaleRef.current,
				nextX: drag.originX + deltaX,
				nextY: drag.originY + deltaY,
			});

			previewZoom(true, zoomScaleRef.current, nextOffset);
		},
		[previewZoom, commitZoom],
	);

	const handleZoomPointerEnd = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const pointers = pointersRef.current;
			const wasTracked = pointers.delete(event.pointerId);
			const pinch = pinchRef.current;

			if (pinch && wasTracked) {
				pinchRef.current = null;
				event.currentTarget.releasePointerCapture?.(event.pointerId);
				event.currentTarget.style.cursor = "";

				if (pinch.scale <= MIN_ZOOM_SCALE) {
					clearZoom();
					return;
				}

				commitZoom(true, pinch.scale, pinch.offset);

				const remaining = pointers.entries().next().value;

				if (!remaining) {
					setIsDraggingZoom(false);
					return;
				}

				const [pointerId, position] = remaining;

				dragRef.current = {
					pointerId,
					startX: position.x,
					startY: position.y,
					originX: pinch.offset.x,
					originY: pinch.offset.y,
					canPan: true,
					moved: true,
				};
				return;
			}

			const drag = dragRef.current;

			if (!drag || drag.pointerId !== event.pointerId) {
				return;
			}

			if (drag.canPan) {
				event.currentTarget.releasePointerCapture?.(event.pointerId);
				event.currentTarget.style.cursor = "";
				commitZoom(true, zoomScaleRef.current, zoomOffsetRef.current);
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
			}

			const shouldToggleZoom = !drag.moved;
			dragRef.current = null;
			setIsDraggingZoom(false);

			if (shouldToggleZoom) {
				toggleZoomAt({ clientX: endX, clientY: endY });
			}
		},
		[toggleZoomAt, clearZoom, commitZoom],
	);

	const panZoom = useCallback(
		(direction: "up" | "down" | "left" | "right") => {
			const container = activeZoomContainerRef.current;
			const baseSize = zoomBaseSizeRef.current;

			if (!container || !baseSize) {
				return;
			}

			const containerRect = container.getBoundingClientRect();

			const [dx, dy] = PAN_DELTA[direction];
			const deltaX = dx * containerRect.width * PAN_STEP_RATIO;
			const deltaY = dy * containerRect.height * PAN_STEP_RATIO;

			const scale = zoomScaleRef.current;
			const offset = zoomOffsetRef.current;

			commitZoom(
				isZoomedRef.current,
				scale,
				clampZoomOffset({
					containerWidth: containerRect.width,
					containerHeight: containerRect.height,
					imageWidth: baseSize.width,
					imageHeight: baseSize.height,
					zoomScale: scale,
					nextX: offset.x + deltaX,
					nextY: offset.y + deltaY,
				}),
			);
		},
		[commitZoom],
	);

	useEffect(() => {
		if (!opened) {
			resetZoom();
		}
	}, [opened, resetZoom]);

	useEffect(() => {
		if (!withZoom) {
			resetZoom();
			setCanZoomCurrent(false);
			return;
		}

		updateCanZoomAvailability();
	}, [withZoom, resetZoom, updateCanZoomAvailability]);

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
		isZoomedRef,
		isDraggingZoom,
		zoomOffset,
		zoomScale,
		canZoomCurrent,
		activeZoomContainerRef,
		activeZoomContentRef,
		resetZoom,
		toggleZoom,
		updateCanZoomAvailability,
		handleZoomPointerDown,
		handleZoomPointerMove,
		handleZoomPointerEnd,
		panZoom,
	};
}

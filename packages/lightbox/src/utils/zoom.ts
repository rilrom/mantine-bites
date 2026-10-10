/** Pixel offset representing a translation applied to a zoomed image. */
export interface ZoomOffset {
	/** Horizontal translation in pixels. */
	x: number;
	/** Vertical translation in pixels. */
	y: number;
}

/** Default zoom scale applied when zooming in on an image. */
export const DEFAULT_ZOOM_SCALE = 2;

/** Zero-offset value representing no translation on a zoomed image. */
export const ZERO_ZOOM_OFFSET: ZoomOffset = { x: 0, y: 0 };

interface ClampZoomOffsetInput {
	containerWidth: number;
	containerHeight: number;
	imageWidth: number;
	imageHeight: number;
	zoomScale: number;
	nextX: number;
	nextY: number;
}

interface InitialZoomOffsetInput {
	containerRect: DOMRect;
	imageRect: DOMRect;
	zoomScale: number;
	pointerClientX: number;
	pointerClientY: number;
}

/**
 * Clamps a proposed zoom pan offset so the image cannot be panned beyond its
 * edges relative to the container at the given zoom scale.
 */
export const clampZoomOffset = ({
	containerWidth,
	containerHeight,
	imageWidth,
	imageHeight,
	zoomScale,
	nextX,
	nextY,
}: ClampZoomOffsetInput): ZoomOffset => {
	const scaledWidth = imageWidth * zoomScale;
	const scaledHeight = imageHeight * zoomScale;
	const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
	const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

	return {
		x: Math.min(Math.max(nextX, -maxX), maxX),
		y: Math.min(Math.max(nextY, -maxY), maxY),
	};
};

/**
 * Calculates the initial pan offset when zooming so the clicked/tapped point
 * moves toward the viewport center, then clamps it to valid pan bounds.
 */
export const getInitialZoomOffset = ({
	containerRect,
	imageRect,
	zoomScale,
	pointerClientX,
	pointerClientY,
}: InitialZoomOffsetInput): ZoomOffset => {
	const centerX = containerRect.left + containerRect.width / 2;
	const centerY = containerRect.top + containerRect.height / 2;
	const rawOffsetX = -(pointerClientX - centerX) * zoomScale;
	const rawOffsetY = -(pointerClientY - centerY) * zoomScale;

	return clampZoomOffset({
		containerWidth: containerRect.width,
		containerHeight: containerRect.height,
		imageWidth: imageRect.width,
		imageHeight: imageRect.height,
		zoomScale,
		nextX: rawOffsetX,
		nextY: rawOffsetY,
	});
};

/**
 * Returns a CSS `transform` string that applies the zoom pan offset and scale.
 * When not zoomed, returns identity values regardless of the stored offset.
 */
export const getZoomTransform = ({
	isZoomed,
	offset,
	scale,
}: {
	isZoomed: boolean;
	offset: ZoomOffset;
	scale: number;
}) =>
	`translate(${isZoomed ? offset.x : 0}px, ${isZoomed ? offset.y : 0}px) scale(${
		isZoomed ? scale : 1
	})`;

/** Scale at or below which an image is treated as unzoomed. */
export const MIN_ZOOM_SCALE = 1.01;

/** Width and height of an image as rendered without the zoom transform. */
export interface ZoomSize {
	width: number;
	height: number;
}

const getImageMeasurements = (
	image: HTMLImageElement,
	renderedSize?: ZoomSize,
) => {
	const { width, height } = renderedSize ?? image.getBoundingClientRect();
	return {
		naturalWidth: image.naturalWidth,
		naturalHeight: image.naturalHeight,
		renderedWidth: width,
		renderedHeight: height,
	};
};

/**
 * Returns the maximum zoom scale at which the image would still be rendered at
 * its native resolution (1:1 pixel ratio). Falls back to `DEFAULT_ZOOM_SCALE`
 * when image dimensions are unavailable. Pass `renderedSize` with the unzoomed
 * size when the image is already zoomed, because its bounding rect includes
 * the zoom transform.
 */
export const getImageMaxZoomScale = (
	image: HTMLImageElement,
	renderedSize?: ZoomSize,
) => {
	const { naturalWidth, naturalHeight, renderedWidth, renderedHeight } =
		getImageMeasurements(image, renderedSize);

	if (!naturalWidth || !naturalHeight || !renderedWidth || !renderedHeight) {
		return DEFAULT_ZOOM_SCALE;
	}

	return Math.min(naturalWidth / renderedWidth, naturalHeight / renderedHeight);
};

/**
 * Calculates the zoom scale that should be applied when the user triggers a
 * zoom action. Prefers a scale that fills the container viewport; falls back to
 * the native-resolution scale or `DEFAULT_ZOOM_SCALE` when the image is small.
 */
export const getTargetZoomScale = ({
	image,
	containerWidth,
	containerHeight,
	renderedSize,
}: {
	image: HTMLImageElement;
	containerWidth: number;
	containerHeight: number;
	renderedSize?: ZoomSize;
}) => {
	const { renderedWidth, renderedHeight } = getImageMeasurements(
		image,
		renderedSize,
	);
	const fillWidthScale =
		renderedWidth > 0 ? containerWidth / renderedWidth : DEFAULT_ZOOM_SCALE;
	const fillHeightScale =
		renderedHeight > 0 ? containerHeight / renderedHeight : DEFAULT_ZOOM_SCALE;
	const fillViewportScale = Math.max(fillWidthScale, fillHeightScale);
	const maxZoomScale = getImageMaxZoomScale(image, renderedSize);
	const fallbackStepScale = Math.min(maxZoomScale, DEFAULT_ZOOM_SCALE);
	const targetScale =
		fillViewportScale > 1 ? fillViewportScale : fallbackStepScale;

	return Math.max(1, Math.min(maxZoomScale, targetScale));
};

/**
 * Returns `true` if the image has sufficient resolution to be meaningfully
 * zoomed (i.e. its max zoom scale exceeds `MIN_ZOOM_SCALE`).
 */
export const canZoomImageElement = (image: HTMLImageElement) =>
	getImageMaxZoomScale(image) > MIN_ZOOM_SCALE;

/** Client coordinates of a pointer on screen. */
export type PinchPoint = ZoomOffset;

/** Distance between two pointers and the point halfway between them. */
export interface PinchGeometry {
	distance: number;
	midpoint: PinchPoint;
}

/** Values captured when a pinch gesture starts. */
export interface PinchStart {
	containerRect: DOMRect;
	imageSize: ZoomSize;
	maxScale: number;
	scale: number;
	offset: ZoomOffset;
	distance: number;
	midpoint: PinchPoint;
}

/**
 * Returns the geometry of the first two points, or `null` when there are
 * fewer than two.
 */
export const getPinchGeometry = (
	points: Iterable<PinchPoint>,
): PinchGeometry | null => {
	const [a, b] = points;

	if (!a || !b) {
		return null;
	}

	return {
		distance: Math.hypot(a.x - b.x, a.y - b.y),
		midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
	};
};

/**
 * Calculates the zoom scale and pan offset for an in-progress pinch gesture.
 * The scale follows the change in distance between the two pointers, and the
 * image point that was under the starting midpoint stays under the current
 * midpoint, so the gesture can zoom and pan at the same time.
 */
export const getPinchZoom = (
	start: PinchStart,
	{ distance, midpoint }: PinchGeometry,
): { scale: number; offset: ZoomOffset } => {
	const { containerRect, imageSize, maxScale } = start;
	const rawScale =
		start.distance > 0
			? start.scale * (distance / start.distance)
			: start.scale;
	const scale = Math.min(Math.max(rawScale, 1), Math.max(1, maxScale));
	const centerX = containerRect.left + containerRect.width / 2;
	const centerY = containerRect.top + containerRect.height / 2;
	const anchorX = (start.midpoint.x - centerX - start.offset.x) / start.scale;
	const anchorY = (start.midpoint.y - centerY - start.offset.y) / start.scale;

	return {
		scale,
		offset: clampZoomOffset({
			containerWidth: containerRect.width,
			containerHeight: containerRect.height,
			imageWidth: imageSize.width,
			imageHeight: imageSize.height,
			zoomScale: scale,
			nextX: midpoint.x - centerX - scale * anchorX,
			nextY: midpoint.y - centerY - scale * anchorY,
		}),
	};
};

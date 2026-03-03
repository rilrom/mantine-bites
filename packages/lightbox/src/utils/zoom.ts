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

const RESOLUTION_EPSILON = 1.01;

const getImageMeasurements = (image: HTMLImageElement) => {
	const rect = image.getBoundingClientRect();
	return {
		naturalWidth: image.naturalWidth,
		naturalHeight: image.naturalHeight,
		renderedWidth: rect.width,
		renderedHeight: rect.height,
	};
};

/**
 * Returns the maximum zoom scale at which the image would still be rendered at
 * its native resolution (1:1 pixel ratio). Falls back to `DEFAULT_ZOOM_SCALE`
 * when image dimensions are unavailable.
 */
export const getImageMaxZoomScale = (image: HTMLImageElement) => {
	const { naturalWidth, naturalHeight, renderedWidth, renderedHeight } =
		getImageMeasurements(image);

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
}: {
	image: HTMLImageElement;
	containerWidth: number;
	containerHeight: number;
}) => {
	const { renderedWidth, renderedHeight } = getImageMeasurements(image);
	const fillWidthScale =
		renderedWidth > 0 ? containerWidth / renderedWidth : DEFAULT_ZOOM_SCALE;
	const fillHeightScale =
		renderedHeight > 0 ? containerHeight / renderedHeight : DEFAULT_ZOOM_SCALE;
	const fillViewportScale = Math.max(fillWidthScale, fillHeightScale);
	const maxZoomScale = getImageMaxZoomScale(image);
	const fallbackStepScale = Math.min(maxZoomScale, DEFAULT_ZOOM_SCALE);
	const targetScale =
		fillViewportScale > 1 ? fillViewportScale : fallbackStepScale;

	return Math.max(1, Math.min(maxZoomScale, targetScale));
};

/**
 * Returns `true` if the image has sufficient resolution to be meaningfully
 * zoomed (i.e. its max zoom scale exceeds the resolution epsilon threshold).
 */
export const canZoomImageElement = (image: HTMLImageElement) =>
	getImageMaxZoomScale(image) > RESOLUTION_EPSILON;

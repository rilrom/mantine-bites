export interface ZoomOffset {
	x: number;
	y: number;
}

export const DEFAULT_ZOOM_SCALE = 2;

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

export const isImageTarget = (target: EventTarget | null) =>
	target instanceof HTMLElement && Boolean(target.closest("img"));

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

export const getImageMaxZoomScale = (image: HTMLImageElement) => {
	const { naturalWidth, naturalHeight, renderedWidth, renderedHeight } =
		getImageMeasurements(image);

	if (!naturalWidth || !naturalHeight || !renderedWidth || !renderedHeight) {
		return DEFAULT_ZOOM_SCALE;
	}

	const widthRatio = naturalWidth / renderedWidth;
	const heightRatio = naturalHeight / renderedHeight;

	return Math.min(widthRatio, heightRatio);
};

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

export const canZoomImageElement = (image: HTMLImageElement) => {
	return getImageMaxZoomScale(image) > RESOLUTION_EPSILON;
};

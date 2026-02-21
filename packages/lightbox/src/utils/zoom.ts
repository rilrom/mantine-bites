export interface ZoomOffset {
	x: number;
	y: number;
}

export const DEFAULT_ZOOM_SCALE = 2;
export const POINTER_MOVE_THRESHOLD = 2;

export const ZERO_ZOOM_OFFSET: ZoomOffset = { x: 0, y: 0 };

export interface OutsideClosePointerState {
	pointerId: number;
	startX: number;
	startY: number;
	startedOutsideContent: boolean;
	moved: boolean;
}

interface CreateOutsideClosePointerStateInput {
	pointerId: number;
	clientX: number;
	clientY: number;
	startedOutsideContent: boolean;
}

interface PointerMoveInput {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	threshold?: number;
}

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

export const isEventTargetWithinSelector = (
	target: EventTarget | null,
	selector: string,
) => target instanceof HTMLElement && Boolean(target.closest(selector));

export const isImageTarget = (target: EventTarget | null) =>
	isEventTargetWithinSelector(target, "img");

export const getPointerCoordinate = (value: number, fallback: number) =>
	Number.isFinite(value) ? value : fallback;

export const hasPointerMoved = ({
	startX,
	startY,
	endX,
	endY,
	threshold = POINTER_MOVE_THRESHOLD,
}: PointerMoveInput) =>
	Math.abs(endX - startX) > threshold || Math.abs(endY - startY) > threshold;

export const createOutsideClosePointerState = ({
	pointerId,
	clientX,
	clientY,
	startedOutsideContent,
}: CreateOutsideClosePointerStateInput): OutsideClosePointerState => ({
	pointerId,
	startX: getPointerCoordinate(clientX, 0),
	startY: getPointerCoordinate(clientY, 0),
	startedOutsideContent,
	moved: false,
});

export const updateOutsideClosePointerState = (
	state: OutsideClosePointerState,
	{ clientX, clientY }: { clientX: number; clientY: number },
): OutsideClosePointerState => {
	const endX = getPointerCoordinate(clientX, state.startX);
	const endY = getPointerCoordinate(clientY, state.startY);

	if (
		!state.moved &&
		hasPointerMoved({
			startX: state.startX,
			startY: state.startY,
			endX,
			endY,
		})
	) {
		return { ...state, moved: true };
	}

	return state;
};

export const shouldCloseFromOutsidePointerState = (
	state: OutsideClosePointerState,
) => state.startedOutsideContent && !state.moved;

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

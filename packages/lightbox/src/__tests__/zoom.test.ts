import {
	canZoomImageElement,
	clampZoomOffset,
	DEFAULT_ZOOM_SCALE,
	getInitialZoomOffset,
	getTargetZoomScale,
	getZoomTransform,
	ZERO_ZOOM_OFFSET,
} from "../utils/zoom.js";

const createRect = (width: number, height: number): DOMRect =>
	({
		x: 0,
		y: 0,
		width,
		height,
		top: 0,
		left: 0,
		right: width,
		bottom: height,
		toJSON: () => ({}),
	}) as DOMRect;

const createImage = ({
	naturalWidth,
	naturalHeight,
	renderedWidth,
	renderedHeight,
}: {
	naturalWidth: number;
	naturalHeight: number;
	renderedWidth: number;
	renderedHeight: number;
}) => {
	const image = document.createElement("img");
	Object.defineProperty(image, "naturalWidth", {
		configurable: true,
		value: naturalWidth,
	});
	Object.defineProperty(image, "naturalHeight", {
		configurable: true,
		value: naturalHeight,
	});
	Object.defineProperty(image, "getBoundingClientRect", {
		configurable: true,
		value: () => createRect(renderedWidth, renderedHeight),
	});
	return image;
};

describe("zoom utilities", () => {
	it("should export DEFAULT_ZOOM_SCALE as 2", () => {
		expect(DEFAULT_ZOOM_SCALE).toBe(2);
	});

	it("should export ZERO_ZOOM_OFFSET as { x: 0, y: 0 }", () => {
		expect(ZERO_ZOOM_OFFSET).toEqual({ x: 0, y: 0 });
	});

	it("should keep zoom available when image is downscaled even if viewport fill scale is 1", () => {
		const image = createImage({
			naturalWidth: 1500,
			naturalHeight: 1000,
			renderedWidth: 1000,
			renderedHeight: 667,
		});
		expect(canZoomImageElement(image)).toBe(true);
		expect(
			getTargetZoomScale({ image, containerWidth: 1000, containerHeight: 667 }),
		).toBeCloseTo(1.5);
	});

	it("should compute zoom target from the larger viewport fill axis", () => {
		const image = createImage({
			naturalWidth: 4000,
			naturalHeight: 3000,
			renderedWidth: 1000,
			renderedHeight: 750,
		});
		expect(
			getTargetZoomScale({
				image,
				containerWidth: 1000,
				containerHeight: 1000,
			}),
		).toBeCloseTo(1000 / 750);
	});

	it("should clamp target zoom to available natural resolution", () => {
		const image = createImage({
			naturalWidth: 1500,
			naturalHeight: 1125,
			renderedWidth: 1000,
			renderedHeight: 750,
		});
		expect(
			getTargetZoomScale({
				image,
				containerWidth: 2000,
				containerHeight: 2000,
			}),
		).toBeCloseTo(1.5);
	});

	it("should center zoom around pointer position when possible", () => {
		expect(
			getInitialZoomOffset({
				containerRect: createRect(800, 600),
				imageRect: createRect(1200, 900),
				zoomScale: 2,
				pointerClientX: 500,
				pointerClientY: 350,
			}),
		).toEqual({ x: -200, y: -100 });
	});

	it("should clamp initial pointer-based zoom offset to pan limits", () => {
		expect(
			getInitialZoomOffset({
				containerRect: createRect(800, 600),
				imageRect: createRect(1200, 900),
				zoomScale: 2,
				pointerClientX: 0,
				pointerClientY: 0,
			}),
		).toEqual({ x: 800, y: 600 });
	});

	it("should return identity transform when not zoomed", () => {
		expect(
			getZoomTransform({ isZoomed: false, offset: { x: 50, y: 50 }, scale: 2 }),
		).toBe("translate(0px, 0px) scale(1)");
	});

	it("should return scaled transform when zoomed", () => {
		expect(
			getZoomTransform({ isZoomed: true, offset: { x: 10, y: -20 }, scale: 2 }),
		).toBe("translate(10px, -20px) scale(2)");
	});

	it("should clampZoomOffset to prevent panning beyond image edges", () => {
		const result = clampZoomOffset({
			containerWidth: 800,
			containerHeight: 600,
			imageWidth: 1000,
			imageHeight: 750,
			zoomScale: 2,
			nextX: 9999,
			nextY: 9999,
		});
		expect(result.x).toBeCloseTo((1000 * 2 - 800) / 2);
		expect(result.y).toBeCloseTo((750 * 2 - 600) / 2);
	});
});

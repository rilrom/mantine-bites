import { canZoomImageElement, getTargetZoomScale } from "./zoom.js";

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
	it("should keep zoom available when image is downscaled even if viewport fill scale is 1", () => {
		const image = createImage({
			naturalWidth: 1500,
			naturalHeight: 1000,
			renderedWidth: 1000,
			renderedHeight: 667,
		});

		expect(canZoomImageElement(image)).toBe(true);

		expect(
			getTargetZoomScale({
				image,
				containerWidth: 1000,
				containerHeight: 667,
			}),
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
});

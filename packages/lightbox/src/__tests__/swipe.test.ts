import {
	getSwipeProgress,
	resolveSwipeGesture,
	SWIPE_CLOSE_THRESHOLD,
	SWIPE_GESTURE_THRESHOLD,
	shouldCloseFromSwipe,
} from "../utils/swipe.js";

describe("swipe utilities", () => {
	describe("resolveSwipeGesture", () => {
		it("should stay undecided until the gesture threshold is reached", () => {
			expect(
				resolveSwipeGesture({
					closeDelta: SWIPE_GESTURE_THRESHOLD - 1,
					carouselDelta: 0,
				}),
			).toBeNull();
		});

		it("should resolve to close when movement is mostly across the carousel", () => {
			expect(resolveSwipeGesture({ closeDelta: -12, carouselDelta: 4 })).toBe(
				"close",
			);
		});

		it("should resolve to the carousel when movement is mostly along it", () => {
			expect(resolveSwipeGesture({ closeDelta: 4, carouselDelta: -12 })).toBe(
				"carousel",
			);
		});

		it("should prefer the carousel on a perfect diagonal", () => {
			expect(resolveSwipeGesture({ closeDelta: 10, carouselDelta: 10 })).toBe(
				"carousel",
			);
		});
	});

	describe("getSwipeProgress", () => {
		it("should scale with distance and cap at half the size", () => {
			expect(getSwipeProgress(0, 800)).toBe(0);
			expect(getSwipeProgress(200, 800)).toBe(0.5);
			expect(getSwipeProgress(-200, 800)).toBe(0.5);
			expect(getSwipeProgress(600, 800)).toBe(1);
		});

		it("should return 0 when the size is unknown", () => {
			expect(getSwipeProgress(200, 0)).toBe(0);
		});
	});

	describe("shouldCloseFromSwipe", () => {
		it("should close at or past the threshold in either direction", () => {
			expect(shouldCloseFromSwipe(SWIPE_CLOSE_THRESHOLD)).toBe(true);
			expect(shouldCloseFromSwipe(-SWIPE_CLOSE_THRESHOLD)).toBe(true);
			expect(shouldCloseFromSwipe(SWIPE_CLOSE_THRESHOLD - 1)).toBe(false);
		});
	});
});

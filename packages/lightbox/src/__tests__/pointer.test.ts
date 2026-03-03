import {
	createOutsideClosePointerState,
	getPointerCoordinate,
	hasPointerMoved,
	isEventTargetWithinSelector,
	isImageTarget,
	POINTER_MOVE_THRESHOLD,
	shouldCloseFromOutsidePointerState,
	updateOutsideClosePointerState,
} from "../utils/pointer.js";

describe("pointer utilities", () => {
	it("should export POINTER_MOVE_THRESHOLD as 2", () => {
		expect(POINTER_MOVE_THRESHOLD).toBe(2);
	});

	describe("getPointerCoordinate", () => {
		it("should return the value when finite", () => {
			expect(getPointerCoordinate(100, 0)).toBe(100);
			expect(getPointerCoordinate(-50, 0)).toBe(-50);
			expect(getPointerCoordinate(0, 99)).toBe(0);
		});

		it("should return the fallback when value is NaN", () => {
			expect(getPointerCoordinate(NaN, 42)).toBe(42);
		});

		it("should return the fallback when value is Infinity", () => {
			expect(getPointerCoordinate(Infinity, 42)).toBe(42);
			expect(getPointerCoordinate(-Infinity, 42)).toBe(42);
		});
	});

	describe("hasPointerMoved", () => {
		it("should return false when movement is within threshold", () => {
			expect(hasPointerMoved({ startX: 0, startY: 0, endX: 1, endY: 1 })).toBe(
				false,
			);
		});

		it("should return true when horizontal movement exceeds threshold", () => {
			expect(hasPointerMoved({ startX: 0, startY: 0, endX: 3, endY: 0 })).toBe(
				true,
			);
		});

		it("should return true when vertical movement exceeds threshold", () => {
			expect(hasPointerMoved({ startX: 0, startY: 0, endX: 0, endY: 3 })).toBe(
				true,
			);
		});

		it("should return true when movement equals threshold (exclusive)", () => {
			expect(hasPointerMoved({ startX: 0, startY: 0, endX: 2, endY: 0 })).toBe(
				false,
			);
		});

		it("should use a custom threshold when provided", () => {
			expect(
				hasPointerMoved({
					startX: 0,
					startY: 0,
					endX: 5,
					endY: 0,
					threshold: 10,
				}),
			).toBe(false);
			expect(
				hasPointerMoved({
					startX: 0,
					startY: 0,
					endX: 11,
					endY: 0,
					threshold: 10,
				}),
			).toBe(true);
		});

		it("should handle negative movement", () => {
			expect(
				hasPointerMoved({ startX: 10, startY: 10, endX: 7, endY: 10 }),
			).toBe(true);
		});
	});

	describe("isEventTargetWithinSelector", () => {
		it("should return false for null target", () => {
			expect(isEventTargetWithinSelector(null, "img")).toBe(false);
		});

		it("should return false for non-HTMLElement target", () => {
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			expect(isEventTargetWithinSelector(svg, "svg")).toBe(false);
		});

		it("should return true when element matches selector", () => {
			const div = document.createElement("div");
			div.className = "target";
			expect(isEventTargetWithinSelector(div, ".target")).toBe(true);
		});

		it("should return true when element is a descendant matching selector", () => {
			const outer = document.createElement("div");
			outer.className = "outer";
			const inner = document.createElement("span");
			outer.appendChild(inner);
			expect(isEventTargetWithinSelector(inner, ".outer")).toBe(true);
		});

		it("should return false when element does not match selector", () => {
			const div = document.createElement("div");
			expect(isEventTargetWithinSelector(div, "img")).toBe(false);
		});
	});

	describe("isImageTarget", () => {
		it("should return true for an img element", () => {
			const img = document.createElement("img");
			expect(isImageTarget(img)).toBe(true);
		});

		it("should return true for a descendant of an img element", () => {
			const img = document.createElement("img");
			const span = document.createElement("span");
			document.body.appendChild(img);
			img.appendChild(span);
			expect(isImageTarget(span)).toBe(true);
			document.body.removeChild(img);
		});

		it("should return false for a non-img element", () => {
			const div = document.createElement("div");
			expect(isImageTarget(div)).toBe(false);
		});

		it("should return false for null", () => {
			expect(isImageTarget(null)).toBe(false);
		});
	});

	describe("createOutsideClosePointerState", () => {
		it("should create state with provided values", () => {
			const state = createOutsideClosePointerState({
				pointerId: 1,
				clientX: 100,
				clientY: 200,
				startedOutsideContent: true,
			});
			expect(state).toEqual({
				pointerId: 1,
				startX: 100,
				startY: 200,
				startedOutsideContent: true,
				moved: false,
			});
		});

		it("should fall back to 0 for non-finite coordinates", () => {
			const state = createOutsideClosePointerState({
				pointerId: 2,
				clientX: NaN,
				clientY: Infinity,
				startedOutsideContent: false,
			});
			expect(state.startX).toBe(0);
			expect(state.startY).toBe(0);
		});

		it("should initialise moved as false", () => {
			const state = createOutsideClosePointerState({
				pointerId: 3,
				clientX: 50,
				clientY: 50,
				startedOutsideContent: false,
			});
			expect(state.moved).toBe(false);
		});
	});

	describe("updateOutsideClosePointerState", () => {
		const baseState = createOutsideClosePointerState({
			pointerId: 1,
			clientX: 100,
			clientY: 100,
			startedOutsideContent: true,
		});

		it("should not set moved when pointer stays within threshold", () => {
			const updated = updateOutsideClosePointerState(baseState, {
				clientX: 101,
				clientY: 100,
			});
			expect(updated.moved).toBe(false);
		});

		it("should set moved to true when pointer exceeds threshold", () => {
			const updated = updateOutsideClosePointerState(baseState, {
				clientX: 104,
				clientY: 100,
			});
			expect(updated.moved).toBe(true);
		});

		it("should not reset moved once it is true", () => {
			const movedState = { ...baseState, moved: true };
			const updated = updateOutsideClosePointerState(movedState, {
				clientX: 100,
				clientY: 100,
			});
			expect(updated.moved).toBe(true);
		});

		it("should fall back to start coordinates for non-finite values", () => {
			const updated = updateOutsideClosePointerState(baseState, {
				clientX: NaN,
				clientY: Infinity,
			});
			expect(updated.moved).toBe(false);
		});

		it("should preserve other state properties", () => {
			const updated = updateOutsideClosePointerState(baseState, {
				clientX: 200,
				clientY: 200,
			});
			expect(updated.pointerId).toBe(baseState.pointerId);
			expect(updated.startX).toBe(baseState.startX);
			expect(updated.startY).toBe(baseState.startY);
			expect(updated.startedOutsideContent).toBe(
				baseState.startedOutsideContent,
			);
		});
	});

	describe("shouldCloseFromOutsidePointerState", () => {
		it("should return true when started outside and did not move", () => {
			const state = createOutsideClosePointerState({
				pointerId: 1,
				clientX: 0,
				clientY: 0,
				startedOutsideContent: true,
			});
			expect(shouldCloseFromOutsidePointerState(state)).toBe(true);
		});

		it("should return false when started outside but pointer moved", () => {
			const state = {
				...createOutsideClosePointerState({
					pointerId: 1,
					clientX: 0,
					clientY: 0,
					startedOutsideContent: true,
				}),
				moved: true,
			};
			expect(shouldCloseFromOutsidePointerState(state)).toBe(false);
		});

		it("should return false when started inside content", () => {
			const state = createOutsideClosePointerState({
				pointerId: 1,
				clientX: 0,
				clientY: 0,
				startedOutsideContent: false,
			});
			expect(shouldCloseFromOutsidePointerState(state)).toBe(false);
		});

		it("should return false when started inside and pointer moved", () => {
			const state = {
				...createOutsideClosePointerState({
					pointerId: 1,
					clientX: 0,
					clientY: 0,
					startedOutsideContent: false,
				}),
				moved: true,
			};
			expect(shouldCloseFromOutsidePointerState(state)).toBe(false);
		});
	});
});

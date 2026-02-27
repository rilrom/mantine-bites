/** Minimum pointer movement in pixels before a gesture is considered a drag. */
export const POINTER_MOVE_THRESHOLD = 2;

/** Tracks the state of a pointer used to detect outside-content close gestures. */
export interface OutsideClosePointerState {
	/** Identifier of the tracked pointer. */
	pointerId: number;
	/** Horizontal position where the pointer was initially pressed. */
	startX: number;
	/** Vertical position where the pointer was initially pressed. */
	startY: number;
	/** Whether the pointer press originated outside the slide content area. */
	startedOutsideContent: boolean;
	/** Whether the pointer has moved beyond the drag threshold since pressing. */
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

/**
 * Returns `true` if the event target is an element (or descendant) matching
 * the given CSS selector.
 */
export const isEventTargetWithinSelector = (
	target: EventTarget | null,
	selector: string,
) => target instanceof HTMLElement && Boolean(target.closest(selector));

/** Returns `true` if the event target is or is inside an `<img>` element. */
export const isImageTarget = (target: EventTarget | null) =>
	isEventTargetWithinSelector(target, "img");

/**
 * Returns `value` if it is a finite number, otherwise returns `fallback`.
 * Useful for sanitising pointer coordinates that may be `NaN` or `Infinity`.
 */
export const getPointerCoordinate = (value: number, fallback: number) =>
	Number.isFinite(value) ? value : fallback;

/**
 * Returns `true` if the pointer has moved more than `threshold` pixels in
 * either axis between the start and end positions.
 */
export const hasPointerMoved = ({
	startX,
	startY,
	endX,
	endY,
	threshold = POINTER_MOVE_THRESHOLD,
}: PointerMoveInput) =>
	Math.abs(endX - startX) > threshold || Math.abs(endY - startY) > threshold;

/** Creates the initial tracking state for an outside-close pointer gesture. */
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

/**
 * Returns an updated copy of the pointer state after a pointer move event.
 * Sets `moved` to `true` once the pointer has exceeded the drag threshold.
 */
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

/**
 * Returns `true` if the pointer gesture should trigger a close action.
 * The action triggers when the press started outside the content and the
 * pointer did not drag.
 */
export const shouldCloseFromOutsidePointerState = (
	state: OutsideClosePointerState,
) => state.startedOutsideContent && !state.moved;

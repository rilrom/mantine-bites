/** Distance in pixels the slide must be swiped before releasing closes the lightbox. */
export const SWIPE_CLOSE_THRESHOLD = 100;

/** Distance in pixels the pointer must travel before the swipe direction is decided. */
export const SWIPE_GESTURE_THRESHOLD = 8;

export type SwipeGesture = "close" | "carousel" | null;

interface ResolveSwipeGestureInput {
	/** Movement along the axis that closes the lightbox. */
	closeDelta: number;
	/** Movement along the axis the carousel scrolls on. */
	carouselDelta: number;
}

/**
 * Decides which gesture a pointer drag belongs to once it has moved past
 * `SWIPE_GESTURE_THRESHOLD`. Returns `null` while the direction is still undecided.
 */
export const resolveSwipeGesture = ({
	closeDelta,
	carouselDelta,
}: ResolveSwipeGestureInput): SwipeGesture => {
	const closeDistance = Math.abs(closeDelta);
	const carouselDistance = Math.abs(carouselDelta);

	if (Math.max(closeDistance, carouselDistance) < SWIPE_GESTURE_THRESHOLD) {
		return null;
	}

	return closeDistance > carouselDistance ? "close" : "carousel";
};

/**
 * Returns how far through the swipe the slide is, from `0` at rest to `1`
 * once it has travelled half of `size`.
 */
export const getSwipeProgress = (offset: number, size: number) => {
	if (size <= 0) {
		return 0;
	}

	return Math.min(Math.abs(offset) / (size / 2), 1);
};

/** Returns `true` if releasing the swipe at `offset` should close the lightbox. */
export const shouldCloseFromSwipe = (offset: number) =>
	Math.abs(offset) >= SWIPE_CLOSE_THRESHOLD;

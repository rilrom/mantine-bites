import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
	getPointerCoordinate,
	isEventTargetWithinSelector,
} from "../utils/pointer.js";
import {
	getSwipeProgress,
	resolveSwipeGesture,
	shouldCloseFromSwipe,
} from "../utils/swipe.js";

interface UseSwipeToCloseInput {
	opened: boolean;
	closeOnSwipe: boolean;
	orientation: "horizontal" | "vertical";
	isZoomedRef: RefObject<boolean>;
	containerRef: RefObject<HTMLDivElement | null>;
	overlayRef: RefObject<HTMLDivElement | null>;
	onClose: () => void;
}

export interface UseSwipeToCloseOutput {
	isSwiping: boolean;
	/** Whether the slide is displaced or still transitioning back to rest. */
	isSwipeActive: boolean;
	handleSwipePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleSwipePointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleSwipePointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
	resetSwipe: () => void;
}

interface SwipeState {
	pointerId: number;
	startX: number;
	startY: number;
	offset: number;
	closing: boolean;
}

/**
 * The swipe is written straight to the DOM so pointer moves do not re-render
 * every lightbox context consumer. The overlay styles React rendered are kept
 * here so they can be put back once the slide is released.
 */
interface SwipeDisplacement {
	container: HTMLElement | null;
	overlay: HTMLElement | null;
	size: number;
	overlayOpacity: string;
	overlayTransitionDuration: string;
	appliedOverlayOpacity: string | null;
}

/**
 * Embla only listens for mouse and touch events, so stopping them here keeps
 * the carousel still without affecting the pointer events driving the swipe.
 */
const swallowCarouselDrag = (event: Event) => {
	event.stopPropagation();

	if (event.type === "touchmove" && event.cancelable) {
		event.preventDefault();
	}
};

const addCarouselDragGuard = () => {
	window.addEventListener("mousemove", swallowCarouselDrag, { capture: true });
	window.addEventListener("touchmove", swallowCarouselDrag, {
		capture: true,
		passive: false,
	});
};

const removeCarouselDragGuard = () => {
	window.removeEventListener("mousemove", swallowCarouselDrag, {
		capture: true,
	});
	window.removeEventListener("touchmove", swallowCarouselDrag, {
		capture: true,
	});
};

export function useSwipeToClose(
	props: UseSwipeToCloseInput,
): UseSwipeToCloseOutput {
	const {
		opened,
		closeOnSwipe,
		orientation,
		isZoomedRef,
		containerRef,
		overlayRef,
		onClose,
	} = props;

	const [isSwiping, setIsSwiping] = useState(false);
	const [isDisplaced, setIsDisplaced] = useState(false);
	const [isSettling, setIsSettling] = useState(false);

	const swipeRef = useRef<SwipeState | null>(null);
	const displacementRef = useRef<SwipeDisplacement | null>(null);

	const releaseSwipe = useCallback(() => {
		if (swipeRef.current?.closing) {
			removeCarouselDragGuard();
		}

		swipeRef.current = null;
		setIsSwiping(false);
	}, []);

	const displace = useCallback(
		(size: number) => {
			const container = containerRef.current;
			const previous = displacementRef.current;

			if (previous) {
				displacementRef.current = { ...previous, container, size };
				return;
			}

			const overlay = overlayRef.current;

			displacementRef.current = {
				container,
				overlay,
				size,
				overlayOpacity: overlay?.style.opacity ?? "",
				overlayTransitionDuration: overlay?.style.transitionDuration ?? "",
				appliedOverlayOpacity: null,
			};
		},
		[containerRef, overlayRef],
	);

	const applySwipeOffset = useCallback(
		(offset: number) => {
			const displacement = displacementRef.current;

			if (!displacement) {
				return;
			}

			const { container, overlay } = displacement;

			if (container) {
				container.style.translate =
					offset === 0
						? ""
						: orientation === "horizontal"
							? `0 ${offset}px`
							: `${offset}px 0`;
			}

			if (!overlay) {
				return;
			}

			const progress = getSwipeProgress(offset, displacement.size);

			if (progress === 0) {
				overlay.style.opacity = displacement.overlayOpacity;
				overlay.style.transitionDuration =
					displacement.overlayTransitionDuration;
				return;
			}

			overlay.style.opacity = String(
				Number(displacement.overlayOpacity || 1) * (1 - progress),
			);
			overlay.style.transitionDuration = "0ms";
			// Browsers round the opacity they store, so compare against what was kept.
			displacement.appliedOverlayOpacity = overlay.style.opacity;
		},
		[orientation],
	);

	const restoreOverlayTransition = useCallback(() => {
		const displacement = displacementRef.current;

		if (displacement?.overlay) {
			displacement.overlay.style.transitionDuration =
				displacement.overlayTransitionDuration;
		}
	}, []);

	const resetSwipe = useCallback(() => {
		const displacement = displacementRef.current;

		if (!displacement) {
			return;
		}

		restoreOverlayTransition();
		displacementRef.current = null;

		const { container, overlay } = displacement;

		if (container) {
			container.style.translate = "";
		}

		// After a swipe closes the lightbox the exit transition owns the opacity,
		// so it is only put back while it still holds the swiped value.
		if (
			overlay &&
			overlay.style.opacity === displacement.appliedOverlayOpacity
		) {
			overlay.style.opacity = displacement.overlayOpacity;
		}

		setIsDisplaced(false);
		setIsSettling(true);
	}, [restoreOverlayTransition]);

	const cancelSwipe = useCallback(() => {
		releaseSwipe();
		resetSwipe();
	}, [releaseSwipe, resetSwipe]);

	const handleSwipePointerDown = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (!event.isPrimary) {
				cancelSwipe();
				return;
			}

			if (
				!closeOnSwipe ||
				isZoomedRef.current ||
				isEventTargetWithinSelector(event.target, "[data-lightbox-caption]")
			) {
				return;
			}

			swipeRef.current = {
				pointerId: event.pointerId,
				startX: getPointerCoordinate(event.clientX, 0),
				startY: getPointerCoordinate(event.clientY, 0),
				offset: 0,
				closing: false,
			};
		},
		[closeOnSwipe, isZoomedRef, cancelSwipe],
	);

	const handleSwipePointerMove = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const swipe = swipeRef.current;

			if (!swipe || swipe.pointerId !== event.pointerId) {
				return;
			}

			const deltaX =
				getPointerCoordinate(event.clientX, swipe.startX) - swipe.startX;
			const deltaY =
				getPointerCoordinate(event.clientY, swipe.startY) - swipe.startY;
			const closeDelta = orientation === "horizontal" ? deltaY : deltaX;
			const carouselDelta = orientation === "horizontal" ? deltaX : deltaY;

			if (!swipe.closing) {
				const gesture = resolveSwipeGesture({ closeDelta, carouselDelta });

				if (!gesture) {
					return;
				}

				if (gesture === "carousel") {
					swipeRef.current = null;
					return;
				}

				swipe.closing = true;

				const rect = event.currentTarget.getBoundingClientRect();

				addCarouselDragGuard();
				event.currentTarget.setPointerCapture?.(event.pointerId);
				displace(
					orientation === "horizontal"
						? rect.height || window.innerHeight
						: rect.width || window.innerWidth,
				);

				// The `data-swiping` attribute has to disable the spring back
				// transition before the first offset is written.
				flushSync(() => {
					setIsSwiping(true);
					setIsDisplaced(true);
					setIsSettling(false);
				});
			}

			swipe.offset = closeDelta;
			applySwipeOffset(closeDelta);
		},
		[orientation, displace, applySwipeOffset],
	);

	const handleSwipePointerEnd = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const swipe = swipeRef.current;

			if (!swipe || swipe.pointerId !== event.pointerId) {
				return;
			}

			releaseSwipe();

			if (!swipe.closing) {
				return;
			}

			event.currentTarget.releasePointerCapture?.(event.pointerId);

			if (event.type === "pointerup" && shouldCloseFromSwipe(swipe.offset)) {
				restoreOverlayTransition();
				onClose();
				return;
			}

			resetSwipe();
		},
		[onClose, releaseSwipe, resetSwipe, restoreOverlayTransition],
	);

	useEffect(() => {
		if (!opened) {
			releaseSwipe();
		}
	}, [opened, releaseSwipe]);

	useEffect(() => {
		if (!closeOnSwipe) {
			cancelSwipe();
		}
	}, [closeOnSwipe, cancelSwipe]);

	useEffect(() => {
		if (!isSettling) {
			return;
		}

		let cancelled = false;
		const transitions = (containerRef.current?.getAnimations?.() ?? []).filter(
			(animation): animation is CSSTransition =>
				(animation as CSSTransition).transitionProperty === "translate",
		);

		Promise.allSettled(transitions.map((animation) => animation.finished)).then(
			() => {
				if (!cancelled) {
					setIsSettling(false);
				}
			},
		);

		return () => {
			cancelled = true;
		};
	}, [isSettling, containerRef]);

	useEffect(() => removeCarouselDragGuard, []);

	return {
		isSwiping,
		isSwipeActive: isDisplaced || isSettling,
		handleSwipePointerDown,
		handleSwipePointerMove,
		handleSwipePointerEnd,
		resetSwipe,
	};
}

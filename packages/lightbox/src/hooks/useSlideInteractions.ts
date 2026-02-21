import type { PointerEvent as ReactPointerEvent, SyntheticEvent } from "react";
import { useCallback, useRef } from "react";
import {
	createOutsideClosePointerState,
	isEventTargetWithinSelector,
	type OutsideClosePointerState,
	shouldCloseFromOutsidePointerState,
	updateOutsideClosePointerState,
} from "../utils/zoom.js";

interface UseSlideInteractionsInput {
	onClose: () => void;
	onZoomPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	onZoomPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
	onZoomPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
	updateCanZoomAvailability: () => void;
}

interface UseSlideInteractionsOutput {
	handleSlidePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleSlidePointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleSlidePointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleSlidePointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleSlideLoadCapture: (event: SyntheticEvent<HTMLDivElement>) => void;
}

export function useSlideInteractions(
	props: UseSlideInteractionsInput,
): UseSlideInteractionsOutput {
	const {
		onClose,
		onZoomPointerDown,
		onZoomPointerMove,
		onZoomPointerEnd,
		updateCanZoomAvailability,
	} = props;

	const outsideClosePointerRef = useRef<OutsideClosePointerState | null>(null);

	const handleSlidePointerDown = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const startedInsideContent = isEventTargetWithinSelector(
				event.target,
				"[data-lightbox-slide-content]",
			);

			outsideClosePointerRef.current = createOutsideClosePointerState({
				pointerId: event.pointerId,
				clientX: event.clientX,
				clientY: event.clientY,
				startedOutsideContent: !startedInsideContent,
			});

			onZoomPointerDown(event);
		},
		[onZoomPointerDown],
	);

	const handleSlidePointerMove = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const outsideClosePointer = outsideClosePointerRef.current;

			if (
				outsideClosePointer &&
				outsideClosePointer.pointerId === event.pointerId
			) {
				outsideClosePointerRef.current = updateOutsideClosePointerState(
					outsideClosePointer,
					{
						clientX: event.clientX,
						clientY: event.clientY,
					},
				);
			}

			onZoomPointerMove(event);
		},
		[onZoomPointerMove],
	);

	const handleSlidePointerUp = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			onZoomPointerEnd(event);

			const outsideClosePointer = outsideClosePointerRef.current;

			if (
				!outsideClosePointer ||
				outsideClosePointer.pointerId !== event.pointerId
			) {
				return;
			}

			const finalizedPointer = updateOutsideClosePointerState(
				outsideClosePointer,
				{
					clientX: event.clientX,
					clientY: event.clientY,
				},
			);

			outsideClosePointerRef.current = null;

			if (shouldCloseFromOutsidePointerState(finalizedPointer)) {
				onClose();
			}
		},
		[onClose, onZoomPointerEnd],
	);

	const handleSlidePointerCancel = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			outsideClosePointerRef.current = null;
			onZoomPointerEnd(event);
		},
		[onZoomPointerEnd],
	);

	const handleSlideLoadCapture = useCallback(
		(event: SyntheticEvent<HTMLDivElement>) => {
			if (event.target instanceof HTMLImageElement) {
				updateCanZoomAvailability();
			}
		},
		[updateCanZoomAvailability],
	);

	return {
		handleSlidePointerDown,
		handleSlidePointerMove,
		handleSlidePointerUp,
		handleSlidePointerCancel,
		handleSlideLoadCapture,
	};
}

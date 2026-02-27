import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useRef } from "react";
import {
	createOutsideClosePointerState,
	isEventTargetWithinSelector,
	type OutsideClosePointerState,
	shouldCloseFromOutsidePointerState,
	updateOutsideClosePointerState,
} from "../utils/pointer.js";

interface UseSlideInteractionsProps {
	onClose: () => void;
}

interface UseSlideInteractionsReturn {
	handleSlidePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleSlidePointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleSlidePointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleSlidePointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

export function useSlideInteractions(
	props: UseSlideInteractionsProps,
): UseSlideInteractionsReturn {
	const { onClose } = props;

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
		},
		[],
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
		},
		[],
	);

	const handleSlidePointerUp = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
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
		[onClose],
	);

	const handleSlidePointerCancel = useCallback(() => {
		outsideClosePointerRef.current = null;
	}, []);

	return {
		handleSlidePointerDown,
		handleSlidePointerMove,
		handleSlidePointerUp,
		handleSlidePointerCancel,
	};
}

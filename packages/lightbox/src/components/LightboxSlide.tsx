import {
	Box,
	type BoxProps,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import type { PointerEvent as ReactPointerEvent, SyntheticEvent } from "react";
import React, { useCallback, useRef } from "react";
import { useLightboxContext } from "../context/LightboxContext.js";
import { useLightboxSlideContext } from "../context/LightboxSlideContext.js";
import classes from "../styles/Lightbox.module.css";
import {
	createOutsideClosePointerState,
	isEventTargetWithinSelector,
	type OutsideClosePointerState,
	shouldCloseFromOutsidePointerState,
	updateOutsideClosePointerState,
} from "../utils/pointer.js";
import { getZoomTransform } from "../utils/zoom.js";
import { LightboxCaption } from "./LightboxCaption.js";

export type LightboxSlideStylesNames = "slide";

export interface LightboxSlideProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxSlideFactory>,
		ElementProps<"div"> {}

export type LightboxSlideFactory = Factory<{
	props: LightboxSlideProps;
	ref: HTMLDivElement;
	stylesNames: LightboxSlideStylesNames;
	compound: true;
}>;

export const LightboxSlide = factory<LightboxSlideFactory>((_props) => {
	const props = useProps("LightboxSlide", null, _props);

	const { className, style, classNames, styles, vars, children, ...others } =
		props;

	const {
		currentIndex,
		getStyles,
		onOutsideClick,
		withZoom,
		isZoomed,
		isDraggingZoom,
		canZoomCurrent,
		zoomOffset,
		zoomScale,
		activeZoomContainerRef,
		activeZoomContentRef,
		handleZoomPointerDown,
		handleZoomPointerMove,
		handleZoomPointerEnd,
		updateCanZoomAvailability,
		closeOnSwipe,
		isSwiping,
		handleSwipePointerDown,
		handleSwipePointerMove,
		handleSwipePointerEnd,
	} = useLightboxContext();

	const { index } = useLightboxSlideContext();

	const outsideClosePointerRef = useRef<OutsideClosePointerState | null>(null);

	const handleSlidePointerDown = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			handleSwipePointerDown(event);

			outsideClosePointerRef.current = event.isPrimary
				? createOutsideClosePointerState({
						pointerId: event.pointerId,
						clientX: event.clientX,
						clientY: event.clientY,
						startedOutsideContent: !isEventTargetWithinSelector(
							event.target,
							":is([data-lightbox-slide-content], [data-lightbox-caption])",
						),
					})
				: null;

			handleZoomPointerDown(event);
		},
		[handleZoomPointerDown, handleSwipePointerDown],
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

			handleSwipePointerMove(event);
			handleZoomPointerMove(event);
		},
		[handleZoomPointerMove, handleSwipePointerMove],
	);

	const handleSlidePointerUp = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			handleSwipePointerEnd(event);
			handleZoomPointerEnd(event);

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
				onOutsideClick();
			}
		},
		[onOutsideClick, handleZoomPointerEnd, handleSwipePointerEnd],
	);

	const handleSlidePointerCancel = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			outsideClosePointerRef.current = null;
			handleSwipePointerEnd(event);
			handleZoomPointerEnd(event);
		},
		[handleZoomPointerEnd, handleSwipePointerEnd],
	);

	const handleSlideLoadCapture = useCallback(
		(event: SyntheticEvent<HTMLDivElement>) => {
			if (event.target instanceof HTMLImageElement) {
				updateCanZoomAvailability();
			}
		},
		[updateCanZoomAvailability],
	);

	const isActive = index === currentIndex;

	const childrenArray = React.Children.toArray(children);
	const captionChild = childrenArray.find(
		(child) => React.isValidElement(child) && child.type === LightboxCaption,
	);
	const slideChildren = childrenArray.filter(
		(child) => !(React.isValidElement(child) && child.type === LightboxCaption),
	);

	return (
		<Box
			aria-current={isActive ? "true" : undefined}
			data-active={isActive || undefined}
			onPointerDown={isActive ? handleSlidePointerDown : undefined}
			onPointerMove={isActive ? handleSlidePointerMove : undefined}
			onPointerUp={isActive ? handleSlidePointerUp : undefined}
			onPointerCancel={isActive ? handleSlidePointerCancel : undefined}
			onLoadCapture={isActive ? handleSlideLoadCapture : undefined}
			{...getStyles("slide", {
				className,
				style,
				classNames,
				styles,
			})}
			{...others}
		>
			<Box
				ref={isActive ? activeZoomContainerRef : undefined}
				data-zoom-enabled={withZoom || undefined}
				data-zoomed={(isActive && isZoomed) || undefined}
				data-can-zoom={isActive ? String(canZoomCurrent) : undefined}
				data-dragging={(isActive && isDraggingZoom) || undefined}
				data-swipe-enabled={closeOnSwipe || undefined}
				data-swiping={(isActive && isSwiping) || undefined}
				{...getStyles("zoomContainer")}
			>
				<Box
					ref={isActive ? activeZoomContentRef : undefined}
					{...getStyles("zoomContent", {
						style: {
							transform: getZoomTransform({
								isZoomed: isActive && isZoomed,
								offset: zoomOffset,
								scale: zoomScale,
							}),
						},
					})}
				>
					<Box style={{ display: "contents" }} data-lightbox-slide-content>
						{slideChildren}
					</Box>
				</Box>
			</Box>
			{captionChild}
		</Box>
	);
});

LightboxSlide.classes = classes;

LightboxSlide.displayName = "LightboxSlide";

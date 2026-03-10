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

export const LightboxSlide = factory<LightboxSlideFactory>((_props, ref) => {
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
		handleZoomPointerDown,
		handleZoomPointerMove,
		handleZoomPointerEnd,
		updateCanZoomAvailability,
	} = useLightboxContext();

	const { index } = useLightboxSlideContext();

	const outsideClosePointerRef = useRef<OutsideClosePointerState | null>(null);

	const handleSlidePointerDown = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const startedInsideContent = isEventTargetWithinSelector(
				event.target,
				":is([data-lightbox-slide-content], [data-lightbox-caption])",
			);

			outsideClosePointerRef.current = createOutsideClosePointerState({
				pointerId: event.pointerId,
				clientX: event.clientX,
				clientY: event.clientY,
				startedOutsideContent: !startedInsideContent,
			});

			handleZoomPointerDown(event);
		},
		[handleZoomPointerDown],
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

			handleZoomPointerMove(event);
		},
		[handleZoomPointerMove],
	);

	const handleSlidePointerUp = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
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
		[onOutsideClick, handleZoomPointerEnd],
	);

	const handleSlidePointerCancel = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			outsideClosePointerRef.current = null;
			handleZoomPointerEnd(event);
		},
		[handleZoomPointerEnd],
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
			ref={ref}
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
				{...getStyles("zoomContainer")}
			>
				<Box
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

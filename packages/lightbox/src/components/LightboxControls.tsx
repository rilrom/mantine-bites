import { ActionIcon } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";
import { LIGHTBOX_DEFAULT_PROPS } from "../Lightbox.defaults.js";

export function LightboxControls() {
	const { slideCarouselProps, onScrollPrev, onScrollNext, getStyles } =
		useLightboxContext();

	const controlSize =
		slideCarouselProps.controlSize ??
		LIGHTBOX_DEFAULT_PROPS.slideCarouselProps.controlSize;

	return (
		<>
			<ActionIcon
				{...getStyles("control")}
				data-direction="prev"
				aria-label="Previous slide"
				size={controlSize}
				variant="default"
				onClick={onScrollPrev}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="60%"
					height="60%"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</ActionIcon>
			<ActionIcon
				{...getStyles("control")}
				data-direction="next"
				aria-label="Next slide"
				size={controlSize}
				variant="default"
				onClick={onScrollNext}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="60%"
					height="60%"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</ActionIcon>
		</>
	);
}

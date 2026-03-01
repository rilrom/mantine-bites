import { ActionIcon, useProps } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";

export interface LightboxControlsProps {
	/** Size of the prev/next navigation buttons in px, `36` by default */
	size?: number;
}

const defaultProps: Partial<LightboxControlsProps> = {
	size: 36,
};

export function LightboxControls(_props: LightboxControlsProps) {
	const props = useProps("LightboxControls", defaultProps, _props);

	const { size } = props;

	const { onScrollPrev, onScrollNext, getStyles } = useLightboxContext();

	return (
		<>
			<ActionIcon
				{...getStyles("control")}
				data-direction="prev"
				aria-label="Previous slide"
				size={size}
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
				size={size}
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

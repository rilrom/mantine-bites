import {
	AccordionChevron,
	rem,
	UnstyledButton,
	useDirection,
	useProps,
} from "@mantine/core";
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

	const { onScrollPrev, onScrollNext, getStyles, orientation } =
		useLightboxContext();

	const { dir } = useDirection();

	const prevRotation =
		orientation === "horizontal" ? 90 * (dir === "ltr" ? 1 : -1) : -180;
	const nextRotation =
		orientation === "horizontal" ? 90 * (dir === "ltr" ? -1 : 1) : 0;

	return (
		<>
			<UnstyledButton
				{...getStyles("control", {
					style: { "--lightbox-control-size": rem(size) },
				})}
				data-direction="prev"
				aria-label="Previous slide"
				onClick={onScrollPrev}
			>
				<AccordionChevron style={{ transform: `rotate(${prevRotation}deg)` }} />
			</UnstyledButton>
			<UnstyledButton
				{...getStyles("control", {
					style: {
						"--lightbox-control-size": rem(size),
					} as React.CSSProperties,
				})}
				data-direction="next"
				aria-label="Next slide"
				onClick={onScrollNext}
			>
				<AccordionChevron style={{ transform: `rotate(${nextRotation}deg)` }} />
			</UnstyledButton>
		</>
	);
}

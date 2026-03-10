import {
	AccordionChevron,
	type CompoundStylesApiProps,
	type Factory,
	factory,
	rem,
	UnstyledButton,
	useDirection,
	useProps,
} from "@mantine/core";
import { useLightboxContext } from "../context/LightboxContext.js";
import { useScrollButtons } from "../hooks/useScrollButtons.js";
import classes from "../styles/Lightbox.module.css";

export type LightboxControlsStylesNames = "control";

export interface LightboxControlsProps
	extends CompoundStylesApiProps<LightboxControlsFactory> {
	/** Size of the prev/next navigation buttons in px, `36` by default */
	size?: number;
}

const defaultProps = {
	size: 36,
} satisfies Partial<LightboxControlsProps>;

export type LightboxControlsFactory = Factory<{
	props: LightboxControlsProps;
	ref: HTMLElement;
	stylesNames: LightboxControlsStylesNames;
	compound: true;
}>;

export const LightboxControls = factory<LightboxControlsFactory>(
	(_props, _ref) => {
		const props = useProps("LightboxControls", defaultProps, _props);

		const { classNames, styles, size } = props;

		const {
			onScrollPrev,
			onScrollNext,
			getStyles,
			orientation,
			slidesEmblaApi,
		} = useLightboxContext();

		const { prevBtnDisabled, nextBtnDisabled } =
			useScrollButtons(slidesEmblaApi);

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
						classNames,
						styles,
					})}
					data-direction="prev"
					aria-label="Previous slide"
					disabled={prevBtnDisabled}
					onClick={onScrollPrev}
				>
					<AccordionChevron
						style={{ transform: `rotate(${prevRotation}deg)` }}
					/>
				</UnstyledButton>
				<UnstyledButton
					{...getStyles("control", {
						style: {
							"--lightbox-control-size": rem(size),
						} as React.CSSProperties,
						classNames,
						styles,
					})}
					data-direction="next"
					aria-label="Next slide"
					disabled={nextBtnDisabled}
					onClick={onScrollNext}
				>
					<AccordionChevron
						style={{ transform: `rotate(${nextRotation}deg)` }}
					/>
				</UnstyledButton>
			</>
		);
	},
);

LightboxControls.classes = classes;

LightboxControls.displayName = "LightboxControls";

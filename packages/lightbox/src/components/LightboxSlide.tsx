import {
	Box,
	type BoxProps,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import { useSlideInteractions } from "../hooks/useSlideInteractions.js";
import { useLightboxContext } from "../Lightbox.context.js";
import { useLightboxSlideContext } from "./LightboxSlide.context.js";

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

	const { currentIndex, getStyles, onOutsideClick } = useLightboxContext();

	const { index } = useLightboxSlideContext();

	const {
		handleSlidePointerDown,
		handleSlidePointerMove,
		handleSlidePointerUp,
		handleSlidePointerCancel,
	} = useSlideInteractions({
		onClose: onOutsideClick,
	});

	const isActive = index === currentIndex;

	return (
		<Box
			ref={ref}
			aria-current={isActive ? "true" : undefined}
			data-active={isActive || undefined}
			onPointerDown={isActive ? handleSlidePointerDown : undefined}
			onPointerMove={isActive ? handleSlidePointerMove : undefined}
			onPointerUp={isActive ? handleSlidePointerUp : undefined}
			onPointerCancel={isActive ? handleSlidePointerCancel : undefined}
			{...getStyles("slide", {
				className,
				style,
				classNames,
				styles,
			})}
			{...others}
		>
			<Box style={{ display: "contents" }} data-lightbox-slide-content>
				{children}
			</Box>
		</Box>
	);
});

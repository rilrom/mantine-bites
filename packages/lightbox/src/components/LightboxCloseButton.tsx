import {
	ActionIcon,
	type BoxProps,
	CloseIcon,
	type CompoundStylesApiProps,
	type ElementProps,
	type Factory,
	factory,
	useProps,
} from "@mantine/core";
import { useLightboxContext } from "../context/LightboxContext.js";
import classes from "../styles/Lightbox.module.css";

export type LightboxCloseButtonStylesNames = "closeButton";

export interface LightboxCloseButtonProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxCloseButtonFactory>,
		ElementProps<"button"> {}

export type LightboxCloseButtonFactory = Factory<{
	props: LightboxCloseButtonProps;
	ref: HTMLButtonElement;
	stylesNames: LightboxCloseButtonStylesNames;
	compound: true;
}>;

export const LightboxCloseButton = factory<LightboxCloseButtonFactory>(
	(_props) => {
		const props = useProps("LightboxCloseButton", null, _props);

		const { classNames, className, style, styles, vars, ...others } = props;

		const { onClose, getStyles } = useLightboxContext();

		return (
			<ActionIcon
				variant="default"
				size="lg"
				onClick={onClose}
				aria-label="Close lightbox"
				{...getStyles("closeButton", { className, style, classNames, styles })}
				{...others}
			>
				<CloseIcon />
			</ActionIcon>
		);
	},
);

LightboxCloseButton.classes = classes;

LightboxCloseButton.displayName = "LightboxCloseButton";

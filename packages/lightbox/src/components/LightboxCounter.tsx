import {
	type BoxProps,
	type CompoundStylesApiProps,
	type Factory,
	factory,
	Text,
	useProps,
} from "@mantine/core";
import { useLightboxContext } from "../context/LightboxContext.js";
import classes from "../styles/Lightbox.module.css";

export type LightboxCounterStylesNames = "counter";

export interface LightboxCounterProps
	extends BoxProps,
		CompoundStylesApiProps<LightboxCounterFactory> {
	/** Custom formatter for the counter label, `(i, t) => \`${i + 1} / ${t}\`` by default */
	formatter?: (index: number, total: number) => string;
}

export type LightboxCounterFactory = Factory<{
	props: LightboxCounterProps;
	ref: HTMLParagraphElement;
	stylesNames: LightboxCounterStylesNames;
	compound: true;
}>;

export const LightboxCounter = factory<LightboxCounterFactory>(
	(_props, ref) => {
		const props = useProps("LightboxCounter", null, _props);

		const { classNames, className, style, styles, vars, formatter, ...others } =
			props;

		const { currentIndex, slideCount, getStyles } = useLightboxContext();

		if (slideCount === null) {
			return null;
		}

		const label = formatter
			? formatter(currentIndex, slideCount)
			: `${currentIndex + 1} / ${slideCount}`;

		return (
			<Text
				ref={ref}
				size="sm"
				{...getStyles("counter", { className, style, classNames, styles })}
				{...others}
			>
				{label}
			</Text>
		);
	},
);

LightboxCounter.classes = classes;

LightboxCounter.displayName = "LightboxCounter";

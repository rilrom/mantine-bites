import { Text, useProps } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";

export interface LightboxCounterProps {
	/** Custom formatter for the counter label, `(i, t) => \`${i + 1} / ${t}\`` by default */
	formatter?: (index: number, total: number) => string;
}

export function LightboxCounter(_props: LightboxCounterProps) {
	const props = useProps("LightboxCounter", null, _props);

	const { formatter } = props;

	const { currentIndex, slideCount, getStyles } = useLightboxContext();

	if (slideCount === null) {
		return null;
	}

	const label = formatter
		? formatter(currentIndex, slideCount)
		: `${currentIndex + 1} / ${slideCount}`;

	return (
		<Text size="sm" {...getStyles("counter")}>
			{label}
		</Text>
	);
}

import { Text } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";

export function LightboxCounter() {
	const { counterLabel, getStyles } = useLightboxContext();

	if (!counterLabel) {
		return null;
	}

	return (
		<Text size="sm" {...getStyles("counter")}>
			{counterLabel}
		</Text>
	);
}

import { Text } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";

export function LightboxCounter() {
	const { counterText, getStyles } = useLightboxContext();

	if (!counterText) {
		return null;
	}

	return (
		<Text size="sm" {...getStyles("counter")}>
			{counterText}
		</Text>
	);
}

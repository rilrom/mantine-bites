import { Text } from "@mantine/core";
import { useLightboxContext } from "../Lightbox.context.js";

export function LightboxCounter() {
	const ctx = useLightboxContext();

	return (
		<Text size="sm" {...ctx.getStyles("counter")}>
			{ctx.counterText}
		</Text>
	);
}

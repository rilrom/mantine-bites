import "@mantine/core/styles.css";

import { MantineProvider, useMantineColorScheme } from "@mantine/core";
import { addons } from "@storybook/preview-api";
import type { Preview } from "@storybook/react";
import type React from "react";
import { useEffect } from "react";
import { DARK_MODE_EVENT_NAME } from "storybook-dark-mode";

const channel = addons.getChannel();

function ColorSchemeWrapper({ children }: { children: React.ReactNode }) {
	const { setColorScheme } = useMantineColorScheme();
	const handleColorScheme = (value: boolean) =>
		setColorScheme(value ? "dark" : "light");

	// biome-ignore lint/correctness/useExhaustiveDependencies: TODO
	useEffect(() => {
		channel.on(DARK_MODE_EVENT_NAME, handleColorScheme);
		return () => channel.off(DARK_MODE_EVENT_NAME, handleColorScheme);
	}, [channel]);

	return <>{children}</>;
}

export const decorators = [
	(renderStory: any) => (
		<ColorSchemeWrapper>{renderStory()}</ColorSchemeWrapper>
	),
	(renderStory: any) => <MantineProvider>{renderStory()}</MantineProvider>,
];

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;

import { dirname, join } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

function getAbsolutePath(value: string): string {
	return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
	stories: ["../../../packages/*/src/**/*.story.@(js|jsx|mjs|ts|tsx)"],
	addons: [
		getAbsolutePath("@storybook/addon-essentials"),
		getAbsolutePath("storybook-dark-mode"),
	],
	framework: {
		name: getAbsolutePath("@storybook/react-vite") as "@storybook/react-vite",
		options: {},
	},
	docs: {
		autodocs: false,
	},
};

export default config;

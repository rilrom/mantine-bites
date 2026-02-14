import { nodeResolve } from "@rollup/plugin-node-resolve";
import { createGenerateScopedName } from "hash-css-selector";
import banner from "rollup-plugin-banner2";
import esbuild from "rollup-plugin-esbuild";
import nodeExternals from "rollup-plugin-node-externals";
import postcss from "rollup-plugin-postcss";

export function createRollupConfig({ input = "./src/index.ts" } = {}) {
	return {
		input,
		output: [
			{
				format: "es",
				entryFileNames: "[name].mjs",
				dir: "./dist/esm",
				preserveModules: true,
				sourcemap: true,
			},
			{
				format: "cjs",
				entryFileNames: "[name].cjs",
				dir: "./dist/cjs",
				preserveModules: true,
				sourcemap: true,
			},
		],
		plugins: [
			nodeExternals(),
			nodeResolve({ extensions: [".ts", ".tsx", ".js", ".jsx"] }),
			esbuild({ sourceMap: false, tsconfig: "./tsconfig.json" }),
			postcss({
				extract: true,
				modules: { generateScopedName: createGenerateScopedName("me") },
				minimize: true,
			}),
			banner((chunk) => {
				if (chunk.fileName !== "index.js" && chunk.fileName !== "index.mjs") {
					return "'use client';\n";
				}
				return undefined;
			}),
		],
	};
}

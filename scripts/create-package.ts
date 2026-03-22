import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function toPascalCase(slug: string): string {
	return slug
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

function validateSlug(slug: string): string | null {
	if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(slug)) {
		return "Slug must be lowercase kebab-case (e.g. my-component)";
	}

	if (existsSync(path.join(ROOT, "packages", slug))) {
		return `Package 'packages/${slug}' already exists`;
	}

	return null;
}

// ---------------------------------------------------------------------------
// Package file templates
// ---------------------------------------------------------------------------

function packageJson(slug: string, description: string): string {
	return JSON.stringify(
		{
			name: `@mantine-bites/${slug}`,
			version: "0.0.0",
			description,
			license: "MIT",
			type: "module",
			keywords: ["extension", "mantine", slug],
			main: "./dist/cjs/index.cjs",
			module: "./dist/esm/index.mjs",
			types: "./dist/types/index.d.ts",
			exports: {
				".": {
					import: {
						types: "./dist/types/index.d.mts",
						default: "./dist/esm/index.mjs",
					},
					require: {
						types: "./dist/types/index.d.ts",
						default: "./dist/cjs/index.cjs",
					},
				},
				"./styles.css": "./dist/styles.css",
				"./styles.layer.css": "./dist/styles.layer.css",
			},
			files: ["dist"],
			peerDependencies: {
				"@mantine/core": ">=8.0.0",
				"@mantine/hooks": ">=8.0.0",
				react: "^18.x || ^19.x",
				"react-dom": "^18.x || ^19.x",
			},
			devDependencies: {
				"@mantine-bites/rollup-config": "workspace:*",
				"@mantine-bites/typescript-config": "workspace:*",
				"@mantine-tests/core": "^2.1.0",
				"@mantine/core": "^8.3.18",
				"@mantine/hooks": "^8.3.18",
				"@testing-library/dom": "^10.4.0",
				"@testing-library/jest-dom": "^6.6.3",
				"@testing-library/react": "^16.3.0",
				"@testing-library/user-event": "^14.6.1",
				"@types/jest": "^29.5.14",
				"@types/react": "^19.2.14",
				"@types/react-dom": "^19",
				"esbuild-jest": "^0.5.0",
				"identity-obj-proxy": "^3.0.0",
				jest: "^29.7.0",
				"jest-axe": "^10.0.0",
				"jest-environment-jsdom": "^29.7.0",
				react: "^19.2.4",
				"react-dom": "^19.2.4",
				rollup: "^4.59.1",
			},
			scripts: {
				build:
					"rollup -c && tsx ../../scripts/generate-dts.ts && tsx ../../scripts/prepare-css.ts",
				test: "jest",
				tsc: "tsc --noEmit",
				lint: "pnpm lint:biome && pnpm lint:styles",
				"lint:biome": "biome check --write .",
				"lint:styles": 'stylelint --fix=strict "**/*.module.css"',
			},
		},
		null,
		"\t",
	);
}

function rollupConfig(): string {
	return `import { createRollupConfig } from "@mantine-bites/rollup-config";

export default createRollupConfig();
`;
}

function tsconfig(): string {
	return `{
\t"extends": "@mantine-bites/typescript-config/react-library.json",
\t"include": ["src", "global.d.ts"],
\t"exclude": ["dist"]
}
`;
}

function jestConfig(): string {
	return `const path = require("node:path");

module.exports = {
\trootDir: ".",
\ttestEnvironment: require.resolve("jest-environment-jsdom"),
\ttransform: {
\t\t"^.+\\\\.tsx?$": require.resolve("esbuild-jest"),
\t},
\ttestMatch: ["**/?(*.)+(spec|test).ts?(x)"],
\tsetupFilesAfterEnv: [path.join(__dirname, "jsdom.mocks.cjs")],
\tmoduleNameMapper: {
\t\t"\\\\.(css)$": require.resolve("identity-obj-proxy"),
\t\t"^(\\\\.\\\\.\\\\.?/.*)\\\\.js$": "$1",
\t},
};
`;
}

function jsdomMocks(): string {
	return `require("@testing-library/jest-dom");

global.React = require("react");

const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);

Object.defineProperty(window, "matchMedia", {
\twritable: true,
\tvalue: jest.fn().mockImplementation((query) => ({
\t\tmatches: false,
\t\tmedia: query,
\t\tonchange: null,
\t\taddListener: jest.fn(),
\t\tremoveListener: jest.fn(),
\t\taddEventListener: jest.fn(),
\t\tremoveEventListener: jest.fn(),
\t\tdispatchEvent: jest.fn(),
\t})),
});

class ResizeObserver {
\tobserve() {}
\tunobserve() {}
\tdisconnect() {}
}

window.ResizeObserver = ResizeObserver;

class IntersectionObserver {
\tobserve() {}
\tunobserve() {}
\tdisconnect() {}
}

window.IntersectionObserver = IntersectionObserver;
`;
}

function globalDts(): string {
	return `/// <reference types="@testing-library/jest-dom" />

declare module "*.module.css" {
\tconst classes: Record<string, string>;
\texport default classes;
}
`;
}

function srcIndex(slug: string): string {
	const c = toPascalCase(slug);

	return `export type {
\t${c}CssVariables,
\t${c}Factory,
\t${c}Props,
\t${c}StylesNames,
} from "./${c}.js";

export { ${c} } from "./${c}.js";
`;
}

function srcComponent(slug: string): string {
	const c = toPascalCase(slug);

	const cssVar = `--${slug}-color`;

	return `import {
\tBox,
\ttype BoxProps,
\tcreateVarsResolver,
\ttype ElementProps,
\ttype Factory,
\tfactory,
\tgetThemeColor,
\ttype MantineColor,
\ttype StylesApiProps,
\tuseProps,
\tuseStyles,
} from "@mantine/core";
import classes from "./${c}.module.css";

export type ${c}StylesNames = "root";

export type ${c}CssVariables = {
\troot: "${cssVar}";
};

export interface ${c}Props
\textends BoxProps,
\t\tStylesApiProps<${c}Factory>,
\t\tElementProps<"div"> {
\t/** Controls \`background-color\`, key of \`theme.colors\` or any valid CSS color, \`theme.primaryColor\` by default */
\tcolor?: MantineColor;
}

export type ${c}Factory = Factory<{
\tprops: ${c}Props;
\tref: HTMLDivElement;
\tstylesNames: ${c}StylesNames;
\tvars: ${c}CssVariables;
}>;

const defaultProps: Partial<${c}Props> = {};

const varsResolver = createVarsResolver<${c}Factory>((theme, { color }) => ({
\troot: {
\t\t"${cssVar}": getThemeColor(color, theme),
\t},
}));

export const ${c} = factory<${c}Factory>((_props, ref) => {
\tconst props = useProps("${c}", defaultProps, _props);
\tconst { classNames, className, style, styles, unstyled, vars, ...others } =
\t\tprops;

\tconst getStyles = useStyles<${c}Factory>({
\t\tname: "${c}",
\t\tclasses,
\t\tprops,
\t\tclassName,
\t\tstyle,
\t\tclassNames,
\t\tstyles,
\t\tunstyled,
\t\tvars,
\t\tvarsResolver,
\t});

\treturn <Box ref={ref} {...getStyles("root")} {...others} />;
});

${c}.displayName = "${c}";
${c}.classes = classes;
`;
}

function srcCss(): string {
	return `.root {
}
`;
}

function srcTest(slug: string): string {
	const c = toPascalCase(slug);

	return `import { render, screen, tests } from "@mantine-tests/core";
import { ${c} } from "./${c}.js";
import type { ${c}Props, ${c}StylesNames } from "./${c}.js";

const defaultProps: ${c}Props = {};

describe("@mantine-bites/${slug}/${c}", () => {
\ttests.itSupportsSystemProps<${c}Props, ${c}StylesNames>({
\t\tcomponent: ${c},
\t\tprops: defaultProps,
\t\tpolymorphic: true,
\t\tstyleProps: true,
\t\textend: true,
\t\tvariant: true,
\t\tsize: true,
\t\tclasses: true,
\t\trefType: HTMLDivElement,
\t\tdisplayName: "${c}",
\t\tstylesApiSelectors: ["root"],
\t});

\tit("renders without crashing", () => {
\t\trender(<${c} data-testid="${slug}-root" />);
\t\texpect(screen.getByTestId("${slug}-root")).toBeInTheDocument();
\t});
});
`;
}

function srcStory(slug: string): string {
	const c = toPascalCase(slug);

	return `import { ${c} } from "./${c}.js";

export function Default() {
\treturn <${c} />;
}
`;
}

// ---------------------------------------------------------------------------
// Docs file templates
// ---------------------------------------------------------------------------

function docsPage(slug: string): string {
	const c = toPascalCase(slug);

	return `import { DocsTabs } from "../components/DocsTabs";
import { PageHeader } from "../components/PageHeader";
import { Shell } from "../components/Shell";
import { PACKAGES_DATA } from "../data";
import docgen from "../docgen.json";

import Docs from "../docs/${slug}.mdx";
import { STYLES_API_DATA } from "../styles-api/${slug}";

export default function ${c}PackagePage() {
\tconst slug = "${slug}";
\tconst data = PACKAGES_DATA[slug];

\tif (!data) {
\t\tthrow new Error("Data is missing");
\t}

\treturn (
\t\t<Shell>
\t\t\t<PageHeader data={data} />
\t\t\t<DocsTabs
\t\t\t\tdocgen={docgen}
\t\t\t\tcomponentsProps={data.componentsProps}
\t\t\t\tcomponentsStyles={data.componentsStyles}
\t\t\t\tstylesApiData={STYLES_API_DATA}
\t\t\t>
\t\t\t\t<Docs />
\t\t\t</DocsTabs>
\t\t</Shell>
\t);
}
`;
}

function docsMdx(slug: string): string {
	const c = toPascalCase(slug);

	return `import { InstallScript } from '../components/InstallScript/InstallScript';
import * as demos from '../demos/${slug}';

## Installation

<InstallScript packages="@mantine-bites/${slug}" />

After installation import package styles at the root of your application:

\`\`\`tsx
import '@mantine/core/styles.css';
// ‼️ import ${slug} styles after core package styles
import '@mantine-bites/${slug}/styles.css';
\`\`\`

## Usage

\`\`\`tsx
import { ${c} } from '@mantine-bites/${slug}';
\`\`\`

{/* Add demos and documentation here */}
`;
}

function docsStylesApiComponent(slug: string): string {
	const c = toPascalCase(slug);

	return `import type { ${c}Factory } from "@mantine-bites/${slug}";
import type { StylesApiData } from "../../components/styles-api.types";

export const ${c}StylesApi: StylesApiData<${c}Factory> = {
\tselectors: {
\t\troot: "Root element of the ${c} component.",
\t},

\tvars: {},

\tmodifiers: [],
};
`;
}

function docsStylesApiIndex(slug: string): string {
	const c = toPascalCase(slug);

	return `import { ${c}StylesApi } from "./${c}.styles-api";

export const STYLES_API_DATA = {
\t${c}: ${c}StylesApi,
};
`;
}

function docsDemosIndex(slug: string): string {
	const c = toPascalCase(slug);

	return `// Add demo exports here as you build them
// Example: export { myDemo } from "./${c}.demo.myDemo";
`;
}

// ---------------------------------------------------------------------------
// data.ts patch
// ---------------------------------------------------------------------------

async function patchDataTs(slug: string, description: string): Promise<void> {
	const filePath = path.join(ROOT, "apps", "docs", "data.ts");

	const source = await readFile(filePath, "utf8");

	const c = toPascalCase(slug);

	const newEntry = `\t${slug}: {
\t\tpackageName: \`@\${REPO_NAME}/${slug}\`,
\t\tpackageDescription: ${JSON.stringify(description)},
\t\tmdxFileUrl: \`https://github.com/rilrom/\${REPO_NAME}/blob/main/apps/docs/docs/${slug}.mdx\`,
\t\trepositoryUrl: REPO_URL,
\t\tlicenseUrl: \`https://github.com/rilrom/\${REPO_NAME}/blob/main/LICENSE\`,
\t\tauthor: {
\t\t\tname: "Riley Langbein",
\t\t\tgithubUsername: "rilrom",
\t\t},
\t\tcomponentsProps: ["${c}"],
\t\tcomponentsStyles: ["${c}"],
\t},
`;

	// Find the last `};` in the file — PACKAGES_DATA is always the final export
	const matches = [...source.matchAll(/^};$/gm)];

	if (matches.length === 0) {
		throw new Error("Could not find closing `};` in data.ts — cannot patch");
	}

	const lastMatch = matches[matches.length - 1];

	const matchIndex = lastMatch?.index ?? source.lastIndexOf("};");

	const patched =
		source.slice(0, matchIndex) + newEntry + source.slice(matchIndex);

	await writeFile(filePath, patched, "utf8");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	const slug = process.argv[2]?.trim() ?? "";

	const slugError = validateSlug(slug);

	if (slugError) {
		console.error(`  ✗ ${slugError}`);
		console.error("  Usage: pnpm create-package <slug>");

		process.exit(1);
	}

	const description = "TODO";

	const c = toPascalCase(slug);

	const pkgDir = path.join(ROOT, "packages", slug);
	const srcDir = path.join(pkgDir, "src");
	const docsDir = path.join(ROOT, "apps", "docs");

	console.log(`\nScaffolding @mantine-bites/${slug}...\n`);

	// Create directories
	await mkdir(srcDir, { recursive: true });
	await mkdir(path.join(docsDir, "styles-api", slug), { recursive: true });
	await mkdir(path.join(docsDir, "demos", slug), { recursive: true });

	// Package files
	const packageFiles: Array<[string, string]> = [
		[path.join(pkgDir, "package.json"), packageJson(slug, description)],
		[path.join(pkgDir, "rollup.config.ts"), rollupConfig()],
		[path.join(pkgDir, "tsconfig.json"), tsconfig()],
		[path.join(pkgDir, "jest.config.cjs"), jestConfig()],
		[path.join(pkgDir, "jsdom.mocks.cjs"), jsdomMocks()],
		[path.join(pkgDir, "global.d.ts"), globalDts()],
		[path.join(srcDir, "index.ts"), srcIndex(slug)],
		[path.join(srcDir, `${c}.tsx`), srcComponent(slug)],
		[path.join(srcDir, `${c}.module.css`), srcCss()],
		[path.join(srcDir, `${c}.test.tsx`), srcTest(slug)],
		[path.join(srcDir, `${c}.story.tsx`), srcStory(slug)],
	];

	// Docs files
	const docsFiles: Array<[string, string]> = [
		[path.join(docsDir, "pages", `${slug}.tsx`), docsPage(slug)],
		[path.join(docsDir, "docs", `${slug}.mdx`), docsMdx(slug)],
		[
			path.join(docsDir, "styles-api", slug, `${c}.styles-api.ts`),
			docsStylesApiComponent(slug),
		],
		[
			path.join(docsDir, "styles-api", slug, "index.ts"),
			docsStylesApiIndex(slug),
		],
		[path.join(docsDir, "demos", slug, "index.ts"), docsDemosIndex(slug)],
	];

	for (const [filePath, content] of [...packageFiles, ...docsFiles]) {
		await writeFile(filePath, content, "utf8");

		console.log(`  ✓ ${path.relative(ROOT, filePath)}`);
	}

	// Patch data.ts
	await patchDataTs(slug, description);

	console.log("  ✓ apps/docs/data.ts (patched)");

	// Run pnpm install
	console.log("\nRunning pnpm install...");

	execSync("pnpm install", { cwd: ROOT, stdio: "inherit" });

	console.log(`✅ Done! @mantine-bites/${slug} is ready.`);
}

main().catch((err) => {
	console.error(err);

	process.exit(1);
});

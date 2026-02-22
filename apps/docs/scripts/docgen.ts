import fs from "node:fs";
import path from "node:path";
import { generateDeclarations } from "mantine-docgen-script";

const cwd = process.cwd();
const packagesDir = path.join(cwd, "../../packages");

const componentsPaths: string[] = [];

for (const pkg of fs.readdirSync(packagesDir)) {
	const srcDir = path.join(packagesDir, pkg, "src");
	if (!fs.existsSync(srcDir)) continue;
	if (["rollup-config", "typescript-config"].includes(pkg)) continue;

	for (const file of fs.readdirSync(srcDir)) {
		if (
			file.endsWith(".tsx") &&
			!file.includes(".story.") &&
			!file.includes(".test.") &&
			!file.includes("index")
		) {
			componentsPaths.push(path.join(srcDir, file));
		}
	}
}

const outputPath = cwd;

const docgenPath = path.join(outputPath, "docgen.json");

await generateDeclarations({
	componentsPaths,
	tsConfigPath: path.join(cwd, "tsconfig.json"),
	outputPath,
});

const docgen = JSON.parse(fs.readFileSync(docgenPath, "utf-8"));

// Format it to use tabs to satisfy biome formatting
fs.writeFileSync(docgenPath, `${JSON.stringify(docgen, null, "\t")}\n`);

import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const esmCss = join(cwd, "dist/esm/index.css");
const cjsCss = join(cwd, "dist/cjs/index.css");

if (!existsSync(esmCss)) {
  process.exit(0);
}

const content = readFileSync(esmCss, "utf-8");

writeFileSync(join(cwd, "dist/styles.css"), content);
writeFileSync(
  join(cwd, "dist/styles.layer.css"),
  `@layer mantine {${content}}`,
);

unlinkSync(esmCss);
if (existsSync(cjsCss)) {
  unlinkSync(cjsCss);
}

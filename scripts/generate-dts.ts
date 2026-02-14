import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();

try {
  execSync(
    "tsc --project tsconfig.json --emitDeclarationOnly --declarationDir dist/types --outDir dist/types",
    { stdio: "inherit", cwd },
  );

  const dts = join(cwd, "dist/types/index.d.ts");
  const dmts = join(cwd, "dist/types/index.d.mts");

  if (existsSync(dts)) {
    copyFileSync(dts, dmts);
  }
} catch {
  console.error("Failed to generate .d.ts files");
  process.exit(1);
}

import fs from "node:fs";
import path from "node:path";

fs.writeFileSync(path.join(process.cwd(), "apps/docs/out/.nojekyll"), "");

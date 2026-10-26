import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = resolve(root, "package.json");
const publicVersionPath = resolve(root, "public/version.json");

const packageText = await readFile(packagePath, "utf8");
let packageJson;

try {
  packageJson = JSON.parse(packageText);
} catch (error) {
  throw new Error(`No se pudo leer package.json: ${error.message}`);
}

const currentVersion = packageJson.version;
const match = typeof currentVersion === "string"
  ? /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(currentVersion)
  : null;

if (!match) {
  throw new Error(`La versión ${JSON.stringify(currentVersion)} no es SemVer x.y.z válido`);
}

const nextVersion = `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
packageJson.version = nextVersion;

await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
await writeFile(publicVersionPath, `${JSON.stringify({ version: nextVersion })}\n`);

console.log(`Versión actualizada: ${currentVersion} -> ${nextVersion}`);

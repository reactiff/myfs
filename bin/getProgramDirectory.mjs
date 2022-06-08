import path from "path";
import { fileURLToPath } from "url";

/////////////////// bin/index ////////////////////

export function getProgramDirectory() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(__dirname, "..");
}

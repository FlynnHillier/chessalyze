import path from "path";
import { fileURLToPath } from "url";

export const PUBLIC_FOLDER_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../public",
);

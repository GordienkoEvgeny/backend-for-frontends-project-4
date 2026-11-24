import fsp from "node:fs/promises";
import { log } from "./logger.js";

export function createDirectory(dirPath) {
  return fsp
    .mkdir(dirPath, { recursive: true })
    .then(() => log(`✅ Директория ${dirPath} создана`))
    .catch((e) => log(`Ошибка создания директории ${dirPath}`));
}

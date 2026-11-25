import fsp from "node:fs/promises";
import { log } from "./logger.js";

export function saveFile(dir, name, data) {
  return fsp
    .writeFile(`${dir}/${name}`, data)
    .then(() => {
      log(`✅ Файл ${name} сохранен!`);
    })
    .catch((error) => {
      throw new Error(`Ошибка сохранения файла ${name}: ${error.message}`);
    });
}

import fsp from "node:fs/promises";
import { log } from "./logger.js";

export function saveFile(dir, name, data) {
  return fsp
    .writeFile(`${dir}/${name}`, data)
    .then(() => {
      log(`✅ Файл ${name} сохранен!`);
    })
    .catch((error) => {
      console.error(`Ошибка при сохранении ${name}:`, error.message);
      throw error;
    });
}

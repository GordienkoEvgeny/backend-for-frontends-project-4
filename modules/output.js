import axios from "axios";
import path from "node:path";
import { getFileName } from "./get-file-name.js";
import { saveFile } from "./save-file.js";
import { createDirectory } from "./create-directory.js";
import { processResources } from "./process-resources.js";
import { downloadResources } from "./download-resources.js";
import { log } from "./logger.js";

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// require("axios-debug-log/enable.js");

export function output(saveDirPath, link) {
  const fileName = getFileName(link, ".html");
  const dirName = getFileName(link, "_files");
  let resourcesLinks = [];

  const fullFilesPath = path.join(saveDirPath, dirName);

  log(`ℹ️ Cтарт загрузки страницы ${link}`);

  return axios
    .get(link)
    .then((response) => {
      log(`✅ Страница успешно загружена. Размер: ${response.data.length} байт`);

      const { modifiedHtml, resourceUrls } = processResources(response.data, link, dirName);

      resourcesLinks = resourceUrls.map((url) => url);

      log(`ℹ️ Сохранение страницы`);

      return saveFile(saveDirPath, fileName, modifiedHtml);
    })

    .then(() => {
      log(`ℹ️ Cтарт создания директории`);
      return createDirectory(fullFilesPath);
    })

    .then(() => {
      log(`ℹ️ Cтарт загрузки ресурсов`);
      return downloadResources(resourcesLinks, fullFilesPath);
    })

    .catch((e) => {
      log("❌ Ошибка ", e.message);
      console.error(" ❌ Ошибка ", e.message);
      throw e;
    });
}

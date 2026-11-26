import axios from "axios";
import path from "node:path";
import { getFileName } from "./get-file-name.js";
import { saveFile } from "./save-file.js";
import { createDirectory } from "./create-directory.js";
import { processResources } from "./process-resources.js";
import { downloadWithProgress } from "./download-progress.js";
import { downloadResources } from "./download-resources.js";
import { log } from "./logger.js";
import { URL } from "node:url";

export function output(saveDirPath, link, useProgress) {
  let normalizedLink = link;
  try {
    new URL(link);
  } catch {
    normalizedLink = new URL(link, "http://localhost").href;
  }

  const fileName = getFileName(normalizedLink, ".html");
  const dirName = getFileName(normalizedLink, "_files");
  let resourcesLinks = [];

  const fullFilesPath = path.join(saveDirPath, dirName);

  log(`ℹ️ Cтарт загрузки страницы ${normalizedLink}`);

  return axios
    .get(normalizedLink)
    .then((response) => {
      log(`✅ Страница успешно загружена. Размер: ${response.data.length} байт`);

      const { modifiedHtml, resourceUrls } = processResources(
        response.data,
        normalizedLink,
        dirName,
      );

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
      if (useProgress) {
        return downloadWithProgress(resourcesLinks, fullFilesPath);
      }
      return downloadResources(resourcesLinks, fullFilesPath);
    })

    .catch((e) => {
      throw new Error(e.message);
    });
}

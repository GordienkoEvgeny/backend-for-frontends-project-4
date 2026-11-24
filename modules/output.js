import axios from "axios";
import path from "node:path";
import { getFileName } from "./get-file-name.js";
import { saveFile } from "./save-file.js";
import { createDirectory } from "./create-directory.js";
import { processResources } from "./process-resources.js";
import { downloadResources } from "./download-resources.js";

export function output(saveDirPath, link) {
  const fileName = getFileName(link, ".html");
  const dirName = getFileName(link, "_files");
  let resourcesLinks = [];

  const fullFilesPath = path.join(saveDirPath, dirName);

  return axios
    .get(link)
    .then((response) => {
      const { modifiedHtml, resourceUrls } = processResources(response.data, link, dirName);

      resourcesLinks = resourceUrls.map((url) => url);

      return saveFile(saveDirPath, fileName, modifiedHtml);
    })

    .then(() => {
      return createDirectory(fullFilesPath);
    })

    .then(() => {
      return downloadResources(resourcesLinks, fullFilesPath);
    })

    .catch((e) => {
      console.error("Ошибка ", e.message);
    });
}

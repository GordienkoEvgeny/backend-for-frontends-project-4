import axios from "axios";
import path from "node:path";
import { getFileName } from "./get-file-name.js";
import { saveFile } from "./save-file.js";
import { createDirectory } from "./create-directory.js";
import { processImages } from "./processImages.js";
import { downloadImages } from "./download-Img.js";

export function output(saveDirPath, link) {
  const fileName = getFileName(link, ".html");
  const dirName = getFileName(link, "_files");
  let imageLinks = [];

  const fullFilesPath = path.join(saveDirPath, dirName);

  return axios
    .get(link)
    .then((response) => {
      const { modifiedHtml, imageUrls } = processImages(response.data, link, dirName);

      imageLinks = imageUrls.map((url) => url);

      return saveFile(saveDirPath, fileName, modifiedHtml);
    })

    .then(() => {
      return createDirectory(fullFilesPath);
    })

    .then(() => {
      return downloadImages(imageLinks, fullFilesPath);
    })

    .catch((e) => {
      console.error("Ошибка ", e.message);
    });
}

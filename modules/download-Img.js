import axios from "axios";
import { getFileName } from "./get-file-name.js";
import { saveFile } from "./save-file.js";

export function downloadImages(imageUrls, resourcesDirPath) {
  const downloadPromises = imageUrls.map((url) => {
    const imgName = getFileName(url, ".png");

    return axios
      .get(url, { responseType: "arraybuffer" })
      .then((response) => {
        return saveFile(resourcesDirPath, imgName, response.data);
      })
      .catch((error) => {
        console.error(`ошибка при скачивании ${imgName}:`, error.message);
        return Promise.reject(error);
      });
  });

  return Promise.all(downloadPromises);
}

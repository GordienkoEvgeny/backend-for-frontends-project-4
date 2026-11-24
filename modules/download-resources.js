import axios from "axios";
import { getFileName } from "./get-file-name.js";
import { saveFile } from "./save-file.js";

export function downloadResources(urls, resourcesDirPath) {
  const downloadPromises = urls.map((url) => {
    // получаем расширение из ссылки
    const urlParts = url.split("?")[0].split(".");
    const ext = urlParts.pop();
    const extension = ext && ext.length <= 5 ? `.${ext}` : ".bin";

    const fileName = getFileName(url, extension);

    return axios
      .get(url, { responseType: "arraybuffer" })
      .then((response) => {
        return saveFile(resourcesDirPath, fileName, response.data);
      })
      .catch((error) => {
        console.error(`ошибка при скачивании ${fileName}:`, error.message);
        return Promise.reject(error);
      });
  });

  return Promise.all(downloadPromises);
}

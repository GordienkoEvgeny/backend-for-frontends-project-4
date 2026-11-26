import axios from "axios";
import { saveFile } from "./save-file.js";

export function downloadResources(resources, resourcesDirPath) {
  const downloadPromises = resources.map(({ url, fileName }) => {
    return axios
      .get(url, { responseType: "arraybuffer" })
      .then((response) => {
        return saveFile(resourcesDirPath, fileName, response.data);
      })
      .catch((error) => {
        console.error(`❌ Ошибка при скачивании ${fileName}:`, error.message);
        return Promise.reject(error);
      });
  });

  return Promise.all(downloadPromises);
}

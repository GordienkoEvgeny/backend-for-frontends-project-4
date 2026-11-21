import axios from "axios";
import { getFileName } from "./get-file-name.js";
import { saveFile } from "./save-file.js";

export function output(saveDirPath, link) {
  const fileName = getFileName(link);

  return axios
    .get(link)
    .then((response) => {
      return saveFile(saveDirPath, fileName, response.data);
    })
    .catch((e) => {
      console.error("Ошибка при сохранении:", e.message);
    });
}

import fsp from "node:fs/promises";

export function saveFile(dir, name, data) {
  return fsp
    .writeFile(`${dir}/${name}`, data)
    .then(() => {
      console.log("save success");
    })
    .catch((error) => {
      console.error("Ошибка при сохранении:", error);
    });
}

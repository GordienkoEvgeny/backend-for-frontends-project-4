export function getFileName(url, extension) {
  // Убираем протокол
  let cleanUrl = url.replace(/^https?:\/\//, "");

  // Отделяем расширение (если есть)
  const ext = extension || "";
  let namePart = cleanUrl;
  if (namePart.endsWith(ext)) {
    namePart = namePart.slice(0, -ext.length);
  }

  // Заменяем спецсимволы в имени
  let fileName = namePart.replace(/[^a-zA-Z0-9]/g, "-");

  // Обрезаем
  if (fileName.length > 100) {
    fileName = fileName.substring(0, 100);
  }

  // Возвращаем имя + расширение
  return `${fileName}${ext}`;
}

import * as cheerio from "cheerio";
import { getFileName } from "./get-file-name.js";
import { URL } from "node:url";

export function processResources(html, pageUrl, resourcesDirName) {
  const $ = cheerio.load(html);
  const resourceUrls = [];
  const baseUrl = new URL(pageUrl);

  // Путь страницы без завершающего слэша (например, /blog/about)
  const pagePath = baseUrl.pathname.replace(/\/$/, "");

  const processElement = (element, attribute) => {
    const src = $(element).attr(attribute);
    if (!src) return;

    if (src.startsWith("data:") || src.startsWith("#")) return;

    // Абсолютный URL для скачивания
    const absoluteUrl = new URL(src, pageUrl);
    if (absoluteUrl.host !== baseUrl.host) return;

    // Формируем URL для генерации имени файла
    let nameUrl;

    if (src.startsWith("http://") || src.startsWith("https://")) {
      // Если ссылка абсолютная, используем её как есть
      nameUrl = absoluteUrl.href;
    } else {
      // Для относительных путей
      let cleanSrc = src;

      // Если src начинается с пути страницы (например, /blog/about/...), убираем этот префикс
      if (pagePath && src.startsWith(pagePath)) {
        cleanSrc = src.slice(pagePath.length);
      }

      // Убираем ведущий слэш, чтобы не было двойного
      cleanSrc = cleanSrc.replace(/^\//, "");

      // Склеиваем базовый URL страницы (без завершающего слэша) и очищенный путь
      const pageUrlWithoutSlash = pageUrl.endsWith("/") ? pageUrl.slice(0, -1) : pageUrl;
      nameUrl = `${pageUrlWithoutSlash}/${cleanSrc}`;
    }

    resourceUrls.push({
      url: absoluteUrl.href, // для axios.get
      nameUrl: nameUrl, // для getFileName
    });

    const ext = absoluteUrl.pathname.split(".").pop();
    const extension = ext && ext.length < 5 ? `.${ext}` : ".bin";
    const localFileName = getFileName(nameUrl, extension);

    $(element).attr(attribute, `./${resourcesDirName}/${localFileName}`);
  };

  $("img").each((_, el) => processElement(el, "src"));
  $('link[rel="stylesheet"]').each((_, el) => processElement(el, "href"));
  $("script").each((_, el) => processElement(el, "src"));

  return {
    modifiedHtml: $.html(),
    resourceUrls,
  };
}

import * as cheerio from "cheerio";
import { getFileName } from "./get-file-name.js";
import { URL } from "node:url"; // Встроенный модуль Node.js для работы с URL

export function processResources(html, pageUrl, resourcesDirName) {
  const $ = cheerio.load(html);
  const resourceUrls = [];
  const baseUrl = new URL(pageUrl);

  const processElement = (element, attribute) => {
    const src = $(element).attr(attribute);
    if (!src) return;

    // Пропускаем data-uri (base64 картинки прямо в HTML) и якоря (#)
    if (src.startsWith("data:") || src.startsWith("#")) return;

    // Склеиваем относительную ссылку с базовым URL страницы
    const absoluteUrl = new URL(src, pageUrl);

    // если ресурс на другом домене (например, cdn2.hexlet.io), пропускаем его
    if (absoluteUrl.host !== baseUrl.host) return;

    const hrefStr = absoluteUrl.href;
    resourceUrls.push(hrefStr);

    // получаем расширение если расширения нет, оставляем дефолтное (например, .bin)
    const ext = absoluteUrl.pathname.split(".").pop();
    const extension = ext && ext.length < 5 ? `.${ext}` : ".bin";

    // получаем локальное имя файла
    const localFileName = getFileName(hrefStr, extension);

    // меняем атрибут в HTML на локальный путь
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

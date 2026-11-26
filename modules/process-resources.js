import * as cheerio from "cheerio";
import { getFileName } from "./get-file-name.js";
import { URL } from "node:url";
import path from "node:path";

export function processResources(html, pageUrl, resourcesDirName) {
  const $ = cheerio.load(html);
  const resourceUrls = [];
  const baseUrl = new URL(pageUrl);

  const processElement = (element, attribute) => {
    const src = $(element).attr(attribute);
    if (!src) return;

    if (src.startsWith("data:") || src.startsWith("#")) return;

    const absoluteUrl = new URL(src, pageUrl);
    if (absoluteUrl.host !== baseUrl.host) return;

    // Убираем завершающий слэш из пути (кроме корня), чтобы не было лишнего дефиса в имени файла
    const cleanPathname = absoluteUrl.pathname.replace(/\/$/, "");
    const nameUrl = `${absoluteUrl.origin}${cleanPathname}`;

    const parsedExt = path.extname(cleanPathname);
    const extension = parsedExt || ".html";

    const nameUrlWithoutExt = parsedExt ? nameUrl.slice(0, -parsedExt.length) : nameUrl;

    const localFileName = getFileName(nameUrlWithoutExt, extension);

    // Сразу передаем готовое имя файла для скачивания
    resourceUrls.push({
      url: absoluteUrl.href,
      fileName: localFileName,
    });

    $(element).attr(attribute, `${resourcesDirName}/${localFileName}`);
  };

  $("img").each((_, el) => processElement(el, "src"));
  $("link").each((_, el) => processElement(el, "href"));
  $("script").each((_, el) => processElement(el, "src"));

  return {
    modifiedHtml: $.html(),
    resourceUrls,
  };
}

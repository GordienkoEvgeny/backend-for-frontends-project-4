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

    const nameUrl = absoluteUrl.href;

    resourceUrls.push({
      url: absoluteUrl.href,
      nameUrl,
    });

    // Определяем расширение. Если его нет в пути (например, /blog/about) — ставим .html
    const parsedExt = path.extname(absoluteUrl.pathname);
    const extension = parsedExt || ".html";

    const nameUrlWithoutExt = parsedExt ? nameUrl.slice(0, -parsedExt.length) : nameUrl;

    const localFileName = getFileName(nameUrlWithoutExt, extension);

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

import * as cheerio from "cheerio";
import { getFileName } from "./get-file-name.js";
import { URL } from "node:url";

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
      url: absoluteUrl.href, // для axios.get
      nameUrl, // для getFileName
    });

    const ext = absoluteUrl.pathname.split(".").pop();
    const extension = ext && ext.length < 5 ? `.${ext}` : ".bin";
    const nameUrlWithoutExt = nameUrl.replace(new RegExp(`${extension}$`), "");
    const localFileName = getFileName(nameUrlWithoutExt, extension);

    $(element).attr(attribute, `${resourcesDirName}/${localFileName}`);
  };

  $("img").each((_, el) => processElement(el, "src"));
  $('link[rel="stylesheet"]').each((_, el) => processElement(el, "href"));
  $("script").each((_, el) => processElement(el, "src"));

  return {
    modifiedHtml: $.html(),
    resourceUrls,
  };
}

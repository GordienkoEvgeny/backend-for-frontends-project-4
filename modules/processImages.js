import * as cheerio from "cheerio";
import { getFileName } from "./get-file-name.js";

export function processImages(html, pageUrl, resourcesDirName) {
  const $ = cheerio.load(html);
  const imageUrls = [];

  $("img").each((_, element) => {
    const src = $(element).attr("src");

    if (!src) return;

    const absoluteUrl = new URL(src, pageUrl).href;
    imageUrls.push(absoluteUrl);

    const localFileName = getFileName(absoluteUrl, ".png");

    $(element).attr("src", `./${resourcesDirName}/${localFileName}`);
  });

  return {
    modifiedHtml: $.html(),
    imageUrls,
  };
}

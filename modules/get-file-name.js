export function getFileName(url) {
  let cleanUrl = url.replace(/^https?:\/\//, "");
  let fileName = cleanUrl.replace(/[^a-zA-Z0-9]/g, "-");
  return `${fileName}.html`;
}

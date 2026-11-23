export function getFileName(url, extension) {
  let cleanUrl = url.replace(/^https?:\/\//, "");
  let fileName = cleanUrl.replace(/[^a-zA-Z0-9]/g, "-");

  if (fileName.length > 100) {
    fileName = fileName.substring(0, 100);
  }

  return `${fileName}${extension}`;
}

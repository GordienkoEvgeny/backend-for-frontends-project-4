export function getFileName(url, extension) {
  let cleanUrl = url.replace(/^https?:\/\//, "");

  const ext = extension || "";
  let namePart = cleanUrl;
  if (namePart.endsWith(ext)) {
    namePart = namePart.slice(0, -ext.length);
  }

  let fileName = namePart.replace(/[^a-zA-Z0-9]/g, "-");

  if (fileName.length > 100) {
    fileName = fileName.substring(0, 100);
  }

  return `${fileName}${ext}`;
}

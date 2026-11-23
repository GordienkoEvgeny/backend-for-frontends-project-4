import fsp from "node:fs/promises";

export function createDirectory(dirPath) {
  return fsp.mkdir(dirPath, { recursive: true });
}

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { saveFile } from "../modules/save-file.js";

describe("saveFile", () => {
  let tempDir;

  // создаем уникальную временную папку
  beforeEach(async () => {
    tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "page-loader-"));
  });

  // удаляем временную папку
  afterEach(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true });
  });

  it("должна сохранять файл в указанную директорию", async () => {
    const fileName = "test.html";
    const content = "<h1>Hello</h1>";

    await saveFile(tempDir, fileName, content);

    // читаем файл, чтобы проверить что он создался
    const savedContent = await fsp.readFile(path.join(tempDir, fileName), "utf-8");

    expect(savedContent).toBe(content);
  });
});

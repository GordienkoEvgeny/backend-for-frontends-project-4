import { describe, it, expect, beforeEach, afterEach } from "vitest";
import nock from "nock";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { output } from "../modules/output.js";

describe("Ошибочные ситуации", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "page-loader-err-"));
  });

  afterEach(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true });
    nock.cleanAll();
  });

  // 1. Ошибка 404 при загрузке страницы
  it("должна выбрасывать ошибку при 404 ответе", async () => {
    const url = "https://ru.hexlet.io/404";

    // Говорим nock вернуть 404
    nock("https://ru.hexlet.io").get("/404").reply(404);

    // Ожидаем, что функция выбросит ошибку с текстом
    await expect(output(tempDir, url)).rejects.toThrow(/404/);
  });

  // 2. Ошибка при скачивании ресурса (например, картинки)
  it("должна выбрасывать ошибку, если ресурс не скачался", async () => {
    const url = "https://ru.hexlet.io/courses";
    const html = '<html><img src="/assets/broken.png"></html>';

    nock("https://ru.hexlet.io").get("/courses").reply(200, html);
    // Ресурс вернет 500
    nock("https://ru.hexlet.io").get("/assets/broken.png").reply(500);

    await expect(output(tempDir, url)).rejects.toThrow(/500/);
  });

  // 3. Ошибка файловой системы (нет прав на запись)
  it("должна выбрасывать ошибку при отсутствии доступа к директории", async () => {
    const url = "https://ru.hexlet.io/courses";
    const html = "<html></html>";
    nock("https://ru.hexlet.io").get("/courses").reply(200, html);

    const badPath = "/root/forbidden-folder";

    await expect(output(badPath, url)).rejects.toThrow();
  });
});

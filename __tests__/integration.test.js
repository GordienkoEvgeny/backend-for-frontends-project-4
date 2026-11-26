import { describe, it, expect, beforeAll, afterAll } from "vitest";
import nock from "nock";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { output } from "../modules/output.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, "..", "__fixtures__");

describe("Интеграционный тест с фикстурой", () => {
  let tempDir;

  beforeAll(async () => {
    nock.disableNetConnect();
    tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "page-loader-"));
  });

  afterAll(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true });
    nock.enableNetConnect();
  });

  it("скачивает локальные ресурсы и не трогает внешние", async () => {
    // Читаем фикстуру
    const htmlFixture = await fsp.readFile(path.join(fixturesDir, "hexlet.html"), "utf-8");
    const imageFixture = await fsp.readFile(path.join(fixturesDir, "nodejs.png"), "utf-8");
    const pageUrl = "https://ru.hexlet.io/courses";

    // Настраиваем nock для страницы и локальных ресурсов
    nock("https://ru.hexlet.io").get("/courses").reply(200, htmlFixture);
    nock("https://ru.hexlet.io").get("/assets/application.css").reply(200, "css content");
    nock("https://ru.hexlet.io").get("/assets/professions/nodejs.png").reply(200, imageFixture);
    nock("https://ru.hexlet.io").get("/packs/js/runtime.js").reply(200, "js content");

    // Запускаем функцию
    await output(tempDir, pageUrl);

    // Проверяем HTML
    const savedHtml = await fsp.readFile(path.join(tempDir, "ru-hexlet-io-courses.html"), "utf-8");

    // Проверяем, что локальные ссылки заменились
    expect(savedHtml).toContain(
      'src="./ru-hexlet-io-courses_files/ru-hexlet-io-courses-assets-professions-nodejs-png.png"',
    );
    expect(savedHtml).toContain(
      'href="./ru-hexlet-io-courses_files/ru-hexlet-io-courses-assets-application-css.css"',
    );
    expect(savedHtml).toContain(
      'src="./ru-hexlet-io-courses_files/ru-hexlet-io-courses-https---ru-hexlet-io-packs-js-runtime-js.js"',
    );

    // Проверяем, что ВНЕШНИЕ ссылки остались нетронутыми
    expect(savedHtml).toContain('href="https://cdn2.hexlet.io/assets/menu.css"');
    expect(savedHtml).toContain('src="https://js.stripe.com/v3/"');

    // Проверяем, что файлы скачались
    const files = await fsp.readdir(path.join(tempDir, "ru-hexlet-io-courses_files"));

    // Должно быть 3 файла (css, png, js). Внешние мы не качаем.
    expect(files).toHaveLength(3);

    // Проверяем картинку
    const savedImage = await fsp.readFile(
      path.join(
        tempDir,
        "ru-hexlet-io-courses_files",
        "ru-hexlet-io-courses-assets-professions-nodejs-png.png",
      ),
      "utf-8",
    );
    expect(savedImage).toBe(imageFixture);
  });
});

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

    // ИЗМЕНЕНИЕ 1: добавили .times(2)
    nock("https://ru.hexlet.io").get("/courses").times(2).reply(200, htmlFixture);
    nock("https://ru.hexlet.io").get("/assets/application.css").reply(200, "css content");
    nock("https://ru.hexlet.io").get("/assets/professions/nodejs.png").reply(200, imageFixture);
    nock("https://ru.hexlet.io").get("/packs/js/runtime.js").reply(200, "js content");

    await output(tempDir, pageUrl);
    const savedHtml = await fsp.readFile(path.join(tempDir, "ru-hexlet-io-courses.html"), "utf-8");

    // Проверяем пути в HTML
    expect(savedHtml).toContain(
      'href="ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css"',
    );

    // ИЗМЕНЕНИЕ 2: добавили проверку ссылки на скачанный HTML-ресурс
    expect(savedHtml).toContain('href="ru-hexlet-io-courses_files/ru-hexlet-io-courses.html"');

    expect(savedHtml).toContain(
      'src="ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png"',
    );

    expect(savedHtml).toContain(
      'src="ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js"',
    );

    // Проверяем, что ВНЕШНИЕ ссылки остались нетронутыми
    expect(savedHtml).toContain('href="https://cdn2.hexlet.io/assets/menu.css"');
    expect(savedHtml).toContain('src="https://js.stripe.com/v3/"');

    // Проверяем, что файлы скачались
    const files = await fsp.readdir(path.join(tempDir, "ru-hexlet-io-courses_files"));

    // ИЗМЕНЕНИЕ 3: изменили 3 на 4 файла
    expect(files).toHaveLength(4);

    // Проверяем картинку
    const savedImage = await fsp.readFile(
      path.join(
        tempDir,
        "ru-hexlet-io-courses_files",
        "ru-hexlet-io-assets-professions-nodejs.png",
      ),
      "utf-8",
    );
    expect(savedImage).toBe(imageFixture);
  });
});

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

describe("Интеграционный тест с фикстурами", () => {
  let tempDir;

  beforeAll(async () => {
    nock.disableNetConnect(); // запрещаем реальные запросы
    tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "page-loader-"));
  });

  afterAll(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true });
    nock.enableNetConnect();
  });

  it("должна скачать страницу, заменить ссылки и сохранить картинку", async () => {
    // читаем фикстуры
    const htmlFixture = await fsp.readFile(path.join(fixturesDir, "hexlet.html"), "utf-8");
    const imageFixture = await fsp.readFile(path.join(fixturesDir, "nodejs.png"), "utf-8");

    const pageUrl = "https://ru.hexlet.io/courses";

    // nock
    nock("https://ru.hexlet.io").get("/courses").reply(200, htmlFixture);
    nock("https://ru.hexlet.io")
      .get("/assets/professions/nodejs.png")
      .reply(200, imageFixture, { "Content-Type": "image/png" });

    // запускаем функцию
    await output(tempDir, pageUrl);

    // проверяем HTML
    const savedHtml = await fsp.readFile(path.join(tempDir, "ru-hexlet-io-courses.html"), "utf-8");
    expect(savedHtml).toContain(
      'src="./ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png"',
    );

    // проверяем картинку
    const savedImagePath = path.join(
      tempDir,
      "ru-hexlet-io-courses_files",
      "ru-hexlet-io-assets-professions-nodejs.png",
    );
    const savedImageContent = await fsp.readFile(savedImagePath, "utf-8");
    expect(savedImageContent).toBe(imageFixture);
  });
});

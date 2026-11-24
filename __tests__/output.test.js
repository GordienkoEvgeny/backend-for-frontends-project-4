import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { output } from "../modules/output.js";
import * as saveFileModule from "../modules/save-file.js";

// Мокаем axios и модуль сохранения файла
vi.mock("axios");
vi.mock("../modules/save-file.js", () => ({
  saveFile: vi.fn(() => Promise.resolve()),
}));

describe("output function", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Очищаем историю вызовов перед каждым тестом
  });

  it("должна скачать страницу и вызвать функцию сохранения", async () => {
    const fakeHtml = "<html>Test</html>";
    const url = "https://ru.hexlet.io/courses";
    const outputDir = "/tmp";

    // Говорим моку вернуть фейковые данные
    axios.get.mockResolvedValue({ data: fakeHtml });

    // Вызываем нашу функцию (так как внутри промисы, используем await)
    await output(outputDir, url);

    // Проверяем, что axios был вызван с правильным URL
    expect(axios.get).toHaveBeenCalledWith(url);

    // Проверяем, что saveFile был вызван с правильными аргументами
    expect(saveFileModule.saveFile).toHaveBeenCalledWith(
      outputDir,
      "ru-hexlet-io-courses.html",
      expect.stringContaining("Test"),
    );
  });

  it("должна обрабатывать ошибки сети", async () => {
    // Имитируем ошибку сети
    axios.get.mockRejectedValue(new Error("Network Error"));

    // Вызываем функцию и ожидаем, что она выбросит ошибку
    await expect(output("/tmp", "https://ru.hexlet.io")).rejects.toThrow("Network Error");

    // Проверяем, что функция сохранения НЕ вызывалась
    expect(saveFileModule.saveFile).not.toHaveBeenCalled();
  });
});

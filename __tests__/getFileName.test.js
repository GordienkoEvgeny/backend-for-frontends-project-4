import { describe, it, expect } from "vitest";
import { getFileName } from "../modules/get-file-name.js";

describe("getFileName", () => {
  it("должна преобразовывать простой URL в имя файла", () => {
    const url = "https://ru.hexlet.io/courses";
    expect(getFileName(url, ".html")).toBe("ru-hexlet-io-courses.html");
  });

  it("должна работать с URL без пути", () => {
    const url = "https://ru.hexlet.io";
    expect(getFileName(url, ".html")).toBe("ru-hexlet-io.html");
  });

  it("должна заменять спецсимволы на дефисы", () => {
    const url = "https://example.com/page?id=123&name=test";
    expect(getFileName(url, ".html")).toBe("example-com-page-id-123-name-test.html");
  });
});

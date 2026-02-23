import { describe, expect, it } from "vitest";
import { ApiError } from "../errors.js";
import { handleToolRequest } from "./handler.js";

describe("handleToolRequest", () => {
  it("成功時に JSON 文字列を返す", async () => {
    const data = { id: "1", name: "test" };

    const result = await handleToolRequest(() => Promise.resolve(data));

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toBe(JSON.stringify(data, null, 2));
  });

  it("ApiError 時に isError とフォーマット済みメッセージを返す", async () => {
    const result = await handleToolRequest(() =>
      Promise.reject(new ApiError(404, "Not Found", "not found")),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("404");
    expect(result.content[0].text).toContain("not found");
  });

  it("一般エラー時に isError とメッセージを返す", async () => {
    const result = await handleToolRequest(() =>
      Promise.reject(new Error("network failure")),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("network failure");
  });
});

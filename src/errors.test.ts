import { describe, expect, it } from "vitest";
import { ApiError, createApiError, formatErrorForAgent } from "./errors.js";

describe("ApiError", () => {
  it("ステータスコードとステータステキストを保持する", () => {
    const error = new ApiError(404, "Not Found", "resource not found");

    expect(error.status).toBe(404);
    expect(error.statusText).toBe("Not Found");
    expect(error.body).toBe("resource not found");
    expect(error.message).toBe("404 Not Found");
    expect(error.name).toBe("ApiError");
  });
});

describe("createApiError", () => {
  it("Response からエラーを生成する", async () => {
    const response = new Response("validation error", {
      status: 400,
      statusText: "Bad Request",
    });

    const error = await createApiError(response);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.statusText).toBe("Bad Request");
    expect(error.body).toBe("validation error");
  });

  it("ボディが読み取れない場合は空文字になる", async () => {
    const response = new Response("body", {
      status: 500,
      statusText: "Internal Server Error",
    });
    // ボディを先に消費して読み取りエラーを発生させる
    await response.text();

    const error = await createApiError(response);

    expect(error.body).toBe("");
  });
});

describe("formatErrorForAgent", () => {
  it("ApiError をフォーマットする", () => {
    const error = new ApiError(400, "Bad Request", "invalid name");

    const message = formatErrorForAgent(error);

    expect(message).toBe("Error: 400 Bad Request\ninvalid name");
  });

  it("401 エラーに API キー確認の補足を付与する", () => {
    const error = new ApiError(401, "Unauthorized", "");

    const message = formatErrorForAgent(error);

    expect(message).toContain("API キー");
    expect(message).toContain("ANYCAST_API_KEY");
  });

  it("403 エラーにアクセス権の補足を付与する", () => {
    const error = new ApiError(403, "Forbidden", "");

    const message = formatErrorForAgent(error);

    expect(message).toContain("アクセス権");
  });

  it("404 エラーにリソース未発見の補足を付与する", () => {
    const error = new ApiError(404, "Not Found", "");

    const message = formatErrorForAgent(error);

    expect(message).toContain("リソースが見つかりません");
  });

  it("409 エラーに競合の補足を付与する", () => {
    const error = new ApiError(409, "Conflict", "");

    const message = formatErrorForAgent(error);

    expect(message).toContain("競合");
  });

  it("500 エラーにサーバーエラーの補足を付与する", () => {
    const error = new ApiError(500, "Internal Server Error", "");

    const message = formatErrorForAgent(error);

    expect(message).toContain("サーバー側");
  });

  it("補足メッセージのないステータスコードはヒントなし", () => {
    const error = new ApiError(422, "Unprocessable Entity", "detail");

    const message = formatErrorForAgent(error);

    expect(message).toBe("Error: 422 Unprocessable Entity\ndetail");
  });

  it("通常の Error をフォーマットする", () => {
    const error = new Error("network error");

    const message = formatErrorForAgent(error);

    expect(message).toBe("Error: network error");
  });

  it("不明なエラーをフォーマットする", () => {
    const message = formatErrorForAgent("unknown");

    expect(message).toBe("Error: 予期しないエラーが発生しました");
  });
});

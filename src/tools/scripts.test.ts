import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnycastClient } from "../client.js";
import { ApiError } from "../errors.js";
import { registerScriptTools } from "./scripts.js";
import { getToolHandler } from "./test-helper.js";

describe("script tools", () => {
  let server: McpServer;
  let client: {
    generateScript: ReturnType<typeof vi.fn>;
    getScriptJob: ReturnType<typeof vi.fn>;
    listScriptLines: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    server = new McpServer({ name: "test", version: "0.0.0" });
    client = {
      generateScript: vi.fn(),
      getScriptJob: vi.fn(),
      listScriptLines: vi.fn(),
    };
    registerScriptTools(server, client as unknown as AnycastClient);
  });

  describe("generate_script", () => {
    it("台本生成ジョブを開始して結果を返す", async () => {
      const job = { id: "job-1", status: "pending" };
      client.generateScript.mockResolvedValue(job);

      const handler = getToolHandler(server, "generate_script");
      const result = await handler({
        channelId: "ch-1",
        episodeId: "ep-1",
        prompt: "AIの未来について",
        durationMinutes: 15,
        withEmotion: true,
      });

      expect(result.content[0].text).toBe(JSON.stringify(job, null, 2));
      expect(client.generateScript).toHaveBeenCalledWith("ch-1", "ep-1", {
        prompt: "AIの未来について",
        durationMinutes: 15,
        withEmotion: true,
      });
    });

    it("オプションパラメータを省略できる", async () => {
      const job = { id: "job-1", status: "pending" };
      client.generateScript.mockResolvedValue(job);

      const handler = getToolHandler(server, "generate_script");
      await handler({
        channelId: "ch-1",
        episodeId: "ep-1",
        prompt: "テーマ",
      });

      expect(client.generateScript).toHaveBeenCalledWith("ch-1", "ep-1", {
        prompt: "テーマ",
      });
    });

    it("エラー時に isError を返す", async () => {
      client.generateScript.mockRejectedValue(
        new ApiError(400, "Bad Request", "prompt is required"),
      );

      const handler = getToolHandler(server, "generate_script");
      const result = await handler({
        channelId: "ch-1",
        episodeId: "ep-1",
        prompt: "",
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("prompt is required");
    });
  });

  describe("get_script_job", () => {
    it("ジョブの状態を返す", async () => {
      const job = { id: "job-1", status: "completed", progress: 100 };
      client.getScriptJob.mockResolvedValue(job);

      const handler = getToolHandler(server, "get_script_job");
      const result = await handler({ jobId: "job-1" });

      expect(result.content[0].text).toBe(JSON.stringify(job, null, 2));
      expect(client.getScriptJob).toHaveBeenCalledWith("job-1");
    });

    it("エラー時に isError を返す", async () => {
      client.getScriptJob.mockRejectedValue(
        new ApiError(404, "Not Found", ""),
      );

      const handler = getToolHandler(server, "get_script_job");
      const result = await handler({ jobId: "invalid" });

      expect(result.isError).toBe(true);
    });
  });

  describe("list_script_lines", () => {
    it("台本行の一覧を返す", async () => {
      const lines = [
        { id: "line-1", lineOrder: 1, text: "こんにちは" },
        { id: "line-2", lineOrder: 2, text: "今日のテーマは…" },
      ];
      client.listScriptLines.mockResolvedValue(lines);

      const handler = getToolHandler(server, "list_script_lines");
      const result = await handler({ channelId: "ch-1", episodeId: "ep-1" });

      expect(result.content[0].text).toBe(JSON.stringify(lines, null, 2));
      expect(client.listScriptLines).toHaveBeenCalledWith("ch-1", "ep-1");
    });

    it("エラー時に isError を返す", async () => {
      client.listScriptLines.mockRejectedValue(
        new ApiError(404, "Not Found", ""),
      );

      const handler = getToolHandler(server, "list_script_lines");
      const result = await handler({ channelId: "ch-1", episodeId: "invalid" });

      expect(result.isError).toBe(true);
    });
  });
});

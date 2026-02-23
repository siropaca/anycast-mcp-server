import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnycastClient } from "../client.js";
import { ApiError } from "../errors.js";
import { registerMasterTools } from "./master.js";
import { getToolHandler } from "./test-helper.js";

describe("master tools", () => {
  let server: McpServer;
  let client: {
    listCategories: ReturnType<typeof vi.fn>;
    listVoices: ReturnType<typeof vi.fn>;
    listCharacters: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    server = new McpServer({ name: "test", version: "0.0.0" });
    client = {
      listCategories: vi.fn(),
      listVoices: vi.fn(),
      listCharacters: vi.fn(),
    };
    registerMasterTools(server, client as unknown as AnycastClient);
  });

  describe("list_categories", () => {
    it("カテゴリ一覧を返す", async () => {
      const categories = [{ id: "cat-1", slug: "tech", name: "テクノロジー" }];
      client.listCategories.mockResolvedValue(categories);

      const handler = getToolHandler(server, "list_categories");
      const result = await handler({});

      expect(result.content[0].text).toBe(JSON.stringify(categories, null, 2));
      expect(result.isError).toBeUndefined();
    });

    it("エラー時に isError を返す", async () => {
      client.listCategories.mockRejectedValue(
        new ApiError(500, "Internal Server Error", ""),
      );

      const handler = getToolHandler(server, "list_categories");
      const result = await handler({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("500");
    });
  });

  describe("list_voices", () => {
    it("ボイス一覧を返す", async () => {
      const voices = [
        { id: "v-1", name: "Voice 1", provider: "google", gender: "female" },
      ];
      client.listVoices.mockResolvedValue(voices);

      const handler = getToolHandler(server, "list_voices");
      const result = await handler({});

      expect(result.content[0].text).toBe(JSON.stringify(voices, null, 2));
    });

    it("エラー時に isError を返す", async () => {
      client.listVoices.mockRejectedValue(new Error("network error"));

      const handler = getToolHandler(server, "list_voices");
      const result = await handler({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("network error");
    });
  });

  describe("list_characters", () => {
    it("キャラクター一覧を返す", async () => {
      const characters = [{ id: "char-1", name: "Host", persona: "明るい" }];
      client.listCharacters.mockResolvedValue(characters);

      const handler = getToolHandler(server, "list_characters");
      const result = await handler({});

      expect(result.content[0].text).toBe(
        JSON.stringify(characters, null, 2),
      );
    });

    it("エラー時に isError を返す", async () => {
      client.listCharacters.mockRejectedValue(
        new ApiError(401, "Unauthorized", ""),
      );

      const handler = getToolHandler(server, "list_characters");
      const result = await handler({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("API キー");
    });
  });
});

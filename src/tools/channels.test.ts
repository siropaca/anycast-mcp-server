import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnycastClient } from "../client.js";
import { ApiError } from "../errors.js";
import { registerChannelTools } from "./channels.js";
import { getToolHandler } from "./test-helper.js";

describe("channel tools", () => {
  let server: McpServer;
  let client: {
    listChannels: ReturnType<typeof vi.fn>;
    getChannel: ReturnType<typeof vi.fn>;
    createChannel: ReturnType<typeof vi.fn>;
    updateChannel: ReturnType<typeof vi.fn>;
    publishChannel: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    server = new McpServer({ name: "test", version: "0.0.0" });
    client = {
      listChannels: vi.fn(),
      getChannel: vi.fn(),
      createChannel: vi.fn(),
      updateChannel: vi.fn(),
      publishChannel: vi.fn(),
    };
    registerChannelTools(server, client as unknown as AnycastClient);
  });

  describe("list_channels", () => {
    it("チャンネル一覧を返す", async () => {
      const channels = [{ id: "ch-1", name: "Channel 1" }];
      client.listChannels.mockResolvedValue(channels);

      const handler = getToolHandler(server, "list_channels");
      const result = await handler({});

      expect(result.content[0].text).toBe(JSON.stringify(channels, null, 2));
    });

    it("エラー時に isError を返す", async () => {
      client.listChannels.mockRejectedValue(
        new ApiError(500, "Internal Server Error", ""),
      );

      const handler = getToolHandler(server, "list_channels");
      const result = await handler({});

      expect(result.isError).toBe(true);
    });
  });

  describe("get_channel", () => {
    it("チャンネル詳細を返す", async () => {
      const channel = { id: "ch-1", name: "Channel 1" };
      client.getChannel.mockResolvedValue(channel);

      const handler = getToolHandler(server, "get_channel");
      const result = await handler({ channelId: "ch-1" });

      expect(result.content[0].text).toBe(JSON.stringify(channel, null, 2));
      expect(client.getChannel).toHaveBeenCalledWith("ch-1");
    });

    it("404 エラー時にリソース未発見の補足を返す", async () => {
      client.getChannel.mockRejectedValue(
        new ApiError(404, "Not Found", ""),
      );

      const handler = getToolHandler(server, "get_channel");
      const result = await handler({ channelId: "invalid" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("リソースが見つかりません");
    });
  });

  describe("create_channel", () => {
    it("チャンネルを作成して結果を返す", async () => {
      const created = { id: "ch-1", name: "New Channel" };
      client.createChannel.mockResolvedValue(created);

      const handler = getToolHandler(server, "create_channel");
      const result = await handler({
        name: "New Channel",
        categoryId: "cat-1",
        characters: {
          create: [{ name: "Host", persona: "明るい", voiceId: "v-1" }],
        },
      });

      expect(result.content[0].text).toBe(JSON.stringify(created, null, 2));
      expect(client.createChannel).toHaveBeenCalledWith({
        name: "New Channel",
        categoryId: "cat-1",
        characters: {
          create: [{ name: "Host", persona: "明るい", voiceId: "v-1" }],
        },
      });
    });

    it("description を省略できる", async () => {
      const created = { id: "ch-1", name: "Channel" };
      client.createChannel.mockResolvedValue(created);

      const handler = getToolHandler(server, "create_channel");
      await handler({
        name: "Channel",
        categoryId: "cat-1",
        characters: { connect: [{ characterId: "char-1" }] },
      });

      expect(client.createChannel).toHaveBeenCalledWith({
        name: "Channel",
        categoryId: "cat-1",
        characters: { connect: [{ characterId: "char-1" }] },
      });
    });

    it("エラー時に isError を返す", async () => {
      client.createChannel.mockRejectedValue(
        new ApiError(400, "Bad Request", "invalid name"),
      );

      const handler = getToolHandler(server, "create_channel");
      const result = await handler({
        name: "",
        categoryId: "cat-1",
        characters: {},
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("invalid name");
    });
  });

  describe("update_channel", () => {
    it("チャンネルを更新して結果を返す", async () => {
      const updated = { id: "ch-1", name: "Updated" };
      client.updateChannel.mockResolvedValue(updated);

      const handler = getToolHandler(server, "update_channel");
      const result = await handler({
        channelId: "ch-1",
        name: "Updated",
        categoryId: "cat-1",
      });

      expect(result.content[0].text).toBe(JSON.stringify(updated, null, 2));
      expect(client.updateChannel).toHaveBeenCalledWith("ch-1", {
        name: "Updated",
        categoryId: "cat-1",
      });
    });
  });

  describe("publish_channel", () => {
    it("チャンネルを公開して結果を返す", async () => {
      const published = { id: "ch-1", publishedAt: "2024-01-01" };
      client.publishChannel.mockResolvedValue(published);

      const handler = getToolHandler(server, "publish_channel");
      const result = await handler({ channelId: "ch-1" });

      expect(result.content[0].text).toBe(
        JSON.stringify(published, null, 2),
      );
      expect(client.publishChannel).toHaveBeenCalledWith("ch-1");
    });
  });
});

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnycastClient } from "../client.js";
import { ApiError } from "../errors.js";
import { registerEpisodeTools } from "./episodes.js";
import { getToolHandler } from "./test-helper.js";

describe("episode tools", () => {
  let server: McpServer;
  let client: {
    listEpisodes: ReturnType<typeof vi.fn>;
    getEpisode: ReturnType<typeof vi.fn>;
    createEpisode: ReturnType<typeof vi.fn>;
    updateEpisode: ReturnType<typeof vi.fn>;
    publishEpisode: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    server = new McpServer({ name: "test", version: "0.0.0" });
    client = {
      listEpisodes: vi.fn(),
      getEpisode: vi.fn(),
      createEpisode: vi.fn(),
      updateEpisode: vi.fn(),
      publishEpisode: vi.fn(),
    };
    registerEpisodeTools(server, client as unknown as AnycastClient);
  });

  describe("list_episodes", () => {
    it("エピソード一覧を返す", async () => {
      const episodes = [{ id: "ep-1", title: "Episode 1" }];
      client.listEpisodes.mockResolvedValue(episodes);

      const handler = getToolHandler(server, "list_episodes");
      const result = await handler({ channelId: "ch-1" });

      expect(result.content[0].text).toBe(JSON.stringify(episodes, null, 2));
      expect(client.listEpisodes).toHaveBeenCalledWith("ch-1");
    });

    it("エラー時に isError を返す", async () => {
      client.listEpisodes.mockRejectedValue(
        new ApiError(404, "Not Found", ""),
      );

      const handler = getToolHandler(server, "list_episodes");
      const result = await handler({ channelId: "invalid" });

      expect(result.isError).toBe(true);
    });
  });

  describe("get_episode", () => {
    it("エピソード詳細を返す", async () => {
      const episode = { id: "ep-1", title: "Episode 1" };
      client.getEpisode.mockResolvedValue(episode);

      const handler = getToolHandler(server, "get_episode");
      const result = await handler({ channelId: "ch-1", episodeId: "ep-1" });

      expect(result.content[0].text).toBe(JSON.stringify(episode, null, 2));
      expect(client.getEpisode).toHaveBeenCalledWith("ch-1", "ep-1");
    });
  });

  describe("create_episode", () => {
    it("エピソードを作成して結果を返す", async () => {
      const created = { id: "ep-1", title: "New Episode" };
      client.createEpisode.mockResolvedValue(created);

      const handler = getToolHandler(server, "create_episode");
      const result = await handler({
        channelId: "ch-1",
        title: "New Episode",
        description: "説明文",
      });

      expect(result.content[0].text).toBe(JSON.stringify(created, null, 2));
      expect(client.createEpisode).toHaveBeenCalledWith("ch-1", {
        title: "New Episode",
        description: "説明文",
      });
    });

    it("description を省略できる", async () => {
      const created = { id: "ep-1", title: "Episode" };
      client.createEpisode.mockResolvedValue(created);

      const handler = getToolHandler(server, "create_episode");
      await handler({ channelId: "ch-1", title: "Episode" });

      expect(client.createEpisode).toHaveBeenCalledWith("ch-1", {
        title: "Episode",
      });
    });

    it("エラー時に isError を返す", async () => {
      client.createEpisode.mockRejectedValue(
        new ApiError(400, "Bad Request", "title is required"),
      );

      const handler = getToolHandler(server, "create_episode");
      const result = await handler({ channelId: "ch-1", title: "" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("title is required");
    });
  });

  describe("update_episode", () => {
    it("エピソードを更新して結果を返す", async () => {
      const updated = { id: "ep-1", title: "Updated" };
      client.updateEpisode.mockResolvedValue(updated);

      const handler = getToolHandler(server, "update_episode");
      const result = await handler({
        channelId: "ch-1",
        episodeId: "ep-1",
        title: "Updated",
        description: "updated desc",
      });

      expect(result.content[0].text).toBe(JSON.stringify(updated, null, 2));
      expect(client.updateEpisode).toHaveBeenCalledWith("ch-1", "ep-1", {
        title: "Updated",
        description: "updated desc",
      });
    });
  });

  describe("publish_episode", () => {
    it("エピソードを公開して結果を返す", async () => {
      const published = { id: "ep-1", publishedAt: "2024-01-01" };
      client.publishEpisode.mockResolvedValue(published);

      const handler = getToolHandler(server, "publish_episode");
      const result = await handler({
        channelId: "ch-1",
        episodeId: "ep-1",
      });

      expect(result.content[0].text).toBe(
        JSON.stringify(published, null, 2),
      );
      expect(client.publishEpisode).toHaveBeenCalledWith("ch-1", "ep-1");
    });
  });
});

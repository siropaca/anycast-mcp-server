import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AnycastClient } from "../client.js";
import { handleToolRequest } from "./handler.js";

/**
 * エピソード系ツールを登録する
 *
 * @param server - MCP サーバーインスタンス
 * @param client - anycast-backend クライアント
 */
export function registerEpisodeTools(
  server: McpServer,
  client: AnycastClient,
): void {
  server.tool(
    "list_episodes",
    "チャンネル内のエピソード一覧を取得する",
    {
      channelId: z.string().uuid().describe("チャンネル ID（UUID）"),
    },
    ({ channelId }) =>
      handleToolRequest(() => client.listEpisodes(channelId)),
  );

  server.tool(
    "get_episode",
    "エピソードの詳細情報を取得する",
    {
      channelId: z.string().uuid().describe("チャンネル ID（UUID）"),
      episodeId: z.string().uuid().describe("エピソード ID（UUID）"),
    },
    ({ channelId, episodeId }) =>
      handleToolRequest(() => client.getEpisode(channelId, episodeId)),
  );

  server.tool(
    "create_episode",
    "チャンネルに新しいエピソードを作成する",
    {
      channelId: z.string().uuid().describe("チャンネル ID（UUID）"),
      title: z.string().max(255).describe("エピソードタイトル（255文字以内）"),
      description: z
        .string()
        .max(2000)
        .optional()
        .describe("エピソードの説明（2000文字以内）"),
    },
    ({ channelId, title, description }) =>
      handleToolRequest(() =>
        client.createEpisode(channelId, { title, description }),
      ),
  );

  server.tool(
    "update_episode",
    "エピソードの情報を更新する",
    {
      channelId: z.string().uuid().describe("チャンネル ID（UUID）"),
      episodeId: z.string().uuid().describe("エピソード ID（UUID）"),
      title: z.string().max(255).describe("エピソードタイトル（255文字以内）"),
      description: z
        .string()
        .max(2000)
        .describe("エピソードの説明（2000文字以内）"),
    },
    ({ channelId, episodeId, title, description }) =>
      handleToolRequest(() =>
        client.updateEpisode(channelId, episodeId, { title, description }),
      ),
  );

  server.tool(
    "publish_episode",
    "エピソードを公開状態にする",
    {
      channelId: z.string().uuid().describe("チャンネル ID（UUID）"),
      episodeId: z.string().uuid().describe("エピソード ID（UUID）"),
    },
    ({ channelId, episodeId }) =>
      handleToolRequest(() => client.publishEpisode(channelId, episodeId)),
  );
}

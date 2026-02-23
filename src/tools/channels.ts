import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AnycastClient } from "../client.js";
import { handleToolRequest } from "./handler.js";

/**
 * チャンネル系ツールを登録する
 *
 * @param server - MCP サーバーインスタンス
 * @param client - anycast-backend クライアント
 */
export function registerChannelTools(
  server: McpServer,
  client: AnycastClient,
): void {
  server.tool(
    "list_channels",
    "自分が所有するチャンネルの一覧を取得する",
    {},
    () => handleToolRequest(() => client.listChannels()),
  );

  server.tool(
    "get_channel",
    "チャンネルの詳細情報を取得する",
    {
      channelId: z.string().uuid().describe("チャンネル ID（UUID）"),
    },
    ({ channelId }) =>
      handleToolRequest(() => client.getChannel(channelId)),
  );

  server.tool(
    "create_channel",
    "新しいチャンネルを作成する。characters には connect（既存キャラクターの紐づけ）と create（新規作成）を指定でき、合計 1〜2 人",
    {
      name: z.string().max(255).describe("チャンネル名（255文字以内）"),
      description: z
        .string()
        .max(2000)
        .optional()
        .describe("チャンネルの説明（2000文字以内）"),
      categoryId: z.string().uuid().describe("カテゴリ ID（UUID）"),
      characters: z
        .object({
          connect: z
            .array(
              z.object({
                characterId: z.string().uuid().describe("キャラクター ID"),
              }),
            )
            .optional()
            .describe("既存キャラクターを紐づける"),
          create: z
            .array(
              z.object({
                name: z.string().describe("キャラクター名"),
                persona: z.string().describe("性格・話し方の設定"),
                voiceId: z.string().uuid().describe("ボイス ID（UUID）"),
              }),
            )
            .optional()
            .describe("新規キャラクターを作成して紐づける"),
        })
        .describe("キャラクター設定（connect/create のいずれかまたは両方）"),
    },
    ({ name, description, categoryId, characters }) =>
      handleToolRequest(() =>
        client.createChannel({ name, description, categoryId, characters }),
      ),
  );

  server.tool(
    "update_channel",
    "チャンネルの情報を更新する",
    {
      channelId: z.string().uuid().describe("チャンネル ID（UUID）"),
      name: z.string().max(255).describe("チャンネル名（255文字以内）"),
      description: z
        .string()
        .max(2000)
        .optional()
        .describe("チャンネルの説明（2000文字以内）"),
      categoryId: z.string().uuid().describe("カテゴリ ID（UUID）"),
    },
    ({ channelId, name, description, categoryId }) =>
      handleToolRequest(() =>
        client.updateChannel(channelId, { name, description, categoryId }),
      ),
  );

  server.tool(
    "publish_channel",
    "チャンネルを公開状態にする",
    {
      channelId: z.string().uuid().describe("チャンネル ID（UUID）"),
    },
    ({ channelId }) =>
      handleToolRequest(() => client.publishChannel(channelId)),
  );
}

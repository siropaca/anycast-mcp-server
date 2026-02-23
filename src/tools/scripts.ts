import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AnycastClient } from "../client.js";
import { handleToolRequest } from "./handler.js";

/**
 * 台本系ツールを登録する
 *
 * @param server - MCP サーバーインスタンス
 * @param client - anycast-backend クライアント
 */
export function registerScriptTools(
  server: McpServer,
  client: AnycastClient,
): void {
  server.tool(
    "generate_script",
    "台本を非同期生成する。返却されるジョブ ID で get_script_job を使って進捗を確認できる",
    {
      channelId: z.string().uuid().describe("チャンネル ID（UUID）"),
      episodeId: z.string().uuid().describe("エピソード ID（UUID）"),
      prompt: z
        .string()
        .max(2000)
        .describe("台本のテーマ（2000文字以内）"),
      durationMinutes: z
        .number()
        .int()
        .min(3)
        .max(30)
        .optional()
        .describe("台本の長さ（分）。3〜30、デフォルト 10"),
      withEmotion: z
        .boolean()
        .optional()
        .describe("感情付与するかどうか。デフォルト false"),
    },
    ({ channelId, episodeId, prompt, durationMinutes, withEmotion }) =>
      handleToolRequest(() =>
        client.generateScript(channelId, episodeId, {
          prompt,
          durationMinutes,
          withEmotion,
        }),
      ),
  );

  server.tool(
    "get_script_job",
    "台本生成ジョブの状態を取得する。status が completed になったら list_script_lines で結果を取得できる",
    {
      jobId: z.string().uuid().describe("ジョブ ID（UUID）"),
    },
    ({ jobId }) =>
      handleToolRequest(() => client.getScriptJob(jobId)),
  );

  server.tool(
    "list_script_lines",
    "台本行の一覧を取得する",
    {
      channelId: z.string().uuid().describe("チャンネル ID（UUID）"),
      episodeId: z.string().uuid().describe("エピソード ID（UUID）"),
    },
    ({ channelId, episodeId }) =>
      handleToolRequest(() => client.listScriptLines(channelId, episodeId)),
  );
}

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AnycastClient } from "../client.js";
import { handleToolRequest } from "./handler.js";

/**
 * マスタデータ系ツールを登録する
 *
 * @param server - MCP サーバーインスタンス
 * @param client - anycast-backend クライアント
 */
export function registerMasterTools(
  server: McpServer,
  client: AnycastClient,
): void {
  server.tool(
    "list_categories",
    "チャンネル作成時に指定するカテゴリの一覧を取得する",
    {},
    () => handleToolRequest(() => client.listCategories()),
  );

  server.tool(
    "list_voices",
    "キャラクター作成時に指定するボイスの一覧を取得する",
    {},
    () => handleToolRequest(() => client.listVoices()),
  );

  server.tool(
    "list_characters",
    "自分が所有するキャラクターの一覧を取得する。チャンネル作成時の connect で使用する",
    {},
    () => handleToolRequest(() => client.listCharacters()),
  );
}

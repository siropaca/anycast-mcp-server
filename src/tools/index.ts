import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AnycastClient } from "../client.js";
import { registerChannelTools } from "./channels.js";
import { registerEpisodeTools } from "./episodes.js";
import { registerMasterTools } from "./master.js";
import { registerScriptTools } from "./scripts.js";

/**
 * 全ツールを MCP サーバーに登録する
 *
 * @param server - MCP サーバーインスタンス
 * @param client - anycast-backend クライアント
 */
export function registerAllTools(
  server: McpServer,
  client: AnycastClient,
): void {
  registerChannelTools(server, client);
  registerEpisodeTools(server, client);
  registerMasterTools(server, client);
  registerScriptTools(server, client);
}

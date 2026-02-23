import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * McpServer に登録されたツールのハンドラーを取得する
 *
 * SDK の内部プロパティに依存しているため、テストでのみ使用すること。
 * SDK のバージョンアップで変更された場合、ここだけ修正すればよい。
 *
 * @param server - MCP サーバーインスタンス
 * @param name - ツール名
 * @returns ツールハンドラー関数
 */
export function getToolHandler(
  server: McpServer,
  name: string,
): (args: Record<string, unknown>) => Promise<{ isError?: boolean; content: { type: string; text: string }[] }> {
  const tools = (
    server as unknown as {
      _registeredTools: Record<string, { handler: Function }>;
    }
  )._registeredTools;

  const tool = tools[name];
  if (!tool) {
    throw new Error(`Tool "${name}" is not registered`);
  }

  return tool.handler as (args: Record<string, unknown>) => Promise<{ isError?: boolean; content: { type: string; text: string }[] }>;
}

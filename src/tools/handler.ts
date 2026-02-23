import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatErrorForAgent } from "../errors.js";

/**
 * ツールハンドラーの共通処理。API 呼び出しの結果を JSON で返し、エラー時は isError を付与する
 *
 * @param fn - API 呼び出しを行う関数
 * @returns MCP ツールのレスポンス
 */
export async function handleToolRequest(
  fn: () => Promise<unknown>,
): Promise<CallToolResult> {
  try {
    const result = await fn();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: formatErrorForAgent(error) }],
    };
  }
}

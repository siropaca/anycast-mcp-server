import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AnycastClient } from "./client.js";
import { registerAllTools } from "./tools/index.js";

// 環境変数のバリデーション
const apiKey = process.env.ANYCAST_API_KEY;
const baseUrl = process.env.ANYCAST_BASE_URL;

if (!apiKey) {
  console.error("環境変数 ANYCAST_API_KEY が設定されていません");
  process.exit(1);
}

if (!baseUrl) {
  console.error("環境変数 ANYCAST_BASE_URL が設定されていません");
  process.exit(1);
}

// クライアントとサーバーの初期化
const client = new AnycastClient(baseUrl, apiKey);
const server = new McpServer({
  name: "anycast",
  version: "0.1.0",
});

// ツール登録
registerAllTools(server, client);

// stdio トランスポートで接続
const transport = new StdioServerTransport();
await server.connect(transport);

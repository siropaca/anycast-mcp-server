# Anycast MCP Server

[anycast-backend](https://github.com/siropaca/anycast-backend) の REST API をラップする MCP（Model Context Protocol）Server です。
Claude Code などの MCP クライアントから anycast API を操作し、チャンネル作成やエピソード作成を行うために使用します。

## セットアップ

### 前提条件

- Node.js >= 22
- anycast-backend の API キー（`ak_` プレフィックス）を取得済みであること

### 環境変数

| 変数名 | 必須 | 説明 |
|--------|:----:|------|
| `ANYCAST_API_KEY` | ○ | anycast-backend の API キー |
| `ANYCAST_BASE_URL` | ○ | anycast-backend のベース URL |

### Claude Code への登録

`.claude/settings.json` に以下を追加します:

```json
{
  "mcpServers": {
    "anycast": {
      "command": "npx",
      "args": ["-y", "anycast-mcp-server"],
      "env": {
        "ANYCAST_API_KEY": "ak_...",
        "ANYCAST_BASE_URL": "https://api.anycast.audio"
      }
    }
  }
}
```

## 提供ツール

| ツール名 | 説明 |
|----------|------|
| `list_channels` | 自分のチャンネル一覧を取得 |
| `get_channel` | チャンネルの詳細を取得 |
| `create_channel` | 新しいチャンネルを作成 |
| `update_channel` | チャンネルを更新 |
| `publish_channel` | チャンネルを公開 |
| `list_episodes` | エピソード一覧を取得 |
| `get_episode` | エピソードの詳細を取得 |
| `create_episode` | 新しいエピソードを作成 |
| `update_episode` | エピソードを更新 |
| `publish_episode` | エピソードを公開 |
| `list_categories` | カテゴリ一覧を取得 |
| `list_voices` | ボイス一覧を取得 |
| `list_characters` | 自分のキャラクター一覧を取得 |
| `generate_script` | 台本を非同期生成 |
| `get_script_job` | 台本生成ジョブの状態を取得 |
| `list_script_lines` | 台本行の一覧を取得 |

## 開発

```bash
pnpm install        # 依存関係のインストール
pnpm build          # ビルド
pnpm dev            # TypeScript のウォッチビルド
pnpm test           # テスト実行
pnpm test:watch     # テストのウォッチモード
pnpm typecheck      # 型チェック
```

## 関連リポジトリ

- [anycast-backend](https://github.com/siropaca/anycast-backend)
- [anycast-frontend](https://github.com/siropaca/anycast-frontend)

## License

MIT

# Anycast MCP Server

[anycast-backend](https://github.com/siropaca/anycast-backend) の REST API をラップする MCP（Model Context Protocol）Server です。
Claude Code エージェントから本番 API を操作し、チャンネル作成やエピソード作成を行うために使用します。

## 関連リポジトリ

- https://github.com/siropaca/anycast-backend
- https://github.com/siropaca/anycast-frontend

## 技術スタック

- **言語**: TypeScript
- **ランタイム**: Node.js
- **MCP SDK**: @modelcontextprotocol/sdk
- **トランスポート**: stdio
- **バージョン管理**: mise

## セットアップ

### 前提条件

- [mise](https://mise.jdx.dev/) がインストールされていること
- anycast-backend の API キー（`ak_` プレフィックス）を取得済みであること

### インストール

```bash
mise trust && mise install  # Node.js のインストール
npm install                 # 依存関係のインストール
```

### ビルド

```bash
npm run build
```

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|:----:|------|
| `ANYCAST_API_KEY` | ○ | anycast-backend の API キー |
| `ANYCAST_BASE_URL` | ○ | anycast-backend のベース URL |

## Claude Code への登録

`.claude/settings.json` に以下を追加します:

```json
{
  "mcpServers": {
    "anycast": {
      "command": "node",
      "args": ["/path/to/anycast-mcp-server/dist/index.js"],
      "env": {
        "ANYCAST_API_KEY": "ak_...",
        "ANYCAST_BASE_URL": "https://api.example.com"
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

詳細は [docs/specs/tool-design.md](docs/specs/tool-design.md) を参照。

## ディレクトリ構成

```
.
├── src/                 # ソースコード
│   ├── index.ts         # エントリーポイント（MCP Server 起動）
│   ├── tools/           # ツール定義
│   └── client.ts        # anycast-backend HTTP クライアント
├── docs/                # ドキュメント
│   ├── adr/             # Architecture Decision Records
│   └── specs/           # 設計仕様書
├── package.json
├── tsconfig.json
├── .mise.toml           # mise 設定（Node.js バージョン管理）
├── README.md
├── CLAUDE.md
└── AGENTS.md
```

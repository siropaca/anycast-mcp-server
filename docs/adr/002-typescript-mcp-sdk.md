# ADR-002: TypeScript + MCP SDK の採用

## ステータス

Accepted

## コンテキスト

ADR-001 で MCP Server の構築を決定した。実装に使用する言語とフレームワークを選定する必要がある。

## 決定

**TypeScript** と公式の **@modelcontextprotocol/sdk** を使用して MCP Server を実装する。

トランスポートには **stdio** を使用する。

## 選択肢

### 選択肢 1: TypeScript + @modelcontextprotocol/sdk

- **メリット**
  - MCP 公式 SDK であり、プロトコル仕様への準拠が保証される
  - ドキュメントやサンプルが最も充実している
  - JSON スキーマとの親和性が高い
  - エコシステムが成熟しており HTTP クライアントライブラリが豊富
- **デメリット**
  - バックエンドは Go で書かれているため、言語が異なる

### 選択肢 2: Go + mcp-go

- **メリット**
  - バックエンドと同じ言語で統一できる
  - バックエンドの型定義を直接参照可能
- **デメリット**
  - Go の MCP SDK はコミュニティ主導で公式ほど成熟していない
  - MCP Server として使われている実績が TypeScript SDK より少ない

### 選択肢 3: Python + mcp (公式)

- **メリット**
  - Python の公式 MCP SDK も提供されている
- **デメリット**
  - プロジェクトで Python を使用していないため、ツールチェインの追加が必要
  - TypeScript SDK ほどのエコシステムはない

## 理由

1. **公式サポート**: TypeScript SDK は Anthropic が直接メンテナンスしており、MCP プロトコルの進化に追従できる
2. **実績**: Claude Code 自体が TypeScript 製の MCP Server と連携する前提で設計されており、最も実績のある組み合わせ
3. **軽量**: このプロジェクトは REST API の薄いラッパーであり、Go の型安全性よりも TypeScript の開発速度が適している
4. **stdio トランスポート**: Claude Code はローカル MCP Server を stdio で起動するため、サーバーレス基盤は不要

## 結果

- ランタイムは Node.js を使用する
- Node.js のバージョンは mise で管理する
- `@modelcontextprotocol/sdk` パッケージを依存に追加する
- TypeScript の strict モードで実装する
- stdio トランスポートで Claude Code と通信する

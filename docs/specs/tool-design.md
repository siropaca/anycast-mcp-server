# MCP ツール設計仕様書

anycast-backend の REST API をラップする MCP ツールの設計仕様。

---

## 設計方針

### 原則

1. **最小権限**: エージェントの主要ユースケース（チャンネル作成・エピソード作成・公開）に必要な操作のみツール化する
2. **安全性**: 破壊的操作（削除）はツールとして提供しない
3. **自己完結性**: 各ツールは必要なパラメータを入力として受け取り、結果を構造化して返す
4. **発見可能性**: 一覧取得ツールを提供し、エージェントが既存リソースの ID を取得できるようにする

### API 通信

- ベース URL は環境変数 `ANYCAST_BASE_URL` で指定
- 認証は環境変数 `ANYCAST_API_KEY` の値を `X-API-Key` ヘッダーに設定
- レスポンスは MCP ツールの結果として整形して返す
- HTTP エラー時はステータスコードとエラーメッセージを含めて返す

---

## ツール一覧

| ツール名 | 操作 | 説明 |
|----------|------|------|
| `list_channels` | GET | 自分のチャンネル一覧を取得 |
| `get_channel` | GET | チャンネルの詳細を取得 |
| `create_channel` | POST | 新しいチャンネルを作成 |
| `update_channel` | PATCH | チャンネルを更新 |
| `publish_channel` | POST | チャンネルを公開 |
| `list_episodes` | GET | チャンネル内のエピソード一覧を取得 |
| `get_episode` | GET | エピソードの詳細を取得 |
| `create_episode` | POST | 新しいエピソードを作成 |
| `update_episode` | PATCH | エピソードを更新 |
| `publish_episode` | POST | エピソードを公開 |
| `list_categories` | GET | カテゴリ一覧を取得 |
| `list_voices` | GET | ボイス一覧を取得 |
| `list_characters` | GET | 自分のキャラクター一覧を取得 |
| `generate_script` | POST | 台本を非同期生成 |
| `get_script_job` | GET | 台本生成ジョブの状態を取得 |
| `list_script_lines` | GET | 台本行の一覧を取得 |

---

## ツール詳細

### list_channels

自分が所有するチャンネルの一覧を取得する。

- **エンドポイント**: `GET /api/v1/me/channels`
- **入力パラメータ**: なし
- **レスポンス**: チャンネル一覧（id, name, description, publishedAt）

---

### get_channel

チャンネルの詳細情報を取得する。

- **エンドポイント**: `GET /api/v1/me/channels/{channelId}`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| channelId | string | ○ | チャンネル ID（UUID） |

- **レスポンス**: チャンネル詳細（キャラクター、カテゴリ、公開状態を含む）

---

### create_channel

新しいチャンネルを作成する。

- **エンドポイント**: `POST /api/v1/channels`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| name | string | ○ | チャンネル名（255文字以内） |
| description | string | | チャンネルの説明（2000文字以内） |
| categoryId | string | ○ | カテゴリ ID（UUID） |
| characters | object | ○ | キャラクター設定（下記参照） |

**characters の構造**:

```json
{
  "connect": [
    { "characterId": "uuid" }
  ],
  "create": [
    {
      "name": "キャラクター名",
      "persona": "性格・話し方の設定",
      "voiceId": "uuid"
    }
  ]
}
```

- `connect`: 既存キャラクターを紐づける場合
- `create`: 新規キャラクターを作成して紐づける場合
- いずれか、または両方を指定。合計 1〜2 人

- **レスポンス**: 作成されたチャンネルの詳細

---

### update_channel

チャンネルの情報を更新する。

- **エンドポイント**: `PATCH /api/v1/channels/{channelId}`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| channelId | string | ○ | チャンネル ID（UUID） |
| name | string | ○ | チャンネル名（255文字以内） |
| description | string | | チャンネルの説明（2000文字以内） |
| categoryId | string | ○ | カテゴリ ID（UUID） |

- **レスポンス**: 更新されたチャンネルの詳細

---

### publish_channel

チャンネルを公開状態にする。

- **エンドポイント**: `POST /api/v1/channels/{channelId}/publish`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| channelId | string | ○ | チャンネル ID（UUID） |

- **レスポンス**: 公開されたチャンネルの詳細

---

### list_episodes

チャンネル内のエピソード一覧を取得する。

- **エンドポイント**: `GET /api/v1/me/channels/{channelId}/episodes`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| channelId | string | ○ | チャンネル ID（UUID） |

- **レスポンス**: エピソード一覧（id, title, description, publishedAt）

---

### get_episode

エピソードの詳細情報を取得する。

- **エンドポイント**: `GET /api/v1/me/channels/{channelId}/episodes/{episodeId}`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| channelId | string | ○ | チャンネル ID（UUID） |
| episodeId | string | ○ | エピソード ID（UUID） |

- **レスポンス**: エピソード詳細（音声情報、BGM、公開状態を含む）

---

### create_episode

チャンネルに新しいエピソードを作成する。

- **エンドポイント**: `POST /api/v1/channels/{channelId}/episodes`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| channelId | string | ○ | チャンネル ID（UUID） |
| title | string | ○ | エピソードタイトル（255文字以内） |
| description | string | | エピソードの説明（2000文字以内） |

- **レスポンス**: 作成されたエピソードの詳細

---

### update_episode

エピソードの情報を更新する。

- **エンドポイント**: `PATCH /api/v1/channels/{channelId}/episodes/{episodeId}`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| channelId | string | ○ | チャンネル ID（UUID） |
| episodeId | string | ○ | エピソード ID（UUID） |
| title | string | ○ | エピソードタイトル（255文字以内） |
| description | string | ○ | エピソードの説明（2000文字以内） |

- **レスポンス**: 更新されたエピソードの詳細

---

### publish_episode

エピソードを公開状態にする。

- **エンドポイント**: `POST /api/v1/channels/{channelId}/episodes/{episodeId}/publish`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| channelId | string | ○ | チャンネル ID（UUID） |
| episodeId | string | ○ | エピソード ID（UUID） |

- **レスポンス**: 公開されたエピソードの詳細

---

### list_categories

チャンネル作成時に指定するカテゴリの一覧を取得する。

- **エンドポイント**: `GET /api/v1/categories`
- **入力パラメータ**: なし
- **レスポンス**: カテゴリ一覧（id, slug, name）

---

### list_voices

キャラクター作成時に指定するボイスの一覧を取得する。

- **エンドポイント**: `GET /api/v1/voices`
- **入力パラメータ**: なし
- **レスポンス**: ボイス一覧（id, name, provider, gender）

---

### list_characters

自分が所有するキャラクターの一覧を取得する。チャンネル作成時の `connect` で使用する。

- **エンドポイント**: `GET /api/v1/me/characters`
- **入力パラメータ**: なし
- **レスポンス**: キャラクター一覧（id, name, persona, voice）

---

### generate_script

台本を非同期生成する。ジョブ ID を返すので、`get_script_job` で進捗を確認する。

- **エンドポイント**: `POST /api/v1/channels/{channelId}/episodes/{episodeId}/script/generate-async`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| channelId | string | ○ | チャンネル ID（UUID） |
| episodeId | string | ○ | エピソード ID（UUID） |
| prompt | string | ○ | 台本のテーマ（2000文字以内） |
| durationMinutes | number | | 台本の長さ（分）。3〜30、デフォルト 10 |
| withEmotion | boolean | | 感情付与するかどうか。デフォルト false |

- **レスポンス**: 台本生成ジョブ（id, status, progress 等）

---

### get_script_job

台本生成ジョブの状態を取得する。`status` が `completed` になったら `list_script_lines` で結果を取得できる。

- **エンドポイント**: `GET /api/v1/script-jobs/{jobId}`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| jobId | string | ○ | ジョブ ID（UUID） |

- **レスポンス**: 台本生成ジョブ（id, status, progress, errorMessage 等）

---

### list_script_lines

台本行の一覧を取得する。

- **エンドポイント**: `GET /api/v1/channels/{channelId}/episodes/{episodeId}/script/lines`
- **入力パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| channelId | string | ○ | チャンネル ID（UUID） |
| episodeId | string | ○ | エピソード ID（UUID） |

- **レスポンス**: 台本行一覧（id, lineOrder, speaker, text, emotion）

---

## エラーハンドリング

### 方針

- HTTP ステータスコードに基づいてエージェントにわかりやすいメッセージを返す
- レスポンスボディのエラーメッセージがあればそれを含める

### エラーレスポンス形式

```
Error: {status} {statusText}
{error message from API response}
```

### ステータスコード別の対応

| ステータス | 説明 | ツール側の対応 |
|-----------|------|---------------|
| 400 | バリデーションエラー | エラーメッセージをそのまま返す |
| 401 | 認証エラー | API キーの設定確認を促すメッセージを返す |
| 403 | 権限エラー | リソースへのアクセス権がない旨を返す |
| 404 | リソース未発見 | 指定された ID が存在しない旨を返す |
| 409 | 競合エラー | 重複などの理由をそのまま返す |
| 500 | サーバーエラー | サーバー側の問題である旨を返す |

---

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|:----:|------|
| `ANYCAST_API_KEY` | ○ | anycast-backend の API キー（`ak_` プレフィックス） |
| `ANYCAST_BASE_URL` | ○ | anycast-backend のベース URL（例: `https://api.example.com`） |

---

## Claude Code への登録

`.claude/settings.json` に以下のように登録する:

```json
{
  "mcpServers": {
    "anycast": {
      "command": "node",
      "args": ["path/to/anycast-mcp-server/dist/index.js"],
      "env": {
        "ANYCAST_API_KEY": "ak_...",
        "ANYCAST_BASE_URL": "https://api.example.com"
      }
    }
  }
}
```

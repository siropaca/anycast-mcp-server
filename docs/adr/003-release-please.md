# ADR-003: Release Please によるリリース自動化の採用

## ステータス

Accepted

## コンテキスト

npm パッケージ `anycast-mcp-server` のリリースワークフローを堅牢にする必要があった。
現状は手動で `package.json` のバージョンを更新し `npm publish` を実行しており、以下の課題がある:

- バージョン番号の更新忘れ・ミス
- CHANGELOG の手動管理が煩雑
- リリース前のレビューゲートがない
- リリース手順が属人化している

単一パッケージ構成のため、モノレポ向けの複雑なツールは不要。
Conventional Commits に準拠したコミットメッセージから自動でバージョン決定・CHANGELOG 生成を行い、PR ベースのレビューゲートを設けたい。

## 決定

**Release Please** を GitHub Actions で導入し、リリースプロセスを自動化する。

- Conventional Commits に基づきバージョンを自動決定する
- Release PR を自動作成し、マージをトリガーに GitHub Release を作成する
- npm publish は Release イベントをトリガーに GitHub Actions で実行する

## 選択肢

### 選択肢 1: Release Please

- **メリット**
  - PR ベースのリリースフローで、マージ前にレビューできる
  - 設定が最小限（`release-please-config.json` と `.release-please-manifest.json`）
  - Conventional Commits からバージョンとCHANGELOG を自動生成
  - Google が開発・メンテナンスしており、安定している
- **デメリット**
  - Conventional Commits への準拠が必須

### 選択肢 2: Changesets

- **メリット**
  - モノレポ対応が強力
  - changeset ファイルで変更内容を明示的に管理できる
- **デメリット**
  - 単一パッケージには過剰な設定が必要
  - changeset ファイルの手動作成が開発フローに追加される
  - Conventional Commits との連携が標準ではない

### 選択肢 3: semantic-release

- **メリット**
  - 完全自動化（マージ即リリース）
  - プラグインエコシステムが豊富
- **デメリット**
  - マージ前のレビューゲートがない（PR ベースではない）
  - 設定が複雑になりやすい
  - 意図しないリリースが発生するリスクがある

## 理由

1. **PR ベースのレビューゲート**: Release Please は Release PR を作成し、マージ前にバージョン・CHANGELOG を確認できる。semantic-release にはこの仕組みがない
2. **設定の最小性**: 単一パッケージ構成のため、Changesets のようなモノレポ向けの複雑さは不要。Release Please は最小限の設定で動作する
3. **Conventional Commits との親和性**: コミットメッセージからバージョンを自動決定するため、開発者は changeset ファイルの作成など追加の手順を踏む必要がない
4. **安全性**: PR マージをトリガーにすることで、意図しないリリースを防止できる

## 結果

- GitHub Actions に Release Please ワークフローを追加する
- npm publish を Release イベントトリガーの GitHub Actions で実行する
- コミットメッセージを Conventional Commits 形式に統一する
- AGENTS.md と README.md に Conventional Commits の規約を記載する

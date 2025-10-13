# SF Meter
SF 作品に登場するテクノロジーの危険度や SF 度合いを数値化し、「SF メーター」として表示するためのモノレポジトリです。Go 製のバックエンド API（`backend/`）と、React + TypeScript + Vite で構築するフロントエンド（`frontend/`）の 2 つのサブプロジェクトを格納しています。

## プロジェクト構成
```
sf-meter/
├── backend/               # Go 製 REST API。クリーンアーキテクチャの学習用構成
│   ├── domain/            # エンティティ定義
│   ├── infrastructure/    # リポジトリ実装（メモリモック）
│   ├── presentation/      # HTTP ハンドラーとルーター
│   ├── registry/          # 依存解決（DI）とサーバー初期化
│   ├── usecase/           # ビジネスロジックとポート定義
│   └── main.go
├── frontend/              # React + TypeScript + Vite による Web UI（現在はテンプレート状態）
│   ├── src/
│   └── index.html
├── README.md
└── LICENSE
```

詳細な実装メモは `backend/README.md` と `frontend/README.md` を参照してください。

## 技術スタック
- Backend: Go 1.24.x（標準ライブラリのみ）
- Frontend: React 19 / TypeScript / Vite
- 開発環境: Node.js 18 以上推奨、npm または pnpm

## セットアップ
以下はモノレポジトリ全体をローカルで動かす際の手順です。

### 1. リポジトリを取得
```bash
git clone https://github.com/nemdull/sf-meter.git
cd sf-meter
```

### 2. バックエンドの起動
```bash
cd backend
go run ./main.go
```
バックエンドは `http://localhost:8080` で待ち受けます。ポートを変更したい場合は `registry.NewHTTPServer` に渡しているアドレスを編集してください。

### 3. フロントエンドのセットアップと起動
フロントエンドは現在テンプレートの状態で、まだバックエンドと連携する UI は実装していません。開発を進める際は以下のコマンドでローカルサーバーを起動してください。

```bash
cd frontend
npm install          # もしくは pnpm install / yarn install
npm run dev          # http://localhost:5173 がデフォルト
```

## API クイックリファレンス
現状のバックエンドはメモリ上のモックデータを返す簡易 REST API です。

| メソッド | パス                    | 説明                      |
|----------|-------------------------|---------------------------|
| GET      | `/api/v1/techs`         | テクノロジー一覧の取得   |
| GET      | `/api/v1/tech?id={id}`  | 指定 ID の取得           |

サンプルレスポンス（`GET /api/v1/techs`）:

```json
[
  {
    "id": 1,
    "name": "ドミネーター",
    "description": "犯罪係数で裁く未来銃",
    "score": 35
  }
]
```

より詳しいアーキテクチャやレイヤーの役割は `backend/README.md` を参照してください。

## 開発時のヒント
- バックエンドはレイヤーごとに依存を逆転させているため、`infrastructure` の実装を差し替えるだけで永続化先を変更できます。
- フロントエンドは Vite の初期テンプレートからスタートしているため、`frontend/src/App.tsx` を差し替えてバックエンド API を呼び出す UI を実装してください。
- CORS や API のエンドポイント URL を共通化する場合は、Vite の環境変数（`.env`）で `VITE_API_BASE_URL` などを管理すると開発しやすくなります。

## テスト・静的解析
- Backend: まだテストは用意されていません。`go test ./...` で一括実行できる構成を想定しています。
- Frontend: `npm run lint` で ESLint を実行できます。必要に応じて `npm run build` で本番ビルドを確認してください。

## 今後のロードマップ（例）
- バックエンド: バリデーションやエラーハンドリングの整備、永続化層の差し替え、テスト追加
- フロントエンド: API と連携した UI 構築、デザイン適用、テスト導入（Vitest / Testing Library 等）

## ライセンス
このリポジトリは [MIT License](LICENSE) の下で公開されています。

# SF Meter

SF 作品に出てくるテクノロジーが、いまどれくらい現実に近いか。それを 0〜100 の「実現度」で見せるアプリです。タイムマシンは 1、量子暗号通信は 88、といった具合です。

このリポジトリは入り口で、中身は 2 つのリポジトリに分かれています（サブモジュールとして入れてあります）。

| フォルダ | リポジトリ | 中身 |
| --- | --- | --- |
| `backend/` | [sf-meter-api](https://github.com/nemdull/sf-meter-api) | Go の API。標準ライブラリの `net/http` だけで、層を分けて依存の向きをそろえてある。保存先は PostgreSQL とメモリを切り替えられる |
| `frontend/` | [sf-meter-web](https://github.com/nemdull/sf-meter-web) | React と TypeScript の画面。針で実現度を指す計器、検索、絞り込み。API につながらないときは、サンプルデータで動く |

作った人: [nemdull.com](https://www.nemdull.com/)

## 動かす

```bash
git clone --recurse-submodules https://github.com/nemdull/sf-meter.git
cd sf-meter
```

すでに clone してあって `backend/` と `frontend/` が空のときは、`git submodule update --init` を実行してください。

### いちばん早い方法（Docker）

```bash
docker compose up --build
```

DB（PostgreSQL）・API・画面がまとめて立ち上がります。http://localhost:5173 を開いてください。画面の右上に「API につながっています」と出れば、画面 → API → DB までつながっています。

### 手元の Go と Node で動かす

ターミナルを 2 つ使います。

```bash
# 1 つ目: API（http://localhost:8080）。DB は要りません
cd backend
go run .
```

```bash
# 2 つ目: 画面（http://localhost:5173）
cd frontend
npm install
npm run dev
```

画面の開発サーバーは、`/api` へのリクエストを API へ中継します。API を起こさなくても、画面はサンプルデータで動きます。

PostgreSQL を使うとき、書き込みの API を開けるときは、[backend の README](https://github.com/nemdull/sf-meter-api#readme) を見てください。

## API をひとめで

| メソッド | パス | 何をするか |
| --- | --- | --- |
| GET | `/api/v1/techs` | 一覧。`q`（検索）、`min_score` / `max_score`、`sort`、`limit` / `offset` が使える |
| GET | `/api/v1/techs/{id}` | 1 件 |
| GET | `/api/v1/techs/random` | どれか 1 件 |
| GET | `/api/v1/stats` | 件数・平均・段階ごとの内訳 |
| POST / PUT / DELETE | `/api/v1/techs`、`/api/v1/techs/{id}` | 追加・更新・削除。サーバーに `ADMIN_TOKEN` を設定したときだけ有効 |
| GET | `/health` | サーバーと保存先が動いているか |

```bash
curl "http://localhost:8080/api/v1/techs?sort=-score&limit=1"
```

```json
[
  { "id": 2, "name": "シビラシステム", "description": "脳スキャンで犯罪係数を算出する全国犯罪予防システム", "score": 91, "level": "reality" }
]
```

くわしい仕様は [openapi.yaml](https://github.com/nemdull/sf-meter-api/blob/main/docs/openapi.yaml) にあります。

## テスト

```bash
cd backend && go test -race ./...     # API
cd frontend && npm test               # 画面
```

2 つのリポジトリで、同じことを両側から確かめています。

- API は、メモリ実装と PostgreSQL 実装に同じテストを当てて、保存先を差し替えても結果が変わらないことを確かめる
- 画面は、API につながらないときに使うサンプルデータに、API と同じ条件を当てて、同じ結果になることを確かめる

どちらのリポジトリも、プルリクエストのたびに GitHub Actions でテストが走ります。

このリポジトリには、3 つをつないだ状態で確かめるテスト（`e2e/`、Playwright）があります。`docker compose up` で立ち上げたものをブラウザーで実際に開いて、画面 → nginx → API → PostgreSQL がつながっていること、検索・絞り込み・並べ替え・「ほかの技術を引く」が API の結果どおりに出ることを確かめます。CI でも毎回走ります。

```bash
docker compose up -d --build --wait
cd e2e && npm ci && npx playwright install chromium && npm test
```

## サブモジュールを新しくする

`backend/` と `frontend/` は、それぞれのリポジトリの特定のコミットを指しています。新しいものに合わせるとき:

```bash
git submodule update --remote
git add backend frontend
git commit -m "chore: サブモジュールを更新"
```

## 関連する記事

- [Go言語で気づいたシンプル設計の真髄 ─ Rails・Java経験者がハマったポイントまとめ](https://qiita.com/nemdull/items/7ff73572ccc3c78d311d)

## ライセンス

このリポジトリは [MIT License](LICENSE) の下で公開されています。

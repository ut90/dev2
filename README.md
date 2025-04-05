# 図書館管理システム (Library Management System)

## 概要 (Overview)

図書館管理システムは、図書館の日常業務を効率化するためのウェブアプリケーションです。本システムは、蔵書管理、利用者管理、貸出・返却処理などの基本的な図書館機能を提供します。

本システムは以下の2つの主要なインターフェースを持っています：

1. **スタッフ向けインターフェース**：図書館スタッフが蔵書の登録・管理、利用者の登録・管理、貸出・返却処理を行うためのインターフェース
2. **利用者向けインターフェース**：図書館利用者が蔵書検索や自身の貸出状況を確認するためのインターフェース

## 主な機能 (Main Features)

### スタッフ向け機能
- スタッフ認証（ログイン/ログアウト）
- 蔵書管理（登録、検索、更新、削除）
- 利用者管理（登録、検索、更新、削除）
- 貸出処理
- 返却処理
- 貸出履歴の確認

### 利用者向け機能
- 利用者認証（ログイン/ログアウト）
- 蔵書検索
- 貸出状況の確認

## 技術スタック (Technology Stack)

- **フロントエンド**: HTML, CSS, JavaScript, Bootstrap
- **バックエンド**: Node.js, Express.js
- **データベース**: PostgreSQL
- **認証**: JWT (JSON Web Tokens)
- **テスト**: Jest, Supertest

## システム要件 (System Requirements)

- Node.js (v14以上)
- npm (v6以上)
- PostgreSQL (v14以上)

## インストール手順 (Installation)

1. リポジトリをクローン
```bash
git clone https://github.com/ut90/dev2.git
cd dev2
```

2. 依存パッケージのインストール
```bash
npm install
```

3. 環境変数の設定
`.env`ファイルを作成し、以下の内容を設定します：
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

4. データベースの作成と初期化
```bash
# PostgreSQLにログイン
psql -U postgres

# データベースの作成
CREATE DATABASE library_db;

# 作成したデータベースに接続
\c library_db

# スキーマの適用（別ターミナルで実行）
psql -U postgres -d library_db -f config/schema.sql
```

## 起動手順 (Startup)

1. 開発モードで起動
```bash
npm run dev
```

2. 本番モードで起動
```bash
npm start
```

起動後、ブラウザで以下のURLにアクセスできます：
- http://localhost:3000 - メインページ
- http://localhost:3000/staff/login - スタッフログインページ
- http://localhost:3000/user/login - 利用者ログインページ

## テスト実行 (Testing)

テストを実行するには以下のコマンドを使用します：
```bash
npm test
```

カバレッジレポート付きでテストを実行するには：
```bash
npm test -- --coverage
```

## プロジェクト構成 (Project Structure)

```
library_system/
├── app.js                # アプリケーションのエントリーポイント
├── config/               # 設定ファイル
│   └── schema.sql        # データベーススキーマ
├── controllers/          # コントローラー
│   ├── bookController.js # 蔵書管理コントローラー
│   ├── lendingController.js # 貸出・返却コントローラー
│   ├── staffController.js # スタッフ管理コントローラー
│   └── userController.js # 利用者管理コントローラー
├── docs/                 # ドキュメント
├── middleware/           # ミドルウェア
│   └── auth.js           # 認証ミドルウェア
├── models/               # モデル
│   └── db.js             # データベース接続
├── public/               # 静的ファイル
│   ├── css/              # CSSファイル
│   ├── js/               # クライアントサイドJavaScript
│   └── images/           # 画像ファイル
├── routes/               # ルート定義
│   ├── api.js            # APIルート
│   └── staff.js          # スタッフ向けルート
├── tests/                # テストファイル
└── views/                # ビューテンプレート（EJS）
    ├── index.ejs         # メインページ
    ├── error.ejs         # エラーページ
    ├── partials/         # 部分テンプレート
    ├── staff/            # スタッフ向けページ
    └── user/             # 利用者向けページ
```

## ライセンス (License)

このプロジェクトはMITライセンスの下で公開されています。

## 開発者 (Developers)

- Devin AI

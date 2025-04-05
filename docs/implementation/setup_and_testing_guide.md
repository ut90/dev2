# 図書館管理システム セットアップおよび動作確認手順書

## 1. 概要

本文書では、図書館管理システムのセットアップ方法と動作確認手順について説明します。STEP1で実装した機能を実際に動作させるための環境構築から、各機能のテスト方法までを詳細に記載しています。

## 2. 前提条件

以下のソフトウェアがインストールされていることを前提とします：

- Node.js（バージョン14以上）
- npm（バージョン6以上）
- PostgreSQL（バージョン12以上）

## 3. 環境構築手順

### 3.1 プロジェクトのセットアップ

1. プロジェクトディレクトリを作成します：

```bash
mkdir -p ~/library_system
cd ~/library_system
```

2. package.jsonファイルを作成します：

```bash
npm init -y
```

3. 必要なパッケージをインストールします：

```bash
npm install express pg ejs body-parser dotenv bcrypt jsonwebtoken cors
npm install --save-dev nodemon
```

4. プロジェクト構造を作成します：

```bash
mkdir -p public/css public/js views/partials views/staff views/user models controllers routes config
```

### 3.2 データベースのセットアップ

1. PostgreSQLにログインします：

```bash
sudo -u postgres psql
```

2. データベースとユーザーを作成します：

```sql
CREATE DATABASE library_management;
CREATE USER library_admin WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE library_management TO library_admin;
\c library_management
GRANT ALL ON SCHEMA public TO library_admin;
\q
```

3. データベーススキーマを作成します。以下のSQLファイルを作成します：

```bash
touch ~/library_system/config/schema.sql
```

4. `schema.sql`ファイルに、`/implementation/data_model/database_schema.md`の内容をコピーします。

5. スキーマをデータベースに適用します：

```bash
psql -U library_admin -d library_management -f ~/library_system/config/schema.sql
```

### 3.3 環境変数の設定

1. `.env`ファイルを作成します：

```bash
touch ~/library_system/.env
```

2. 以下の内容を`.env`ファイルに追加します：

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_management
DB_USER=library_admin
DB_PASSWORD=your_password
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

## 4. アプリケーションの実装

### 4.1 サーバー設定

1. `app.js`ファイルを作成します：

```bash
touch ~/library_system/app.js
```

2. 以下の内容を`app.js`に追加します：

```javascript
// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

// アプリケーションの初期化
const app = express();

// ミドルウェアの設定
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// テンプレートエンジンの設定
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// データベース接続の設定
const db = require('./models/db');

// ルートの設定
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const lendingRoutes = require('./routes/lendingRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api', bookRoutes);
app.use('/api', userRoutes);
app.use('/api', lendingRoutes);
app.use('/api', authRoutes);

// フロントエンドルート
app.get('/', (req, res) => {
    res.render('index');
});

// スタッフ向けルート
app.get('/staff/login', (req, res) => {
    res.render('staff/login');
});

app.get('/staff/dashboard', (req, res) => {
    res.render('staff/dashboard');
});

app.get('/staff/books', (req, res) => {
    res.render('staff/book_management');
});

app.get('/staff/books/register', (req, res) => {
    res.render('staff/book_registration');
});

app.get('/staff/users', (req, res) => {
    res.render('staff/user_management');
});

app.get('/staff/lending', (req, res) => {
    res.render('staff/lending');
});

// 利用者向けルート
app.get('/user/login', (req, res) => {
    res.render('user/login');
});

app.get('/user/home', (req, res) => {
    res.render('user/home');
});

app.get('/user/books', (req, res) => {
    res.render('user/book_search');
});

app.get('/user/books/:id', (req, res) => {
    res.render('user/book_detail', { bookId: req.params.id });
});

app.get('/user/lending', (req, res) => {
    res.render('user/lending_status');
});

// エラーハンドリング
app.use((req, res, next) => {
    res.status(404).render('error', { message: 'ページが見つかりません' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'サーバーエラーが発生しました' });
});

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

module.exports = app;
```

### 4.2 データベース接続設定

1. `models/db.js`ファイルを作成します：

```bash
touch ~/library_system/models/db.js
```

2. 以下の内容を`db.js`に追加します：

```javascript
// models/db.js
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};
```

### 4.3 コントローラーの実装

1. 蔵書管理コントローラーを作成します：

```bash
touch ~/library_system/controllers/bookController.js
```

2. 利用者管理コントローラーを作成します：

```bash
touch ~/library_system/controllers/userController.js
```

3. 貸出・返却コントローラーを作成します：

```bash
touch ~/library_system/controllers/lendingController.js
```

4. 認証コントローラーを作成します：

```bash
touch ~/library_system/controllers/authController.js
```

5. 各コントローラーファイルに、対応する実装ファイルの内容をコピーします。

### 4.4 ルートの実装

1. 蔵書管理ルートを作成します：

```bash
touch ~/library_system/routes/bookRoutes.js
```

2. 利用者管理ルートを作成します：

```bash
touch ~/library_system/routes/userRoutes.js
```

3. 貸出・返却ルートを作成します：

```bash
touch ~/library_system/routes/lendingRoutes.js
```

4. 認証ルートを作成します：

```bash
touch ~/library_system/routes/authRoutes.js
```

5. 各ルートファイルに、対応するコントローラーを使用するコードを追加します。

### 4.5 ビューの実装

1. 各ビューファイルを作成します（例：`views/staff/book_management.ejs`）。

2. 各ビューファイルに、対応するモックアップのHTMLコードをコピーし、EJSテンプレート形式に変換します。

### 4.6 フロントエンドJavaScriptの実装

1. 各機能のJavaScriptファイルを作成します（例：`public/js/book_management.js`）。

2. 各JavaScriptファイルに、対応する実装ファイルの内容をコピーします。

## 5. アプリケーションの起動

1. 開発モードでアプリケーションを起動します：

```bash
cd ~/library_system
npm run dev
```

または、package.jsonに以下のスクリプトを追加してから実行します：

```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

2. ブラウザで`http://localhost:3000`にアクセスして、アプリケーションが起動していることを確認します。

## 6. 動作確認手順

### 6.1 スタッフ機能の動作確認

#### 6.1.1 ログイン機能

1. ブラウザで`http://localhost:3000/staff/login`にアクセスします。
2. 以下の認証情報を使用してログインします：
   - ユーザー名：admin
   - パスワード：password
3. ダッシュボードにリダイレクトされることを確認します。

#### 6.1.2 蔵書管理機能

1. ダッシュボードから「蔵書管理」メニューをクリックします。
2. 蔵書管理画面が表示されることを確認します。
3. 「新規登録」ボタンをクリックして、蔵書登録画面に移動します。
4. 以下の情報を入力して蔵書を登録します：
   - ISBN：9784123456789
   - タイトル：プログラミング入門
   - 著者：山田太郎
   - 出版社：技術書出版
   - 出版年：2023
   - 分類：コンピュータ
   - バーコード：B00001
5. 「登録」ボタンをクリックして、蔵書が登録されることを確認します。
6. 蔵書管理画面に戻り、検索機能を使って登録した蔵書を検索します。
7. 検索結果に登録した蔵書が表示されることを確認します。

#### 6.1.3 利用者管理機能

1. ダッシュボードから「利用者管理」メニューをクリックします。
2. 利用者管理画面が表示されることを確認します。
3. 「新規登録」ボタンをクリックして、利用者登録画面に移動します。
4. 以下の情報を入力して利用者を登録します：
   - 氏名：佐藤花子
   - メールアドレス：hanako@example.com
   - 電話番号：090-1234-5678
   - 住所：東京都千代田区1-1-1
   - 生年月日：1990-01-01
   - 利用者区分：一般
5. 「登録」ボタンをクリックして、利用者が登録されることを確認します。
6. 利用者管理画面に戻り、検索機能を使って登録した利用者を検索します。
7. 検索結果に登録した利用者が表示されることを確認します。

#### 6.1.4 貸出・返却機能

1. ダッシュボードから「貸出・返却」メニューをクリックします。
2. 貸出・返却画面が表示されることを確認します。
3. 貸出タブで、以下の手順で貸出処理を行います：
   - 利用者ID：登録した利用者のID
   - 蔵書ID：登録した蔵書のID
   - 返却予定日：2週間後の日付
4. 「貸出処理」ボタンをクリックして、貸出が完了することを確認します。
5. 返却タブに切り替えて、以下の手順で返却処理を行います：
   - 蔵書ID：貸し出した蔵書のID
   - 返却状態：良好
6. 「返却処理」ボタンをクリックして、返却が完了することを確認します。

### 6.2 利用者機能の動作確認

#### 6.2.1 ログイン機能

1. ブラウザで`http://localhost:3000/user/login`にアクセスします。
2. 以下の認証情報を使用してログインします：
   - ユーザー名：登録した利用者のメールアドレス
   - パスワード：登録時に設定したパスワード
3. ホーム画面にリダイレクトされることを確認します。

#### 6.2.2 蔵書検索機能

1. ホーム画面から「蔵書検索」メニューをクリックします。
2. 蔵書検索画面が表示されることを確認します。
3. 検索条件を入力して検索ボタンをクリックします。
4. 検索結果に登録した蔵書が表示されることを確認します。
5. 蔵書のタイトルをクリックして、蔵書詳細画面に移動します。
6. 蔵書の詳細情報が表示されることを確認します。

#### 6.2.3 貸出状況確認機能

1. ホーム画面から「貸出状況」メニューをクリックします。
2. 貸出状況画面が表示されることを確認します。
3. 現在の貸出、予約、貸出履歴が表示されることを確認します。

## 7. トラブルシューティング

### 7.1 データベース接続エラー

1. PostgreSQLサービスが起動していることを確認します：

```bash
sudo service postgresql status
```

2. データベース接続情報が正しいことを確認します：

```bash
psql -U library_admin -d library_management -c "SELECT 1"
```

### 7.2 アプリケーション起動エラー

1. 必要なパッケージがすべてインストールされていることを確認します：

```bash
npm install
```

2. ポート3000が他のアプリケーションで使用されていないことを確認します：

```bash
lsof -i :3000
```

3. 使用されている場合は、`.env`ファイルで別のポートを指定します。

### 7.3 機能エラー

1. ブラウザのコンソールでエラーメッセージを確認します。
2. サーバーのログでエラーメッセージを確認します。
3. データベースのテーブルが正しく作成されていることを確認します：

```bash
psql -U library_admin -d library_management -c "\dt"
```

## 8. バックアップと復元

### 8.1 データベースのバックアップ

```bash
pg_dump -U library_admin -d library_management > backup.sql
```

### 8.2 データベースの復元

```bash
psql -U library_admin -d library_management < backup.sql
```

## 9. まとめ

本文書では、図書館管理システムのセットアップ方法と動作確認手順について説明しました。環境構築からアプリケーションの起動、各機能のテスト方法までを詳細に記載しています。

問題が発生した場合は、トラブルシューティングセクションを参照してください。それでも解決しない場合は、開発者にお問い合わせください。

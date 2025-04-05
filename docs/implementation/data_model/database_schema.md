# 図書館管理システム データベーススキーマ定義

## 1. テーブル定義

### 1.1 books（蔵書）テーブル

```sql
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    biblio_id INTEGER NOT NULL,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT '利用可能',
    location VARCHAR(100),
    acquisition_date DATE,
    price INTEGER,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (biblio_id) REFERENCES bibliographic_info(biblio_id)
);

COMMENT ON TABLE books IS '図書館の個別蔵書情報';
COMMENT ON COLUMN books.book_id IS '蔵書ID（主キー）';
COMMENT ON COLUMN books.biblio_id IS '書誌情報ID（外部キー）';
COMMENT ON COLUMN books.barcode IS 'バーコード番号（一意）';
COMMENT ON COLUMN books.status IS '蔵書状態（利用可能、貸出中、修理中、紛失など）';
COMMENT ON COLUMN books.location IS '配置場所';
COMMENT ON COLUMN books.acquisition_date IS '受入日';
COMMENT ON COLUMN books.price IS '購入価格';
COMMENT ON COLUMN books.notes IS '備考';
```

### 1.2 bibliographic_info（書誌情報）テーブル

```sql
CREATE TABLE bibliographic_info (
    biblio_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    isbn VARCHAR(20),
    publisher VARCHAR(100),
    publication_year INTEGER,
    language VARCHAR(50) DEFAULT '日本語',
    page_count INTEGER,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE bibliographic_info IS '書籍の書誌情報';
COMMENT ON COLUMN bibliographic_info.biblio_id IS '書誌情報ID（主キー）';
COMMENT ON COLUMN bibliographic_info.title IS '書籍タイトル';
COMMENT ON COLUMN bibliographic_info.subtitle IS 'サブタイトル';
COMMENT ON COLUMN bibliographic_info.isbn IS 'ISBN番号';
COMMENT ON COLUMN bibliographic_info.publisher IS '出版社';
COMMENT ON COLUMN bibliographic_info.publication_year IS '出版年';
COMMENT ON COLUMN bibliographic_info.language IS '言語';
COMMENT ON COLUMN bibliographic_info.page_count IS 'ページ数';
COMMENT ON COLUMN bibliographic_info.description IS '内容説明';
```

### 1.3 authors（著者）テーブル

```sql
CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    biography TEXT,
    birth_year INTEGER,
    death_year INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE authors IS '著者情報';
COMMENT ON COLUMN authors.author_id IS '著者ID（主キー）';
COMMENT ON COLUMN authors.name IS '著者名';
COMMENT ON COLUMN authors.biography IS '経歴';
COMMENT ON COLUMN authors.birth_year IS '生年';
COMMENT ON COLUMN authors.death_year IS '没年';
```

### 1.4 book_authors（書籍著者関連）テーブル

```sql
CREATE TABLE book_authors (
    id SERIAL PRIMARY KEY,
    biblio_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT '著者',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (biblio_id) REFERENCES bibliographic_info(biblio_id),
    FOREIGN KEY (author_id) REFERENCES authors(author_id),
    UNIQUE (biblio_id, author_id, role)
);

COMMENT ON TABLE book_authors IS '書籍と著者の関連';
COMMENT ON COLUMN book_authors.id IS 'ID（主キー）';
COMMENT ON COLUMN book_authors.biblio_id IS '書誌情報ID（外部キー）';
COMMENT ON COLUMN book_authors.author_id IS '著者ID（外部キー）';
COMMENT ON COLUMN book_authors.role IS '役割（著者、編集者、翻訳者など）';
```

### 1.5 categories（分類）テーブル

```sql
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(category_id)
);

COMMENT ON TABLE categories IS '書籍分類カテゴリ';
COMMENT ON COLUMN categories.category_id IS '分類ID（主キー）';
COMMENT ON COLUMN categories.name IS '分類名';
COMMENT ON COLUMN categories.parent_id IS '親分類ID（自己参照）';
COMMENT ON COLUMN categories.description IS '説明';
```

### 1.6 book_categories（書籍分類関連）テーブル

```sql
CREATE TABLE book_categories (
    id SERIAL PRIMARY KEY,
    biblio_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (biblio_id) REFERENCES bibliographic_info(biblio_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    UNIQUE (biblio_id, category_id)
);

COMMENT ON TABLE book_categories IS '書籍と分類の関連';
COMMENT ON COLUMN book_categories.id IS 'ID（主キー）';
COMMENT ON COLUMN book_categories.biblio_id IS '書誌情報ID（外部キー）';
COMMENT ON COLUMN book_categories.category_id IS '分類ID（外部キー）';
```

### 1.7 users（利用者）テーブル

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    birth_date DATE,
    user_type VARCHAR(20) NOT NULL DEFAULT '一般',
    status VARCHAR(20) NOT NULL DEFAULT '有効',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS '図書館利用者情報';
COMMENT ON COLUMN users.user_id IS '利用者ID（主キー）';
COMMENT ON COLUMN users.name IS '氏名';
COMMENT ON COLUMN users.email IS 'メールアドレス（一意）';
COMMENT ON COLUMN users.password IS 'パスワード（ハッシュ化）';
COMMENT ON COLUMN users.address IS '住所';
COMMENT ON COLUMN users.phone IS '電話番号';
COMMENT ON COLUMN users.birth_date IS '生年月日';
COMMENT ON COLUMN users.user_type IS '利用者区分（一般、学生、教職員など）';
COMMENT ON COLUMN users.status IS '状態（有効、停止、退会など）';
```

### 1.8 staff（スタッフ）テーブル

```sql
CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT '一般スタッフ',
    status VARCHAR(20) NOT NULL DEFAULT '有効',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE staff IS '図書館スタッフ情報';
COMMENT ON COLUMN staff.staff_id IS 'スタッフID（主キー）';
COMMENT ON COLUMN staff.name IS '氏名';
COMMENT ON COLUMN staff.email IS 'メールアドレス（一意）';
COMMENT ON COLUMN staff.password IS 'パスワード（ハッシュ化）';
COMMENT ON COLUMN staff.role IS '役割（管理者、一般スタッフなど）';
COMMENT ON COLUMN staff.status IS '状態（有効、停止など）';
```

### 1.9 lendings（貸出）テーブル

```sql
CREATE TABLE lendings (
    lending_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    checkout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT '貸出中',
    renewals_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

COMMENT ON TABLE lendings IS '貸出情報';
COMMENT ON COLUMN lendings.lending_id IS '貸出ID（主キー）';
COMMENT ON COLUMN lendings.book_id IS '蔵書ID（外部キー）';
COMMENT ON COLUMN lendings.user_id IS '利用者ID（外部キー）';
COMMENT ON COLUMN lendings.checkout_date IS '貸出日';
COMMENT ON COLUMN lendings.due_date IS '返却予定日';
COMMENT ON COLUMN lendings.return_date IS '実際の返却日';
COMMENT ON COLUMN lendings.status IS '状態（貸出中、返却済、延滞など）';
COMMENT ON COLUMN lendings.renewals_count IS '延長回数';
```

### 1.10 reservations（予約）テーブル

```sql
CREATE TABLE reservations (
    reservation_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT '予約中',
    notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
    expiration_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

COMMENT ON TABLE reservations IS '予約情報';
COMMENT ON COLUMN reservations.reservation_id IS '予約ID（主キー）';
COMMENT ON COLUMN reservations.book_id IS '蔵書ID（外部キー）';
COMMENT ON COLUMN reservations.user_id IS '利用者ID（外部キー）';
COMMENT ON COLUMN reservations.reservation_date IS '予約日';
COMMENT ON COLUMN reservations.status IS '状態（予約中、取置中、キャンセル、完了など）';
COMMENT ON COLUMN reservations.notification_sent IS '通知送信済みフラグ';
COMMENT ON COLUMN reservations.expiration_date IS '予約有効期限';
```

## 2. インデックス定義

```sql
-- books テーブルのインデックス
CREATE INDEX idx_books_biblio_id ON books(biblio_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_barcode ON books(barcode);

-- bibliographic_info テーブルのインデックス
CREATE INDEX idx_bibliographic_info_title ON bibliographic_info(title);
CREATE INDEX idx_bibliographic_info_isbn ON bibliographic_info(isbn);

-- authors テーブルのインデックス
CREATE INDEX idx_authors_name ON authors(name);

-- users テーブルのインデックス
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- lendings テーブルのインデックス
CREATE INDEX idx_lendings_book_id ON lendings(book_id);
CREATE INDEX idx_lendings_user_id ON lendings(user_id);
CREATE INDEX idx_lendings_status ON lendings(status);
CREATE INDEX idx_lendings_due_date ON lendings(due_date);

-- reservations テーブルのインデックス
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_status ON reservations(status);
```

## 3. 初期データ

### 3.1 分類（categories）初期データ

```sql
INSERT INTO categories (name, parent_id, description) VALUES
('文学', NULL, '文学作品全般'),
('小説', 1, '小説作品'),
('詩歌', 1, '詩や短歌、俳句など'),
('エッセイ', 1, 'エッセイ、随筆'),
('自然科学', NULL, '自然科学全般'),
('物理学', 5, '物理学関連'),
('化学', 5, '化学関連'),
('生物学', 5, '生物学関連'),
('社会科学', NULL, '社会科学全般'),
('経済学', 9, '経済学関連'),
('社会学', 9, '社会学関連'),
('歴史', NULL, '歴史全般'),
('日本史', 12, '日本の歴史'),
('世界史', 12, '世界の歴史'),
('芸術', NULL, '芸術全般'),
('音楽', 15, '音楽関連'),
('美術', 15, '美術関連'),
('コンピュータ', NULL, 'コンピュータ全般'),
('プログラミング', 18, 'プログラミング関連'),
('データベース', 18, 'データベース関連'),
('ネットワーク', 18, 'ネットワーク関連');
```

### 3.2 スタッフ（staff）初期データ

```sql
-- パスワードはハッシュ化して保存する必要があります
INSERT INTO staff (name, email, password, role) VALUES
('管理者', 'admin@library.example.com', '$2a$10$XxPXMQv.7Y5jUzQvzL7QoeSlQcqQ/pu2c/j7XGVB.JKSHknNkJKHK', '管理者'),
('田中 一郎', 'tanaka@library.example.com', '$2a$10$XxPXMQv.7Y5jUzQvzL7QoeSlQcqQ/pu2c/j7XGVB.JKSHknNkJKHK', '一般スタッフ'),
('佐藤 花子', 'sato@library.example.com', '$2a$10$XxPXMQv.7Y5jUzQvzL7QoeSlQcqQ/pu2c/j7XGVB.JKSHknNkJKHK', '一般スタッフ');
```

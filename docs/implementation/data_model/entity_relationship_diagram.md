# 図書館管理システム エンティティ関連図

## 1. エンティティ関連図

```
+---------------+       +------------------+       +---------------+
|    books      |       | bibliographic_info|       |   authors    |
+---------------+       +------------------+       +---------------+
| PK: book_id   |<----->| PK: biblio_id    |<----->| PK: author_id |
| biblio_id     |       | title            |       | name          |
| barcode       |       | subtitle         |       | biography     |
| status        |       | isbn             |       | birth_year    |
| location      |       | publisher        |       | death_year    |
| acquisition_date|     | publication_year |       +---------------+
| price         |       | language         |
| notes         |       | page_count       |
+---------------+       | description      |
                        +------------------+
                                ^
                                |
                        +------------------+
                        | book_authors     |
                        +------------------+
                        | PK: id           |
                        | biblio_id        |
                        | author_id        |
                        | role             |
                        +------------------+

+---------------+       +------------------+       +---------------+
|  categories   |       | book_categories  |       |    users      |
+---------------+       +------------------+       +---------------+
| PK: category_id|<---->| PK: id           |       | PK: user_id   |
| name          |       | biblio_id        |       | name          |
| parent_id     |       | category_id      |       | email         |
| description   |       +------------------+       | password      |
+---------------+                                  | address       |
                                                  | phone         |
                                                  | birth_date    |
                                                  | user_type     |
                                                  | status        |
                                                  | created_at    |
                                                  +---------------+
                                                         ^
                                                         |
+---------------+       +------------------+       +---------------+
|   lendings    |       |   reservations   |       |     staff     |
+---------------+       +------------------+       +---------------+
| PK: lending_id|       | PK: reservation_id|      | PK: staff_id  |
| book_id       |       | book_id          |       | name          |
| user_id       |       | user_id          |       | email         |
| checkout_date |       | reservation_date |       | password      |
| due_date      |       | status           |       | role          |
| return_date   |       | notification_sent|       | status        |
| status        |       | expiration_date  |       | created_at    |
| renewals_count|       +------------------+       +---------------+
+---------------+
```

## 2. エンティティ説明

### 2.1 蔵書関連エンティティ

1. **books（蔵書）**
   - 図書館が所有する個々の物理的な資料を表す
   - 各蔵書は一つの書誌情報に紐づく
   - 同じ書籍の複数の複本は、異なるbook_idを持つが同じbiblio_idを持つ

2. **bibliographic_info（書誌情報）**
   - 書籍のタイトル、ISBN、出版社などの書誌的な情報を表す
   - 複数の蔵書が同じ書誌情報を参照できる

3. **authors（著者）**
   - 書籍の著者に関する情報を表す

4. **book_authors（書籍著者関連）**
   - 書誌情報と著者の多対多の関連を表す
   - 役割（著者、編集者、翻訳者など）を指定できる

5. **categories（分類）**
   - 書籍の分類カテゴリを表す
   - 階層構造を持つことができる（parent_id）

6. **book_categories（書籍分類関連）**
   - 書誌情報と分類の多対多の関連を表す

### 2.2 利用者関連エンティティ

1. **users（利用者）**
   - 図書館の利用者情報を表す
   - user_typeにより一般、学生、教職員などの区分を指定

2. **staff（スタッフ）**
   - 図書館スタッフの情報を表す
   - roleにより管理者、一般スタッフなどの役割を指定

### 2.3 貸出・予約関連エンティティ

1. **lendings（貸出）**
   - 蔵書の貸出情報を表す
   - 貸出日、返却予定日、実際の返却日などを記録

2. **reservations（予約）**
   - 蔵書の予約情報を表す
   - 予約日、状態（予約中、取置中など）を記録

## 3. 主要な関連性

1. **蔵書と書誌情報**：1対多（1つの書誌情報に対して複数の蔵書が存在可能）
2. **書誌情報と著者**：多対多（book_authorsテーブルを介して関連）
3. **書誌情報と分類**：多対多（book_categoriesテーブルを介して関連）
4. **蔵書と貸出**：1対多（1つの蔵書に対して複数の貸出履歴が存在）
5. **利用者と貸出**：1対多（1人の利用者が複数の貸出を行う）
6. **蔵書と予約**：1対多（1つの蔵書に対して複数の予約が存在可能）
7. **利用者と予約**：1対多（1人の利用者が複数の予約を行う）

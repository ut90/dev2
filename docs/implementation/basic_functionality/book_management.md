# 蔵書管理機能実装

## 1. 概要

蔵書管理機能は、図書館の蔵書を登録、検索、更新、削除するための機能を提供します。STEP1では、蔵書登録と蔵書検索の基本機能を実装します。

## 2. 蔵書登録機能

### 2.1 機能概要

新しい蔵書を図書館システムに登録する機能です。書誌情報と蔵書情報を入力し、システムに登録します。

### 2.2 処理フロー

```
1. スタッフが蔵書登録画面を開く
2. 書誌情報（タイトル、著者、ISBN等）を入力
3. 蔵書情報（バーコード、配置場所等）を入力
4. 登録ボタンをクリック
5. システムが入力内容を検証
6. 書誌情報が既存のものと一致する場合は既存の書誌情報を使用
7. 書誌情報が新規の場合は新しい書誌情報を作成
8. 蔵書情報を登録
9. 登録完了メッセージを表示
```

### 2.3 実装コード

#### 2.3.1 蔵書登録フォーム（HTML）

```html
<!-- book_registration.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>蔵書登録 - 図書館管理システム</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="#">図書館管理システム</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="dashboard.html">ダッシュボード</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="book_management.html">蔵書管理</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="user_management.html">利用者管理</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="lending.html">貸出・返却</a>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                            ユーザー名
                        </a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#">プロフィール</a></li>
                            <li><a class="dropdown-item" href="#">ログアウト</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <h2>蔵書登録</h2>
        <form id="bookRegistrationForm">
            <div class="card mb-4">
                <div class="card-header">
                    書誌情報
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="isbn" class="form-label">ISBN</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="isbn" name="isbn" required>
                                <button class="btn btn-outline-secondary" type="button" id="isbnLookupBtn">検索</button>
                            </div>
                            <div class="form-text">ISBNを入力して検索ボタンをクリックすると、外部データベースから情報を取得できます</div>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="title" class="form-label">タイトル</label>
                            <input type="text" class="form-control" id="title" name="title" required>
                        </div>
                        <div class="col-md-6">
                            <label for="subtitle" class="form-label">サブタイトル</label>
                            <input type="text" class="form-control" id="subtitle" name="subtitle">
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="author" class="form-label">著者</label>
                            <input type="text" class="form-control" id="author" name="author" required>
                        </div>
                        <div class="col-md-6">
                            <label for="publisher" class="form-label">出版社</label>
                            <input type="text" class="form-control" id="publisher" name="publisher">
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label for="publicationYear" class="form-label">出版年</label>
                            <input type="number" class="form-control" id="publicationYear" name="publicationYear">
                        </div>
                        <div class="col-md-4">
                            <label for="language" class="form-label">言語</label>
                            <select class="form-select" id="language" name="language">
                                <option value="日本語" selected>日本語</option>
                                <option value="英語">英語</option>
                                <option value="中国語">中国語</option>
                                <option value="韓国語">韓国語</option>
                                <option value="その他">その他</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="pageCount" class="form-label">ページ数</label>
                            <input type="number" class="form-control" id="pageCount" name="pageCount">
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="category" class="form-label">分類</label>
                            <select class="form-select" id="category" name="category">
                                <option value="" selected>選択してください</option>
                                <option value="1">文学</option>
                                <option value="5">自然科学</option>
                                <option value="9">社会科学</option>
                                <option value="12">歴史</option>
                                <option value="15">芸術</option>
                                <option value="18">コンピュータ</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="subcategory" class="form-label">サブカテゴリ</label>
                            <select class="form-select" id="subcategory" name="subcategory" disabled>
                                <option value="" selected>選択してください</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="description" class="form-label">概要</label>
                        <textarea class="form-control" id="description" name="description" rows="3"></textarea>
                    </div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-header">
                    蔵書情報
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="barcode" class="form-label">バーコード</label>
                            <input type="text" class="form-control" id="barcode" name="barcode" required>
                            <div class="form-text">未入力の場合、自動生成されます</div>
                        </div>
                        <div class="col-md-6">
                            <label for="location" class="form-label">配置場所</label>
                            <input type="text" class="form-control" id="location" name="location">
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="acquisitionDate" class="form-label">受入日</label>
                            <input type="date" class="form-control" id="acquisitionDate" name="acquisitionDate" value="">
                        </div>
                        <div class="col-md-6">
                            <label for="price" class="form-label">価格</label>
                            <div class="input-group">
                                <input type="number" class="form-control" id="price" name="price">
                                <span class="input-group-text">円</span>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="notes" class="form-label">備考</label>
                        <textarea class="form-control" id="notes" name="notes" rows="2"></textarea>
                    </div>
                </div>
            </div>

            <div class="d-flex justify-content-between">
                <a href="book_management.html" class="btn btn-secondary">キャンセル</a>
                <button type="submit" class="btn btn-primary">登録</button>
            </div>
        </form>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/book_registration.js"></script>
</body>
</html>
```

# 利用者管理機能実装

## 1. 概要

利用者管理機能は、図書館の利用者情報を登録、検索、更新、削除するための機能を提供します。STEP1では、利用者登録と利用者検索の基本機能を実装します。

## 2. 利用者登録機能

### 2.1 機能概要

新しい利用者を図書館システムに登録する機能です。利用者の基本情報を入力し、システムに登録します。

### 2.2 処理フロー

```
1. スタッフが利用者登録画面を開く
2. 利用者情報（氏名、メールアドレス、住所等）を入力
3. 登録ボタンをクリック
4. システムが入力内容を検証
5. 利用者情報を登録
6. 登録完了メッセージを表示
```

### 2.3 実装コード

#### 2.3.1 利用者登録フォーム（HTML）

```html
<!-- user_registration.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>利用者登録 - 図書館管理システム</title>
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
                        <a class="nav-link" href="book_management.html">蔵書管理</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="user_management.html">利用者管理</a>
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
        <h2>利用者登録</h2>
        <form id="userRegistrationForm">
            <div class="card mb-4">
                <div class="card-header">
                    基本情報
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="name" class="form-label">氏名</label>
                            <input type="text" class="form-control" id="name" name="name" required>
                        </div>
                        <div class="col-md-6">
                            <label for="email" class="form-label">メールアドレス</label>
                            <input type="email" class="form-control" id="email" name="email" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="phone" class="form-label">電話番号</label>
                            <input type="tel" class="form-control" id="phone" name="phone">
                        </div>
                        <div class="col-md-6">
                            <label for="birthDate" class="form-label">生年月日</label>
                            <input type="date" class="form-control" id="birthDate" name="birthDate">
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <label for="address" class="form-label">住所</label>
                            <textarea class="form-control" id="address" name="address" rows="2"></textarea>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="userType" class="form-label">利用者区分</label>
                            <select class="form-select" id="userType" name="userType" required>
                                <option value="" selected>選択してください</option>
                                <option value="一般">一般</option>
                                <option value="学生">学生</option>
                                <option value="教職員">教職員</option>
                                <option value="シニア">シニア</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="status" class="form-label">状態</label>
                            <select class="form-select" id="status" name="status" required>
                                <option value="有効" selected>有効</option>
                                <option value="停止">停止</option>
                                <option value="退会">退会</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-header">
                    アカウント情報
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="password" class="form-label">パスワード</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                            <div class="form-text">8文字以上で、英字・数字を含めてください</div>
                        </div>
                        <div class="col-md-6">
                            <label for="confirmPassword" class="form-label">パスワード（確認）</label>
                            <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="notes" class="form-label">備考</label>
                        <textarea class="form-control" id="notes" name="notes" rows="2"></textarea>
                    </div>
                </div>
            </div>

            <div class="d-flex justify-content-between">
                <a href="user_management.html" class="btn btn-secondary">キャンセル</a>
                <button type="submit" class="btn btn-primary">登録</button>
            </div>
        </form>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/user_registration.js"></script>
</body>
</html>
```

#### 2.3.2 利用者登録処理（JavaScript）

```javascript
// user_registration.js
document.addEventListener('DOMContentLoaded', function() {
    const userRegistrationForm = document.getElementById('userRegistrationForm');
    
    // フォーム送信時のイベントリスナー
    userRegistrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            registerUser();
        }
    });
    
    // フォームバリデーション
    function validateForm() {
        // 必須項目のチェック
        const requiredFields = ['name', 'email', 'userType', 'password', 'confirmPassword'];
        for (const field of requiredFields) {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                alert(`${input.labels[0].textContent}は必須項目です`);
                input.focus();
                return false;
            }
        }
        
        // メールアドレスの形式チェック
        const email = document.getElementById('email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('有効なメールアドレスを入力してください');
            document.getElementById('email').focus();
            return false;
        }
        
        // パスワードの強度チェック
        const password = document.getElementById('password').value;
        if (password.length < 8) {
            alert('パスワードは8文字以上で入力してください');
            document.getElementById('password').focus();
            return false;
        }
        
        // 英字と数字を含むかチェック
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (!hasLetter || !hasNumber) {
            alert('パスワードは英字と数字を含める必要があります');
            document.getElementById('password').focus();
            return false;
        }
        
        // パスワード確認
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
            alert('パスワードと確認用パスワードが一致しません');
            document.getElementById('confirmPassword').focus();
            return false;
        }
        
        return true;
    }
    
    // 利用者登録処理
    function registerUser() {
        // フォームデータの収集
        const formData = new FormData(userRegistrationForm);
        const userData = Object.fromEntries(formData.entries());
        
        // 確認用パスワードは送信データから削除
        delete userData.confirmPassword;
        
        // APIリクエスト（実際の実装ではサーバーに送信）
        console.log('登録データ:', userData);
        
        // モック実装（成功したと仮定）
        alert('利用者が正常に登録されました');
        window.location.href = 'user_management.html';
    }
});
```

## 3. 利用者検索機能

### 3.1 機能概要

利用者を様々な条件（氏名、メールアドレス、利用者区分等）で検索する機能です。検索結果から詳細情報の閲覧や編集が可能です。

### 3.2 処理フロー

```
1. スタッフが利用者管理画面を開く
2. 検索条件（氏名、メールアドレス、利用者区分等）を入力
3. 検索ボタンをクリック
4. システムが条件に合致する利用者を検索
5. 検索結果を一覧表示
6. 詳細ボタンをクリックすると利用者の詳細情報を表示
```

### 3.3 実装コード

#### 3.3.1 利用者管理画面（HTML）

```html
<!-- user_management.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>利用者管理 - 図書館管理システム</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
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
                        <a class="nav-link" href="book_management.html">蔵書管理</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="user_management.html">利用者管理</a>
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
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>利用者管理</h2>
            <div>
                <a href="user_registration.html" class="btn btn-primary me-2">
                    <i class="bi bi-plus-circle"></i> 新規登録
                </a>
                <button class="btn btn-outline-secondary me-2">
                    <i class="bi bi-upload"></i> 一括登録
                </button>
                <button class="btn btn-outline-secondary">
                    <i class="bi bi-download"></i> エクスポート
                </button>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                検索条件
            </div>
            <div class="card-body">
                <form id="searchForm">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label for="searchUserId" class="form-label">利用者ID</label>
                            <input type="text" class="form-control" id="searchUserId" name="userId">
                        </div>
                        <div class="col-md-4">
                            <label for="searchName" class="form-label">氏名</label>
                            <input type="text" class="form-control" id="searchName" name="name">
                        </div>
                        <div class="col-md-4">
                            <label for="searchEmail" class="form-label">メールアドレス</label>
                            <input type="email" class="form-control" id="searchEmail" name="email">
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label for="searchUserType" class="form-label">利用者区分</label>
                            <select class="form-select" id="searchUserType" name="userType">
                                <option value="" selected>すべて</option>
                                <option value="一般">一般</option>
                                <option value="学生">学生</option>
                                <option value="教職員">教職員</option>
                                <option value="シニア">シニア</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="searchStatus" class="form-label">状態</label>
                            <select class="form-select" id="searchStatus" name="status">
                                <option value="" selected>すべて</option>
                                <option value="有効">有効</option>
                                <option value="停止">停止</option>
                                <option value="退会">退会</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="searchPhone" class="form-label">電話番号</label>
                            <input type="tel" class="form-control" id="searchPhone" name="phone">
                        </div>
                    </div>
                    <div class="d-flex justify-content-end">
                        <button type="button" class="btn btn-outline-secondary me-2" id="clearButton">
                            条件クリア
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-search"></i> 検索
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>検索結果 <span id="resultCount">0</span>件</span>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="sortDropdown" data-bs-toggle="dropdown">
                        並び替え
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="sortDropdown">
                        <li><a class="dropdown-item" href="#" data-sort="name">氏名</a></li>
                        <li><a class="dropdown-item" href="#" data-sort="userType">利用者区分</a></li>
                        <li><a class="dropdown-item" href="#" data-sort="status">状態</a></li>
                        <li><a class="dropdown-item" href="#" data-sort="created_at">登録日</a></li>
                    </ul>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>氏名</th>
                                <th>区分</th>
                                <th>貸出数</th>
                                <th>状態</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="searchResults">
                            <!-- 検索結果がここに表示されます -->
                        </tbody>
                    </table>
                </div>
                <div id="noResults" class="text-center py-4 d-none">
                    <p class="text-muted">検索条件に一致する利用者が見つかりませんでした。</p>
                </div>
                <div id="pagination" class="d-flex justify-content-center mt-3">
                    <!-- ページネーションがここに表示されます -->
                </div>
            </div>
        </div>
    </div>

    <!-- 利用者詳細モーダル -->
    <div class="modal fade" id="userDetailModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">利用者詳細</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>基本情報</h6>
                            <table class="table table-sm">
                                <tr>
                                    <th>利用者ID</th>
                                    <td id="detailUserId"></td>
                                </tr>
                                <tr>
                                    <th>氏名</th>
                                    <td id="detailName"></td>
                                </tr>
                                <tr>
                                    <th>メールアドレス</th>
                                    <td id="detailEmail"></td>
                                </tr>
                                <tr>
                                    <th>電話番号</th>
                                    <td id="detailPhone"></td>
                                </tr>
                                <tr>
                                    <th>生年月日</th>
                                    <td id="detailBirthDate"></td>
                                </tr>
                                <tr>
                                    <th>住所</th>
                                    <td id="detailAddress"></td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6>アカウント情報</h6>
                            <table class="table table-sm">
                                <tr>
                                    <th>利用者区分</th>
                                    <td id="detailUserType"></td>
                                </tr>
                                <tr>
                                    <th>状態</th>
                                    <td id="detailStatus"></td>
                                </tr>
                                <tr>
                                    <th>登録日</th>
                                    <td id="detailCreatedAt"></td>
                                </tr>
                                <tr>
                                    <th>最終更新日</th>
                                    <td id="detailUpdatedAt"></td>
                                </tr>
                                <tr>
                                    <th>備考</th>
                                    <td id="detailNotes"></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-12">
                            <h6>貸出状況</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>蔵書ID</th>
                                            <th>タイトル</th>
                                            <th>貸出日</th>
                                            <th>返却予定日</th>
                                            <th>状態</th>
                                        </tr>
                                    </thead>
                                    <tbody id="detailLendingStatus">
                                        <!-- 貸出状況がここに表示されます -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                    <a href="#" id="editUserBtn" class="btn btn-primary">編集</a>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/user_management.js"></script>
</body>
</html>
```

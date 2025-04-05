# 蔵書登録機能 JavaScript 実装

## 1. 蔵書登録処理（JavaScript クライアントサイド）

```javascript
// book_registration.js
document.addEventListener('DOMContentLoaded', function() {
    const bookRegistrationForm = document.getElementById('bookRegistrationForm');
    const isbnLookupBtn = document.getElementById('isbnLookupBtn');
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    
    // 現在の日付をデフォルト値として設定
    document.getElementById('acquisitionDate').valueAsDate = new Date();
    
    // ISBNルックアップボタンのイベントリスナー
    isbnLookupBtn.addEventListener('click', function() {
        const isbn = document.getElementById('isbn').value.trim();
        if (isbn) {
            lookupBookByISBN(isbn);
        } else {
            alert('ISBNを入力してください');
        }
    });
    
    // カテゴリ選択時のイベントリスナー
    categorySelect.addEventListener('change', function() {
        updateSubcategories(this.value);
    });
    
    // フォーム送信時のイベントリスナー
    bookRegistrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            registerBook();
        }
    });
    
    // ISBNによる書籍情報検索
    function lookupBookByISBN(isbn) {
        // 実際の実装では外部APIを呼び出す
        // ここではモック実装
        console.log(`ISBNで検索: ${isbn}`);
        
        // モックデータ（実際の実装では削除）
        if (isbn === '9784123456789') {
            document.getElementById('title').value = 'プログラミング入門';
            document.getElementById('subtitle').value = 'JavaScript編';
            document.getElementById('author').value = '山田太郎';
            document.getElementById('publisher').value = '技術書出版';
            document.getElementById('publicationYear').value = '2023';
            document.getElementById('pageCount').value = '320';
            document.getElementById('description').value = 'JavaScriptプログラミングの基礎から応用までを解説した入門書です。';
            document.getElementById('category').value = '18'; // コンピュータ
            updateSubcategories('18');
            document.getElementById('subcategory').value = '19'; // プログラミング
        } else {
            alert('書籍情報が見つかりませんでした');
        }
    }
    
    // サブカテゴリの更新
    function updateSubcategories(categoryId) {
        subcategorySelect.innerHTML = '<option value="" selected>選択してください</option>';
        subcategorySelect.disabled = !categoryId;
        
        if (!categoryId) return;
        
        // カテゴリに応じたサブカテゴリをセット
        const subcategories = getSubcategories(categoryId);
        subcategories.forEach(subcat => {
            const option = document.createElement('option');
            option.value = subcat.id;
            option.textContent = subcat.name;
            subcategorySelect.appendChild(option);
        });
    }
    
    // サブカテゴリデータの取得（モック）
    function getSubcategories(categoryId) {
        const subcategoriesMap = {
            '1': [ // 文学
                {id: '2', name: '小説'},
                {id: '3', name: '詩歌'},
                {id: '4', name: 'エッセイ'}
            ],
            '5': [ // 自然科学
                {id: '6', name: '物理学'},
                {id: '7', name: '化学'},
                {id: '8', name: '生物学'}
            ],
            '9': [ // 社会科学
                {id: '10', name: '経済学'},
                {id: '11', name: '社会学'}
            ],
            '12': [ // 歴史
                {id: '13', name: '日本史'},
                {id: '14', name: '世界史'}
            ],
            '15': [ // 芸術
                {id: '16', name: '音楽'},
                {id: '17', name: '美術'}
            ],
            '18': [ // コンピュータ
                {id: '19', name: 'プログラミング'},
                {id: '20', name: 'データベース'},
                {id: '21', name: 'ネットワーク'}
            ]
        };
        
        return subcategoriesMap[categoryId] || [];
    }
    
    // フォームバリデーション
    function validateForm() {
        // 必須項目のチェック
        const requiredFields = ['title', 'author', 'barcode'];
        for (const field of requiredFields) {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                alert(`${input.labels[0].textContent}は必須項目です`);
                input.focus();
                return false;
            }
        }
        return true;
    }
    
    // 蔵書登録処理
    function registerBook() {
        // フォームデータの収集
        const formData = new FormData(bookRegistrationForm);
        const bookData = Object.fromEntries(formData.entries());
        
        // APIリクエスト（実際の実装ではサーバーに送信）
        console.log('登録データ:', bookData);
        
        // モック実装（成功したと仮定）
        alert('蔵書が正常に登録されました');
        window.location.href = 'book_management.html';
    }
});
```

## 2. 蔵書登録処理（Node.js/Express サーバーサイド）

```javascript
// bookController.js
const db = require('../models/db');

// 蔵書登録処理
exports.registerBook = async (req, res) => {
    try {
        const {
            // 書誌情報
            isbn, title, subtitle, author, publisher, publicationYear,
            language, pageCount, category, subcategory, description,
            // 蔵書情報
            barcode, location, acquisitionDate, price, notes
        } = req.body;

        // トランザクション開始
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. 著者の確認/登録
            let authorId;
            const authorResult = await client.query(
                'SELECT author_id FROM authors WHERE name = $1',
                [author]
            );
            
            if (authorResult.rows.length > 0) {
                authorId = authorResult.rows[0].author_id;
            } else {
                const newAuthorResult = await client.query(
                    'INSERT INTO authors (name) VALUES ($1) RETURNING author_id',
                    [author]
                );
                authorId = newAuthorResult.rows[0].author_id;
            }

            // 2. 書誌情報の確認/登録
            let biblioId;
            if (isbn) {
                const biblioResult = await client.query(
                    'SELECT biblio_id FROM bibliographic_info WHERE isbn = $1',
                    [isbn]
                );
                
                if (biblioResult.rows.length > 0) {
                    biblioId = biblioResult.rows[0].biblio_id;
                    
                    // 既存の書誌情報を更新
                    await client.query(
                        `UPDATE bibliographic_info 
                         SET title = $1, subtitle = $2, publisher = $3, 
                             publication_year = $4, language = $5, 
                             page_count = $6, description = $7, 
                             updated_at = CURRENT_TIMESTAMP
                         WHERE biblio_id = $8`,
                        [title, subtitle, publisher, publicationYear, 
                         language, pageCount, description, biblioId]
                    );
                } else {
                    // 新規書誌情報の登録
                    const newBiblioResult = await client.query(
                        `INSERT INTO bibliographic_info 
                         (title, subtitle, isbn, publisher, publication_year, 
                          language, page_count, description)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                         RETURNING biblio_id`,
                        [title, subtitle, isbn, publisher, publicationYear, 
                         language, pageCount, description]
                    );
                    biblioId = newBiblioResult.rows[0].biblio_id;
                }
            } else {
                // ISBNなしの新規書誌情報登録
                const newBiblioResult = await client.query(
                    `INSERT INTO bibliographic_info 
                     (title, subtitle, publisher, publication_year, 
                      language, page_count, description)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING biblio_id`,
                    [title, subtitle, publisher, publicationYear, 
                     language, pageCount, description]
                );
                biblioId = newBiblioResult.rows[0].biblio_id;
            }

            // 3. 著者と書誌情報の関連付け
            await client.query(
                `INSERT INTO book_authors (biblio_id, author_id, role)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (biblio_id, author_id, role) DO NOTHING`,
                [biblioId, authorId, '著者']
            );

            // 4. カテゴリと書誌情報の関連付け
            if (category) {
                await client.query(
                    `INSERT INTO book_categories (biblio_id, category_id)
                     VALUES ($1, $2)
                     ON CONFLICT (biblio_id, category_id) DO NOTHING`,
                    [biblioId, category]
                );
            }
            
            if (subcategory) {
                await client.query(
                    `INSERT INTO book_categories (biblio_id, category_id)
                     VALUES ($1, $2)
                     ON CONFLICT (biblio_id, category_id) DO NOTHING`,
                    [biblioId, subcategory]
                );
            }

            // 5. 蔵書情報の登録
            // バーコードが未指定の場合は自動生成
            const finalBarcode = barcode || `B${Date.now()}`;
            
            const bookResult = await client.query(
                `INSERT INTO books 
                 (biblio_id, barcode, status, location, acquisition_date, price, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING book_id`,
                [biblioId, finalBarcode, '利用可能', location, 
                 acquisitionDate || new Date(), price, notes]
            );
            
            const bookId = bookResult.rows[0].book_id;

            // トランザクションコミット
            await client.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: '蔵書が正常に登録されました',
                data: { bookId, biblioId, barcode: finalBarcode }
            });
        } catch (error) {
            // トランザクションロールバック
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('蔵書登録エラー:', error);
        res.status(500).json({
            success: false,
            message: '蔵書の登録に失敗しました',
            error: error.message
        });
    }
};
```

## 3. APIルート設定（Node.js/Express）

```javascript
// bookRoutes.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// 蔵書登録
router.post('/books', bookController.registerBook);

// その他のルート（検索、詳細取得、更新、削除など）は後で追加

module.exports = router;
```

## 4. データベース接続設定（Node.js/Express）

```javascript
// db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'library_management',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

module.exports = {
    pool,
    query: (text, params) => pool.query(text, params),
};
```

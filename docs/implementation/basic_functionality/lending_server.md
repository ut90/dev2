# 貸出・返却機能 サーバーサイド実装

## 1. 貸出・返却処理（Node.js/Express サーバーサイド）

```javascript
// lendingController.js
const db = require('../models/db');

// 貸出処理
exports.checkoutBook = async (req, res) => {
    try {
        const { userId, bookId, dueDate } = req.body;

        // トランザクション開始
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            // 蔵書の存在と状態の確認
            const bookResult = await client.query(
                'SELECT status FROM books WHERE book_id = $1',
                [bookId]
            );
            
            if (bookResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '指定された蔵書が見つかりません'
                });
            }
            
            if (bookResult.rows[0].status !== '利用可能') {
                return res.status(400).json({
                    success: false,
                    message: `この蔵書は現在 ${bookResult.rows[0].status} 状態のため、貸出できません`
                });
            }
            
            // 利用者の存在と状態の確認
            const userResult = await client.query(
                'SELECT status FROM users WHERE user_id = $1',
                [userId]
            );
            
            if (userResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '指定された利用者が見つかりません'
                });
            }
            
            if (userResult.rows[0].status !== '有効') {
                return res.status(400).json({
                    success: false,
                    message: `この利用者は現在 ${userResult.rows[0].status} 状態のため、貸出できません`
                });
            }
            
            // 利用者の貸出数と上限の確認
            const lendingCountResult = await client.query(
                'SELECT COUNT(*) AS count FROM lendings WHERE user_id = $1 AND return_date IS NULL',
                [userId]
            );
            
            const userTypeResult = await client.query(
                'SELECT user_type FROM users WHERE user_id = $1',
                [userId]
            );
            
            const userType = userTypeResult.rows[0].user_type;
            let lendingLimit = 5; // デフォルト値
            
            // 利用者区分に応じた貸出上限の設定
            switch (userType) {
                case '一般':
                    lendingLimit = 5;
                    break;
                case '学生':
                    lendingLimit = 3;
                    break;
                case '教職員':
                    lendingLimit = 10;
                    break;
                case 'シニア':
                    lendingLimit = 7;
                    break;
            }
            
            const currentLendingCount = parseInt(lendingCountResult.rows[0].count);
            
            if (currentLendingCount >= lendingLimit) {
                return res.status(400).json({
                    success: false,
                    message: `貸出上限数（${lendingLimit}冊）に達しているため、これ以上貸出できません`
                });
            }
            
            // 貸出情報の登録
            const lendingResult = await client.query(
                `INSERT INTO lendings 
                 (book_id, user_id, checkout_date, due_date, status)
                 VALUES ($1, $2, CURRENT_DATE, $3, '貸出中')
                 RETURNING lending_id`,
                [bookId, userId, dueDate]
            );
            
            const lendingId = lendingResult.rows[0].lending_id;
            
            // 蔵書の状態を更新
            await client.query(
                "UPDATE books SET status = '貸出中' WHERE book_id = $1",
                [bookId]
            );
            
            // 書誌情報の取得（レスポンス用）
            const bookInfoResult = await client.query(
                `SELECT b.book_id, b.barcode, bi.title, bi.subtitle, 
                        string_agg(a.name, ', ') AS author
                 FROM books b
                 JOIN bibliographic_info bi ON b.biblio_id = bi.biblio_id
                 LEFT JOIN book_authors ba ON bi.biblio_id = ba.biblio_id
                 LEFT JOIN authors a ON ba.author_id = a.author_id
                 WHERE b.book_id = $1
                 GROUP BY b.book_id, b.barcode, bi.title, bi.subtitle`,
                [bookId]
            );
            
            // 利用者情報の取得（レスポンス用）
            const userInfoResult = await client.query(
                'SELECT name FROM users WHERE user_id = $1',
                [userId]
            );
            
            // トランザクションコミット
            await client.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: '貸出処理が完了しました',
                data: {
                    lending_id: lendingId,
                    book: bookInfoResult.rows[0],
                    user: userInfoResult.rows[0],
                    checkout_date: new Date().toISOString().split('T')[0],
                    due_date: dueDate
                }
            });
        } catch (error) {
            // トランザクションロールバック
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('貸出処理エラー:', error);
        res.status(500).json({
            success: false,
            message: '貸出処理に失敗しました',
            error: error.message
        });
    }
};

// 返却処理
exports.returnBook = async (req, res) => {
    try {
        const { bookId, condition, notes } = req.body;

        // トランザクション開始
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            // 貸出情報の確認
            const lendingResult = await client.query(
                `SELECT l.lending_id, l.user_id, l.checkout_date, l.due_date,
                        u.name AS user_name
                 FROM lendings l
                 JOIN users u ON l.user_id = u.user_id
                 WHERE l.book_id = $1 AND l.return_date IS NULL
                 ORDER BY l.checkout_date DESC
                 LIMIT 1`,
                [bookId]
            );
            
            if (lendingResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'この蔵書の貸出記録が見つかりません'
                });
            }
            
            const lending = lendingResult.rows[0];
            
            // 返却情報の更新
            await client.query(
                `UPDATE lendings 
                 SET return_date = CURRENT_DATE, 
                     status = '返却済', 
                     return_condition = $1,
                     notes = $2
                 WHERE lending_id = $3`,
                [condition, notes, lending.lending_id]
            );
            
            // 蔵書の状態を更新
            let bookStatus = '利用可能';
            
            // 返却状態に応じた蔵書状態の設定
            switch (condition) {
                case '良好':
                case '軽度の損傷':
                    bookStatus = '利用可能';
                    break;
                case '重度の損傷':
                    bookStatus = '修理中';
                    break;
                case '紛失':
                    bookStatus = '紛失';
                    break;
            }
            
            await client.query(
                'UPDATE books SET status = $1 WHERE book_id = $2',
                [bookStatus, bookId]
            );
            
            // 書誌情報の取得（レスポンス用）
            const bookInfoResult = await client.query(
                `SELECT b.book_id, b.barcode, bi.title, bi.subtitle, 
                        string_agg(a.name, ', ') AS author
                 FROM books b
                 JOIN bibliographic_info bi ON b.biblio_id = bi.biblio_id
                 LEFT JOIN book_authors ba ON bi.biblio_id = ba.biblio_id
                 LEFT JOIN authors a ON ba.author_id = a.author_id
                 WHERE b.book_id = $1
                 GROUP BY b.book_id, b.barcode, bi.title, bi.subtitle`,
                [bookId]
            );
            
            // トランザクションコミット
            await client.query('COMMIT');
            
            res.status(200).json({
                success: true,
                message: '返却処理が完了しました',
                data: {
                    book: bookInfoResult.rows[0],
                    user: {
                        user_id: lending.user_id,
                        name: lending.user_name
                    },
                    checkout_date: lending.checkout_date,
                    due_date: lending.due_date,
                    return_date: new Date().toISOString().split('T')[0],
                    condition: condition,
                    book_status: bookStatus
                }
            });
        } catch (error) {
            // トランザクションロールバック
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('返却処理エラー:', error);
        res.status(500).json({
            success: false,
            message: '返却処理に失敗しました',
            error: error.message
        });
    }
};

// 貸出情報取得処理
exports.getLendingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // 利用者の貸出情報を取得
        const lendingsResult = await db.query(
            `SELECT l.lending_id, l.book_id, l.checkout_date, l.due_date, l.status,
                    b.barcode, bi.title, bi.subtitle, 
                    string_agg(a.name, ', ') AS author
             FROM lendings l
             JOIN books b ON l.book_id = b.book_id
             JOIN bibliographic_info bi ON b.biblio_id = bi.biblio_id
             LEFT JOIN book_authors ba ON bi.biblio_id = ba.biblio_id
             LEFT JOIN authors a ON ba.author_id = a.author_id
             WHERE l.user_id = $1 AND l.return_date IS NULL
             GROUP BY l.lending_id, l.book_id, l.checkout_date, l.due_date, l.status,
                      b.barcode, bi.title, bi.subtitle
             ORDER BY l.checkout_date DESC`,
            [userId]
        );
        
        res.status(200).json({
            success: true,
            data: lendingsResult.rows
        });
    } catch (error) {
        console.error('貸出情報取得エラー:', error);
        res.status(500).json({
            success: false,
            message: '貸出情報の取得に失敗しました',
            error: error.message
        });
    }
};

// 貸出履歴取得処理
exports.getLendingHistoryByBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        
        // 蔵書の貸出履歴を取得
        const historyResult = await db.query(
            `SELECT l.lending_id, l.user_id, u.name AS user_name,
                    l.checkout_date, l.due_date, l.return_date, l.status,
                    l.return_condition, l.notes
             FROM lendings l
             JOIN users u ON l.user_id = u.user_id
             WHERE l.book_id = $1
             ORDER BY l.checkout_date DESC`,
            [bookId]
        );
        
        res.status(200).json({
            success: true,
            data: historyResult.rows
        });
    } catch (error) {
        console.error('貸出履歴取得エラー:', error);
        res.status(500).json({
            success: false,
            message: '貸出履歴の取得に失敗しました',
            error: error.message
        });
    }
};

// 貸出取消処理
exports.cancelCheckout = async (req, res) => {
    try {
        const { lendingId } = req.params;

        // トランザクション開始
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            // 貸出情報の確認
            const lendingResult = await client.query(
                'SELECT book_id FROM lendings WHERE lending_id = $1',
                [lendingId]
            );
            
            if (lendingResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '指定された貸出情報が見つかりません'
                });
            }
            
            const bookId = lendingResult.rows[0].book_id;
            
            // 貸出情報の削除
            await client.query(
                'DELETE FROM lendings WHERE lending_id = $1',
                [lendingId]
            );
            
            // 蔵書の状態を更新
            await client.query(
                "UPDATE books SET status = '利用可能' WHERE book_id = $1",
                [bookId]
            );
            
            // トランザクションコミット
            await client.query('COMMIT');
            
            res.status(200).json({
                success: true,
                message: '貸出取消処理が完了しました'
            });
        } catch (error) {
            // トランザクションロールバック
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('貸出取消エラー:', error);
        res.status(500).json({
            success: false,
            message: '貸出取消処理に失敗しました',
            error: error.message
        });
    }
};

// APIルート設定
// lendingRoutes.js
const express = require('express');
const router = express.Router();
const lendingController = require('../controllers/lendingController');

// 貸出処理
router.post('/lendings/checkout', lendingController.checkoutBook);

// 返却処理
router.post('/lendings/return', lendingController.returnBook);

// 利用者の貸出情報取得
router.get('/lendings/user/:userId', lendingController.getLendingsByUser);

// 蔵書の貸出履歴取得
router.get('/lendings/book/:bookId', lendingController.getLendingHistoryByBook);

// 貸出取消処理
router.delete('/lendings/:lendingId', lendingController.cancelCheckout);

module.exports = router;
```

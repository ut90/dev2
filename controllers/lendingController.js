const db = require('../models/db');

exports.getAllLendings = async (req, res) => {
    try {
        const { page = 1, userId, bookId, status } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;

        let query = `
            SELECT l.lending_id, l.user_id, l.book_id, l.checkout_date, l.due_date, l.return_date,
                   u.name as user_name, u.email as user_email,
                   b.book_id, bi.title, bi.isbn, a.name as author
            FROM lendings l
            JOIN users u ON l.user_id = u.user_id
            JOIN books b ON l.book_id = b.book_id
            JOIN bibliographic_info bi ON b.biblio_id = bi.biblio_id
            LEFT JOIN book_authors ba ON bi.biblio_id = ba.biblio_id
            LEFT JOIN authors a ON ba.author_id = a.author_id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (userId) {
            query += ` AND l.user_id = $${paramIndex++}`;
            params.push(userId);
        }

        if (bookId) {
            query += ` AND l.book_id = $${paramIndex++}`;
            params.push(bookId);
        }

        if (status === '貸出中') {
            query += ` AND l.return_date IS NULL`;
        } else if (status === '返却済み') {
            query += ` AND l.return_date IS NOT NULL`;
        }

        const countQuery = query.replace('SELECT l.lending_id, l.user_id, l.book_id, l.checkout_date, l.due_date, l.return_date, u.name as user_name, u.email as user_email, b.book_id, bi.title, bi.isbn, a.name as author', 'SELECT COUNT(*)');
        const countResult = await db.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);

        query += ` ORDER BY l.checkout_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        res.status(200).json({
            lendings: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount
            }
        });
    } catch (error) {
        console.error('貸出一覧取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.getLendingById = async (req, res) => {
    try {
        const lendingId = req.params.id;

        const query = `
            SELECT l.lending_id, l.user_id, l.book_id, l.checkout_date, l.due_date, l.return_date,
                   u.name as user_name, u.email as user_email,
                   b.book_id, bi.title, bi.isbn, a.name as author
            FROM lendings l
            JOIN users u ON l.user_id = u.user_id
            JOIN books b ON l.book_id = b.book_id
            JOIN bibliographic_info bi ON b.biblio_id = bi.biblio_id
            LEFT JOIN book_authors ba ON bi.biblio_id = ba.biblio_id
            LEFT JOIN authors a ON ba.author_id = a.author_id
            WHERE l.lending_id = $1
        `;

        const result = await db.query(query, [lendingId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '貸出情報が見つかりません' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('貸出情報取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.createLending = async (req, res) => {
    try {
        const { userId, bookId, dueDate } = req.body;

        const userResult = await db.query(
            'SELECT * FROM users WHERE user_id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: '利用者が見つかりません' });
        }

        const user = userResult.rows[0];

        if (user.status !== '有効') {
            return res.status(400).json({ message: 'この利用者は現在、貸出が許可されていません' });
        }

        const bookResult = await db.query(
            'SELECT * FROM books WHERE book_id = $1',
            [bookId]
        );

        if (bookResult.rows.length === 0) {
            return res.status(404).json({ message: '蔵書が見つかりません' });
        }

        const book = bookResult.rows[0];

        if (book.status !== '利用可能') {
            return res.status(400).json({ message: 'この蔵書は現在、貸出できません' });
        }

        const lendingCheckResult = await db.query(
            'SELECT * FROM lendings WHERE book_id = $1 AND return_date IS NULL',
            [bookId]
        );

        if (lendingCheckResult.rows.length > 0) {
            return res.status(400).json({ message: 'この蔵書は既に貸出中です' });
        }

        await db.query('BEGIN');

        const lendingDate = new Date();
        const dueDateObj = dueDate ? new Date(dueDate) : new Date(lendingDate);

        if (!dueDate) {
            dueDateObj.setDate(dueDateObj.getDate() + 14);
        }

        const lendingResult = await db.query(
            `INSERT INTO lendings (user_id, book_id, checkout_date, due_date)
            VALUES ($1, $2, $3, $4) RETURNING lending_id`,
            [userId, bookId, lendingDate, dueDateObj]
        );

        await db.query(
            `UPDATE books SET status = '貸出中', updated_at = CURRENT_TIMESTAMP WHERE book_id = $1`,
            [bookId]
        );

        await db.query('COMMIT');

        res.status(201).json({
            message: '貸出処理が完了しました',
            lendingId: lendingResult.rows[0].lending_id
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('貸出処理エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.returnBook = async (req, res) => {
    try {
        const { lendingId } = req.params;

        const lendingResult = await db.query(
            'SELECT * FROM lendings WHERE lending_id = $1',
            [lendingId]
        );

        if (lendingResult.rows.length === 0) {
            return res.status(404).json({ message: '貸出情報が見つかりません' });
        }

        const lending = lendingResult.rows[0];

        if (lending.return_date) {
            return res.status(400).json({ message: 'この蔵書は既に返却されています' });
        }

        await db.query('BEGIN');

        const returnDate = new Date();

        await db.query(
            `UPDATE lendings SET return_date = $1 WHERE lending_id = $2`,
            [returnDate, lendingId]
        );

        await db.query(
            `UPDATE books SET status = '利用可能', updated_at = CURRENT_TIMESTAMP WHERE book_id = $1`,
            [lending.book_id]
        );

        await db.query('COMMIT');

        res.status(200).json({ message: '返却処理が完了しました' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('返却処理エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.getOverdueBooks = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const query = `
            SELECT l.lending_id, l.user_id, l.book_id, l.checkout_date, l.due_date,
                   u.name as user_name, u.email as user_email,
                   b.book_id, bi.title, bi.isbn, a.name as author,
                   EXTRACT(DAY FROM (CURRENT_DATE - l.due_date)) as days_overdue
            FROM lendings l
            JOIN users u ON l.user_id = u.user_id
            JOIN books b ON l.book_id = b.book_id
            JOIN bibliographic_info bi ON b.biblio_id = bi.biblio_id
            LEFT JOIN book_authors ba ON bi.biblio_id = ba.biblio_id
            LEFT JOIN authors a ON ba.author_id = a.author_id
            WHERE l.return_date IS NULL AND l.due_date < CURRENT_DATE
            ORDER BY l.due_date ASC
            LIMIT $1 OFFSET $2
        `;

        const countQuery = `
            SELECT COUNT(*)
            FROM lendings l
            WHERE l.return_date IS NULL AND l.due_date < CURRENT_DATE
        `;

        const countResult = await db.query(countQuery);
        const totalCount = parseInt(countResult.rows[0].count);

        const result = await db.query(query, [limit, offset]);

        res.status(200).json({
            overdueBooks: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount
            }
        });
    } catch (error) {
        console.error('延滞図書取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.getUserLendingHistory = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { page = 1 } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;

        const userResult = await db.query(
            'SELECT * FROM users WHERE user_id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: '利用者が見つかりません' });
        }

        const query = `
            SELECT l.lending_id, l.book_id, l.checkout_date, l.due_date, l.return_date,
                   b.book_id, bi.title, bi.isbn, a.name as author,
                   CASE
                       WHEN l.return_date IS NULL AND l.due_date < CURRENT_DATE THEN '延滞中'
                       WHEN l.return_date IS NULL THEN '貸出中'
                       ELSE '返却済み'
                   END as status
            FROM lendings l
            JOIN books b ON l.book_id = b.book_id
            JOIN bibliographic_info bi ON b.biblio_id = bi.biblio_id
            LEFT JOIN book_authors ba ON bi.biblio_id = ba.biblio_id
            LEFT JOIN authors a ON ba.author_id = a.author_id
            WHERE l.user_id = $1
            ORDER BY l.checkout_date DESC
            LIMIT $2 OFFSET $3
        `;

        const countQuery = `
            SELECT COUNT(*)
            FROM lendings
            WHERE user_id = $1
        `;

        const countResult = await db.query(countQuery, [userId]);
        const totalCount = parseInt(countResult.rows[0].count);

        const result = await db.query(query, [userId, limit, offset]);

        res.status(200).json({
            lendingHistory: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount
            }
        });
    } catch (error) {
        console.error('貸出履歴取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

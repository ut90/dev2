const db = require('../models/db');

exports.getAllBooks = async (req, res) => {
    try {
        const { page = 1, isbn, title, author, category } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM books WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        if (isbn) {
            query += ` AND isbn LIKE $${paramIndex++}`;
            params.push(`%${isbn}%`);
        }
        
        if (title) {
            query += ` AND title LIKE $${paramIndex++}`;
            params.push(`%${title}%`);
        }
        
        if (author) {
            query += ` AND author LIKE $${paramIndex++}`;
            params.push(`%${author}%`);
        }
        
        if (category) {
            query += ` AND category = $${paramIndex++}`;
            params.push(category);
        }
        
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
        const countResult = await db.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);
        
        query += ` ORDER BY book_id LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);
        
        const result = await db.query(query, params);
        
        res.status(200).json({
            books: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount
            }
        });
    } catch (error) {
        console.error('蔵書一覧取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const bookId = req.params.id;
        
        const result = await db.query(
            'SELECT * FROM books WHERE book_id = $1',
            [bookId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: '蔵書が見つかりません' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('蔵書情報取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.createBook = async (req, res) => {
    try {
        const { isbn, title, author, publisher, publishDate, category, description, location, status } = req.body;
        
        const checkResult = await db.query(
            'SELECT * FROM books WHERE isbn = $1',
            [isbn]
        );
        
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'この ISBN は既に登録されています' });
        }
        
        const result = await db.query(
            `INSERT INTO books (isbn, title, author, publisher, publish_date, category, description, location, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING book_id`,
            [isbn, title, author, publisher, publishDate, category, description, location, status || '利用可能']
        );
        
        res.status(201).json({
            message: '蔵書を登録しました',
            bookId: result.rows[0].book_id
        });
    } catch (error) {
        console.error('蔵書登録エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const { isbn, title, author, publisher, publishDate, category, description, location, status } = req.body;
        
        const checkResult = await db.query(
            'SELECT * FROM books WHERE book_id = $1',
            [bookId]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: '蔵書が見つかりません' });
        }
        
        const isbnCheckResult = await db.query(
            'SELECT * FROM books WHERE isbn = $1 AND book_id != $2',
            [isbn, bookId]
        );
        
        if (isbnCheckResult.rows.length > 0) {
            return res.status(400).json({ message: 'この ISBN は既に登録されています' });
        }
        
        await db.query(
            `UPDATE books
            SET isbn = $1, title = $2, author = $3, publisher = $4, publish_date = $5, 
            category = $6, description = $7, location = $8, status = $9, updated_at = CURRENT_TIMESTAMP
            WHERE book_id = $10`,
            [isbn, title, author, publisher, publishDate, category, description, location, status, bookId]
        );
        
        res.status(200).json({ message: '蔵書情報を更新しました' });
    } catch (error) {
        console.error('蔵書情報更新エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        
        const checkResult = await db.query(
            'SELECT * FROM books WHERE book_id = $1',
            [bookId]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: '蔵書が見つかりません' });
        }
        
        const lendingCheckResult = await db.query(
            'SELECT * FROM lendings WHERE book_id = $1 AND returned_at IS NULL',
            [bookId]
        );
        
        if (lendingCheckResult.rows.length > 0) {
            return res.status(400).json({ message: 'この蔵書は貸出中のため削除できません' });
        }
        
        await db.query(
            'DELETE FROM books WHERE book_id = $1',
            [bookId]
        );
        
        res.status(200).json({ message: '蔵書を削除しました' });
    } catch (error) {
        console.error('蔵書削除エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT DISTINCT category FROM books ORDER BY category'
        );
        
        const categories = result.rows.map(row => row.category);
        
        res.status(200).json(categories);
    } catch (error) {
        console.error('カテゴリ一覧取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

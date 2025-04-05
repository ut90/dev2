const db = require('../models/db');

exports.getAllBooks = async (req, res) => {
    try {
        const { page = 1, isbn, title, author, category } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT b.book_id, bi.isbn, bi.title, a.name as author, bi.publisher, 
                   bi.publication_year, c.name as category, b.status, b.location
            FROM books b
            JOIN bibliographic_info bi ON b.biblio_id = bi.biblio_id
            LEFT JOIN book_authors ba ON bi.biblio_id = ba.biblio_id
            LEFT JOIN authors a ON ba.author_id = a.author_id
            LEFT JOIN book_categories bc ON bi.biblio_id = bc.biblio_id
            LEFT JOIN categories c ON bc.category_id = c.category_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (isbn) {
            query += ` AND bi.isbn LIKE $${paramIndex++}`;
            params.push(`%${isbn}%`);
        }
        
        if (title) {
            query += ` AND bi.title LIKE $${paramIndex++}`;
            params.push(`%${title}%`);
        }
        
        if (author) {
            query += ` AND a.name LIKE $${paramIndex++}`;
            params.push(`%${author}%`);
        }
        
        if (category) {
            query += ` AND c.name = $${paramIndex++}`;
            params.push(category);
        }
        
        const countQuery = `
            SELECT COUNT(DISTINCT b.book_id) 
            FROM books b
            JOIN bibliographic_info bi ON b.biblio_id = bi.biblio_id
            LEFT JOIN book_authors ba ON bi.biblio_id = ba.biblio_id
            LEFT JOIN authors a ON ba.author_id = a.author_id
            LEFT JOIN book_categories bc ON bi.biblio_id = bc.biblio_id
            LEFT JOIN categories c ON bc.category_id = c.category_id
            WHERE 1=1
        ` + query.substring(query.indexOf('WHERE 1=1') + 9);
        
        const countResult = await db.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);
        
        query += ` GROUP BY b.book_id, bi.isbn, bi.title, a.name, bi.publisher, 
                  bi.publication_year, c.name, b.status, b.location
                  ORDER BY b.book_id LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
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
        
        const query = `
            SELECT b.book_id, bi.biblio_id, bi.isbn, bi.title, a.name as author, bi.publisher, 
                   bi.publication_year, c.name as category, bi.description, 
                   b.status, b.location, b.acquisition_date, b.price, b.notes
            FROM books b
            JOIN bibliographic_info bi ON b.biblio_id = bi.biblio_id
            LEFT JOIN book_authors ba ON bi.biblio_id = ba.biblio_id
            LEFT JOIN authors a ON ba.author_id = a.author_id
            LEFT JOIN book_categories bc ON bi.biblio_id = bc.biblio_id
            LEFT JOIN categories c ON bc.category_id = c.category_id
            WHERE b.book_id = $1
        `;
        
        const result = await db.query(query, [bookId]);
        
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
        
        await db.query('BEGIN');
        
        let authorId;
        const authorResult = await db.query(
            'SELECT author_id FROM authors WHERE name = $1',
            [author]
        );
        
        if (authorResult.rows.length > 0) {
            authorId = authorResult.rows[0].author_id;
        } else {
            const newAuthorResult = await db.query(
                'INSERT INTO authors (name) VALUES ($1) RETURNING author_id',
                [author]
            );
            authorId = newAuthorResult.rows[0].author_id;
        }
        
        let categoryId;
        const categoryResult = await db.query(
            'SELECT category_id FROM categories WHERE name = $1',
            [category]
        );
        
        if (categoryResult.rows.length > 0) {
            categoryId = categoryResult.rows[0].category_id;
        } else {
            const otherCategoryResult = await db.query(
                'SELECT category_id FROM categories WHERE name = $1',
                ['その他']
            );
            
            if (otherCategoryResult.rows.length > 0) {
                categoryId = otherCategoryResult.rows[0].category_id;
            } else {
                const newCategoryResult = await db.query(
                    'INSERT INTO categories (name) VALUES ($1) RETURNING category_id',
                    ['その他']
                );
                categoryId = newCategoryResult.rows[0].category_id;
            }
        }
        
        let biblioId;
        const biblioResult = await db.query(
            'SELECT biblio_id FROM bibliographic_info WHERE isbn = $1',
            [isbn]
        );
        
        if (biblioResult.rows.length > 0) {
            biblioId = biblioResult.rows[0].biblio_id;
        } else {
            const publicationYear = publishDate ? new Date(publishDate).getFullYear() : null;
            
            const newBiblioResult = await db.query(
                `INSERT INTO bibliographic_info (title, isbn, publisher, publication_year, description)
                VALUES ($1, $2, $3, $4, $5) RETURNING biblio_id`,
                [title, isbn, publisher, publicationYear, description]
            );
            
            biblioId = newBiblioResult.rows[0].biblio_id;
            
            await db.query(
                'INSERT INTO book_authors (biblio_id, author_id) VALUES ($1, $2)',
                [biblioId, authorId]
            );
            
            await db.query(
                'INSERT INTO book_categories (biblio_id, category_id) VALUES ($1, $2)',
                [biblioId, categoryId]
            );
        }
        
        const acquisitionDate = publishDate ? new Date(publishDate) : new Date();
        
        const bookResult = await db.query(
            `INSERT INTO books (biblio_id, status, location, acquisition_date)
            VALUES ($1, $2, $3, $4) RETURNING book_id`,
            [biblioId, status || '利用可能', location, acquisitionDate]
        );
        
        await db.query('COMMIT');
        
        res.status(201).json({
            message: '蔵書を登録しました',
            bookId: bookResult.rows[0].book_id
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('蔵書登録エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const { isbn, title, author, publisher, publishDate, category, description, location, status } = req.body;
        
        const bookCheck = await db.query(
            'SELECT biblio_id FROM books WHERE book_id = $1',
            [bookId]
        );
        
        if (bookCheck.rows.length === 0) {
            return res.status(404).json({ message: '蔵書が見つかりません' });
        }
        
        const biblioId = bookCheck.rows[0].biblio_id;
        
        await db.query('BEGIN');
        
        const publicationYear = publishDate ? new Date(publishDate).getFullYear() : null;
        
        await db.query(
            `UPDATE bibliographic_info
            SET title = $1, isbn = $2, publisher = $3, publication_year = $4, description = $5, updated_at = CURRENT_TIMESTAMP
            WHERE biblio_id = $6`,
            [title, isbn, publisher, publicationYear, description, biblioId]
        );
        
        let authorId;
        const authorResult = await db.query(
            'SELECT author_id FROM authors WHERE name = $1',
            [author]
        );
        
        if (authorResult.rows.length > 0) {
            authorId = authorResult.rows[0].author_id;
        } else {
            const newAuthorResult = await db.query(
                'INSERT INTO authors (name) VALUES ($1) RETURNING author_id',
                [author]
            );
            authorId = newAuthorResult.rows[0].author_id;
        }
        
        await db.query(
            'DELETE FROM book_authors WHERE biblio_id = $1',
            [biblioId]
        );
        
        await db.query(
            'INSERT INTO book_authors (biblio_id, author_id) VALUES ($1, $2)',
            [biblioId, authorId]
        );
        
        let categoryId;
        const categoryResult = await db.query(
            'SELECT category_id FROM categories WHERE name = $1',
            [category]
        );
        
        if (categoryResult.rows.length > 0) {
            categoryId = categoryResult.rows[0].category_id;
        } else {
            const otherCategoryResult = await db.query(
                'SELECT category_id FROM categories WHERE name = $1',
                ['その他']
            );
            
            if (otherCategoryResult.rows.length > 0) {
                categoryId = otherCategoryResult.rows[0].category_id;
            } else {
                const newCategoryResult = await db.query(
                    'INSERT INTO categories (name) VALUES ($1) RETURNING category_id',
                    ['その他']
                );
                categoryId = newCategoryResult.rows[0].category_id;
            }
        }
        
        await db.query(
            'DELETE FROM book_categories WHERE biblio_id = $1',
            [biblioId]
        );
        
        await db.query(
            'INSERT INTO book_categories (biblio_id, category_id) VALUES ($1, $2)',
            [biblioId, categoryId]
        );
        
        await db.query(
            `UPDATE books
            SET status = $1, location = $2, updated_at = CURRENT_TIMESTAMP
            WHERE book_id = $3`,
            [status, location, bookId]
        );
        
        await db.query('COMMIT');
        
        res.status(200).json({ message: '蔵書情報を更新しました' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('蔵書情報更新エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        
        const bookCheck = await db.query(
            'SELECT * FROM books WHERE book_id = $1',
            [bookId]
        );
        
        if (bookCheck.rows.length === 0) {
            return res.status(404).json({ message: '蔵書が見つかりません' });
        }
        
        const lendingCheck = await db.query(
            'SELECT * FROM lendings WHERE book_id = $1 AND return_date IS NULL',
            [bookId]
        );
        
        if (lendingCheck.rows.length > 0) {
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
            'SELECT name FROM categories ORDER BY name'
        );
        
        const categories = result.rows.map(row => row.name);
        
        res.status(200).json(categories);
    } catch (error) {
        console.error('カテゴリ一覧取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

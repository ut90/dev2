const bcrypt = require('bcrypt');
const db = require('../models/db');

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, id, name, email } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM users WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        if (id) {
            query += ` AND user_id = $${paramIndex++}`;
            params.push(id);
        }
        
        if (name) {
            query += ` AND name LIKE $${paramIndex++}`;
            params.push(`%${name}%`);
        }
        
        if (email) {
            query += ` AND email LIKE $${paramIndex++}`;
            params.push(`%${email}%`);
        }
        
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
        const countResult = await db.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);
        
        query += ` ORDER BY user_id LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);
        
        const result = await db.query(query, params);
        
        res.status(200).json({
            users: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount
            }
        });
    } catch (error) {
        console.error('利用者一覧取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const result = await db.query(
            'SELECT * FROM users WHERE user_id = $1',
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: '利用者が見つかりません' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('利用者情報取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, phone, address, birthdate, memberType, password } = req.body;
        
        const checkResult = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            `INSERT INTO users (name, email, phone, address, birth_date, user_type, password, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING user_id`,
            [name, email, phone, address, birthdate, memberType, hashedPassword, '有効']
        );
        
        res.status(201).json({
            message: '利用者を登録しました',
            userId: result.rows[0].user_id
        });
    } catch (error) {
        console.error('利用者登録エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, phone, address, birthdate, memberType, status } = req.body;
        
        const checkResult = await db.query(
            'SELECT * FROM users WHERE user_id = $1',
            [userId]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: '利用者が見つかりません' });
        }
        
        const emailCheckResult = await db.query(
            'SELECT * FROM users WHERE email = $1 AND user_id != $2',
            [email, userId]
        );
        
        if (emailCheckResult.rows.length > 0) {
            return res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
        }
        
        await db.query(
            `UPDATE users
            SET name = $1, email = $2, phone = $3, address = $4, birth_date = $5, user_type = $6, status = $7, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $8`,
            [name, email, phone, address, birthdate, memberType, status, userId]
        );
        
        res.status(200).json({ message: '利用者情報を更新しました' });
    } catch (error) {
        console.error('利用者情報更新エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const checkResult = await db.query(
            'SELECT * FROM users WHERE user_id = $1',
            [userId]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: '利用者が見つかりません' });
        }
        
        const lendingCheckResult = await db.query(
            'SELECT * FROM lendings WHERE user_id = $1 AND returned_at IS NULL',
            [userId]
        );
        
        if (lendingCheckResult.rows.length > 0) {
            return res.status(400).json({ message: 'この利用者は貸出中の本があるため削除できません' });
        }
        
        await db.query(
            'DELETE FROM users WHERE user_id = $1',
            [userId]
        );
        
        res.status(200).json({ message: '利用者を削除しました' });
    } catch (error) {
        console.error('利用者削除エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;
        
        const result = await db.query(
            'SELECT * FROM users WHERE user_id = $1',
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: '利用者が見つかりません' });
        }
        
        const user = result.rows[0];
        
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: '現在のパスワードが正しくありません' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
            [hashedPassword, userId]
        );
        
        res.status(200).json({ message: 'パスワードを変更しました' });
    } catch (error) {
        console.error('パスワード変更エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

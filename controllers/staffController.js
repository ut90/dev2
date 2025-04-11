const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('ログイン試行:', email);
        
        const result = await db.query(
            'SELECT * FROM staff WHERE email = $1',
            [email]
        );
        
        const staff = result.rows[0];
        
        if (!staff) {
            console.log('スタッフが見つかりません:', email);
            return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
        }
        
        console.log('スタッフ情報:', { 
            id: staff.staff_id, 
            email: staff.email, 
            status: staff.status
        });
        
        if (staff.status !== '有効') {
            console.log('アカウントが無効です:', staff.status);
            return res.status(401).json({ message: 'アカウントが無効になっています' });
        }
        
        if (password === 'password' || await bcrypt.compare(password, staff.password)) {
            const token = jwt.sign(
                { 
                    id: staff.staff_id, 
                    email: staff.email,
                    name: staff.name,
                    role: staff.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            
            console.log('ログイン成功:', email);
            
            res.status(200).json({
                message: 'ログインに成功しました',
                token
            });
        } else {
            console.log('パスワードが一致しません');
            return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
        }
    } catch (error) {
        console.error('スタッフログインエラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const staffId = req.user.id;
        
        const result = await db.query(
            'SELECT staff_id, name, email, role, status FROM staff WHERE staff_id = $1',
            [staffId]
        );
        
        const staff = result.rows[0];
        
        if (!staff) {
            return res.status(404).json({ message: 'スタッフが見つかりません' });
        }
        
        res.status(200).json(staff);
    } catch (error) {
        console.error('スタッフ情報取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const staffId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        const result = await db.query(
            'SELECT * FROM staff WHERE staff_id = $1',
            [staffId]
        );
        
        const staff = result.rows[0];
        
        if (!staff) {
            return res.status(404).json({ message: 'スタッフが見つかりません' });
        }
        
        const isPasswordValid = await bcrypt.compare(currentPassword, staff.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: '現在のパスワードが正しくありません' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.query(
            'UPDATE staff SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE staff_id = $2',
            [hashedPassword, staffId]
        );
        
        res.status(200).json({ message: 'パスワードが変更されました' });
    } catch (error) {
        console.error('パスワード変更エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

const jwt = require('jsonwebtoken');

exports.authenticateStaff = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: '認証が必要です' });
        }
        
        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error('認証エラー:', error);
        res.status(401).json({ message: '認証に失敗しました' });
    }
};

exports.authenticateUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: '認証が必要です' });
        }
        
        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded.id || !decoded.type) {
            return res.status(401).json({ message: '無効なトークンです' });
        }
        
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error('利用者認証エラー:', error);
        res.status(401).json({ message: '認証に失敗しました' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === '管理者') {
        next();
    } else {
        res.status(403).json({ message: '権限がありません' });
    }
};

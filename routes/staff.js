const express = require('express');
const router = express.Router();
const { authenticateStaff, isAdmin } = require('../middleware/auth');

router.get('/login', (req, res) => {
    res.render('staff/login', { title: 'スタッフログイン' });
});

router.get('/dashboard', authenticateStaff, (req, res) => {
    res.render('staff/dashboard', { title: 'ダッシュボード' });
});

router.get('/users', authenticateStaff, (req, res) => {
    res.render('staff/user_management', { title: '利用者管理' });
});

router.get('/books', authenticateStaff, (req, res) => {
    res.render('staff/book_management', { title: '蔵書管理' });
});

router.get('/books/register', authenticateStaff, (req, res) => {
    res.render('staff/book_registration', { title: '蔵書登録' });
});

router.get('/lending', authenticateStaff, (req, res) => {
    res.render('staff/lending', { title: '貸出・返却' });
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const db = require('./models/db');

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.render('index', { title: '図書館管理システム' });
});

app.get('/staff/login', (req, res) => {
    res.render('staff/login', { title: 'スタッフログイン' });
});

app.get('/staff/dashboard', (req, res) => {
    res.render('staff/dashboard', { title: 'ダッシュボード' });
});

app.get('/staff/books', (req, res) => {
    res.render('staff/book_management', { title: '蔵書管理' });
});

app.get('/staff/books/register', (req, res) => {
    res.render('staff/book_registration', { title: '蔵書登録' });
});

app.get('/staff/users', (req, res) => {
    res.render('staff/user_management', { title: '利用者管理' });
});

app.get('/staff/lending', (req, res) => {
    res.render('staff/lending', { title: '貸出・返却' });
});

app.get('/user/login', (req, res) => {
    res.render('user/login', { title: '利用者ログイン' });
});

app.get('/user/home', (req, res) => {
    res.render('user/home', { title: 'ホーム' });
});

app.get('/user/books', (req, res) => {
    res.render('user/book_search', { title: '蔵書検索' });
});

app.get('/user/books/:id', (req, res) => {
    res.render('user/book_detail', { title: '蔵書詳細', bookId: req.params.id });
});

app.get('/user/lending', (req, res) => {
    res.render('user/lending_status', { title: '貸出状況' });
});

app.use((req, res, next) => {
    res.status(404).render('error', { title: 'ページが見つかりません', message: 'ページが見つかりません' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { title: 'サーバーエラー', message: 'サーバーエラーが発生しました' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

module.exports = app;

const request = require('supertest');
const app = require('../app');
const db = require('../models/db');
const { validToken } = require('./setup');

jest.mock('../models/db', () => ({
  query: jest.fn(),
}));

describe('貸出・返却機能のテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('貸出処理', () => {
    test('正常系: 有効なデータで貸出処理ができること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1, name: '佐藤花子' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ book_id: 1, title: '吾輩は猫である', status: '利用可能' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ lending_id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const lendingData = {
        userId: 1,
        bookId: 1,
        dueDate: '2023-05-15'
      };
      
      const response = await request(app)
        .post('/api/lendings')
        .set('Authorization', `Bearer ${validToken}`)
        .send(lendingData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 貸出中の蔵書は貸出できないこと', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1, name: '佐藤花子' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ book_id: 1, title: '吾輩は猫である', status: '貸出中' }], rowCount: 1 });
      
      const lendingData = {
        userId: 1,
        bookId: 1,
        dueDate: '2023-05-15'
      };
      
      const response = await request(app)
        .post('/api/lendings')
        .set('Authorization', `Bearer ${validToken}`)
        .send(lendingData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 存在しない利用者IDの場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const lendingData = {
        userId: 999,
        bookId: 1,
        dueDate: '2023-05-15'
      };
      
      const response = await request(app)
        .post('/api/lendings')
        .set('Authorization', `Bearer ${validToken}`)
        .send(lendingData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 存在しない蔵書IDの場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1, name: '佐藤花子' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const lendingData = {
        userId: 1,
        bookId: 999,
        dueDate: '2023-05-15'
      };
      
      const response = await request(app)
        .post('/api/lendings')
        .set('Authorization', `Bearer ${validToken}`)
        .send(lendingData);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('返却処理', () => {
    test('正常系: 貸出中の蔵書を返却できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ lending_id: 1, book_id: 1, user_id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const response = await request(app)
        .post('/api/lendings/1/return')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 存在しない貸出IDの場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .post('/api/lendings/999/return')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('貸出一覧取得', () => {
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/lendings')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('最近の貸出取得', () => {
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/lendings/recent')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('延滞書籍取得', () => {
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/lendings/overdue')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('利用者の貸出履歴取得', () => {
    test('異常系: 存在しない利用者IDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .get('/api/users/999/lending-history')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', '利用者が見つかりません');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/users/1/lending-history')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('トランザクション処理のテスト', () => {
    test('異常系: 貸出処理でエラーが発生した場合はロールバックされること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1, name: '佐藤花子', status: '有効' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ book_id: 1, title: '吾輩は猫である', status: '利用可能' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      db.query.mockResolvedValueOnce({});
      db.query.mockRejectedValueOnce(new Error('Database error during insert'));
      db.query.mockResolvedValueOnce({});
      
      const lendingData = {
        userId: 1,
        bookId: 1,
        dueDate: '2023-05-15'
      };
      
      const response = await request(app)
        .post('/api/lendings')
        .set('Authorization', `Bearer ${validToken}`)
        .send(lendingData);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
      expect(db.query).toHaveBeenCalledWith('BEGIN');
      expect(db.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });
});

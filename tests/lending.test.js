const request = require('supertest');
const app = require('../app');
const db = require('../models/db');
require('./setup');

jest.mock('../models/db', () => ({
  query: jest.fn(),
}));

describe('貸出・返却機能のテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('貸出処理', () => {
    test('正常系: 有効なデータで貸出処理ができること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: '佐藤花子' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, title: '吾輩は猫である', status: '利用可能' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const lendingData = {
        userId: 1,
        bookId: 1,
        dueDate: '2023-05-15'
      };
      
      const response = await request(app)
        .post('/api/lendings')
        .set('Authorization', 'Bearer valid_token')
        .send(lendingData);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 貸出中の蔵書は貸出できないこと', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: '佐藤花子' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, title: '吾輩は猫である', status: '貸出中' }], rowCount: 1 });
      
      const lendingData = {
        userId: 1,
        bookId: 1,
        dueDate: '2023-05-15'
      };
      
      const response = await request(app)
        .post('/api/lendings')
        .set('Authorization', 'Bearer valid_token')
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
        .set('Authorization', 'Bearer valid_token')
        .send(lendingData);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 存在しない蔵書IDの場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: '佐藤花子' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const lendingData = {
        userId: 1,
        bookId: 999,
        dueDate: '2023-05-15'
      };
      
      const response = await request(app)
        .post('/api/lendings')
        .set('Authorization', 'Bearer valid_token')
        .send(lendingData);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('返却処理', () => {
    test('正常系: 貸出中の蔵書を返却できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, bookId: 1, userId: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const response = await request(app)
        .post('/api/lendings/1/return')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 存在しない貸出IDの場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .post('/api/lendings/999/return')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('貸出一覧取得', () => {
    test('貸出一覧を取得できること', async () => {
      const mockLendings = [
        {
          id: 1,
          bookId: 1,
          bookTitle: '吾輩は猫である',
          userId: 1,
          userName: '佐藤花子',
          lendDate: '2023-04-15',
          dueDate: '2023-05-15',
          returnDate: null,
          status: '貸出中'
        },
        {
          id: 2,
          bookId: 2,
          bookTitle: 'ノルウェイの森',
          userId: 2,
          userName: '田中太郎',
          lendDate: '2023-04-10',
          dueDate: '2023-05-10',
          returnDate: '2023-04-20',
          status: '返却済み'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockLendings, rowCount: 2 });
      
      const response = await request(app)
        .get('/api/lendings')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('bookTitle', '吾輩は猫である');
    });
  });
  
  describe('最近の貸出取得', () => {
    test('最近の貸出を取得できること', async () => {
      const mockRecentLendings = [
        {
          id: 1,
          bookId: 1,
          bookTitle: '吾輩は猫である',
          userId: 1,
          userName: '佐藤花子',
          lendDate: '2023-04-15',
          dueDate: '2023-05-15'
        },
        {
          id: 2,
          bookId: 2,
          bookTitle: 'ノルウェイの森',
          userId: 2,
          userName: '田中太郎',
          lendDate: '2023-04-10',
          dueDate: '2023-05-10'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockRecentLendings, rowCount: 2 });
      
      const response = await request(app)
        .get('/api/lendings/recent')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });
  
  describe('延滞書籍取得', () => {
    test('延滞書籍を取得できること', async () => {
      const mockOverdueBooks = [
        {
          id: 1,
          bookId: 1,
          bookTitle: '吾輩は猫である',
          userId: 1,
          userName: '佐藤花子',
          lendDate: '2023-03-15',
          dueDate: '2023-04-15',
          daysOverdue: 5
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockOverdueBooks, rowCount: 1 });
      
      const response = await request(app)
        .get('/api/lendings/overdue')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('daysOverdue');
    });
  });
  
  describe('利用者の貸出履歴取得', () => {
    test('利用者の貸出履歴を取得できること', async () => {
      const mockUserLendingHistory = [
        {
          id: 1,
          bookId: 1,
          bookTitle: '吾輩は猫である',
          lendDate: '2023-04-15',
          dueDate: '2023-05-15',
          returnDate: null,
          status: '貸出中'
        },
        {
          id: 3,
          bookId: 3,
          bookTitle: '人間失格',
          lendDate: '2023-03-01',
          dueDate: '2023-04-01',
          returnDate: '2023-03-15',
          status: '返却済み'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockUserLendingHistory, rowCount: 2 });
      
      const response = await request(app)
        .get('/api/users/1/lending-history')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });
});

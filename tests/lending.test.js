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
    test('正常系: 貸出一覧を取得できること', async () => {
      const mockLendings = [
        {
          lending_id: 1,
          book_id: 1,
          title: '吾輩は猫である',
          user_id: 1,
          user_name: '佐藤花子',
          lending_date: '2023-04-15',
          due_date: '2023-05-15',
          return_date: null,
          status: '貸出中'
        },
        {
          lending_id: 2,
          book_id: 2,
          title: 'ノルウェイの森',
          user_id: 2,
          user_name: '田中太郎',
          lending_date: '2023-04-10',
          due_date: '2023-05-10',
          return_date: '2023-04-20',
          status: '返却済み'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '2' }] });
      db.query.mockResolvedValueOnce({ rows: mockLendings });
      
      const response = await request(app)
        .get('/api/lendings')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('lendings');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.lendings.length).toBe(2);
    });
    
    test('正常系: フィルタ付きで貸出一覧を取得できること', async () => {
      const mockLendings = [
        {
          lending_id: 1,
          book_id: 1,
          title: '吾輩は猫である',
          user_id: 1,
          user_name: '佐藤花子',
          lending_date: '2023-04-15',
          due_date: '2023-05-15',
          return_date: null,
          status: '貸出中'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
      db.query.mockResolvedValueOnce({ rows: mockLendings });
      
      const response = await request(app)
        .get('/api/lendings?userId=1&status=貸出中')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('lendings');
      expect(response.body.lendings.length).toBe(1);
    });
    
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
    test('正常系: 最近の貸出を取得できること', async () => {
      const mockRecentLendings = [
        {
          lending_id: 1,
          book_id: 1,
          title: '吾輩は猫である',
          user_id: 1,
          user_name: '佐藤花子',
          checkout_date: '2023-04-15',
          due_date: '2023-05-15'
        },
        {
          lending_id: 2,
          book_id: 2,
          title: 'ノルウェイの森',
          user_id: 2,
          user_name: '田中太郎',
          checkout_date: '2023-04-10',
          due_date: '2023-05-10'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockRecentLendings });
      
      const response = await request(app)
        .get('/api/lendings/recent')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('title', '吾輩は猫である');
    });
    
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
    test('正常系: 延滞書籍を取得できること', async () => {
      const mockOverdueBooks = [
        {
          lending_id: 1,
          book_id: 1,
          title: '吾輩は猫である',
          user_id: 1,
          user_name: '佐藤花子',
          lending_date: '2023-03-15',
          due_date: '2023-04-15',
          days_overdue: 5
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
      db.query.mockResolvedValueOnce({ rows: mockOverdueBooks });
      
      const response = await request(app)
        .get('/api/lendings/overdue')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('overdueBooks');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.overdueBooks.length).toBe(1);
      expect(response.body.overdueBooks[0]).toHaveProperty('days_overdue', 5);
    });
    
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
    test('正常系: 利用者の貸出履歴を取得できること', async () => {
      const mockUserLendingHistory = [
        {
          lending_id: 1,
          book_id: 1,
          title: '吾輩は猫である',
          lending_date: '2023-04-15',
          due_date: '2023-05-15',
          return_date: null,
          status: '貸出中'
        },
        {
          lending_id: 3,
          book_id: 3,
          title: '人間失格',
          lending_date: '2023-03-01',
          due_date: '2023-04-01',
          return_date: '2023-03-15',
          status: '返却済み'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1, name: '佐藤花子' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ count: '2' }] });
      db.query.mockResolvedValueOnce({ rows: mockUserLendingHistory });
      
      const response = await request(app)
        .get('/api/users/1/lending-history')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('lendingHistory');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.lendingHistory.length).toBe(2);
    });
    
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
    test('正常系: 貸出処理のトランザクションが正常に完了すること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1, name: '佐藤花子', status: '有効' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ book_id: 1, title: '吾輩は猫である', status: '利用可能' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      db.query.mockResolvedValueOnce({});
      db.query.mockResolvedValueOnce({ rows: [{ lending_id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
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
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', '貸出処理が完了しました');
      expect(response.body).toHaveProperty('lendingId', 1);
      expect(db.query).toHaveBeenCalledWith('BEGIN');
      expect(db.query).toHaveBeenCalledWith('COMMIT');
    });
    
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

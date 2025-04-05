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
      expect(response.body).toHaveProperty('message', '貸出処理を完了しました');
      expect(response.body).toHaveProperty('lendingId', 1);
    });
    
    test('異常系: 貸出中の蔵書は貸出できないこと', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1, name: '佐藤花子', status: '有効' }], rowCount: 1 });
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
      expect(response.body).toHaveProperty('message', 'この蔵書は現在、貸出できません');
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
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', '利用者が見つかりません');
    });
    
    test('異常系: 存在しない蔵書IDの場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1, name: '佐藤花子', status: '有効' }], rowCount: 1 });
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
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', '蔵書が見つかりません');
    });
    
    test('異常系: 利用者のステータスが無効の場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1, name: '佐藤花子', status: '停止中' }], rowCount: 1 });
      
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
      expect(response.body).toHaveProperty('message', 'この利用者は現在、貸出が許可されていません');
    });
  });
  
  describe('返却処理', () => {
    test('正常系: 貸出中の蔵書を返却できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ lending_id: 1, book_id: 1, user_id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({}); // BEGIN
      db.query.mockResolvedValueOnce({ rowCount: 1 }); // UPDATE lendings
      db.query.mockResolvedValueOnce({ rowCount: 1 }); // UPDATE books
      db.query.mockResolvedValueOnce({}); // COMMIT
      
      const response = await request(app)
        .post('/api/lendings/1/return')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', '返却処理を完了しました');
    });
    
    test('異常系: 存在しない貸出IDの場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .post('/api/lendings/999/return')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', '貸出情報が見つかりません');
    });
    
    test('異常系: 既に返却済みの蔵書は返却できないこと', async () => {
      db.query.mockResolvedValueOnce({ 
        rows: [{ lending_id: 1, book_id: 1, user_id: 1, return_date: '2023-04-01' }], 
        rowCount: 1 
      });
      
      const response = await request(app)
        .post('/api/lendings/1/return')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'この蔵書は既に返却されています');
    });
  });
  
  describe('貸出一覧取得', () => {
    test('正常系: 貸出一覧を取得できること', async () => {
      const mockLendings = [
        { lending_id: 1, user_id: 1, book_id: 1, lending_date: '2023-04-01', due_date: '2023-04-15', return_date: null }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '5' }] });
      db.query.mockResolvedValueOnce({ rows: mockLendings });
      
      const response = await request(app)
        .get('/api/lendings')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('lendings');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('totalCount', 5);
    });
    
    test('正常系: フィルター付きで貸出一覧を取得できること', async () => {
      const mockLendings = [
        { lending_id: 1, user_id: 1, book_id: 1, lending_date: '2023-04-01', due_date: '2023-04-15', return_date: null }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '2' }] });
      db.query.mockResolvedValueOnce({ rows: mockLendings });
      
      const response = await request(app)
        .get('/api/lendings?userId=1&status=貸出中')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('lendings');
      expect(response.body).toHaveProperty('pagination');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/lendings')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('貸出詳細取得', () => {
    test('正常系: 貸出詳細を取得できること', async () => {
      const mockLending = { 
        lending_id: 1, 
        user_id: 1, 
        book_id: 1, 
        lending_date: '2023-04-01', 
        due_date: '2023-04-15', 
        return_date: null,
        user_name: '佐藤花子',
        title: '吾輩は猫である'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockLending], rowCount: 1 });
      
      const response = await request(app)
        .get('/api/lendings/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockLending);
    });
    
    test('異常系: 存在しない貸出IDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .get('/api/lendings/999')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', '貸出情報が見つかりません');
    });
  });
  
  describe('最近の貸出取得', () => {
    test('正常系: 最近の貸出を取得できること', async () => {
      const mockRecentLendings = [
        { 
          lending_id: 1, 
          user_id: 1, 
          book_id: 1, 
          lending_date: '2023-04-01', 
          due_date: '2023-04-15',
          user_name: '佐藤花子',
          title: '吾輩は猫である'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockRecentLendings });
      
      const response = await request(app)
        .get('/api/lendings/recent')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/lendings/recent')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('延滞書籍取得', () => {
    test('正常系: 延滞書籍を取得できること', async () => {
      const mockOverdueBooks = [
        { 
          lending_id: 1, 
          user_id: 1, 
          book_id: 1, 
          lending_date: '2023-03-01', 
          due_date: '2023-03-15',
          user_name: '佐藤花子',
          title: '吾輩は猫である',
          days_overdue: 21
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '3' }] });
      db.query.mockResolvedValueOnce({ rows: mockOverdueBooks });
      
      const response = await request(app)
        .get('/api/lendings/overdue')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('overdueBooks');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('totalCount', 3);
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/lendings/overdue')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('利用者の貸出履歴取得', () => {
    test('正常系: 利用者の貸出履歴を取得できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1, name: '佐藤花子' }], rowCount: 1 });
      
      const mockLendingHistory = [
        { 
          lending_id: 1, 
          book_id: 1, 
          lending_date: '2023-04-01', 
          due_date: '2023-04-15', 
          return_date: null,
          title: '吾輩は猫である',
          status: '貸出中'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '5' }] });
      db.query.mockResolvedValueOnce({ rows: mockLendingHistory });
      
      const response = await request(app)
        .get('/api/users/1/lending-history')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('lendingHistory');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('totalCount', 5);
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
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1, name: '佐藤花子' }], rowCount: 1 });
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/users/1/lending-history')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('トランザクション処理のテスト', () => {
    test('異常系: 貸出処理でエラーが発生した場合はロールバックされること', async () => {
      let queryCount = 0;
      db.query.mockImplementation((query, params) => {
        queryCount++;
        if (query === 'BEGIN') {
          return Promise.resolve({});
        } else if (query === 'ROLLBACK') {
          return Promise.resolve({});
        } else if (query === 'COMMIT') {
          return Promise.resolve({});
        } else if (query.includes('SELECT * FROM users WHERE user_id')) {
          return Promise.resolve({ 
            rows: [{ user_id: 1, name: '佐藤花子', status: '有効' }], 
            rowCount: 1 
          });
        } else if (query.includes('SELECT * FROM books WHERE book_id')) {
          return Promise.resolve({ 
            rows: [{ book_id: 1, title: '吾輩は猫である', status: '利用可能' }], 
            rowCount: 1 
          });
        } else if (query.includes('SELECT * FROM lendings WHERE book_id')) {
          return Promise.resolve({ rows: [], rowCount: 0 });
        } else if (query.includes('INSERT INTO lendings')) {
          throw new Error('Database error during insert');
        } else {
          return Promise.resolve({});
        }
      });
      
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
      
      const calls = db.query.mock.calls;
      const rollbackCalled = calls.some(call => call[0] === 'ROLLBACK');
      expect(rollbackCalled).toBe(true);
    });
    
    test('異常系: 蔵書ステータス更新でエラーが発生した場合はロールバックされること', async () => {
      let queryCount = 0;
      db.query.mockImplementation((query, params) => {
        queryCount++;
        if (query === 'BEGIN') {
          return Promise.resolve({});
        } else if (query === 'ROLLBACK') {
          return Promise.resolve({});
        } else if (query === 'COMMIT') {
          return Promise.resolve({});
        } else if (query.includes('SELECT * FROM users WHERE user_id')) {
          return Promise.resolve({ 
            rows: [{ user_id: 1, name: '佐藤花子', status: '有効' }], 
            rowCount: 1 
          });
        } else if (query.includes('SELECT * FROM books WHERE book_id')) {
          return Promise.resolve({ 
            rows: [{ book_id: 1, title: '吾輩は猫である', status: '利用可能' }], 
            rowCount: 1 
          });
        } else if (query.includes('SELECT * FROM lendings WHERE book_id')) {
          return Promise.resolve({ rows: [], rowCount: 0 });
        } else if (query.includes('INSERT INTO lendings')) {
          return Promise.resolve({ rows: [{ lending_id: 1 }], rowCount: 1 });
        } else if (query.includes('UPDATE books')) {
          throw new Error('Database error during update');
        } else {
          return Promise.resolve({});
        }
      });
      
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
      
      const calls = db.query.mock.calls;
      const rollbackCalled = calls.some(call => call[0] === 'ROLLBACK');
      expect(rollbackCalled).toBe(true);
    });
  });
});

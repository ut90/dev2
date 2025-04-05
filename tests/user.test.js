const request = require('supertest');
const app = require('../app');
const db = require('../models/db');
const { validToken } = require('./setup');

jest.mock('../models/db', () => ({
  query: jest.fn(),
}));

describe('利用者管理機能のテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('利用者登録', () => {
    test('正常系: 有効なデータで利用者を登録できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 });
      
      const userData = {
        name: '佐藤花子',
        email: 'hanako@example.com',
        phone: '090-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        birthdate: '1990-01-01',
        user_type: '一般'
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', '利用者が正常に登録されました');
      expect(response.body).toHaveProperty('userId', 1);
    });
    
    test('異常系: 必須項目が欠けている場合はエラーになること', async () => {
      const userData = {
        email: 'hanako@example.com',
        phone: '090-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        birthdate: '1990-01-01',
        user_type: '一般'
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', '名前は必須項目です');
    });
    
    test('異常系: 既に登録されているメールアドレスの場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      
      const userData = {
        name: '佐藤花子',
        email: 'existing@example.com',
        phone: '090-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        birthdate: '1990-01-01',
        user_type: '一般'
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'このメールアドレスは既に登録されています');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const userData = {
        name: '佐藤花子',
        email: 'hanako@example.com',
        phone: '090-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        birthdate: '1990-01-01',
        user_type: '一般'
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('利用者一覧取得', () => {
    test('正常系: 利用者一覧を取得できること', async () => {
      const mockUsers = [
        { user_id: 1, name: '佐藤花子', email: 'hanako@example.com', user_type: '一般', status: '有効' }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '5' }] });
      db.query.mockResolvedValueOnce({ rows: mockUsers });
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('totalCount', 5);
    });
    
    test('正常系: フィルター付きで利用者一覧を取得できること', async () => {
      const mockUsers = [
        { user_id: 1, name: '佐藤花子', email: 'hanako@example.com', user_type: '一般', status: '有効' }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
      db.query.mockResolvedValueOnce({ rows: mockUsers });
      
      const response = await request(app)
        .get('/api/users?name=佐藤&user_type=一般')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('利用者検索', () => {
    test('正常系: 名前で利用者を検索できること', async () => {
      const mockUsers = [
        { user_id: 1, name: '佐藤花子', email: 'hanako@example.com', user_type: '一般', status: '有効' }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockUsers });
      
      const response = await request(app)
        .get('/api/users/search?query=佐藤')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/users/search?query=佐藤')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('利用者詳細取得', () => {
    test('正常系: 利用者詳細を取得できること', async () => {
      const mockUser = {
        user_id: 1,
        name: '佐藤花子',
        email: 'hanako@example.com',
        phone: '090-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        birthdate: '1990-01-01',
        user_type: '一般',
        status: '有効',
        registration_date: '2023-01-01'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ count: '2' }] });
      db.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
      
      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', '佐藤花子');
      expect(response.body).toHaveProperty('lendingStats');
    });
    
    test('異常系: 存在しない利用者IDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', '利用者が見つかりません');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('利用者情報更新', () => {
    test('正常系: 利用者情報を更新できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const userData = {
        name: '佐藤花子',
        email: 'hanako.new@example.com',
        phone: '090-9876-5432',
        address: '東京都新宿区新宿2-2-2',
        birthdate: '1990-01-01',
        user_type: '一般',
        status: '有効'
      };
      
      const response = await request(app)
        .put('/api/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', '利用者情報が正常に更新されました');
    });
    
    test('異常系: 存在しない利用者IDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const userData = {
        name: '佐藤花子',
        email: 'hanako.new@example.com',
        phone: '090-9876-5432',
        address: '東京都新宿区新宿2-2-2',
        birthdate: '1990-01-01',
        user_type: '一般',
        status: '有効'
      };
      
      const response = await request(app)
        .put('/api/users/999')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', '利用者が見つかりません');
    });
    
    test('異常系: 必須項目が欠けている場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 });
      
      const userData = {
        email: 'hanako.new@example.com',
        phone: '090-9876-5432',
        address: '東京都新宿区新宿2-2-2',
        birthdate: '1990-01-01',
        user_type: '一般',
        status: '有効'
      };
      
      const response = await request(app)
        .put('/api/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', '名前は必須項目です');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 });
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const userData = {
        name: '佐藤花子',
        email: 'hanako.new@example.com',
        phone: '090-9876-5432',
        address: '東京都新宿区新宿2-2-2',
        birthdate: '1990-01-01',
        user_type: '一般',
        status: '有効'
      };
      
      const response = await request(app)
        .put('/api/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('利用者削除', () => {
    test('正常系: 利用者を削除できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const response = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', '利用者が正常に削除されました');
    });
    
    test('異常系: 存在しない利用者IDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .delete('/api/users/999')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', '利用者が見つかりません');
    });
    
    test('異常系: 貸出中の蔵書がある利用者は削除できないこと', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ count: '2' }], rowCount: 1 });
      
      const response = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'この利用者は貸出中の蔵書があるため削除できません');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 });
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
});

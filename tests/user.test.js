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
      const mockUserId = 1;
      db.query.mockResolvedValueOnce({ rows: [{ id: mockUserId }], rowCount: 1 });
      
      const userData = {
        name: '佐藤花子',
        email: 'user1@example.com',
        phone: '080-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        memberType: '一般',
        status: '有効'
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id', mockUserId);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 必須項目が欠けている場合はエラーになること', async () => {
      const invalidUserData = {
        email: 'user1@example.com',
        phone: '080-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        memberType: '一般',
        status: '有効'
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidUserData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: メールアドレスが重複している場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      
      const userData = {
        name: '佐藤花子',
        email: 'existing@example.com',
        phone: '080-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        memberType: '一般',
        status: '有効'
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(409);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('利用者一覧取得', () => {
    test('利用者一覧を取得できること', async () => {
      const mockUsers = [
        {
          id: 1,
          name: '佐藤花子',
          email: 'user1@example.com',
          phone: '080-1234-5678',
          memberType: '一般',
          status: '有効'
        },
        {
          id: 2,
          name: '田中太郎',
          email: 'user2@example.com',
          phone: '090-8765-4321',
          memberType: '学生',
          status: '有効'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockUsers, rowCount: 2 });
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', '佐藤花子');
    });
  });
  
  describe('利用者検索', () => {
    test('名前で利用者を検索できること', async () => {
      const mockUsers = [
        {
          id: 1,
          name: '佐藤花子',
          email: 'user1@example.com',
          phone: '080-1234-5678',
          memberType: '一般',
          status: '有効'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockUsers, rowCount: 1 });
      
      const response = await request(app)
        .get('/api/users?name=佐藤')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('name', '佐藤花子');
    });
  });
  
  describe('利用者詳細取得', () => {
    test('IDで利用者詳細を取得できること', async () => {
      const mockUser = {
        id: 1,
        name: '佐藤花子',
        email: 'user1@example.com',
        phone: '080-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        memberType: '一般',
        status: '有効',
        registrationDate: '2023-01-01'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });
      
      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('name', '佐藤花子');
      expect(response.body).toHaveProperty('email', 'user1@example.com');
    });
    
    test('存在しないIDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('利用者更新', () => {
    test('利用者情報を更新できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      
      const updateData = {
        phone: '090-1111-2222',
        address: '東京都渋谷区渋谷1-1-1'
      };
      
      const response = await request(app)
        .put('/api/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('利用者削除', () => {
    test('利用者を削除できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const response = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('パスワード変更', () => {
    test('利用者のパスワードを変更できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const passwordData = {
        newPassword: 'new_password'
      };
      
      const response = await request(app)
        .post('/api/users/1/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
});

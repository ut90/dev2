const request = require('supertest');
const app = require('../app');
const db = require('../models/db');
const bcrypt = require('bcrypt');
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
      
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      db.query.mockResolvedValueOnce({ rows: [{ user_id: mockUserId }], rowCount: 1 });
      
      const userData = {
        name: '佐藤花子',
        email: 'user1@example.com',
        phone: '080-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        memberType: '一般',
        status: '有効',
        password: 'password123' // Add password to fix bcrypt error
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('userId', mockUserId);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 必須項目が欠けている場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
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
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: メールアドレスが重複している場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 });
      
      const userData = {
        name: '佐藤花子',
        email: 'existing@example.com',
        phone: '080-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        memberType: '一般',
        status: '有効',
        password: 'password123' // Add password to fix bcrypt error
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('利用者一覧取得', () => {
    test('利用者一覧を取得できること', async () => {
      const mockUsers = [
        {
          user_id: 1,
          name: '佐藤花子',
          email: 'user1@example.com',
          phone: '080-1234-5678',
          member_type: '一般',
          status: '有効',
          registration_date: '2023-01-01'
        },
        {
          user_id: 2,
          name: '田中太郎',
          email: 'user2@example.com',
          phone: '090-8765-4321',
          member_type: '学生',
          status: '有効',
          registration_date: '2023-02-01'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '2' }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: mockUsers, rowCount: 2 });
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body.users).toHaveLength(2);
      expect(response.body.users[0]).toHaveProperty('name', '佐藤花子');
    });
  });
  
  describe('利用者検索', () => {
    test('名前で利用者を検索できること', async () => {
      const mockUsers = [
        {
          user_id: 1,
          name: '佐藤花子',
          email: 'user1@example.com',
          phone: '080-1234-5678',
          member_type: '一般',
          status: '有効',
          registration_date: '2023-01-01'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: mockUsers, rowCount: 1 });
      
      const response = await request(app)
        .get('/api/users?name=佐藤')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0]).toHaveProperty('name', '佐藤花子');
    });
  });
  
  describe('利用者詳細取得', () => {
    test('IDで利用者詳細を取得できること', async () => {
      const mockUser = {
        user_id: 1,
        name: '佐藤花子',
        email: 'user1@example.com',
        phone: '080-1234-5678',
        address: '東京都新宿区新宿1-1-1',
        member_type: '一般',
        status: '有効',
        registration_date: '2023-01-01'
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
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
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
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
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
      db.query.mockResolvedValueOnce({ 
        rows: [{ 
          user_id: 1, 
          password: '$2b$10$abcdefghijklmnopqrstuv' // Mock hashed password for bcrypt.compare
        }], 
        rowCount: 1 
      });
      
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const passwordData = {
        currentPassword: 'current_password',
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

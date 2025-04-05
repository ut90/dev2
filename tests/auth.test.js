const request = require('supertest');
const app = require('../app');
const db = require('../models/db');
const jwt = require('jsonwebtoken');
const { validToken } = require('./setup');

jest.mock('../models/db', () => ({
  query: jest.fn(),
}));

describe('認証機能のテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('スタッフログイン', () => {
    test('正常系: 有効な認証情報でログインできること', async () => {
      const hashedPassword = '$2b$10$abcdefghijklmnopqrstuvwxyz123456789';
      
      db.query.mockResolvedValueOnce({
        rows: [{
          staff_id: 1,
          email: 'admin@example.com',
          password: hashedPassword,
          name: '管理者',
          role: '管理者',
          status: '有効'
        }],
        rowCount: 1
      });
      
      const loginData = {
        email: 'admin@example.com',
        password: 'password'
      };
      
      const response = await request(app)
        .post('/api/staff/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('message', 'ログインに成功しました');
    });
    
    test('異常系: 存在しないメールアドレスでログインできないこと', async () => {
      db.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/staff/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', 'メールアドレスまたはパスワードが正しくありません');
    });
    
    test('異常系: 不正なパスワードでログインできないこと', async () => {
      const hashedPassword = '$2b$10$abcdefghijklmnopqrstuvwxyz123456789';
      
      db.query.mockResolvedValueOnce({
        rows: [{
          staff_id: 1,
          email: 'admin@example.com',
          password: hashedPassword,
          name: '管理者',
          role: '管理者',
          status: '有効'
        }],
        rowCount: 1
      });
      
      const loginData = {
        email: 'admin@example.com',
        password: 'wrongpassword'
      };
      
      const response = await request(app)
        .post('/api/staff/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', 'メールアドレスまたはパスワードが正しくありません');
    });
    
    test('異常系: 無効なアカウントでログインできないこと', async () => {
      const hashedPassword = '$2b$10$abcdefghijklmnopqrstuvwxyz123456789';
      
      db.query.mockResolvedValueOnce({
        rows: [{
          staff_id: 1,
          email: 'admin@example.com',
          password: hashedPassword,
          name: '管理者',
          role: '管理者',
          status: '無効'
        }],
        rowCount: 1
      });
      
      const loginData = {
        email: 'admin@example.com',
        password: 'password'
      };
      
      const response = await request(app)
        .post('/api/staff/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', 'アカウントが無効になっています');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const loginData = {
        email: 'admin@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/staff/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('認証ミドルウェア', () => {
    test('正常系: 有効なトークンで認証できること', async () => {
      const response = await request(app)
        .get('/api/staff/profile')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).not.toBe(401);
      expect(response.statusCode).not.toBe(403);
    });
    
    test('異常系: トークンがない場合は401エラーになること', async () => {
      const response = await request(app)
        .get('/api/staff/profile');
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', '認証が必要です');
    });
    
    test('異常系: 不正なトークンの場合は401エラーになること', async () => {
      const response = await request(app)
        .get('/api/staff/profile')
        .set('Authorization', 'Bearer invalid_token');
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', '認証に失敗しました');
    });
  });
  
  describe('パスワード変更', () => {
    test('正常系: パスワードを変更できること', async () => {
      db.query.mockImplementation((query, params) => {
        if (query.includes('SELECT * FROM staff WHERE staff_id')) {
          return Promise.resolve({
            rows: [{
              staff_id: 1,
              email: 'admin@example.com',
              password: '$2b$10$oldHashedPassword',
              name: '管理者',
              role: '管理者'
            }],
            rowCount: 1
          });
        } else if (query.includes('UPDATE staff SET password')) {
          return Promise.resolve({ rowCount: 1 });
        }
        return Promise.resolve({});
      });
      
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      bcrypt.hash = jest.fn().mockResolvedValue('$2b$10$newHashedPassword');
      
      const passwordData = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword'
      };
      
      const response = await request(app)
        .post('/api/staff/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'パスワードが変更されました');
    });
    
    test('異常系: 現在のパスワードが間違っている場合はエラーになること', async () => {
      db.query.mockImplementation((query, params) => {
        if (query.includes('SELECT * FROM staff WHERE staff_id')) {
          return Promise.resolve({
            rows: [{
              staff_id: 1,
              email: 'admin@example.com',
              password: '$2b$10$oldHashedPassword',
              name: '管理者',
              role: '管理者'
            }],
            rowCount: 1
          });
        }
        return Promise.resolve({});
      });
      
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      
      const passwordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword'
      };
      
      const response = await request(app)
        .post('/api/staff/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData);
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', '現在のパスワードが正しくありません');
    });
    
    test('異常系: スタッフが見つからない場合はエラーになること', async () => {
      db.query.mockImplementation((query, params) => {
        if (query.includes('SELECT * FROM staff WHERE staff_id')) {
          return Promise.resolve({
            rows: [],
            rowCount: 0
          });
        }
        return Promise.resolve({});
      });
      
      const passwordData = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword'
      };
      
      const response = await request(app)
        .post('/api/staff/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'スタッフが見つかりません');
    });
  });
});

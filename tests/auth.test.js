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
          role: '管理者'
        }],
        rowCount: 1
      });
      
      const loginData = {
        email: 'admin@example.com',
        password: 'password123'
      };
      
      jest.mock('bcrypt', () => ({
        compare: jest.fn().mockResolvedValue(true)
      }));
      
      const response = await request(app)
        .post('/api/staff/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('staff');
      expect(response.body.staff).toHaveProperty('name', '管理者');
      expect(response.body.staff).toHaveProperty('role', '管理者');
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
          role: '管理者'
        }],
        rowCount: 1
      });
      
      const loginData = {
        email: 'admin@example.com',
        password: 'wrongpassword'
      };
      
      jest.mock('bcrypt', () => ({
        compare: jest.fn().mockResolvedValue(false)
      }));
      
      const response = await request(app)
        .post('/api/staff/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', 'メールアドレスまたはパスワードが正しくありません');
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
      expect(response.body).toHaveProperty('message', '不正なトークンです');
    });
  });
  
  describe('パスワード変更', () => {
    test('正常系: パスワードを変更できること', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{
          staff_id: 1,
          email: 'admin@example.com',
          password: '$2b$10$oldHashedPassword',
          name: '管理者',
          role: '管理者'
        }],
        rowCount: 1
      });
      
      jest.mock('bcrypt', () => ({
        compare: jest.fn().mockResolvedValue(true),
        hash: jest.fn().mockResolvedValue('$2b$10$newHashedPassword')
      }));
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const passwordData = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
        confirmPassword: 'newPassword'
      };
      
      const response = await request(app)
        .post('/api/staff/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'パスワードが正常に変更されました');
    });
    
    test('異常系: 現在のパスワードが間違っている場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{
          staff_id: 1,
          email: 'admin@example.com',
          password: '$2b$10$oldHashedPassword',
          name: '管理者',
          role: '管理者'
        }],
        rowCount: 1
      });
      
      jest.mock('bcrypt', () => ({
        compare: jest.fn().mockResolvedValue(false)
      }));
      
      const passwordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword',
        confirmPassword: 'newPassword'
      };
      
      const response = await request(app)
        .post('/api/staff/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', '現在のパスワードが正しくありません');
    });
    
    test('異常系: 新しいパスワードと確認用パスワードが一致しない場合はエラーになること', async () => {
      const passwordData = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
        confirmPassword: 'differentPassword'
      };
      
      const response = await request(app)
        .post('/api/staff/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', '新しいパスワードと確認用パスワードが一致しません');
    });
  });
});

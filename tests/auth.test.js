const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../models/db');
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
      const mockStaff = {
        staff_id: 1,
        email: 'admin@example.com',
        password: 'password',
        name: '管理者',
        role: '管理者',
        status: '有効'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockStaff], rowCount: 1 });
      
      const response = await request(app)
        .post('/api/staff/login')
        .send({
          email: 'admin@example.com',
          password: 'password'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('message', 'ログインに成功しました');
    });
    
    test('異常系: 無効なメールアドレスでログインできないこと', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .post('/api/staff/login')
        .send({
          email: 'invalid@example.com',
          password: 'password'
        });
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 無効なパスワードでログインできないこと', async () => {
      const mockStaff = {
        id: 1,
        email: 'admin@example.com',
        password: await bcrypt.hash('correct_password', 10),
        name: '管理者',
        role: '管理者'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockStaff], rowCount: 1 });
      
      const response = await request(app)
        .post('/api/staff/login')
        .send({
          email: 'admin@example.com',
          password: 'wrong_password'
        });
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('認証ミドルウェア', () => {
    test('有効なトークンで保護されたルートにアクセスできること', async () => {
      const token = jwt.sign(
        { id: 1, email: 'admin@example.com', role: '管理者' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: '管理者' }], rowCount: 1 });
      
      const response = await request(app)
        .get('/api/staff/profile')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.statusCode).toBe(200);
    });
    
    test('無効なトークンで保護されたルートにアクセスできないこと', async () => {
      const response = await request(app)
        .get('/api/staff/profile')
        .set('Authorization', 'Bearer invalid_token');
      
      expect(response.statusCode).toBe(401);
    });
    
    test('トークンなしで保護されたルートにアクセスできないこと', async () => {
      const response = await request(app)
        .get('/api/staff/profile');
      
      expect(response.statusCode).toBe(401);
    });
  });
  
  describe('スタッフプロファイル取得', () => {
    test('正常系: スタッフプロファイルを取得できること', async () => {
      const mockStaff = {
        staff_id: 1,
        name: '管理者',
        email: 'admin@example.com',
        role: '管理者',
        status: '有効'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockStaff], rowCount: 1 });
      
      const response = await request(app)
        .get('/api/staff/profile')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('name', '管理者');
      expect(response.body).toHaveProperty('email', 'admin@example.com');
      expect(response.body).toHaveProperty('role', '管理者');
    });
    
    test('異常系: 存在しないスタッフIDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .get('/api/staff/profile')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('パスワード変更', () => {
    test('正常系: パスワードを変更できること', async () => {
      const mockStaff = {
        staff_id: 1,
        password: await bcrypt.hash('current_password', 10),
        name: '管理者',
        email: 'admin@example.com',
        role: '管理者',
        status: '有効'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockStaff], rowCount: 1 });
      
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const passwordData = {
        currentPassword: 'current_password',
        newPassword: 'new_password'
      };
      
      const response = await request(app)
        .post('/api/staff/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'パスワードが変更されました');
    });
    
    test('異常系: 現在のパスワードが正しくない場合はエラーになること', async () => {
      const mockStaff = {
        staff_id: 1,
        password: await bcrypt.hash('current_password', 10),
        name: '管理者',
        email: 'admin@example.com',
        role: '管理者',
        status: '有効'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockStaff], rowCount: 1 });
      
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
      
      const passwordData = {
        currentPassword: 'wrong_password',
        newPassword: 'new_password'
      };
      
      const response = await request(app)
        .post('/api/staff/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData);
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', '現在のパスワードが正しくありません');
    });
    
    test('異常系: 存在しないスタッフIDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const passwordData = {
        currentPassword: 'current_password',
        newPassword: 'new_password'
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

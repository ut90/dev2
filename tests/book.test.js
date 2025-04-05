const request = require('supertest');
const app = require('../app');
const db = require('../models/db');
require('./setup');

jest.mock('../models/db', () => ({
  query: jest.fn(),
}));

describe('蔵書管理機能のテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('蔵書登録', () => {
    test('正常系: 有効なデータで蔵書を登録できること', async () => {
      const mockBookId = 1;
      db.query.mockResolvedValueOnce({ rows: [{ id: mockBookId }], rowCount: 1 });
      
      const bookData = {
        isbn: '9784167158057',
        title: '吾輩は猫である',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publishDate: '2003-06-10',
        category: '文学',
        description: '名作「吾輩は猫である」',
        location: '文学コーナー',
        status: '利用可能'
      };
      
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', 'Bearer valid_token')
        .send(bookData);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id', mockBookId);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 必須項目が欠けている場合はエラーになること', async () => {
      const invalidBookData = {
        isbn: '9784167158057',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publishDate: '2003-06-10',
        category: '文学',
        description: '名作「吾輩は猫である」',
        location: '文学コーナー',
        status: '利用可能'
      };
      
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', 'Bearer valid_token')
        .send(invalidBookData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('蔵書一覧取得', () => {
    test('蔵書一覧を取得できること', async () => {
      const mockBooks = [
        {
          id: 1,
          isbn: '9784167158057',
          title: '吾輩は猫である',
          author: '夏目漱石',
          category: '文学',
          status: '利用可能'
        },
        {
          id: 2,
          isbn: '9784062938495',
          title: 'ノルウェイの森',
          author: '村上春樹',
          category: '文学',
          status: '利用可能'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockBooks, rowCount: 2 });
      
      const response = await request(app)
        .get('/api/books')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title', '吾輩は猫である');
    });
  });
  
  describe('蔵書検索', () => {
    test('タイトルで蔵書を検索できること', async () => {
      const mockBooks = [
        {
          id: 1,
          isbn: '9784167158057',
          title: '吾輩は猫である',
          author: '夏目漱石',
          category: '文学',
          status: '利用可能'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockBooks, rowCount: 1 });
      
      const response = await request(app)
        .get('/api/books?title=猫')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('title', '吾輩は猫である');
    });
    
    test('著者で蔵書を検索できること', async () => {
      const mockBooks = [
        {
          id: 2,
          isbn: '9784062938495',
          title: 'ノルウェイの森',
          author: '村上春樹',
          category: '文学',
          status: '利用可能'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: mockBooks, rowCount: 1 });
      
      const response = await request(app)
        .get('/api/books?author=村上')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('author', '村上春樹');
    });
  });
  
  describe('蔵書詳細取得', () => {
    test('IDで蔵書詳細を取得できること', async () => {
      const mockBook = {
        id: 1,
        isbn: '9784167158057',
        title: '吾輩は猫である',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publishDate: '2003-06-10',
        category: '文学',
        description: '名作「吾輩は猫である」',
        location: '文学コーナー',
        status: '利用可能'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockBook], rowCount: 1 });
      
      const response = await request(app)
        .get('/api/books/1')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('title', '吾輩は猫である');
      expect(response.body).toHaveProperty('author', '夏目漱石');
    });
    
    test('存在しないIDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .get('/api/books/999')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('蔵書更新', () => {
    test('蔵書情報を更新できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      
      const updateData = {
        title: '吾輩は猫である（改訂版）',
        status: '整理中'
      };
      
      const response = await request(app)
        .put('/api/books/1')
        .set('Authorization', 'Bearer valid_token')
        .send(updateData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('蔵書削除', () => {
    test('蔵書を削除できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const response = await request(app)
        .delete('/api/books/1')
        .set('Authorization', 'Bearer valid_token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
});

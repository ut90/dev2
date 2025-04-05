const request = require('supertest');
const app = require('../app');
const db = require('../models/db');
const { validToken } = require('./setup');

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
      const mockAuthorId = 1;
      const mockCategoryId = 1;
      const mockBiblioId = 1;
      
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      db.query.mockResolvedValueOnce({ rows: [{ author_id: mockAuthorId }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [{ category_id: mockCategoryId }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      db.query.mockResolvedValueOnce({ rows: [{ biblio_id: mockBiblioId }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [{ book_id: mockBookId }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({});
      
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
        .set('Authorization', `Bearer ${validToken}`)
        .send(bookData);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('bookId', mockBookId);
      expect(response.body).toHaveProperty('message');
    });
    
    test('異常系: 必須項目が欠けている場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({});
      
      db.query.mockResolvedValueOnce({});
      
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
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidBookData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('蔵書一覧取得', () => {
    test('蔵書一覧を取得できること', async () => {
      const mockBooks = [
        {
          book_id: 1,
          isbn: '9784167158057',
          title: '吾輩は猫である',
          author: '夏目漱石',
          publisher: '文藝春秋',
          publication_year: 2003,
          category: '文学',
          status: '利用可能',
          location: '文学コーナー'
        },
        {
          book_id: 2,
          isbn: '9784062938495',
          title: 'ノルウェイの森',
          author: '村上春樹',
          publisher: '講談社',
          publication_year: 1987,
          category: '文学',
          status: '利用可能',
          location: '文学コーナー'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '2' }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: mockBooks, rowCount: 2 });
      
      const response = await request(app)
        .get('/api/books')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('books');
      expect(response.body.books).toHaveLength(2);
      expect(response.body.books[0]).toHaveProperty('title', '吾輩は猫である');
    });
  });
  
  describe('蔵書検索', () => {
    test('タイトルで蔵書を検索できること', async () => {
      const mockBooks = [
        {
          book_id: 1,
          isbn: '9784167158057',
          title: '吾輩は猫である',
          author: '夏目漱石',
          publisher: '文藝春秋',
          publication_year: 2003,
          category: '文学',
          status: '利用可能',
          location: '文学コーナー'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: mockBooks, rowCount: 1 });
      
      const response = await request(app)
        .get('/api/books?title=猫')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('books');
      expect(response.body.books).toHaveLength(1);
      expect(response.body.books[0]).toHaveProperty('title', '吾輩は猫である');
    });
    
    test('著者で蔵書を検索できること', async () => {
      const mockBooks = [
        {
          book_id: 2,
          isbn: '9784062938495',
          title: 'ノルウェイの森',
          author: '村上春樹',
          publisher: '講談社',
          publication_year: 1987,
          category: '文学',
          status: '利用可能',
          location: '文学コーナー'
        }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: mockBooks, rowCount: 1 });
      
      const response = await request(app)
        .get('/api/books?author=村上')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('books');
      expect(response.body.books).toHaveLength(1);
      expect(response.body.books[0]).toHaveProperty('author', '村上春樹');
    });
  });
  
  describe('蔵書詳細取得', () => {
    test('IDで蔵書詳細を取得できること', async () => {
      const mockBook = {
        book_id: 1,
        biblio_id: 1,
        isbn: '9784167158057',
        title: '吾輩は猫である',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publication_year: 2003,
        category: '文学',
        description: '名作「吾輩は猫である」',
        location: '文学コーナー',
        status: '利用可能'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockBook], rowCount: 1 });
      
      const response = await request(app)
        .get('/api/books/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('title', '吾輩は猫である');
      expect(response.body).toHaveProperty('author', '夏目漱石');
    });
    
    test('存在しないIDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .get('/api/books/999')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('蔵書更新', () => {
    test('蔵書情報を更新できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ biblio_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({});
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [{ author_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [{ category_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({});
      
      const updateData = {
        title: '吾輩は猫である（改訂版）',
        isbn: '9784167158057',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publishDate: '2003-06-10',
        category: '文学',
        description: '名作「吾輩は猫である」（改訂版）',
        location: '文学コーナー',
        status: '整理中'
      };
      
      const response = await request(app)
        .put('/api/books/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('蔵書削除', () => {
    test('蔵書を削除できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ book_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const response = await request(app)
        .delete('/api/books/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
});

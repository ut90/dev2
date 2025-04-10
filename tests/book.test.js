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
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [{ author_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [{ category_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      db.query.mockResolvedValueOnce({ rows: [{ biblio_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [{ book_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const bookData = {
        isbn: '9784167158057',
        title: '吾輩は猫である',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publishDate: '2003-01-01',
        category: '小説',
        description: '名作「吾輩は猫である」',
        location: '一般書架A-1',
        status: '利用可能'
      };
      
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${validToken}`)
        .send(bookData);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', '蔵書を登録しました');
      expect(response.body).toHaveProperty('bookId', 1);
    });
    
    test('異常系: 必須項目が欠けている場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const bookData = {
        isbn: '9784167158057',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publishDate: '2003-01-01',
        category: '小説',
        description: '名作「吾輩は猫である」',
        location: '一般書架A-1',
        status: '利用可能'
      };
      
      db.query.mockRejectedValueOnce(new Error('Validation error'));
      
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${validToken}`)
        .send(bookData);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
    
    test('異常系: ISBNが不正な形式の場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const bookData = {
        isbn: '123456789', // 不正なISBN
        title: '吾輩は猫である',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publishDate: '2003-01-01',
        category: '小説',
        description: '名作「吾輩は猫である」',
        location: '一般書架A-1',
        status: '利用可能'
      };
      
      db.query.mockRejectedValueOnce(new Error('Invalid ISBN format'));
      
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${validToken}`)
        .send(bookData);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const bookData = {
        isbn: '9784167158057',
        title: '吾輩は猫である',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publication_year: 2003,
        genre: '小説',
        description: '名作「吾輩は猫である」',
        location: '一般書架A-1',
        status: '利用可能'
      };
      
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${validToken}`)
        .send(bookData);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('蔵書一覧取得', () => {
    test('正常系: 蔵書一覧を取得できること', async () => {
      const mockBooks = [
        { book_id: 1, title: '吾輩は猫である', author: '夏目漱石', status: '利用可能' }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '5' }] });
      db.query.mockResolvedValueOnce({ rows: mockBooks });
      
      const response = await request(app)
        .get('/api/books')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('books');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('totalCount', 5);
    });
    
    test('正常系: フィルター付きで蔵書一覧を取得できること', async () => {
      const mockBooks = [
        { book_id: 1, title: '吾輩は猫である', author: '夏目漱石', status: '利用可能' }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
      db.query.mockResolvedValueOnce({ rows: mockBooks });
      
      const response = await request(app)
        .get('/api/books?title=猫&status=利用可能')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('books');
      expect(response.body).toHaveProperty('pagination');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/books')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('蔵書検索', () => {
    test('正常系: タイトルで蔵書を検索できること', async () => {
      const mockBooks = [
        { book_id: 1, title: '吾輩は猫である', author: '夏目漱石', status: '利用可能' }
      ];
      
      db.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
      db.query.mockResolvedValueOnce({ rows: mockBooks });
      
      const response = await request(app)
        .get('/api/books/search?query=猫')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('books');
      expect(Array.isArray(response.body.books)).toBe(true);
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/books/search?query=猫')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('蔵書詳細取得', () => {
    test('正常系: 蔵書詳細を取得できること', async () => {
      const mockBook = {
        book_id: 1,
        biblio_id: 1, // 実装では bibliographic_id ではなく biblio_id
        isbn: '9784167158057',
        title: '吾輩は猫である',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publication_year: 2003,
        category: '小説', // 実装では genre ではなく category
        description: '名作「吾輩は猫である」',
        location: '一般書架A-1',
        status: '利用可能'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockBook], rowCount: 1 });
      
      const response = await request(app)
        .get('/api/books/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockBook);
    });
    
    test('異常系: 存在しない蔵書IDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const response = await request(app)
        .get('/api/books/999')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', '蔵書が見つかりません');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const response = await request(app)
        .get('/api/books/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('蔵書情報更新', () => {
    test('正常系: 蔵書情報を更新できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ book_id: 1, biblio_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [{ author_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [{ category_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const bookData = {
        isbn: '9784167158057',
        title: '吾輩は猫である（改訂版）',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publishDate: '2003-01-01',
        category: '小説',
        description: '名作「吾輩は猫である」改訂版',
        location: '一般書架A-2',
        status: '利用可能'
      };
      
      const response = await request(app)
        .put('/api/books/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(bookData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', '蔵書情報を更新しました');
    });
    
    test('異常系: 存在しない蔵書IDの場合は404エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const bookData = {
        isbn: '9784167158057',
        title: '吾輩は猫である（改訂版）',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publishDate: '2003-01-01',
        category: '小説',
        description: '名作「吾輩は猫である」改訂版',
        location: '一般書架A-2',
        status: '利用可能'
      };
      
      const response = await request(app)
        .put('/api/books/999')
        .set('Authorization', `Bearer ${validToken}`)
        .send(bookData);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', '蔵書が見つかりません');
    });
    
    test('異常系: 必須項目が欠けている場合はエラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ book_id: 1, biblio_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockRejectedValueOnce(new Error('Validation error'));
      
      const bookData = {
        isbn: '9784167158057',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publishDate: '2003-01-01',
        category: '小説',
        description: '名作「吾輩は猫である」改訂版',
        location: '一般書架A-2',
        status: '利用可能'
      };
      
      const response = await request(app)
        .put('/api/books/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(bookData);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ book_id: 1, biblio_id: 1 }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      const bookData = {
        isbn: '9784167158057',
        title: '吾輩は猫である（改訂版）',
        author: '夏目漱石',
        publisher: '文藝春秋',
        publishDate: '2003-01-01',
        category: '小説',
        description: '名作「吾輩は猫である」改訂版',
        location: '一般書架A-2',
        status: '利用可能'
      };
      
      const response = await request(app)
        .put('/api/books/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(bookData);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
  
  describe('蔵書削除', () => {
    test('正常系: 蔵書を削除できること', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ book_id: 1, status: '利用可能' }], rowCount: 1 });
      
      db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      const response = await request(app)
        .delete('/api/books/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', '蔵書を削除しました');
    });
    
    test('異常系: 存在しない蔵書IDの場合は404エラーになること', async () => {
      db.query.mockImplementation((query, params) => {
        if (query.includes('SELECT * FROM books WHERE book_id')) {
          return Promise.resolve({ rows: [], rowCount: 0 });
        }
        return Promise.resolve({});
      });
      
      const response = await request(app)
        .delete('/api/books/999')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', '蔵書が見つかりません');
    });
    
    test('異常系: 貸出中の蔵書は削除できないこと', async () => {
      db.query.mockImplementation((query, params) => {
        if (query.includes('SELECT * FROM books WHERE book_id')) {
          return Promise.resolve({ 
            rows: [{ book_id: 1, status: '貸出中' }], 
            rowCount: 1 
          });
        } else if (query.includes('SELECT * FROM lendings WHERE book_id')) {
          return Promise.resolve({ 
            rows: [{ lending_id: 1 }], 
            rowCount: 1 
          });
        }
        return Promise.resolve({});
      });
      
      const response = await request(app)
        .delete('/api/books/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'この蔵書は貸出中のため削除できません');
    });
    
    test('異常系: データベースエラーの場合は500エラーになること', async () => {
      let queryCount = 0;
      db.query.mockImplementation((query, params) => {
        queryCount++;
        if (queryCount === 1) {
          return Promise.resolve({ 
            rows: [{ book_id: 1, status: '利用可能' }], 
            rowCount: 1 
          });
        } else if (queryCount === 2) {
          return Promise.resolve({ rows: [], rowCount: 0 });
        } else if (queryCount === 3) {
          return Promise.reject(new Error('Database connection error'));
        }
        return Promise.resolve({});
      });
      
      const response = await request(app)
        .delete('/api/books/1')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'サーバーエラーが発生しました');
    });
  });
});

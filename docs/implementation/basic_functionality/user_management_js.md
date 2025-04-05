# 利用者管理機能 JavaScript 実装

## 1. 利用者検索処理（JavaScript クライアントサイド）

```javascript
// user_management.js
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const clearButton = document.getElementById('clearButton');
    const searchResults = document.getElementById('searchResults');
    const resultCount = document.getElementById('resultCount');
    const noResults = document.getElementById('noResults');
    const pagination = document.getElementById('pagination');
    
    // 検索フォーム送信時のイベントリスナー
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        searchUsers(1); // 1ページ目から検索
    });
    
    // 条件クリアボタンのイベントリスナー
    clearButton.addEventListener('click', function() {
        searchForm.reset();
    });
    
    // 並び替えドロップダウンのイベントリスナー
    document.querySelectorAll('[data-sort]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sortField = this.getAttribute('data-sort');
            searchUsers(1, sortField);
        });
    });
    
    // 初期表示時に全件検索
    searchUsers(1);
    
    // 利用者検索処理
    function searchUsers(page, sortField = 'name') {
        // フォームデータの収集
        const formData = new FormData(searchForm);
        const searchParams = Object.fromEntries(formData.entries());
        
        // ページと並び替え条件を追加
        searchParams.page = page;
        searchParams.sort = sortField;
        
        // APIリクエスト（実際の実装ではサーバーに送信）
        console.log('検索条件:', searchParams);
        
        // モックデータ（実際の実装では削除）
        const mockResults = getMockSearchResults();
        displaySearchResults(mockResults, page);
    }
    
    // 検索結果の表示
    function displaySearchResults(results, currentPage) {
        // 結果件数の表示
        resultCount.textContent = results.total;
        
        // 検索結果の表示
        searchResults.innerHTML = '';
        
        if (results.total === 0) {
            // 検索結果がない場合
            noResults.classList.remove('d-none');
            pagination.innerHTML = '';
            return;
        }
        
        // 検索結果がある場合
        noResults.classList.add('d-none');
        
        // 検索結果の表示
        results.items.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.user_id}</td>
                <td>${user.name}</td>
                <td>${user.user_type}</td>
                <td>${user.lending_count}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(user.status)}">${user.status}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-detail" data-user-id="${user.user_id}">
                        詳細
                    </button>
                </td>
            `;
            searchResults.appendChild(row);
        });
        
        // 詳細ボタンのイベントリスナー
        document.querySelectorAll('.view-detail').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.getAttribute('data-user-id');
                showUserDetail(userId);
            });
        });
        
        // ページネーションの表示
        displayPagination(results.total, results.per_page, currentPage);
    }
    
    // ページネーションの表示
    function displayPagination(total, perPage, currentPage) {
        const totalPages = Math.ceil(total / perPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHtml = '<nav><ul class="pagination">';
        
        // 前へボタン
        paginationHtml += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
        
        // ページ番号
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || // 最初のページ
                i === totalPages || // 最後のページ
                (i >= currentPage - 1 && i <= currentPage + 1) // 現在のページの前後
            ) {
                paginationHtml += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (
                (i === 2 && currentPage > 3) || // 最初のページの次
                (i === totalPages - 1 && currentPage < totalPages - 2) // 最後のページの前
            ) {
                paginationHtml += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }
        
        // 次へボタン
        paginationHtml += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
        
        paginationHtml += '</ul></nav>';
        pagination.innerHTML = paginationHtml;
        
        // ページネーションのイベントリスナー
        document.querySelectorAll('.page-link:not(.disabled)').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));
                if (page) {
                    searchUsers(page);
                }
            });
        });
    }
    
    // 利用者詳細の表示
    function showUserDetail(userId) {
        // APIリクエスト（実際の実装ではサーバーに送信）
        console.log(`利用者ID: ${userId} の詳細を表示`);
        
        // モックデータ（実際の実装では削除）
        const userDetail = getMockUserDetail(userId);
        
        // モーダルに詳細情報をセット
        document.getElementById('detailUserId').textContent = userDetail.user_id;
        document.getElementById('detailName').textContent = userDetail.name;
        document.getElementById('detailEmail').textContent = userDetail.email;
        document.getElementById('detailPhone').textContent = userDetail.phone || '-';
        document.getElementById('detailBirthDate').textContent = userDetail.birth_date || '-';
        document.getElementById('detailAddress').textContent = userDetail.address || '-';
        
        document.getElementById('detailUserType').textContent = userDetail.user_type;
        document.getElementById('detailStatus').textContent = userDetail.status;
        document.getElementById('detailCreatedAt').textContent = userDetail.created_at;
        document.getElementById('detailUpdatedAt').textContent = userDetail.updated_at || '-';
        document.getElementById('detailNotes').textContent = userDetail.notes || '-';
        
        // 貸出状況の表示
        const lendingStatusEl = document.getElementById('detailLendingStatus');
        lendingStatusEl.innerHTML = '';
        
        if (userDetail.lending_status && userDetail.lending_status.length > 0) {
            userDetail.lending_status.forEach(lending => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${lending.book_id}</td>
                    <td>${lending.title}</td>
                    <td>${lending.checkout_date}</td>
                    <td>${lending.due_date}</td>
                    <td>${lending.status}</td>
                `;
                lendingStatusEl.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" class="text-center">現在の貸出はありません。</td>';
            lendingStatusEl.appendChild(row);
        }
        
        // 編集ボタンのリンク先を設定
        document.getElementById('editUserBtn').href = `user_edit.html?id=${userId}`;
        
        // モーダルを表示
        const modal = new bootstrap.Modal(document.getElementById('userDetailModal'));
        modal.show();
    }
    
    // 状態に応じたバッジクラスの取得
    function getStatusBadgeClass(status) {
        switch (status) {
            case '有効':
                return 'bg-success';
            case '停止':
                return 'bg-warning text-dark';
            case '退会':
                return 'bg-secondary';
            default:
                return 'bg-secondary';
        }
    }
    
    // モック検索結果データ（実際の実装では削除）
    function getMockSearchResults() {
        return {
            total: 85,
            per_page: 10,
            items: [
                {
                    user_id: 1,
                    name: '山田太郎',
                    user_type: '一般',
                    lending_count: 3,
                    status: '有効'
                },
                {
                    user_id: 2,
                    name: '佐藤花子',
                    user_type: '学生',
                    lending_count: 2,
                    status: '有効'
                },
                {
                    user_id: 3,
                    name: '鈴木一郎',
                    user_type: '教職員',
                    lending_count: 5,
                    status: '有効'
                },
                {
                    user_id: 4,
                    name: '高橋次郎',
                    user_type: '一般',
                    lending_count: 0,
                    status: '停止'
                },
                {
                    user_id: 5,
                    name: '田中三郎',
                    user_type: 'シニア',
                    lending_count: 1,
                    status: '有効'
                },
                {
                    user_id: 6,
                    name: '伊藤四郎',
                    user_type: '学生',
                    lending_count: 4,
                    status: '有効'
                },
                {
                    user_id: 7,
                    name: '渡辺五郎',
                    user_type: '一般',
                    lending_count: 0,
                    status: '退会'
                },
                {
                    user_id: 8,
                    name: '山本六郎',
                    user_type: '教職員',
                    lending_count: 2,
                    status: '有効'
                },
                {
                    user_id: 9,
                    name: '中村七郎',
                    user_type: '学生',
                    lending_count: 3,
                    status: '有効'
                },
                {
                    user_id: 10,
                    name: '小林八郎',
                    user_type: '一般',
                    lending_count: 1,
                    status: '有効'
                }
            ]
        };
    }
    
    // モック利用者詳細データ（実際の実装では削除）
    function getMockUserDetail(userId) {
        return {
            user_id: userId,
            name: '山田太郎',
            email: 'yamada@example.com',
            phone: '090-1234-5678',
            birth_date: '1985-05-15',
            address: '東京都新宿区新宿1-1-1',
            user_type: '一般',
            status: '有効',
            created_at: '2023-04-01',
            updated_at: '2023-04-15',
            notes: '特になし',
            lending_status: [
                {
                    book_id: 1,
                    title: 'プログラミング入門',
                    checkout_date: '2023-04-05',
                    due_date: '2023-04-19',
                    status: '貸出中'
                },
                {
                    book_id: 3,
                    title: 'Webアプリケーション開発',
                    checkout_date: '2023-03-30',
                    due_date: '2023-04-13',
                    status: '貸出中'
                },
                {
                    book_id: 5,
                    title: 'AI入門',
                    checkout_date: '2023-04-05',
                    due_date: '2023-04-19',
                    status: '貸出中'
                }
            ]
        };
    }
});
```

## 2. 利用者管理処理（Node.js/Express サーバーサイド）

```javascript
// userController.js
const db = require('../models/db');
const bcrypt = require('bcrypt');

// 利用者登録処理
exports.registerUser = async (req, res) => {
    try {
        const {
            name, email, phone, birthDate, address,
            userType, status, password, notes
        } = req.body;

        // パスワードのハッシュ化
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // トランザクション開始
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 利用者情報の登録
            const result = await client.query(
                `INSERT INTO users 
                 (name, email, phone, birth_date, address, 
                  user_type, status, password, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING user_id`,
                [name, email, phone, birthDate, address, 
                 userType, status, hashedPassword, notes]
            );
            
            const userId = result.rows[0].user_id;

            // トランザクションコミット
            await client.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: '利用者が正常に登録されました',
                data: { userId }
            });
        } catch (error) {
            // トランザクションロールバック
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('利用者登録エラー:', error);
        res.status(500).json({
            success: false,
            message: '利用者の登録に失敗しました',
            error: error.message
        });
    }
};

// 利用者検索処理
exports.searchUsers = async (req, res) => {
    try {
        const {
            userId, name, email, userType, status, phone,
            page = 1, sort = 'name', order = 'ASC'
        } = req.query;
        
        const perPage = 10;
        const offset = (page - 1) * perPage;
        
        // 検索条件の構築
        let conditions = [];
        let params = [];
        let paramIndex = 1;
        
        if (userId) {
            conditions.push(`user_id = $${paramIndex}`);
            params.push(userId);
            paramIndex++;
        }
        
        if (name) {
            conditions.push(`name ILIKE $${paramIndex}`);
            params.push(`%${name}%`);
            paramIndex++;
        }
        
        if (email) {
            conditions.push(`email ILIKE $${paramIndex}`);
            params.push(`%${email}%`);
            paramIndex++;
        }
        
        if (userType) {
            conditions.push(`user_type = $${paramIndex}`);
            params.push(userType);
            paramIndex++;
        }
        
        if (status) {
            conditions.push(`status = $${paramIndex}`);
            params.push(status);
            paramIndex++;
        }
        
        if (phone) {
            conditions.push(`phone ILIKE $${paramIndex}`);
            params.push(`%${phone}%`);
            paramIndex++;
        }
        
        // WHERE句の構築
        const whereClause = conditions.length > 0 
            ? `WHERE ${conditions.join(' AND ')}` 
            : '';
        
        // 並び替え条件の検証
        const validSortFields = ['user_id', 'name', 'email', 'user_type', 'status', 'created_at'];
        const validOrders = ['ASC', 'DESC'];
        
        const sortField = validSortFields.includes(sort) ? sort : 'name';
        const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
        
        // 総件数の取得
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM users
            ${whereClause}
        `;
        
        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);
        
        // 検索結果の取得
        const searchQuery = `
            SELECT u.user_id, u.name, u.email, u.phone, u.user_type, u.status,
                   (SELECT COUNT(*) FROM lendings WHERE user_id = u.user_id AND return_date IS NULL) AS lending_count
            FROM users u
            ${whereClause}
            ORDER BY ${sortField} ${sortOrder}
            LIMIT ${perPage} OFFSET ${offset}
        `;
        
        const searchResult = await db.query(searchQuery, params);
        
        res.status(200).json({
            success: true,
            data: {
                total,
                per_page: perPage,
                current_page: parseInt(page),
                last_page: Math.ceil(total / perPage),
                items: searchResult.rows
            }
        });
    } catch (error) {
        console.error('利用者検索エラー:', error);
        res.status(500).json({
            success: false,
            message: '利用者の検索に失敗しました',
            error: error.message
        });
    }
};

// 利用者詳細取得処理
exports.getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 利用者情報の取得
        const userQuery = `
            SELECT user_id, name, email, phone, birth_date, address,
                   user_type, status, created_at, updated_at, notes
            FROM users
            WHERE user_id = $1
        `;
        
        const userResult = await db.query(userQuery, [id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '指定された利用者が見つかりません'
            });
        }
        
        const user = userResult.rows[0];
        
        // 貸出状況の取得
        const lendingQuery = `
            SELECT l.lending_id, l.book_id, b.biblio_id, bi.title,
                   l.checkout_date, l.due_date, l.status
            FROM lendings l
            JOIN books b ON l.book_id = b.book_id
            JOIN bibliographic_info bi ON b.biblio_id = bi.biblio_id
            WHERE l.user_id = $1 AND l.return_date IS NULL
            ORDER BY l.checkout_date DESC
        `;
        
        const lendingResult = await db.query(lendingQuery, [id]);
        
        // レスポンスの構築
        const response = {
            ...user,
            lending_status: lendingResult.rows
        };
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('利用者詳細取得エラー:', error);
        res.status(500).json({
            success: false,
            message: '利用者の詳細取得に失敗しました',
            error: error.message
        });
    }
};

// 利用者更新処理
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, email, phone, birthDate, address,
            userType, status, password, notes
        } = req.body;

        // トランザクション開始
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            // 利用者の存在確認
            const checkResult = await client.query(
                'SELECT user_id FROM users WHERE user_id = $1',
                [id]
            );
            
            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '指定された利用者が見つかりません'
                });
            }
            
            // 更新フィールドと値の構築
            let updateFields = [];
            let params = [];
            let paramIndex = 1;
            
            if (name) {
                updateFields.push(`name = $${paramIndex}`);
                params.push(name);
                paramIndex++;
            }
            
            if (email) {
                updateFields.push(`email = $${paramIndex}`);
                params.push(email);
                paramIndex++;
            }
            
            if (phone !== undefined) {
                updateFields.push(`phone = $${paramIndex}`);
                params.push(phone);
                paramIndex++;
            }
            
            if (birthDate !== undefined) {
                updateFields.push(`birth_date = $${paramIndex}`);
                params.push(birthDate);
                paramIndex++;
            }
            
            if (address !== undefined) {
                updateFields.push(`address = $${paramIndex}`);
                params.push(address);
                paramIndex++;
            }
            
            if (userType) {
                updateFields.push(`user_type = $${paramIndex}`);
                params.push(userType);
                paramIndex++;
            }
            
            if (status) {
                updateFields.push(`status = $${paramIndex}`);
                params.push(status);
                paramIndex++;
            }
            
            if (notes !== undefined) {
                updateFields.push(`notes = $${paramIndex}`);
                params.push(notes);
                paramIndex++;
            }
            
            // パスワードが提供された場合はハッシュ化して更新
            if (password) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                updateFields.push(`password = $${paramIndex}`);
                params.push(hashedPassword);
                paramIndex++;
            }
            
            // 更新日時を設定
            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            
            // 更新フィールドがない場合
            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '更新するフィールドが指定されていません'
                });
            }
            
            // 更新クエリの実行
            params.push(id);
            const updateQuery = `
                UPDATE users
                SET ${updateFields.join(', ')}
                WHERE user_id = $${paramIndex}
                RETURNING user_id
            `;
            
            await client.query(updateQuery, params);
            
            // トランザクションコミット
            await client.query('COMMIT');
            
            res.status(200).json({
                success: true,
                message: '利用者情報が正常に更新されました',
                data: { userId: id }
            });
        } catch (error) {
            // トランザクションロールバック
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('利用者更新エラー:', error);
        res.status(500).json({
            success: false,
            message: '利用者情報の更新に失敗しました',
            error: error.message
        });
    }
};

// APIルート設定
// userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 利用者登録
router.post('/users', userController.registerUser);

// 利用者検索
router.get('/users', userController.searchUsers);

// 利用者詳細取得
router.get('/users/:id', userController.getUserDetail);

// 利用者更新
router.put('/users/:id', userController.updateUser);

module.exports = router;
```

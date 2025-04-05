# 蔵書検索機能 JavaScript 実装

## 1. 蔵書検索処理（JavaScript クライアントサイド）

```javascript
// book_management.js
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
        searchBooks(1); // 1ページ目から検索
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
            searchBooks(1, sortField);
        });
    });
    
    // 初期表示時に全件検索
    searchBooks(1);
    
    // 蔵書検索処理
    function searchBooks(page, sortField = 'title') {
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
        results.items.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.book_id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(book.status)}">${book.status}</span>
                </td>
                <td>${book.location}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-detail" data-book-id="${book.book_id}">
                        詳細
                    </button>
                </td>
            `;
            searchResults.appendChild(row);
        });
        
        // 詳細ボタンのイベントリスナー
        document.querySelectorAll('.view-detail').forEach(button => {
            button.addEventListener('click', function() {
                const bookId = this.getAttribute('data-book-id');
                showBookDetail(bookId);
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
                    searchBooks(page);
                }
            });
        });
    }
    
    // 蔵書詳細の表示
    function showBookDetail(bookId) {
        // APIリクエスト（実際の実装ではサーバーに送信）
        console.log(`蔵書ID: ${bookId} の詳細を表示`);
        
        // モックデータ（実際の実装では削除）
        const bookDetail = getMockBookDetail(bookId);
        
        // モーダルに詳細情報をセット
        document.getElementById('detailTitle').textContent = bookDetail.title;
        document.getElementById('detailSubtitle').textContent = bookDetail.subtitle || '-';
        document.getElementById('detailAuthor').textContent = bookDetail.author;
        document.getElementById('detailIsbn').textContent = bookDetail.isbn || '-';
        document.getElementById('detailPublisher').textContent = bookDetail.publisher || '-';
        document.getElementById('detailPublicationYear').textContent = bookDetail.publication_year || '-';
        document.getElementById('detailCategory').textContent = bookDetail.category || '-';
        
        document.getElementById('detailBookId').textContent = bookDetail.book_id;
        document.getElementById('detailBarcode').textContent = bookDetail.barcode;
        document.getElementById('detailStatus').textContent = bookDetail.status;
        document.getElementById('detailLocation').textContent = bookDetail.location || '-';
        document.getElementById('detailAcquisitionDate').textContent = bookDetail.acquisition_date || '-';
        document.getElementById('detailPrice').textContent = bookDetail.price ? `${bookDetail.price}円` : '-';
        
        document.getElementById('detailDescription').textContent = bookDetail.description || '説明はありません。';
        
        // 貸出履歴の表示
        const lendingHistoryEl = document.getElementById('detailLendingHistory');
        lendingHistoryEl.innerHTML = '';
        
        if (bookDetail.lending_history && bookDetail.lending_history.length > 0) {
            bookDetail.lending_history.forEach(lending => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${lending.user_name}</td>
                    <td>${lending.checkout_date}</td>
                    <td>${lending.due_date}</td>
                    <td>${lending.return_date || '-'}</td>
                    <td>${lending.status}</td>
                `;
                lendingHistoryEl.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" class="text-center">貸出履歴はありません。</td>';
            lendingHistoryEl.appendChild(row);
        }
        
        // 編集ボタンのリンク先を設定
        document.getElementById('editBookBtn').href = `book_edit.html?id=${bookId}`;
        
        // モーダルを表示
        const modal = new bootstrap.Modal(document.getElementById('bookDetailModal'));
        modal.show();
    }
    
    // 状態に応じたバッジクラスの取得
    function getStatusBadgeClass(status) {
        switch (status) {
            case '利用可能':
                return 'bg-success';
            case '貸出中':
                return 'bg-warning text-dark';
            case '予約中':
                return 'bg-info text-dark';
            case '修理中':
                return 'bg-secondary';
            case '紛失':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }
    
    // モック検索結果データ（実際の実装では削除）
    function getMockSearchResults() {
        return {
            total: 125,
            per_page: 10,
            items: [
                {
                    book_id: 1,
                    title: 'プログラミング入門',
                    author: '山田太郎',
                    status: '利用可能',
                    location: 'A-1-1'
                },
                {
                    book_id: 2,
                    title: 'データベース設計の基礎',
                    author: '佐藤花子',
                    status: '貸出中',
                    location: 'B-2-3'
                },
                // 他の検索結果（省略）
            ]
        };
    }
    
    // モック蔵書詳細データ（実際の実装では削除）
    function getMockBookDetail(bookId) {
        return {
            book_id: bookId,
            biblio_id: 123,
            title: 'プログラミング入門',
            subtitle: 'JavaScript編',
            author: '山田太郎',
            isbn: '9784123456789',
            publisher: '技術書出版',
            publication_year: 2023,
            category: 'コンピュータ / プログラミング',
            barcode: 'B123456789',
            status: '利用可能',
            location: 'A-1-1',
            acquisition_date: '2023-04-01',
            price: 3200,
            description: 'JavaScriptプログラミングの基礎から応用までを解説した入門書です。初心者でも理解しやすいように、豊富な図解とサンプルコードを用いて説明しています。',
            lending_history: [
                {
                    user_name: '佐藤花子',
                    checkout_date: '2023-12-15',
                    due_date: '2023-12-29',
                    return_date: '2023-12-28',
                    status: '返却済'
                },
                // 他の貸出履歴（省略）
            ]
        };
    }
});
```

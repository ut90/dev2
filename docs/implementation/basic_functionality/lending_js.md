# 貸出・返却機能 JavaScript 実装

## 1. 貸出・返却処理（JavaScript クライアントサイド）

```javascript
// lending.js
document.addEventListener('DOMContentLoaded', function() {
    // 要素の取得
    const userIdCheckout = document.getElementById('userIdCheckout');
    const userSearchBtn = document.getElementById('userSearchBtn');
    const userInfoCheckout = document.getElementById('userInfoCheckout');
    const userName = document.getElementById('userName');
    const userType = document.getElementById('userType');
    const lendingCount = document.getElementById('lendingCount');
    const lendingLimit = document.getElementById('lendingLimit');
    const userStatus = document.getElementById('userStatus');
    
    const bookIdCheckout = document.getElementById('bookIdCheckout');
    const bookSearchBtn = document.getElementById('bookSearchBtn');
    const dueDate = document.getElementById('dueDate');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutList = document.getElementById('checkoutList');
    const noCheckouts = document.getElementById('noCheckouts');
    
    const bookIdReturn = document.getElementById('bookIdReturn');
    const bookReturnSearchBtn = document.getElementById('bookReturnSearchBtn');
    const bookInfoReturn = document.getElementById('bookInfoReturn');
    const bookTitle = document.getElementById('bookTitle');
    const bookAuthor = document.getElementById('bookAuthor');
    const checkoutDate = document.getElementById('checkoutDate');
    const bookDueDate = document.getElementById('bookDueDate');
    const borrowerName = document.getElementById('borrowerName');
    const returnCondition = document.getElementById('returnCondition');
    const returnNotes = document.getElementById('returnNotes');
    const returnBtn = document.getElementById('returnBtn');
    const returnList = document.getElementById('returnList');
    const noReturns = document.getElementById('noReturns');
    
    // 現在の日付から2週間後をデフォルトの返却予定日に設定
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    dueDate.valueAsDate = twoWeeksLater;
    
    // 貸出リストと返却リスト
    let checkouts = [];
    let returns = [];
    
    // 利用者検索ボタンのイベントリスナー
    userSearchBtn.addEventListener('click', function() {
        const userId = userIdCheckout.value.trim();
        if (userId) {
            searchUser(userId);
        } else {
            alert('利用者IDまたはバーコードを入力してください');
        }
    });
    
    // 利用者ID入力フィールドのEnterキーイベントリスナー
    userIdCheckout.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const userId = userIdCheckout.value.trim();
            if (userId) {
                searchUser(userId);
            } else {
                alert('利用者IDまたはバーコードを入力してください');
            }
        }
    });
    
    // 蔵書検索ボタン（貸出）のイベントリスナー
    bookSearchBtn.addEventListener('click', function() {
        const bookId = bookIdCheckout.value.trim();
        if (bookId) {
            searchBookForCheckout(bookId);
        } else {
            alert('蔵書IDまたはバーコードを入力してください');
        }
    });
    
    // 蔵書ID入力フィールド（貸出）のEnterキーイベントリスナー
    bookIdCheckout.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const bookId = bookIdCheckout.value.trim();
            if (bookId) {
                searchBookForCheckout(bookId);
            } else {
                alert('蔵書IDまたはバーコードを入力してください');
            }
        }
    });
    
    // 貸出ボタンのイベントリスナー
    checkoutBtn.addEventListener('click', function() {
        const bookId = bookIdCheckout.value.trim();
        if (bookId) {
            checkoutBook(bookId);
        } else {
            alert('蔵書IDまたはバーコードを入力してください');
        }
    });
    
    // 蔵書検索ボタン（返却）のイベントリスナー
    bookReturnSearchBtn.addEventListener('click', function() {
        const bookId = bookIdReturn.value.trim();
        if (bookId) {
            searchBookForReturn(bookId);
        } else {
            alert('蔵書IDまたはバーコードを入力してください');
        }
    });
    
    // 蔵書ID入力フィールド（返却）のEnterキーイベントリスナー
    bookIdReturn.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const bookId = bookIdReturn.value.trim();
            if (bookId) {
                searchBookForReturn(bookId);
            } else {
                alert('蔵書IDまたはバーコードを入力してください');
            }
        }
    });
    
    // 返却ボタンのイベントリスナー
    returnBtn.addEventListener('click', function() {
        const bookId = bookIdReturn.value.trim();
        if (bookId) {
            returnBook(bookId);
        } else {
            alert('蔵書IDまたはバーコードを入力してください');
        }
    });
    
    // 利用者検索処理
    function searchUser(userId) {
        // APIリクエスト（実際の実装ではサーバーに送信）
        console.log(`利用者ID: ${userId} を検索`);
        
        // モックデータ（実際の実装では削除）
        const mockUser = {
            user_id: 1,
            name: '山田太郎',
            user_type: '一般',
            lending_count: 3,
            lending_limit: 5,
            status: '有効'
        };
        
        // 利用者情報の表示
        displayUserInfo(mockUser);
    }
    
    // 利用者情報の表示
    function displayUserInfo(user) {
        userName.textContent = user.name;
        userType.textContent = user.user_type;
        lendingCount.textContent = user.lending_count;
        lendingLimit.textContent = user.lending_limit;
        
        // 状態に応じたバッジクラスの設定
        userStatus.textContent = user.status;
        userStatus.className = 'badge';
        
        switch (user.status) {
            case '有効':
                userStatus.classList.add('bg-success');
                break;
            case '停止':
                userStatus.classList.add('bg-warning', 'text-dark');
                break;
            case '退会':
                userStatus.classList.add('bg-secondary');
                break;
            default:
                userStatus.classList.add('bg-secondary');
        }
        
        // 利用者情報を表示
        userInfoCheckout.classList.remove('d-none');
        
        // 貸出リストの更新
        updateCheckoutList();
    }
    
    // 蔵書検索処理（貸出用）
    function searchBookForCheckout(bookId) {
        // APIリクエスト（実際の実装ではサーバーに送信）
        console.log(`蔵書ID: ${bookId} を検索（貸出用）`);
        
        // モックデータ（実際の実装では削除）
        const mockBook = {
            book_id: 1,
            title: 'プログラミング入門',
            author: '山田太郎',
            status: '利用可能'
        };
        
        // 蔵書の状態チェック
        if (mockBook.status !== '利用可能') {
            alert(`この蔵書は現在 ${mockBook.status} 状態のため、貸出できません。`);
            return;
        }
        
        // 利用者の貸出上限チェック
        const currentLendingCount = parseInt(lendingCount.textContent);
        const lendingLimitValue = parseInt(lendingLimit.textContent);
        
        if (currentLendingCount >= lendingLimitValue) {
            alert('貸出上限数に達しているため、これ以上貸出できません。');
            return;
        }
        
        // 貸出処理の準備完了
        bookIdCheckout.value = bookId;
    }
    
    // 貸出処理
    function checkoutBook(bookId) {
        // APIリクエスト（実際の実装ではサーバーに送信）
        console.log(`蔵書ID: ${bookId} を貸出処理`);
        
        // モックデータ（実際の実装では削除）
        const mockCheckout = {
            lending_id: Date.now(),
            book_id: bookId,
            title: 'プログラミング入門',
            due_date: dueDate.value
        };
        
        // 貸出リストに追加
        checkouts.push(mockCheckout);
        
        // 貸出リストの更新
        updateCheckoutList();
        
        // 貸出数の更新
        lendingCount.textContent = parseInt(lendingCount.textContent) + 1;
        
        // 入力フィールドのクリア
        bookIdCheckout.value = '';
        
        // 貸出完了モーダルの表示
        showCheckoutCompleteModal(mockCheckout);
    }
    
    // 貸出リストの更新
    function updateCheckoutList() {
        if (checkouts.length === 0) {
            checkoutList.innerHTML = '';
            noCheckouts.style.display = 'block';
            return;
        }
        
        noCheckouts.style.display = 'none';
        checkoutList.innerHTML = '';
        
        checkouts.forEach(checkout => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${checkout.book_id}</td>
                <td>${checkout.title}</td>
                <td>${formatDate(checkout.due_date)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger cancel-checkout" data-lending-id="${checkout.lending_id}">
                        取消
                    </button>
                </td>
            `;
            checkoutList.appendChild(row);
        });
        
        // 取消ボタンのイベントリスナー
        document.querySelectorAll('.cancel-checkout').forEach(button => {
            button.addEventListener('click', function() {
                const lendingId = this.getAttribute('data-lending-id');
                cancelCheckout(lendingId);
            });
        });
    }
    
    // 貸出取消処理
    function cancelCheckout(lendingId) {
        // APIリクエスト（実際の実装ではサーバーに送信）
        console.log(`貸出ID: ${lendingId} の取消処理`);
        
        // 貸出リストから削除
        checkouts = checkouts.filter(checkout => checkout.lending_id != lendingId);
        
        // 貸出リストの更新
        updateCheckoutList();
        
        // 貸出数の更新
        lendingCount.textContent = parseInt(lendingCount.textContent) - 1;
    }
    
    // 日付のフォーマット
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    
    // 貸出完了モーダルの表示
    function showCheckoutCompleteModal(checkout) {
        document.getElementById('completeTitle').textContent = checkout.title;
        document.getElementById('completeBookId').textContent = checkout.book_id;
        document.getElementById('completeUserName').textContent = userName.textContent;
        document.getElementById('completeDueDate').textContent = formatDate(checkout.due_date);
        
        const modal = new bootstrap.Modal(document.getElementById('checkoutCompleteModal'));
        modal.show();
    }
    
    // 以下は返却処理の関数
    // 蔵書検索処理（返却用）
    function searchBookForReturn(bookId) {
        // APIリクエスト（実際の実装ではサーバーに送信）
        console.log(`蔵書ID: ${bookId} を検索（返却用）`);
        
        // モックデータ（実際の実装では削除）
        const mockLending = {
            lending_id: 123,
            book_id: bookId,
            title: 'プログラミング入門',
            author: '山田太郎',
            checkout_date: '2023-04-01',
            due_date: '2023-04-15',
            borrower_name: '山田太郎',
            status: '貸出中'
        };
        
        // 蔵書の状態チェック
        if (mockLending.status !== '貸出中') {
            alert('この蔵書は現在貸出中ではありません。');
            return;
        }
        
        // 蔵書情報の表示
        displayBookInfo(mockLending);
    }
    
    // 蔵書情報の表示（返却用）
    function displayBookInfo(lending) {
        bookTitle.textContent = lending.title;
        bookAuthor.textContent = lending.author;
        checkoutDate.textContent = formatDate(lending.checkout_date);
        bookDueDate.textContent = formatDate(lending.due_date);
        borrowerName.textContent = lending.borrower_name;
        
        // 蔵書情報を表示
        bookInfoReturn.classList.remove('d-none');
    }
    
    // 返却処理
    function returnBook(bookId) {
        // APIリクエスト（実際の実装ではサーバーに送信）
        console.log(`蔵書ID: ${bookId} を返却処理`);
        
        // モックデータ（実際の実装では削除）
        const mockReturn = {
            lending_id: 123,
            book_id: bookId,
            title: 'プログラミング入門',
            borrower_name: borrowerName.textContent,
            condition: returnCondition.value,
            notes: returnNotes.value
        };
        
        // 返却リストに追加
        returns.push(mockReturn);
        
        // 返却リストの更新
        updateReturnList();
        
        // 入力フィールドのクリア
        bookIdReturn.value = '';
        returnNotes.value = '';
        returnCondition.value = '良好';
        
        // 蔵書情報を非表示
        bookInfoReturn.classList.add('d-none');
        
        // 返却完了モーダルの表示
        showReturnCompleteModal(mockReturn);
    }
    
    // 返却リストの更新
    function updateReturnList() {
        if (returns.length === 0) {
            returnList.innerHTML = '';
            noReturns.style.display = 'block';
            return;
        }
        
        noReturns.style.display = 'none';
        returnList.innerHTML = '';
        
        returns.forEach(returnItem => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${returnItem.book_id}</td>
                <td>${returnItem.title}</td>
                <td>${returnItem.borrower_name}</td>
                <td>${returnItem.condition}</td>
            `;
            returnList.appendChild(row);
        });
    }
    
    // 返却完了モーダルの表示
    function showReturnCompleteModal(returnItem) {
        document.getElementById('returnCompleteTitle').textContent = returnItem.title;
        document.getElementById('returnCompleteBookId').textContent = returnItem.book_id;
        document.getElementById('returnCompleteUserName').textContent = returnItem.borrower_name;
        document.getElementById('returnCompleteCondition').textContent = returnItem.condition;
        
        const modal = new bootstrap.Modal(document.getElementById('returnCompleteModal'));
        modal.show();
    }
});
```

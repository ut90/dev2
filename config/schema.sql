
CREATE TABLE bibliographic_info (
    biblio_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    isbn VARCHAR(20),
    publisher VARCHAR(100),
    publication_year INTEGER,
    language VARCHAR(50) DEFAULT '日本語',
    page_count INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    biography TEXT,
    birth_year INTEGER,
    death_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_authors (
    id SERIAL PRIMARY KEY,
    biblio_id INTEGER NOT NULL REFERENCES bibliographic_info(biblio_id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES authors(author_id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT '著者',
    UNIQUE (biblio_id, author_id, role)
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER REFERENCES categories(category_id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_categories (
    id SERIAL PRIMARY KEY,
    biblio_id INTEGER NOT NULL REFERENCES bibliographic_info(biblio_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    UNIQUE (biblio_id, category_id)
);

CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    biblio_id INTEGER NOT NULL REFERENCES bibliographic_info(biblio_id),
    barcode VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT '利用可能',
    location VARCHAR(100),
    acquisition_date DATE,
    price DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    address TEXT,
    phone VARCHAR(20),
    birth_date DATE,
    user_type VARCHAR(50) DEFAULT '一般',
    status VARCHAR(50) DEFAULT '有効',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT '一般スタッフ',
    status VARCHAR(50) DEFAULT '有効',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE lendings (
    lending_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(book_id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    checkout_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(50) DEFAULT '貸出中',
    renewals_count INTEGER DEFAULT 0,
    return_condition VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservations (
    reservation_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(book_id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    reservation_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT '予約中',
    notification_sent BOOLEAN DEFAULT FALSE,
    expiration_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_biblio_id ON books(biblio_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_book_authors_biblio_id ON book_authors(biblio_id);
CREATE INDEX idx_book_authors_author_id ON book_authors(author_id);
CREATE INDEX idx_book_categories_biblio_id ON book_categories(biblio_id);
CREATE INDEX idx_book_categories_category_id ON book_categories(category_id);
CREATE INDEX idx_lendings_book_id ON lendings(book_id);
CREATE INDEX idx_lendings_user_id ON lendings(user_id);
CREATE INDEX idx_lendings_status ON lendings(status);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_status ON reservations(status);


INSERT INTO categories (name, parent_id, description) VALUES
('文学', NULL, '文学作品全般'),
('小説', 1, '小説作品'),
('詩歌', 1, '詩や短歌、俳句など'),
('エッセイ', 1, 'エッセイや随筆'),
('自然科学', NULL, '自然科学全般'),
('物理学', 5, '物理学関連'),
('化学', 5, '化学関連'),
('生物学', 5, '生物学関連'),
('社会科学', NULL, '社会科学全般'),
('経済学', 9, '経済学関連'),
('社会学', 9, '社会学関連'),
('歴史', NULL, '歴史全般'),
('日本史', 12, '日本の歴史'),
('世界史', 12, '世界の歴史'),
('芸術', NULL, '芸術全般'),
('音楽', 15, '音楽関連'),
('美術', 15, '美術関連'),
('コンピュータ', NULL, 'コンピュータ全般'),
('プログラミング', 18, 'プログラミング関連'),
('データベース', 18, 'データベース関連'),
('ネットワーク', 18, 'ネットワーク関連');

INSERT INTO staff (name, email, password, role) VALUES
('管理者', 'admin@example.com', '$2b$10$X7VYHy.iOBvD3aPD9chZ4.LG.6JJ8dBvKIm/zhRrO.IHGWn9JG.Wy', '管理者');

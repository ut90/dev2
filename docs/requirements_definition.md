# 図書館管理システム 要件定義書

## 1. システム概要

### 1.1 目的
本システムは、図書館の日常業務を効率化し、利用者へのサービス向上を図るための総合的な図書館管理システムである。蔵書管理、利用者管理、貸出・返却処理、検索機能などを統合し、図書館スタッフの業務負担軽減と利用者の利便性向上を実現する。

### 1.2 範囲
本システムは以下の業務範囲をカバーする：
- 蔵書管理（登録、更新、廃棄）
- 利用者管理（登録、更新、削除）
- 貸出・返却処理
- 蔵書検索
- 予約管理
- 延滞管理
- 統計・レポート生成
- 通知管理

### 1.3 ステークホルダー
- 図書館管理者：システム全体の管理と運用を担当
- 図書館スタッフ：日常業務での利用者
- 図書館利用者：蔵書検索、予約、貸出状況確認などの利用者
- システム管理者：技術的な保守・運用担当者

### 1.4 用語定義
| 用語 | 定義 |
|------|------|
| 蔵書 | 図書館が所有する書籍、雑誌、視聴覚資料などの資料 |
| 利用者 | 図書館サービスを利用する個人または団体 |
| 貸出 | 利用者が蔵書を一定期間借りること |
| 返却 | 借りた蔵書を図書館に戻すこと |
| 予約 | 現在貸出中の蔵書に対して、返却後の貸出を予約すること |
| 延滞 | 貸出期限を過ぎても返却されていない状態 |

## 2. 機能要件

### 2.1 蔵書管理機能
#### 2.1.1 蔵書登録
- 新規蔵書の登録機能
- ISBN、タイトル、著者、出版社、出版年、ジャンル、概要などの情報を登録
- バーコードまたはRFIDタグの発行・管理
- 複本（同一書籍の複数所蔵）の管理

#### 2.1.2 蔵書情報更新
- 既存蔵書情報の更新機能
- 蔵書状態（利用可能、貸出中、修理中、紛失など）の管理
- 蔵書の配置場所（書架、特別コレクションなど）の管理

#### 2.1.3 蔵書廃棄
- 不要となった蔵書の廃棄処理
- 廃棄理由の記録
- 廃棄履歴の管理

#### 2.1.4 蔵書棚卸
- 定期的な蔵書点検機能
- 不明蔵書の特定
- 棚卸結果レポートの生成

### 2.2 利用者管理機能
#### 2.2.1 利用者登録
- 新規利用者の登録機能
- 氏名、住所、連絡先、生年月日などの基本情報登録
- 利用者カードの発行
- 利用者区分（一般、学生、教職員など）の設定

#### 2.2.2 利用者情報更新
- 既存利用者情報の更新機能
- パスワードリセット機能
- 利用者状態（有効、停止、退会など）の管理

#### 2.2.3 利用者削除
- 退会した利用者の削除または非アクティブ化
- 個人情報保護に配慮した削除処理

### 2.3 貸出・返却管理
#### 2.3.1 貸出処理
- バーコードまたはRFIDによる迅速な貸出処理
- 貸出期限の自動計算
- 貸出制限（延滞中、上限冊数超過など）のチェック
- 貸出履歴の記録

#### 2.3.2 返却処理
- バーコードまたはRFIDによる迅速な返却処理
- 延滞料金の自動計算（該当する場合）
- 予約待ち蔵書の自動検出と通知
- 返却履歴の記録

#### 2.3.3 貸出延長
- オンラインまたはカウンターでの貸出期間延長機能
- 延長条件（予約なし、延長回数制限内など）の自動チェック
- 延長履歴の記録

#### 2.3.4 延滞管理
- 延滞蔵書の自動検出
- 延滞通知の自動生成
- 延滞料金の計算と管理
- 長期延滞者への対応管理

### 2.4 検索機能
#### 2.4.1 基本検索
- タイトル、著者、キーワードによる検索
- 検索結果の並べ替え（関連性、出版年、タイトルなど）
- 検索結果の絞り込み（資料種別、言語、配置場所など）

#### 2.4.2 詳細検索
- 複数条件を組み合わせた高度な検索
- ISBN/ISSN検索
- 分類記号による検索
- 全文検索（電子資料の場合）

#### 2.4.3 外部データベース連携
- 国立国会図書館などの外部データベースとの連携検索
- 書誌情報の自動取得

### 2.5 予約管理
#### 2.5.1 予約登録
- 貸出中蔵書の予約機能
- 予約順位の管理
- 予約可能冊数の制限管理

#### 2.5.2 予約キャンセル
- 予約のキャンセル機能
- キャンセル時の次順位者への自動通知

#### 2.5.3 予約状況確認
- 利用者による予約状況確認機能
- スタッフによる予約一覧管理

### 2.6 通知システム
#### 2.6.1 自動通知
- 貸出期限通知（事前リマインダー）
- 延滞通知
- 予約到着通知
- 新着資料通知

#### 2.6.2 通知方法
- Eメール通知
- SMS通知
- アプリ内プッシュ通知
- 郵送通知（オプション）

### 2.7 統計・レポート機能
#### 2.7.1 利用統計
- 貸出統計（期間別、資料種別別、利用者区分別など）
- 予約統計
- 利用者統計

#### 2.7.2 蔵書統計
- 蔵書構成分析
- 新規受入統計
- 廃棄統計

#### 2.7.3 カスタムレポート
- 管理者によるカスタムレポート作成機能
- レポートのエクスポート（CSV、PDF、Excelなど）

### 2.8 システム管理機能
#### 2.8.1 ユーザー管理
- スタッフアカウントの管理
- 権限設定（管理者、一般スタッフなど）
- アクセスログの記録

#### 2.8.2 マスタデータ管理
- 資料種別、利用者区分などのマスタデータ管理
- 休館日設定
- 貸出ルール設定（期間、冊数制限など）

#### 2.8.3 バックアップ・リストア
- データの定期バックアップ
- バックアップからのリストア機能

## 3. STEP1実装範囲

STEP1では、以下の優先順位で実装を進める：

### 3.1 UI設計（最優先）
- 画面遷移図の作成
- 主要画面のモックアップ作成
  - スタッフ用：ログイン画面、ダッシュボード、蔵書管理画面、利用者管理画面、貸出・返却画面
  - 利用者用：ログイン画面、ホーム画面、蔵書検索画面、貸出状況確認画面

### 3.2 データモデル設計（次優先）
- エンティティ関連図の作成
- データベーススキーマの定義
  - 蔵書関連テーブル
  - 利用者関連テーブル
  - 貸出・返却関連テーブル

### 3.3 基本機能実装
- 蔵書管理機能
  - 蔵書登録
  - 蔵書検索
- 利用者管理機能
  - 利用者登録
  - 利用者検索
- 貸出・返却機能
  - 貸出処理
  - 返却処理

## 4. 制約条件

### 4.1 技術的制約
- 既存図書館システムからのデータ移行が必要
- オープンソースソフトウェアの積極的活用
- クラウドベースのシステム構築

### 4.2 ビジネス制約
- 予算上限：初期開発2000万円、年間運用費300万円以内
- 開発期間：12ヶ月以内
- 段階的リリース（フェーズ分け）の実施

### 4.3 法的制約
- 個人情報保護法の遵守
- 著作権法の遵守
- アクセシビリティ法制への対応
- データセキュリティ規制の遵守

## 5. 前提条件

### 5.1 システム導入の前提条件
- 既存図書館業務フローの見直しと標準化
- スタッフへのトレーニング実施
- 蔵書データの整備（書誌情報、所蔵情報）
- 利用者データの整備

### 5.2 運用環境の前提条件
- 安定したインターネット接続環境
- バーコードリーダーまたはRFIDリーダーの導入
- 適切なハードウェア環境（PC、タブレット、プリンタなど）
- バックアップ用ストレージの確保

## 6. 将来拡張性

### 6.1 短期的拡張計画（1-2年）
- モバイルアプリの開発
- 電子書籍管理機能の追加
- セルフチェックアウト機能の実装

### 6.2 中長期的拡張計画（3-5年）
- AI活用による蔵書推薦システム
- ビッグデータ分析による利用傾向把握
- 他図書館とのネットワーク連携
- IoT活用による書架管理の自動化

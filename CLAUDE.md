# BEElog CLAUDE.md

## プロジェクト概要
養蜂×ティーン向けのブログ・アクティビティ探索サイト。
PWAとして運用。UI大規模改修完了済み。残タスクはSEO対応。

## 技術スタック
- Next.js 15
- Notion API（コンテンツ管理）
- PWA

## デザインシステム

### カラー
| トークン | HEX | 用途 |
|---|---|---|
| Ivory | #FFFFEE | 背景・ベース |
| Navy | #092040 | テキスト・ヘッダー |
| Yellow | #FCBC2A | アクセント・CTA・ブランド |

### スタイル方針
- ネイビーカード枠線
- アイボリー背景
- アニメーションあり（UI改修済み）

### フォント
- 日本語: Noto Sans CJK JP

## 残タスク
- [ ] 内部リンク強化（SEOインデックス問題）
- [ ] 記事リライト

## コーディング規約
- コンポーネントはPascalCase
- ファイル名はkebab-case
- Notion APIアクセスは `lib/notion.ts` に集約

## 禁止事項
- `any` 型の使用
- `console.log` のコミット混入

# BEElog CLAUDE.md

## プロジェクト概要
10代のための課外活動メディア。
PWAとして運用。UI大規模改修完了済み。残タスクはSEO対応。

## 技術スタック
- Next.js 15
- Notion API（コンテンツ管理）
- PWA

## デザインシステム

### カラー
| トークン | HEX | 用途 |
|---|---|---|
| Ivory | #FFFFF0 | 背景・ベース |
| Navy | #092040 | テキスト・ヘッダー |
| Yellow | #FCBC2A | アクセント・CTA・ブランド |

> 正規アイボリー = **#FFFFF0**。旧アイボリー値は全廃・使用禁止（#FFFFF0 に統一済み）。
> 例外: About リッチレイヤー専用の地色変数 `--paper: #fffef0` / `--paper-soft: #fffff6` は別系統として維持（#FFFFF0 に畳まない）。

### スタイル方針
- ネイビーカード枠線
- アイボリー背景
- アニメーションあり（UI改修済み）

### フォント
- 日本語: Noto Sans CJK JP
- Inter: **About リッチレイヤー専用**（`about.css` の一部見出しのみ）。本体UIでは使用禁止。

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

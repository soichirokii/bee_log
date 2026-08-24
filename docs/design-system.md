# BEE log デザインシステム

このドキュメントは2層で構成される。**原則層（§0〜§4）＝意図・方針**を先に置き、**実測層（§5〜§12）＝実装から抽出した現状値**をその根拠として後段に、末尾に**リッチレイヤー（§13）＝About**を置く。新規実装ではまず §0 を読む。

- 抽出日: 2026-08-12
- 対象: `src/` 配下の実装（Tailwind ユーティリティのハードコードを含む）
- 技術: Next.js 15 / TypeScript / Tailwind CSS / Notion API

> 注意: Tailwind の `theme.extend` に登録されている色は `navy` / `yellow` の2つだけで、他の色・余白・角丸・影はすべて任意値（`bg-[#...]` 等）でコンポーネントに直接記述されている。§12「トークン化されていない箇所」を参照。

---
## 0. このドキュメントの使い方（AI向け・最優先）

新しいページ・機能・コンポーネントを作るときは、まずこの章を読む。以下を守る。

1. **色・余白・角丸は必ずトークン（意図）で選ぶ。** 新しい arbitrary 値（`bg-[#...]` 等）を増やさない。既存の値で足りない場合は「増やす前に相談」が原則。
2. **禁止事項（§2）を守る。** AIくさい表現・演出を出さない。
3. **既定はコアレイヤー（§1）で作る。** About と同じ質感を明示的に求められたときだけ、リッチレイヤー（§13）を参照する。両者を混ぜない。
4. **迷ったら「事実が主役」（§2 原則1）に戻る。** 情報が最速で読める方を選ぶ。

このサイトは「探せるメディア」。装飾より情報到達を常に優先する。

---
## 1. レイヤー構成

BEE log のデザインは2層で構成される。

| レイヤー | 対象 | 表現の方向 |
|---|---|---|
| **コア** | トップ・探す・詳細・その他ほぼ全ページ | ハードシャドウのステッカー系。navy テキスト＋Honey塗り＋アイボリー地。情報密度優先。 |
| **リッチ**（§13） | About、将来のLP・キャンペーンページ | 方眼グリッド＋黄マーカー＋iMessage風UI＋GSAPスクロール演出。表現優先。 |

**両者が共有するのは navy / yellow の2色と跳ね返りイージング `cubic-bezier(0.34,1.56,0.64,1)` のみ。** それ以外（背景・タイポスケール・グレー系・単位系・影の有無）は別物。**混在させない。**

---
## 2. デザイン原則

1. **事実が主役** — コピーやビジュアルより、活動情報そのものが最速で読める状態を優先する。
2. **AIくさくない** — 汎用ヒーローバナー・過度なアニメ・マーケ的煽りを使わない。
3. **中立・フラット** — 主催者や活動を持ち上げない。10代が自分で判断できる材料を並べる。
4. **ブランドは隠し味** — Honey / Navy / ミツバチは下地とアクセント。可読性を最優先。

### 禁止事項

- 意味のない全画面ヒーロー、ストックフォト的ビジュアル
- 「未来が変わる」式の情緒コピー、感嘆符での煽り
- 常時ループするアニメ、視差スクロールの多用（コアでは使わない）
- 絵文字の多用（アイコンは `public/icons` のSVGに統一）
- 新しいデザイントークン・arbitrary色の無断追加

### トーン & ボイス

事実ベース・簡潔・中立。常体（〜だ／〜できる）。

- ✅「締切は12月1日。オンラインで応募できる。」
- ❌「今すぐ応募して、夢への一歩を踏み出そう！」

マイクロコピー：ボタンは動詞で短く（「応募する」「詳細を見る」）。空状態は事実＋次の一手（「該当する活動はまだない。カテゴリを変えて探せる。」）。バッジは状態を短く（「締切間近」「募集中」）。

---
## 3. セマンティックトークン層

実装は現状 arbitrary 値でハードコードされているが、**意図としては以下のトークンで考える。** 新規実装はこの役割で色を選ぶ。実測の全色一覧は §5 を参照。

| トークン | 値 | 役割 |
|---|---|---|
| `surface` | `#FFFFF0` | body・カード・ページ地（**アイボリーはこの1値に統一**。`#FFFFEE` は廃止） |
| `text` | `#092040`（Navy） | 本文・見出し・アイコン既定色 |
| `accent` | `#FCBC2A`（Honey） | CTA塗り・強調・締切ストリップ・タグ |
| `danger` | （実装の締切赤を採用） | 締切間近バッジ・警告 |

### 色のルール

- **Honey は塗り専用。文字色にしない。** `#FCBC2A` を白/クリーム上のテキストにするとコントラスト不足（WCAG不合格）。Honey塗りの上のテキストは必ず Navy。
- **Navy はテキスト/アイコンの既定。** surface・白の上でのみ使う。
- **アイボリーは `#FFFFF0` の1値のみ。** 過去の `#FFFFEE` は使わない。

---
## 4. フォント方針

| フォント | 役割 | レイヤー |
|---|---|---|
| Noto Sans JP | 本文・UI全般（既定） | コア／リッチ共通 |
| toppan-bunkyu-midashi-gothic（Adobe） | 見出し | コア |
| **Inter** | **About の欧文見出し専用**（`.map-caption` 等）。**本体UIでの新規使用は禁止** | リッチのみ |

Inter は Tailwind に未登録で、本体UIへの適用経路はない。About リッチレイヤー内に閉じている。新しいコアページで Inter を呼ばない。実測の詳細は §6.1 を参照。

---

> **ここから §5〜§12 は実測層** — 上記原則（§0〜§4）の根拠となる現状の抽出。実装から機械抽出した値で、原則の裏付けとして参照する。「未定義」と記した項目は実装上トークン化・明示定義されていないもの。

---

## 5. カラー

### 5.1 Tailwind カスタム色（[tailwind.config.js](../tailwind.config.js)）

theme拡張に登録されているのは以下2色のみ。

| Tailwind名 | HEX | 定義 |
|---|---|---|
| `navy` | `#092040` | [tailwind.config.js:9](../tailwind.config.js) |
| `yellow` | `#FCBC2A` | [tailwind.config.js:10](../tailwind.config.js) |

補足: 登録はされているが、実コード内では `navy` / `yellow` クラスよりも任意値 `text-[#092040]` / `bg-[#FCBC2A]` が圧倒的に多用されている。

### 5.2 実使用HEX一覧（`src/` 全体を機械抽出）

出現回数はソースコード内の文字列出現数。

| HEX | 回数 | 役割 | 代表的な出典 |
|---|---|---|---|
| `#092040` | 189 | テキスト・枠線・ヘッダー・CTA文字色（ネイビー） | 全体 |
| `#FCBC2A` | 47 | アクセント・CTA背景・ブランド（イエロー/ハニー） | 全体 |
| `#FFFFF0` | 50 | **主要背景・唯一の正規アイボリー**（body相当・カード・ページ地・Navbar・モバイルメニュー・カテゴリタグ地・ボトムシート） | [ActivityCard.tsx:38,84](../src/app/components/ActivityCard.tsx)、[Navbar.tsx:117,118](../src/app/components/Navbar.tsx)、[categories.ts:28](../src/constants/categories.ts) |
| `#EF4444` | 14 | 締切間近・締切日・警告（レッド） | [ActivityCard.tsx:76,77,91,96](../src/app/components/ActivityCard.tsx) |
| `#4ADE80` | 2 | 「無料」バッジ地（グリーン） | [ActivityCard.tsx:73](../src/app/components/ActivityCard.tsx)、[TopPageClient.tsx:46](../src/app/TopPageClient.tsx) |
| `#F59E0B` | 1 | 季節タグ（夏休み等）バッジ地（アンバー） | [ActivityCard.tsx:67](../src/app/components/ActivityCard.tsx) |
| `#06C755` | 1 | LINE公式ブランドグリーン | [LinePopup.tsx:58](../src/app/components/LinePopup.tsx) |

`#FFFFF0`（body背景）は [layout.tsx:90](../src/app/layout.tsx) で `bg-[#FFFFF0]` として指定されている。役割別トークンとの対応は §3 を参照。

> **アイボリー統一の経緯**: 以前は別系統アイボリー `#FFFFEE`（Navbar・モバイルメニュー・カテゴリタグ地・ボトムシート等、本体UI16箇所＋about.css3箇所＝計19箇所）が `#FFFFF0` と混在していたが、**現在は全19箇所を `#FFFFF0` に統一し `#FFFFEE` は廃止**（コード内の使用は0件）。上表の `#FFFFF0` 回数はこの統合分（旧31＋旧19）を反映。以後 `#FFFFEE` は使用禁止。例外として About 専用の地色変数 `--paper: #fffef0` / `--paper-soft: #fffff6` のみ別系統として維持（§5.3 / §13 参照）。

### 5.3 About ページ専用色（[src/app/about/about.css](../src/app/about/about.css)）

About ページは Tailwind を使わず 1,624 行の専用CSSを持ち、独自の色を定義している（コアとは別レイヤー。意図的な第2デザインシステムとして §13 で詳述）。

`#111` / `#F00` / `#147AF3` / `#929290` / `#BDBDBF` / `#E5E5EA` / `#E8E8E8` / `#F5F5F5` / `#FFF` / `#FFFEF0` / `#FFFFF6` / `#092040` / `#FCBC2A`

→ ネイビー・イエロー以外はこのファイルにしか登場しない。設計上の位置づけは §13 を参照。

> 注: about.css にはかつて `#FFFFEE`（3箇所, L1443/1506/1581）があったが、アイボリー統一で `#FFFFF0` に置換済み。地色変数 `--paper: #fffef0` / `--paper-soft: #fffff6` は統一対象外で従来どおり。

### 5.4 rgba 使用一覧

| rgba | 用途 | 出典 |
|---|---|---|
| `rgba(9,32,64,0.9)` | ハードシャドウ（スクロール後Navbar・ステッカーVIEW MORE） | [Navbar.tsx:117](../src/app/components/Navbar.tsx)、[TopPageClient.tsx:208](../src/app/TopPageClient.tsx) |
| `rgba(255,255,240,0.82)` | スクロール後Navbar地（半透明＋blur。#FFFFF0=正規アイボリーの半透明形） | [Navbar.tsx:117,191](../src/app/components/Navbar.tsx) |
| `rgba(9, 32, 64, 0.42)` | 活動カードのホバーリビール幕 | [globals.css:68](../src/app/globals.css) |
| `rgba(9,32,64,0.15)` | Heroスライダー矢印ボタンの影 | [TopPageClient.tsx:129,134](../src/app/TopPageClient.tsx) |
| `rgba(9,32,64,0.2)` | ボトムシートのグラバーバー | [SearchClient.tsx:340](../src/app/search/SearchClient.tsx) |
| `rgba(252, 188, 42, …)` (0.45/0.5/0.62) | About ページ内の装飾 | [about.css](../src/app/about/about.css) |

> 注: スクロール後Navbar地の半透明アイボリーも `rgba(255,255,240,0.82)`（=#FFFFF0 の半透明形、alpha不変）に統一済み。旧 `rgba(255,255,238,…)`（=#FFFFEE系）はコード内0件。

### 5.5 Tailwind標準グレー（任意値でなくユーティリティ）

補助色として Tailwind 既定のグレースケールを併用している（HEXは未指定＝Tailwind既定値）。

- `text-gray-400`（主催者名・補助テキスト・締切済み・キャプション）
- `text-gray-700` / `text-gray-600`（本文段落・引用）
- `bg-gray-200`（画像プレースホルダ・スケルトン）、`bg-gray-100`（無効ボタン地・閉じるボタン）
- `border-gray-200` / `border-gray-100`（フッター区切り・カード内区切り）
- `bg-gray-900 text-green-400`（コードブロック [posts/[slug]/page.tsx:111](../src/app/posts/[slug]/page.tsx)）
- `bg-red-50`（モバイル応募バーの締切ボックス [MobileApplyButton.tsx:33](../src/app/components/MobileApplyButton.tsx)）

---

## 6. タイポグラフィ

### 6.1 フォントファミリ（[layout.tsx](../src/app/layout.tsx)）

3系統を併用。方針は §4 を参照。

| フォント | 読み込み方式 | ウェイト | CSS変数 | 出典 |
|---|---|---|---|---|
| Noto Sans JP | `next/font/google` | 400,500,700,800,900 | `--font-noto-sans-jp` | [layout.tsx:11-17](../src/app/layout.tsx) |
| Inter | `next/font/google` | 500,700,800 | `--font-inter` | [layout.tsx:19-24](../src/app/layout.tsx) |
| toppan-bunkyu-midashi-gothic | Adobe Fonts / Typekit（`use.typekit.net/qhn8cay.css`） | — | — | [layout.tsx:86-87](../src/app/layout.tsx) |

- `next/font` の Noto Sans JP は `preload: false`、`display: "swap"`（[layout.tsx:16-17](../src/app/layout.tsx)）。
- Tailwind の `font-sans` は `var(--font-noto-sans-jp) → Noto Sans JP → sans-serif`（[tailwind.config.js:12-14](../tailwind.config.js)）。`<body>` に `font-sans` を付与（[layout.tsx:90](../src/app/layout.tsx)）。
- **toppan-bunkyu-midashi-gothic** は Tailwind経由ではなく、活動カードにインラインで直接指定されている: `style={{ fontFamily: "'toppan-bunkyu-midashi-gothic', sans-serif" }}`（[ActivityCard.tsx:39](../src/app/components/ActivityCard.tsx)）。
- **Inter** は本体UIでは変数公開のみで適用0箇所。実適用は About の `.map-caption` 等3セレクタのみ（§4・§13 参照）。
- `theme-color` メタ: `#092040`（[layout.tsx:88](../src/app/layout.tsx)）。

### 6.2 文字サイズ（実使用スケール）

Tailwind 既定のサイズユーティリティを使用（カスタムサイズ定義は未定義）。実際に使われているもの:

| クラス | 主な用途 |
|---|---|
| `text-[10px]` | 極小ラベル（締切まで・SCROLL・LinePopup補足） |
| `text-xs` (12px) | バッジ・タグ・補助テキスト・パンくず・フッターリンク |
| `text-[13px]` | カード内 VIEW MORE |
| `text-sm` (14px) | 本文小・ボタン・検索入力・サイドバー |
| `text-base` (16px) | Navbarリンク・件数表示 |
| `text-lg` (18px) | 見出し小（h2「概要」等）・詳細ページ h3 |
| `text-xl` (20px) | カードタイトル `h3`・セクション見出し・詳細 h2 |
| `text-2xl` (24px) | セクション見出し（PCトップ「おすすめ」）・Heroタイトル・詳細 h1・締切日数 |
| `text-[28px]` | モバイルメニューのリンク |
| `text-3xl` (30px) | サイドバー締切日数 |
| `text-4xl` (36px) | 詳細ページ記事タイトル（md以上） |
| `text-5xl` (48px) | PCトップの `h1`「Unlock Your Potential」 |

モバイルは vw ベースも多用: `text-[8vw]`（トップ h1）、`text-[5vw]`（セクション見出し）、`text-[4vw]`（スライダータイトル）、`text-[2.5vw]`（スライダーバッジ）など（[TopPageClient.tsx:44-62,240,259](../src/app/TopPageClient.tsx)）。

About ページは px 固定サイズを独自スケールで使用: 40 / 50 / 75 / 80px、`clamp(2.7rem, 2.05rem + 1.7vw, 4.3rem)` 等（§13 参照）。

### 6.3 ウェイト

`font-medium`(500) / `font-bold`(700) / `font-black`(900) が中心。`font-semibold`(600) はカード VIEW MORE でのみ使用（[ActivityCard.tsx:61](../src/app/components/ActivityCard.tsx)）。見出し・CTA・数字強調は `font-black`、汎用強調は `font-bold`。

### 6.4 行間

`leading-tight`（見出し）、`leading-relaxed`（本文段落・リスト）、`leading-none`（数字強調）。カスタム値は未定義。

---

## 7. スペーシング / レイアウト

### 7.1 ブレークポイント

Tailwind 既定を使用（`screens` のカスタム定義は未定義）。実使用は主に:

- `md`（768px）: PC/モバイルの主要分岐。`hidden md:flex` / `md:hidden` で完全に別マークアップを出し分け。
- `xl`（1280px）: 検索結果グリッドの3カラム化（`xl:grid-cols-3` [SearchClient.tsx:476](../src/app/search/SearchClient.tsx)）。
- `sm`（640px）: 空状態のボタン並び（[SearchClient.tsx:443](../src/app/search/SearchClient.tsx)）。

### 7.2 コンテナ幅

| 値 | 用途 | 出典 |
|---|---|---|
| `max-w-3xl`（48rem/768px） | トップのHero・検索窓の中央寄せ | [TopPageClient.tsx:275,281](../src/app/TopPageClient.tsx) |
| `w-64`（16rem/256px） | 検索フィルターサイドバー・詳細ページ応募サイドバー | [SearchClient.tsx:355](../src/app/search/SearchClient.tsx)、[posts/[slug]/page.tsx:378](../src/app/posts/[slug]/page.tsx) |
| `w-[min(800px,calc(100%-28px))]` | スクロール後の浮遊Navbar（PC/モバイル共通） | [Navbar.tsx:117,191](../src/app/components/Navbar.tsx) |
| `min-h-screen` | 各ページ最外ラッパー | 各ページ |

### 7.3 横パディング（ページ左右）

- PC: `px-16`（4rem）が基準。フッター・詳細ページは `md:px-16`。
- モバイル: `px-[5vw]` が基準（詳細ページ・検索・トップ本文）。Navbar のみ `px-[6vw]`（スクロール後）/`px-[5vw]`（上部）。

### 7.4 内部パディング / gap（頻出）

- カード本文: `p-4`（[ActivityCard.tsx:84](../src/app/components/ActivityCard.tsx)）。
- パネル/サイドバー: `p-5` / `p-6`（フィルタ・応募サイドバー）。詳細本文 `p-6 md:p-8`。
- ボタン縦: 応募・シェア `py-4`、CTA `py-3.5`、フィルタチップ `py-1`〜`py-1.5`、Navbarピル `py-2.5`〜`py-4`。
- グリッド/リスト gap: `gap-4`（カードグリッド・関連活動）、`gap-2`〜`gap-3`（バッジ・タグ列）、`gap-6`〜`gap-10`（フッター列・モバイルメニュー）。

### 7.5 Navbar 高さの共有

Navbar の実高さを `ResizeObserver` で測り CSS変数 `--navbar-h` に公開（既定 `80px`/`73px`）。スペーサー div と検索サイドバーの sticky 位置がこれに追従する。
出典: [Navbar.tsx:57-65,111](../src/app/components/Navbar.tsx)、[SearchClient.tsx:356](../src/app/search/SearchClient.tsx)。

---

## 8. 角丸 / シャドウ / ボーダー

### 8.1 角丸（rounded-*）

| クラス | 用途 |
|---|---|
| `rounded-full` | ピル・バッジ・タグ・FAB・ページネーション・トグル・検索アイコンボタン |
| `rounded-2xl`（16px） | 検索窓枠・モバイル応募ボタン・空状態パネル |
| `rounded-xl`（12px） | 応募ボタン(サイドバー)・空状態ボタン・モバイル応募バーの締切ボックス |
| `rounded-[10px]` | 検索実行ボタン（黄） |
| `rounded-t-[24px]` | モバイル絞り込みボトムシート上端 |
| `rounded`（4px） | フィルタのチェックボックス・インラインコード |

カードの画像コンテナは意図的に角丸なし（直角）。理由と構造はコメント参照: [ActivityCard.tsx:20-22,41](../src/app/components/ActivityCard.tsx)。

### 8.2 シャドウ（box-shadow）

「浮いた紙／ステッカー」を表す**ハードシャドウ**（ぼかしゼロのオフセット影）が特徴。

| shadow | 用途 | 出典 |
|---|---|---|
| `shadow-[0_4px_0_#092040]` | FAB・トップCTA・Navbar検索ボタン(`0_3px_0`) | [MobileSearchFab.tsx:7,121](../src/app/components/MobileSearchFab.tsx)、[TopPageClient.tsx:340](../src/app/TopPageClient.tsx) |
| `shadow-[0_4px_0_rgba(9,32,64,0.9)]` | スクロール後Navbar | [Navbar.tsx:117,191](../src/app/components/Navbar.tsx) |
| `shadow-[0_0_0_2px_#092040,3px_4px_0_rgba(9,32,64,0.9)]` | ステッカー版 VIEW MORE（白フチ＋二重影） | [TopPageClient.tsx:208](../src/app/TopPageClient.tsx) |
| `shadow-[0_4px_12px_rgba(9,32,64,0.15)]` | Heroスライダー矢印（唯一のソフト影） | [TopPageClient.tsx:129,134](../src/app/TopPageClient.tsx) |
| `shadow-2xl` | LinePopup（Tailwind既定のソフト影） | [LinePopup.tsx:30](../src/app/components/LinePopup.tsx) |

CTA・FAB は押下時に影を縮めて沈む表現: `active:shadow-[0_2px_0_#092040]`（[MobileSearchFab.tsx:7](../src/app/components/MobileSearchFab.tsx)）。

### 8.3 ボーダー

- 主要枠線: `border-2 border-[#092040]`（Navbar浮遊時・FAB・検索実行ボタン・トグルボタン・ページネーション）。
- 太枠: `border-[3px] border-[#092040]`（検索窓）、`border-[2.5px]`（モバイルメニューのアクティブリンク）、`border-[3px] border-white`（ステッカーVIEW MOREの白フチ）。
- 区切り線: `border-b-2 border-[#092040]`（未スクロールNavbar下辺・検索入力の下線）、`border-t-2 border-[#092040]`（フッター上辺・ボトムシート）、`border-t border-gray-200`（フッター下段・カード内区切り）。
- カテゴリタグ: `border border-[#092040]`（[categories.ts:28](../src/constants/categories.ts)）。

---

## 9. コンポーネント

### 9.1 活動カード（ActivityCard）

全ページ共通のカード。[src/app/components/ActivityCard.tsx](../src/app/components/ActivityCard.tsx)。

- 構造: 外側 `<Link>`（`overflow-hidden` を付けない＝影と浮き上がりを効かせる）＋ 画像コンテナ（`overflow-hidden` はここだけ）＋ 本文 `div`。設計意図はファイル冒頭コメント（[:20-22](../src/app/components/ActivityCard.tsx)）。
- ルート class: `activity-card group relative block bg-[#FFFFF0]`、フォントはインラインで `toppan-bunkyu-midashi-gothic`。
- 画像: `aspect-video object-cover`、ホバーで `group-hover:scale-105`（`duration-500 ease-out`）。
- ホバーリビール: `.card-reveal`（右上起点の円形 clip-path）＋「VIEW MORE」。CSS定義は [globals.css:62-74](../src/app/globals.css)。
- タイトル: `h3` `text-[#092040] text-xl font-bold line-clamp-2`。
- バッジ（後述）と締切表示（`deadlineStyle` = `none`/`count`/`date`）を出し分け。

```tsx
<Link href={`/posts/${post.slug}`}
  className="activity-card group relative block bg-[#FFFFF0]"
  style={{ fontFamily: "'toppan-bunkyu-midashi-gothic', sans-serif" }}>
  <div className="relative w-full aspect-video overflow-hidden bg-gray-200">
    <FallbackImage … className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
    <div className="card-reveal z-10">
      <span className="text-[#FFFFF0] text-[13px] font-semibold tracking-[0.2em]">VIEW MORE</span>
    </div>
    …バッジ…
  </div>
  <div className="p-4 bg-[#FFFFF0]">
    <h3 className="text-[#092040] text-xl font-bold line-clamp-2">{post.title}</h3>
  </div>
</Link>
```

### 9.2 バッジ

カードの角に絶対配置。全て `text-xs font-bold px-2 py-1 rounded-full`。

| バッジ | 地色 / 文字 | 出典 |
|---|---|---|
| おすすめ | `bg-white text-[#092040]` ＋ `border border-gray-200` | [ActivityCard.tsx:66](../src/app/components/ActivityCard.tsx) |
| 季節（夏休み等） | `bg-[#F59E0B] text-white` | [:67](../src/app/components/ActivityCard.tsx) |
| 期間ラベル | `bg-[#092040] text-white` | [:68](../src/app/components/ActivityCard.tsx) |
| 無料 | `bg-[#4ADE80] text-white` | [:73](../src/app/components/ActivityCard.tsx) |
| 締切間近（7日以内） | `bg-[#EF4444] text-white` ＋ `animate-ping` の残像 | [:74-79](../src/app/components/ActivityCard.tsx) |

締切間近バッジは `absolute inset-0 … animate-ping opacity-60` を重ねて発光を表現。

### 9.3 タグ / カテゴリタグ

- **カテゴリタグ（共通定数）**: `CATEGORY_TAG_CLASS = "bg-[#FFFFF0] text-[#092040] border border-[#092040] rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap"`（[categories.ts:27-28](../src/constants/categories.ts)）。色分けは廃止し全カテゴリ統一。
- **キーワードタグ（詳細ページ）**: `bg-[#FCBC2A]/20 text-[#092040] text-xs font-bold px-3 py-1`、ホバーで `hover:bg-[#FCBC2A]`（[posts/[slug]/page.tsx:359](../src/app/posts/[slug]/page.tsx)）。
- **人気のタグ（トップPC）**: `bg-[#FCBC2A]/30 text-[#092040] font-bold text-sm px-4 py-2`（[TopPageClient.tsx:297](../src/app/TopPageClient.tsx)）。
- **アクティブフィルターチップ（検索）**: `bg-[#092040] text-white text-xs font-bold px-3 py-1.5 rounded-full`、削除ホバーで `hover:bg-[#EF4444]`、出現に `animate-fadeInDown`（[SearchClient.tsx:397](../src/app/search/SearchClient.tsx)）。

### 9.4 ボタン

| ボタン | クラス要点 | 出典 |
|---|---|---|
| トップCTA「すべての活動を見る」 | `bg-[#FCBC2A] text-[#092040] font-bold px-8 py-3.5 rounded-full shadow-[0_4px_0_#092040]`、ホバーで浮上＋影拡大、押下で沈む | [TopPageClient.tsx:340](../src/app/TopPageClient.tsx) |
| ステッカー VIEW MORE | `bg-[#FCBC2A] font-black px-4 py-1.5 border-[3px] border-white shadow-[0_0_0_2px_#092040,3px_4px_0_rgba(9,32,64,0.9)]` | [TopPageClient.tsx:204-215](../src/app/TopPageClient.tsx) |
| 検索実行（黄） | `bg-[#FCBC2A] text-[#092040] font-bold px-5 py-2 rounded-[10px] border-2 border-[#092040]` | [TopPageClient.tsx:254](../src/app/TopPageClient.tsx) |
| 応募する（サイドバー） | `bg-[#092040] text-white font-bold py-4 rounded-xl`、ホバーで `hover:bg-[#FCBC2A] hover:text-[#092040] hover:scale-[1.02]` | [posts/[slug]/page.tsx:382](../src/app/posts/[slug]/page.tsx) |
| シェアする（ShareButton） | `w-full bg-[#FCBC2A] text-[#092040] font-bold py-4`、コピー後にラベル変化（2秒） | [ShareButton.tsx:16-17](../src/app/components/ShareButton.tsx) |
| 一覧に戻る | `border-2 border-[#092040] text-[#092040] font-bold py-3`、ホバー反転 | [posts/[slug]/page.tsx:411](../src/app/posts/[slug]/page.tsx) |

### 9.5 ナビバー（Navbar）

[src/app/components/Navbar.tsx](../src/app/components/Navbar.tsx)。PC/モバイルで別マークアップ。スクロール80pxを境に「全幅バー」→「浮遊ピル」へモーフィング。

- 未スクロール: `w-full border-b-2 border-[#092040] bg-[#FFFFF0] px-16 py-4`。
- スクロール後: `w-[min(800px,calc(100%-28px))] rounded-full border-2 border-[#092040] bg-[rgba(255,255,240,0.82)] backdrop-blur-[8px] shadow-[0_4px_0_rgba(9,32,64,0.9)]`。
- 遷移: `transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]`。
- ナビリンク共通 class（`LINK_CLASS`, [Navbar.tsx:37-38](../src/app/components/Navbar.tsx)）: `font-bold text-[#092040] rounded-full … hover:bg-[#FCBC2A] hover:-translate-y-0.5 hover:scale-[1.05] active:scale-[0.96]`、イージング `cubic-bezier(0.34,1.56,0.64,1)`。アクティブは `bg-[#FCBC2A]`。
- モバイル: ハンバーガー→クリック起点の円形展開メニュー（`clip-path: circle(...)`、`bg-[#FCBC2A]`、[Navbar.tsx:222-255](../src/app/components/Navbar.tsx)）。
- スクロール後は右側にインライン展開する検索窓＋黄丸アイコンボタンが出現。

### 9.6 検索バー

同一デザインが3箇所（トップ・検索ページPC・検索ページモバイル）に存在。共通形状:

```
border-[3px] border-[#092040] rounded-2xl pl-5 pr-2 py-2 gap-3
  ├ 虫めがねSVG (opacity-40)
  ├ <input type="search"> (bg-transparent, outline-none, placeholder-[#092040]/50)
  └ 検索ボタン bg-[#FCBC2A] … rounded-[10px] border-2 border-[#092040]
```

出典: [TopPageClient.tsx:245-255,282-292](../src/app/TopPageClient.tsx)、[SearchClient.tsx:362-389](../src/app/search/SearchClient.tsx)。`input[type=search]` のネイティブ装飾は globals.css で無効化（[globals.css:100-115](../src/app/globals.css)）。

### 9.7 フッター（Footer）

[src/app/components/Footer.tsx](../src/app/components/Footer.tsx)。`bg-[#FFFFF0] border-t-2 border-[#092040]`。ロゴ＋4列（ナビ/SNS/問い合わせ/カテゴリ）＋著作権行 `©2026 BEE log`。

- リンク: `text-[#092040] font-bold text-sm hover:opacity-70 transition-opacity`。
- カテゴリは `CATEGORIES` 定数を `.map()` し `/search?category=` へリンク（2カラムグリッド、[Footer.tsx:61-66](../src/app/components/Footer.tsx)）。
- SNSアイコンはインラインSVG（Instagram / X / LINE、`fill="currentColor"`, 18×18）。

### 9.8 モバイル固定応募ボタン（MobileApplyButton）

[src/app/components/MobileApplyButton.tsx](../src/app/components/MobileApplyButton.tsx)。詳細ページ専用。

- コンテナ: `md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FFFFF0]/90 backdrop-blur-sm border-t border-gray-200 px-5 py-4`。
- 表示制御: サイドバーの応募ボタン（`#apply-button-sidebar`）を `IntersectionObserver`（threshold 0.5）で監視し、可視の間は `opacity-0 translate-y-4 pointer-events-none` で退避（[:18-27,30](../src/app/components/MobileApplyButton.tsx)）。
- 締切ボックス＋応募CTA（`bg-[#092040] … rounded-2xl`、ホバーで黄反転、`active:scale-95`）。

### 9.9 モバイル検索FAB（MobileSearchFab）

[src/app/components/MobileSearchFab.tsx](../src/app/components/MobileSearchFab.tsx)。`layout.tsx` で全ページに常設。

- 共通 class `FAB_BASE_CLASS`（export、検索ページの絞り込みFABが再利用）: `fixed right-4 z-50 w-14 h-14 rounded-full bg-[#FCBC2A] border-2 border-[#092040] shadow-[0_4px_0_#092040] … active:translate-y-px active:scale-[0.93] active:shadow-[0_2px_0_#092040] md:hidden`（[:6-7](../src/app/components/MobileSearchFab.tsx)）。
- 表示条件: 記事ページ、またはトップ/検索で `#search-box` が画面外のとき（[:62](../src/app/components/MobileSearchFab.tsx)）。
- 位置: 記事ページ `bottom: 104px`、他は `calc(env(safe-area-inset-bottom,0px) + 3.5rem)`。ソフトキーボード表示中は `visualViewport` で高さ検知しキーボード直上へ浮上（[:45-84](../src/app/components/MobileSearchFab.tsx)）。
- 絞り込みFAB（検索ページ）は同 class を再利用し `bottom-[calc(env(safe-area-inset-bottom,0px)+7.5rem)]` で検索FABの上に配置。未選択件数を赤バッジ表示（[SearchClient.tsx:309-329](../src/app/search/SearchClient.tsx)）。
- `body.menu-open .mobile-fab { display:none }` でメニュー展開中は隠す（[globals.css:96-98](../src/app/globals.css)）。

### 9.10 その他

- **PageTransition**: ルート遷移時に全画面 `bg-[#FFFFF0] z-[999]` オーバーレイ＋LoadingIndicator を1秒表示（[PageTransition.tsx](../src/app/components/PageTransition.tsx)）。
- **LoadingIndicator**: ロゴ（`animate-pulse`）＋プログレスバー（`bg-[#092040]/20` トラックに `bg-[#FCBC2A] animate-loading-bar`）＋「読み込み中...」（[LoadingIndicator.tsx](../src/app/components/LoadingIndicator.tsx)）。
- **LinePopup**: 右下固定カード（白地・`shadow-2xl`）。ヘッダー `bg-[#092040]`、CTA `bg-[#06C755]`。localStorage で一度閉じたら非表示（[LinePopup.tsx](../src/app/components/LinePopup.tsx)）。
- **FallbackImage**: `next/image` ラッパー。読み込み失敗で `/noimage.svg` に差し替え（[src/components/FallbackImage.tsx](../src/components/FallbackImage.tsx)）。
- **SkeletonCard / FadeInCard**: 検索ページ内に定義。スケルトンは `animate-pulse`、FadeInは `IntersectionObserver` で `opacity/translateY` を遷移（`delay = index * 40ms`、[SearchClient.tsx:39-75,479](../src/app/search/SearchClient.tsx)）。
- **記事本文レンダラ**: Notionブロック→HTML。見出し `h2` は `<span className="w-1 h-6 bg-[#FCBC2A]">` の黄色いバー付き（[posts/[slug]/page.tsx:94-98](../src/app/posts/[slug]/page.tsx)）。

---

## 10. モーション

### 10.1 @keyframes（[globals.css](../src/app/globals.css)）

| 名前 | 定義 | 用途 | 呼び出しクラス |
|---|---|---|---|
| `loading-bar` | width/margin を 0→70%→0 で往復（1.2s ease-in-out infinite） | ローディングバー | `.animate-loading-bar` [:26-34](../src/app/globals.css) |
| `fadeInDown` | opacity 0→1 ＋ translateY -8px→0（0.2s ease） | フィルターチップ出現 | `.animate-fadeInDown` [:36-43](../src/app/globals.css) |
| `bottomSheetIn` | translateY 100%→0 | モバイル絞り込みシート | inline `animate-[bottomSheetIn_400ms_cubic-bezier(0.22,1,0.36,1)_forwards]` [:45-48](../src/app/globals.css)、[SearchClient.tsx:336](../src/app/search/SearchClient.tsx) |
| `blink` | opacity 1→0.4→1（1.2s ease-in-out infinite） | 点滅（`.animate-blink` 定義あり） | `.animate-blink` [:50-57](../src/app/globals.css) |
| `scrollLine` | top -36px→36px | Heroスクロール誘導の流れる線分 | `.animate-scroll-line` [:83-90](../src/app/globals.css)、[TopPageClient.tsx:120](../src/app/TopPageClient.tsx) |

補足: 締切「間近」の点滅は `@keyframes blink` ではなく Tailwind 既定の `animate-ping`（残像リング）で実装されている（[ActivityCard.tsx:76](../src/app/components/ActivityCard.tsx)）。`.animate-blink` 自体の実使用箇所は `src/` 内に見当たらない（**未使用の可能性**、§12.7）。

### 10.2 clip-path リビール

- 活動カード: `.card-reveal { clip-path: circle(0% at 100% 0%) }` → `.activity-card:hover .card-reveal { clip-path: circle(150% at 100% 0%) }`、`transition: clip-path 0.45s ease`（[globals.css:62-74](../src/app/globals.css)）。初期値をインラインstyleにすると壊れるためCSSクラス側で定義する旨のコメントあり。
- モバイルメニュー: `clip-path: circle(150vmax at Xpx Ypx)` をハンバーガー座標起点に展開、`transition: clip-path 0.9s cubic-bezier(0.22,1,0.36,1)`（[Navbar.tsx:224-226](../src/app/components/Navbar.tsx)）。

### 10.3 イージング（共通パターン）

| cubic-bezier | 性格 | 主な用途 |
|---|---|---|
| `cubic-bezier(0.34,1.56,0.64,1)` | オーバーシュート（弾む） | ナビリンク hover、FAB、トップCTA（コア・リッチ共通の唯一の共有イージング） |
| `cubic-bezier(0.22,1,0.36,1)` | ease-out expo（滑らか減速） | Navbarモーフ、検索窓展開、ボトムシート、モバイルメニュー |
| `ease` / `ease-out` / `ease-in-out` | 既定 | フェード・画像ズーム・汎用 |

### 10.4 代表的な transition

- 画像ズーム: `transition-transform duration-500 ease-out group-hover:scale-105`（カード・スライダー）。
- ホバー浮き上がり: `hover:-translate-y-0.5 hover:scale-[1.05]`（ナビ・CTA・ステッカー）。
- 押下沈み込み: `active:translate-y-px active:scale-[0.93〜0.97]` ＋ 影縮小。
- 汎用フェード: `transition-opacity` / `transition-colors`。
- ページ内カウントアップ（`useCountUp`）・ページ切替フェード（180ms）・Pull-to-refresh（🐝）は JS 側で実装（[SearchClient.tsx:16-36,111-114,157-195](../src/app/search/SearchClient.tsx)）。

### 10.5 prefers-reduced-motion

`motion-reduce:transition-none` / `motion-reduce:transform-none` / `motion-reduce:animate-none` を各所に付与。CSS側でも `.card-reveal` と `.animate-scroll-line` を無効化（[globals.css:76-80,92-94](../src/app/globals.css)）。Navbar・MobileSearchFab は `matchMedia` でも判定。

### 10.6 フォーカスリング

`:focus-visible { outline: 2px solid #FCBC2A; outline-offset: 2px }`（[globals.css:11-16](../src/app/globals.css)）。個別に `focus-visible:outline-2 focus-visible:outline-[#FCBC2A]` を付ける箇所もあり。

---

## 11. アイコン

### 11.1 public/icons/（[public/icons](../public/icons)）

詳細ページのメタ情報行で使用（`next/image`、16×16表示）。いずれも黒(`stroke="black"`)ベースのラインアイコンで、`viewBox` は64×64（Dollar Bagのみ90×90のビットマップ埋め込み）。

| ファイル | 用途 | 出典 |
|---|---|---|
| `Calendar.svg` | 応募締切 | [posts/[slug]/page.tsx:290](../src/app/posts/[slug]/page.tsx) |
| `Clock.svg` | 活動期間 | [:299](../src/app/posts/[slug]/page.tsx) |
| `Graduation Cap.svg` | 対象学年 | [:308](../src/app/posts/[slug]/page.tsx) |
| `PC.svg` | 形式（オンライン等） | [:317](../src/app/posts/[slug]/page.tsx) |
| `Pin.svg` | 地域 | [:326](../src/app/posts/[slug]/page.tsx) |
| `Dollar Bag.svg` | 参加費 | [:335](../src/app/posts/[slug]/page.tsx) |
| `Magnifying Glass.svg` | （public/icons に存在。詳細ページのメタ行では未使用。検索の虫めがねはインラインSVGを使用） | — |

注: ファイル名にスペースを含む（`Dollar Bag.svg` / `Graduation Cap.svg` / `Magnifying Glass.svg`）。プロジェクト規約の kebab-case とは不一致。

### 11.2 インラインSVGアイコン

`public/icons` とは別に、UI内の多くのアイコンはコンポーネントにインライン記述されている:

- 虫めがね（検索窓・Navbar検索・FAB。`stroke="#092040"`、`viewBox 0 0 24 24`）。
- ハンバーガー（Navbar、span 3本）。
- 矢印 `‹ › → ←`（スライダー・ページネーション・CTA。テキスト or polyline SVG）。
- SNS（Instagram / X / LINE、Footer・LinePopup）。
- 共有アイコン（ShareButton）。
- 絞り込み/閉じる（ハンバーガー/×、SearchClient FAB）。

### 11.3 ブランド画像（[public/](../public)）

`Logo.svg`（Navbar/Footer/ローディング）、`beelog.svg`（favicon/LinePopup）、`favicon.ico`、`apple-touch-icon.png`、`ogp.png`、`noimage.svg`、`manifest.json`。

---

## 12. トークン化されていない / 散らばっている箇所

> 本セクションは指摘のみ。実装変更は行わない。将来トークン化する際の候補リスト。§3 のセマンティックトークン化を進める際の対象。

### 12.1 背景色「アイボリー」の分裂 → 統一済み（解決）

- **経緯（解決済み）**: かつて本体UIには正規アイボリー `#FFFFF0`（body・カード・ページ地）と別系統 `#FFFFEE`（Navbar・モバイルメニュー・カテゴリタグ地・ボトムシート、計19箇所）の2トーンが混在していた。`CLAUDE.md` も旧値 `#FFFFEE` を Ivory と定義していた。
- **現状**: アイボリーは **`#FFFFF0` の1値に統一済み**（§3 `surface`）。旧 `#FFFFEE` は全19箇所を置換して**廃止**（コード内0件）。`CLAUDE.md` の定義も `#FFFFF0` に更新済み。以後 `#FFFFEE` は**使用禁止**。
- **半透明形も統一済み**: スクロール後Navbar地の半透明アイボリーは `rgba(255,255,240,0.82)`（=#FFFFF0 の半透明形、alpha不変）に統一。旧 `rgba(255,255,238,…)`（=#FFFFEE系）はコード内0件。
- **残る別系統**: About リッチレイヤーのみ独自地色 `--paper: #fffef0` / `--paper-soft: #fffff6` を保持（意図的にコアと分離、§13 参照）。これは統一対象外。

### 12.2 主要色がTailwindトークン化されていない

- `theme.extend.colors` は `navy` / `yellow` のみ。実際は `text-[#092040]`（189回）・`bg-[#FCBC2A]`（47回）と任意値で全面ハードコード。登録済みの `navy`/`yellow` クラスはほぼ未活用。
- セマンティックカラーが未定義: レッド `#EF4444`（14回）、無料グリーン `#4ADE80`、季節アンバー `#F59E0B`、LINE `#06C755`。いずれも意味（警告/無料/季節/外部ブランド）を持つがトークン名がない（§3 参照）。
- 候補: `surface(#FFFFF0)`（統一済みの唯一のアイボリー） / `text=navy(#092040)` / `accent=honey(#FCBC2A)` / `danger(#EF4444)` / `free(#4ADE80)` / `season(#F59E0B)` / `line(#06C755)`。※旧 `ivory-nav(#FFFFEE)` 候補はアイボリー統一（§12.1）により不要・廃止。

### 12.3 カテゴリ定義・カテゴリ導線の重複

- カテゴリの正データ自体は `src/constants/categories.ts` の `CATEGORIES` に集約済み（良好）。ただし利用側で以下の重複ロジックが散在:
  - トップ: `CATEGORIES.map(...)` でセクション生成＋`/search?category=` リンク（[TopPageClient.tsx:227-232,319-333](../src/app/TopPageClient.tsx)）。
  - フッター: 同様に `CATEGORIES.map(...)`＋`/search?category=`（[Footer.tsx:61-66](../src/app/components/Footer.tsx)）。
  - 検索: `CATEGORY_NAMES` でフィルタUI＋空状態のカテゴリチップ（[SearchClient.tsx:240-245,462-470](../src/app/search/SearchClient.tsx)）。
  - 詳細: `categoryHref = /search?category=...` を独自組み立て（[posts/[slug]/page.tsx:197](../src/app/posts/[slug]/page.tsx)）。
- → `/search?category=${encodeURIComponent(name)}` のURL組み立てが4ファイルに重複。ヘルパー関数（例: `categorySearchHref(name)`）に集約する余地。
- `GRADES` / `FORMATS` / `SEASON_TAGS` は定数化済みだが、活動期間の選択肢 `["長期","中期","短期"]`（[SearchClient.tsx:272](../src/app/search/SearchClient.tsx)）と `["夏休み","冬休み","春休み"]`系のみ定数、期間ラベルはインライン配列。

### 12.4 検索バーのマークアップ重複

同一構造の検索窓が3箇所（トップ×2＝モバイル/PC、検索ページ×2＝モバイル/PC）にコピーされている（[TopPageClient.tsx:245,282](../src/app/TopPageClient.tsx)、[SearchClient.tsx:362,377](../src/app/search/SearchClient.tsx)）。`SearchBox` コンポーネント化の候補。

### 12.5 ハードシャドウ / 枠線の値がべた書き

- `shadow-[0_4px_0_#092040]`・`border-2 border-[#092040]` などブランド特徴の「紙／ステッカー」表現が各コンポーネントに個別記述。`theme.extend.boxShadow` / 共通クラス化されていない。
- 押下時の `active:shadow-[0_2px_0_#092040]` もセットで散在。

### 12.6 締切「間近」判定の閾値・色ロジックの重複

`daysLeft <= 7`（間近）・`< 0`（締切済み）と、その配色（`text-[#EF4444]` / `text-gray-400`）が ActivityCard・MobileApplyButton・詳細ページに個別実装（[ActivityCard.tsx:74,91,96](../src/app/components/ActivityCard.tsx)、[MobileApplyButton.tsx:33,39](../src/app/components/MobileApplyButton.tsx)、[posts/[slug]/page.tsx:289,402](../src/app/posts/[slug]/page.tsx)）。閾値・色を共通化する余地。

### 12.7 `.animate-blink` が未使用の疑い

`@keyframes blink` と `.animate-blink` は定義されているが（[globals.css:50-57](../src/app/globals.css)）、`src/` 内に利用箇所が見当たらない。締切間近の点滅は `animate-ping` で実装されているため、デッドコードの可能性。

### 12.8 アイコン供給元が二系統

メタ情報は `public/icons/*.svg`（黒ラインの64pxアイコン、ファイル名にスペース）、UIチップ類はインラインSVG（`#092040` stroke）。統一スプライト/アイコンコンポーネントは未整備。

---

## 13. リッチレイヤー（About）

About は Tailwind をほぼ使わず、専用CSS（`about.css`、**1,624行**）＋GSAP で構築された**独立した第2デザインシステム**。コアとは別方向の表現を持つ。**この見た目は資産として保護する。将来のLP・キャンペーンで「Aboutと同じ質感」を求められたらここを参照する。** コアと混在させない（§1）。

> 位置づけの整理: 本章は旧「About はデザインシステム外の島」という指摘を統合したもの。about.css は本体UIの `#092040` / `#FCBC2A` 以外の色（`#111` / `#F00` / `#147AF3` ほか、実測の全一覧は §5.3）を独自に持ち、サイト全体のコアトークンとは連動しない。これは**不整合ではなく意図的な分離**として扱う。

### 共有トークン（コアと同じ）
- `navy #092040` / `yellow #fcbc2a`
- 跳ね返りイージング `cubic-bezier(0.34,1.56,0.64,1)`
- `border-radius: 999px`（≒ rounded-full）
- `border: 2px solid navy`

### リッチレイヤー専用トークン（コアに畳まない）

| 値 | 用途 |
|---|---|
| `--paper #fffef0` | 方眼グリッド背景の地 |
| `--paper-soft #fffff6` | body 地色 |
| `--gray-panel #f5f5f5` | パネル背景 |
| `--gray-bubble #e5e5ea` | グレー吹き出し |
| `--blue-bubble #147af3` | 青吹き出し（iMessage風） |
| `#929290 / #bdbdbf` | メタ・補助テキスト |
| 黄マーカー `linear-gradient(180deg, transparent 42〜46%, rgba(252,188,42,0.5〜0.62))` | 行跨ぎハイライト（`box-decoration-break: clone`） |
| 方眼 `linear-gradient(var(--grid) 1px, transparent 1px)` ×2 | グリッド背景 |

### 専用の設計特徴（コアと異なる点）
- **タイポ**：px固定＋`clamp()`流体＋`svh`単位。コアの Tailwind ユーティリティスケールとは別系統。欧文見出しに Inter（`.map-caption` 等、§4・§6.1）。
- **影**：`box-shadow` 未使用（意図的）。コアのハードシャドウ表現を持ち込まない。
- **演出**：GSAP + ScrollTrigger（スクロールリベール `opacity/y`、地図パララックス `scale:1.08 scrub`、チャット吹き出しの `back.out(4.8)` 跳ね返り、モバイル文字実測フィット）。`prefers-reduced-motion` 尊重済み。
- **ブレークポイント**：`900px / 768px / 560px`（コアTailwindにないカスタム境界）。

### リッチレイヤーを使うときのルール
- コアの box-shadow ステッカー表現をリッチに持ち込まない。逆もしない。
- 専用トークンはコアの surface/accent に統合しない。
- 新規のリッチ系ページを作るときは、上記の専用トークンと演出パターンを再利用する。

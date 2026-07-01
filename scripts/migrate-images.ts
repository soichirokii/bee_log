/**
 * Imgur(i.imgur.com) および Notion S3(署名付きで約1時間で失効) にホストされている
 * 画像を Cloudinary に移行し、Notion の画像プロパティを Cloudinary の永続URLで
 * 上書きするスクリプト。
 *
 * 実行:
 *   npm run migrate-images            # 本番実行（Cloudinaryアップロード + Notion更新）
 *   RUN_MODE=dry npm run migrate-images   # DRY RUN（アップロード・更新をせず対象を確認）
 *
 * 環境変数（.env.local から読み込み）:
 *   NOTION_TOKEN, NOTION_DATABASE_ID
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

import dotenv from "dotenv";

// Next.js 外で実行するため .env.local を明示的に読み込む（.env はフォールバック）
dotenv.config({ path: ".env.local" });
dotenv.config();

// Notion の画像プロパティ名（サイト側 lib/notion.ts が参照している実プロパティ）
const IMAGE_PROPERTY = "ファイル&メディア";

// Cloudinary へ移行する対象URLか判定する。
// - i.imgur.com: 外部Imgurホスト
// - amazonaws.com / notion-static.com: Notion S3 の署名付きURL（約1時間で失効するため永続化する）
function isMigratableUrl(url: string): boolean {
  return (
    url.includes("i.imgur.com") ||
    url.includes("amazonaws.com") ||
    url.includes("notion-static.com")
  );
}

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const DRY_RUN = process.env.RUN_MODE === "dry";

// APIレート制限回避のための処理間隔（ミリ秒）
const THROTTLE_MS = 3000;

const notionHeaders = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

// ---- Notion API の最小型定義（any 禁止） ----
type NotionFile = {
  name?: string;
  type?: "file" | "external";
  file?: { url: string };
  external?: { url: string };
};

type ImagePropertyValue = {
  type?: string;
  url?: string | null;
  files?: NotionFile[];
};

type NotionPage = {
  id: string;
  properties: Record<string, ImagePropertyValue & { title?: { plain_text?: string }[] }>;
};

type NotionQueryResult = {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ページタイトル（ログ用）
function pageTitle(page: NotionPage): string {
  const props = page.properties;
  for (const key of Object.keys(props)) {
    const title = props[key]?.title;
    if (Array.isArray(title) && title[0]?.plain_text) {
      return title[0].plain_text;
    }
  }
  return page.id;
}

// 画像プロパティから現在のURLと型（files / url）を取り出す
function readImageProperty(
  page: NotionPage
): { url: string | null; kind: "files" | "url" | null; fileName?: string } {
  const prop = page.properties[IMAGE_PROPERTY];
  if (!prop) return { url: null, kind: null };

  if (prop.type === "files" || Array.isArray(prop.files)) {
    const first = prop.files?.[0];
    const url = first?.file?.url ?? first?.external?.url ?? null;
    return { url, kind: "files", fileName: first?.name };
  }

  if (prop.type === "url" || typeof prop.url === "string") {
    return { url: prop.url ?? null, kind: "url" };
  }

  return { url: null, kind: null };
}

// Cloudinary の public_id を安定させる（再実行時に重複アップロードを避ける）
function buildPublicId(page: NotionPage): string {
  return page.id.replace(/-/g, "");
}

// Notion データベースの全ページを取得（100件ずつページネーション）
async function fetchAllPages(): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: notionHeaders,
        body: JSON.stringify({
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        `Notion query error: ${res.status} ${await res.text()}`
      );
    }

    const data = (await res.json()) as NotionQueryResult;
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor ?? undefined : undefined;
  } while (cursor);

  return pages;
}

// Notion の画像プロパティを Cloudinary URL で更新
async function updateNotionImage(
  pageId: string,
  kind: "files" | "url",
  cloudinaryUrl: string,
  fileName?: string
): Promise<void> {
  const properties =
    kind === "url"
      ? { [IMAGE_PROPERTY]: { url: cloudinaryUrl } }
      : {
          [IMAGE_PROPERTY]: {
            files: [
              {
                type: "external",
                name: fileName || "image",
                external: { url: cloudinaryUrl },
              },
            ],
          },
        };

  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: notionHeaders,
    body: JSON.stringify({ properties }),
  });

  if (!res.ok) {
    throw new Error(`Notion update error: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  // 必須環境変数の確認
  const missing = [
    ["NOTION_TOKEN", NOTION_TOKEN],
    ["NOTION_DATABASE_ID", DATABASE_ID],
    ["CLOUDINARY_CLOUD_NAME", process.env.CLOUDINARY_CLOUD_NAME],
    ["CLOUDINARY_API_KEY", process.env.CLOUDINARY_API_KEY],
    ["CLOUDINARY_API_SECRET", process.env.CLOUDINARY_API_SECRET],
  ].filter(([, v]) => !v).map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `環境変数が不足しています: ${missing.join(", ")}（.env.local を確認してください）`
    );
  }

  // Cloudinary は env 読み込み後に import する（config が env を参照するため）
  const { uploadToCloudinary } = await import("../src/lib/cloudinary");

  console.info(
    `=== 画像移行スクリプト開始 ${DRY_RUN ? "[DRY RUN]" : "[本番実行]"} ===`
  );

  const pages = await fetchAllPages();
  console.info(`取得ページ数: ${pages.length}`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const page of pages) {
    const title = pageTitle(page);
    const { url, kind, fileName } = readImageProperty(page);

    // スキップ判定: URLなし / noimage / cloudinary移行済み / imgur以外
    if (!url || !kind) {
      console.info(`SKIP  [${title}] 画像URLなし`);
      skipped++;
      continue;
    }
    if (url.includes("noimage.svg")) {
      console.info(`SKIP  [${title}] noimage`);
      skipped++;
      continue;
    }
    if (url.includes("cloudinary.com")) {
      console.info(`SKIP  [${title}] 移行済み(Cloudinary)`);
      skipped++;
      continue;
    }
    if (!isMigratableUrl(url)) {
      console.info(`SKIP  [${title}] 移行対象外のURL: ${url}`);
      skipped++;
      continue;
    }

    // ここから移行対象
    try {
      if (DRY_RUN) {
        console.info(`DRY   [${title}] 移行対象(${kind}): ${url}`);
        migrated++;
        continue;
      }

      const cloudinaryUrl = await uploadToCloudinary(url, buildPublicId(page));
      await updateNotionImage(page.id, kind, cloudinaryUrl, fileName);
      console.info(`OK    [${title}] ${url} -> ${cloudinaryUrl}`);
      migrated++;
    } catch (err) {
      // 1件の失敗で全体を止めない
      console.error(
        `FAIL  [${title}] ${url}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      failed++;
    }

    // レート制限回避
    await sleep(THROTTLE_MS);
  }

  console.info("=== 完了 ===");
  console.info(
    `移行${DRY_RUN ? "対象" : "成功"}: ${migrated} / スキップ: ${skipped} / 失敗: ${failed}`
  );
}

main().catch((err) => {
  console.error("致命的エラー:", err instanceof Error ? err.message : err);
  process.exit(1);
});

// ============================================================
// 定数: Notion APIの認証情報とデータベースID
// ============================================================
var NOTION_TOKEN = "secret_xxxxx"; // ← あなたのNotion Integration Tokenに置き換える
var NOTION_DATABASE_ID = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // ← NotionデータベースのIDに置き換える
var NOTION_API_URL = "https://api.notion.com/v1/pages";

// ============================================================
// フォーム送信トリガー: フォーム送信時に自動実行される
// ============================================================
function onFormSubmit(e) {
  try {
    var responses = e.response.getItemResponses();

    // 質問文 → 回答 のマップを作成
    var answers = {};
    for (var i = 0; i < responses.length; i++) {
      var item = responses[i];
      answers[item.getItem().getTitle()] = item.getResponse();
    }

    var properties = buildProperties(answers);

    var payload = {
      parent: { database_id: NOTION_DATABASE_ID },
      properties: properties
    };

    var options = {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: "Bearer " + NOTION_TOKEN,
        "Notion-Version": "2022-06-28"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(NOTION_API_URL, options);
    var code = response.getResponseCode();
    var body = response.getContentText();

    if (code === 200) {
      Logger.log("Notion登録成功: " + body);
    } else {
      Logger.log("Notionエラー (" + code + "): " + body);
    }
  } catch (err) {
    Logger.log("例外エラー: " + err.toString());
  }
}

// ============================================================
// Notionプロパティオブジェクトを組み立てる
// ============================================================
function buildProperties(a) {
  var props = {};

  // タイトル（必須）
  var title = a["活動名"] || "";
  props["タイトル"] = {
    title: [{ text: { content: title } }]
  };

  // 主催者
  if (a["主催者"]) {
    props["主催者"] = richText(a["主催者"]);
  }

  // カテゴリ（select）
  if (a["カテゴリ"]) {
    props["カテゴリ"] = { select: { name: a["カテゴリ"] } };
  }

  // 応募締切（date）— 空の場合はスキップ
  if (a["応募締切日（YYYY-MM-DD）"]) {
    props["応募締切"] = { date: { start: a["応募締切日（YYYY-MM-DD）"] } };
  }

  // 活動期間
  if (a["活動期間"]) {
    props["活動期間"] = richText(a["活動期間"]);
  }

  // 対象学年（multi_select）— カンマ区切り
  if (a["対象学年（カンマ区切り）"]) {
    props["対象学年"] = { multi_select: splitToMultiSelect(a["対象学年（カンマ区切り）"]) };
  }

  // 形式（select）
  if (a["形式"]) {
    props["形式"] = { select: { name: a["形式"] } };
  }

  // 地域
  if (a["地域"]) {
    props["地域"] = richText(a["地域"]);
  }

  // 参加費
  if (a["参加費"]) {
    props["参加費"] = richText(a["参加費"]);
  }

  // タグ（multi_select）— カンマ区切り
  if (a["タグ（カンマ区切り）"]) {
    props["タグ"] = { multi_select: splitToMultiSelect(a["タグ（カンマ区切り）"]) };
  }

  // 概要
  if (a["概要"]) {
    props["概要"] = richText(a["概要"]);
  }

  // 応募URL
  if (a["応募URL"]) {
    props["応募URL"] = { url: a["応募URL"] };
  }

  // ファイル&メディア（外部URL — ImgurのURL）
  if (a["画像URL（ImgurのURL）"]) {
    props["ファイル&メディア"] = {
      files: [
        {
          type: "external",
          name: "image",
          external: { url: a["画像URL（ImgurのURL）"] }
        }
      ]
    };
  }

  // slug
  if (a["slug（英数字ハイフン）"]) {
    props["slug"] = richText(a["slug（英数字ハイフン）"]);
  }

  // 注目・公開はデフォルトfalse（Notionで手動確認後に公開する運用）
  props["注目"] = { checkbox: false };
  props["公開"] = { checkbox: false };

  return props;
}

// ============================================================
// ユーティリティ: rich_text型を組み立てる
// ============================================================
function richText(value) {
  return { rich_text: [{ text: { content: value } }] };
}

// ============================================================
// ユーティリティ: カンマ区切り文字列 → multi_select配列
// ============================================================
function splitToMultiSelect(value) {
  return value.split(",").map(function(s) {
    return { name: s.trim() };
  }).filter(function(item) {
    return item.name !== "";
  });
}

// ============================================================
// フォーム自動作成: 初回に1回だけ手動実行する
// 実行後、ログに表示されるフォームURLを開いて確認する
// ============================================================
function createForm() {
  var form = FormApp.create("BEE log 活動情報登録フォーム");
  form.setDescription("新しい課外活動情報をNotionデータベースへ登録します。");

  // 活動名（短文・必須）
  form.addTextItem()
    .setTitle("活動名")
    .setRequired(true);

  // 主催者（短文）
  form.addTextItem()
    .setTitle("主催者");

  // カテゴリ（プルダウン）
  form.addListItem()
    .setTitle("カテゴリ")
    .setChoiceValues(["コンテスト", "研究・論文", "ボランティア", "インターン", "留学・海外", "講座・スクール", "その他"]);

  // 応募締切日（短文）
  form.addTextItem()
    .setTitle("応募締切日（YYYY-MM-DD）")
    .setHelpText("例: 2026-06-30　未定の場合は空欄");

  // 活動期間（短文）
  form.addTextItem()
    .setTitle("活動期間")
    .setHelpText("例: 2026年7月〜8月");

  // 対象学年（短文・カンマ区切り）
  form.addTextItem()
    .setTitle("対象学年（カンマ区切り）")
    .setHelpText("例: 中学生, 高校1年, 高校2年, 高校3年");

  // 形式（プルダウン）
  form.addListItem()
    .setTitle("形式")
    .setChoiceValues(["オンライン", "対面", "ハイブリッド"]);

  // 地域（短文）
  form.addTextItem()
    .setTitle("地域")
    .setHelpText("例: 全国, 東京, オンライン");

  // 参加費（短文）
  form.addTextItem()
    .setTitle("参加費")
    .setHelpText("例: 無料, 3,000円");

  // タグ（短文・カンマ区切り）
  form.addTextItem()
    .setTitle("タグ（カンマ区切り）")
    .setHelpText("例: プログラミング, AI, 環境");

  // 概要（長文）
  form.addParagraphTextItem()
    .setTitle("概要")
    .setRequired(true);

  // 応募URL（短文・必須）
  form.addTextItem()
    .setTitle("応募URL")
    .setRequired(true);

  // 画像URL（ImgurのURL）
  form.addTextItem()
    .setTitle("画像URL（ImgurのURL）")
    .setHelpText("Imgurにアップロードした直リンクURL（https://i.imgur.com/xxxxx.jpg）");

  // slug（短文）
  form.addTextItem()
    .setTitle("slug（英数字ハイフン）")
    .setHelpText("例: bee-contest-2026　URLに使う識別子");

  Logger.log("フォームを作成しました: " + form.getEditUrl());
  Logger.log("フォーム回答URL: " + form.getPublishedUrl());

  // フォームにトリガーを自動登録
  ScriptApp.newTrigger("onFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log("送信トリガーを登録しました。");
}

// ============================================================
// トリガー登録: createForm()を使わず既存フォームに紐付ける場合に使う
// ============================================================
function createTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit") {
      Logger.log("トリガーはすでに登録済みです。");
      return;
    }
  }

  ScriptApp.newTrigger("onFormSubmit")
    .forForm(FormApp.getActiveForm())
    .onFormSubmit()
    .create();

  Logger.log("トリガーを登録しました。");
}

# Spoiler Block for X

漫画のネタバレをXのタイムラインで自動ブロックするChrome拡張。

## 仕組み

- Xのタイムラインを監視し、登録した作品名が本文に含まれる投稿をぼかして隠す
- テキストのみの投稿も、画像付き投稿も同様にブロック
- 「表示する」ボタンで1件だけ解除、「読んだ」ボタンでその作品を全解除

## 開発中のChromeへの読み込み方

1. `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をオン
3. 「パッケージ化されていない拡張機能を読み込む」→ このフォルダを選択
4. Xを開いてポップアップから作品を登録

## ファイル構成

```
manifest.json   Chrome拡張の設定
content.js      X上でのツイート監視・ブロック処理
content.css     ぼかし表示のスタイル
popup.html      拡張ポップアップのUI
popup.js        作品リストの管理(chrome.storage.sync)
popup.css       ポップアップのスタイル
```

## ストレージ仕様

`chrome.storage.sync` に `series` キーで保存:

```json
[
  { "id": 1234567890, "name": "ワンピース", "read": false },
  { "id": 1234567891, "name": "進撃の巨人", "read": true }
]
```

`read: false` → ブロック中 / `read: true` → 解除済み

## 今後の課題

- アイコン画像の追加 (`icons/icon16.png`, `icon48.png`, `icon128.png`)
- キーワードエイリアス対応(例: ワンピース + ONE PIECE を同一作品として扱う)
- Firefox対応

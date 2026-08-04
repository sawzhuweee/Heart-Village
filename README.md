# 心之村 Emotion Village

響應式網頁 + PWA（可安裝成手機 App）版本。

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 網站本體（含樣式與程式，純前端、不需要後端） |
| `manifest.webmanifest` | PWA 設定（App 名稱、圖示、開啟方式） |
| `sw.js` | Service Worker：離線快取 |
| `icons/` | App 圖示（192 / 512 / maskable / apple-touch） |
| `情緒村.dc.html` | 原始的 DC 預覽檔（保留，不會被使用） |
| `picture/` | 圖片原稿（線上圖走 Cloudinary） |

## 本機測試

PWA 只在 `https://` 或 `localhost` 才會啟用，直接用檔案總管點開 `index.html` 不會有安裝功能。

```bash
python -m http.server 8080
# 瀏覽器開 http://127.0.0.1:8080
```

## 部署（GitHub Pages）

```bash
git add .
git commit -m "心之村 響應式 + PWA"
git branch -M main
git remote add origin <你的 repo 網址>
git push -u origin main
```

到 repo 的 **Settings → Pages**，Source 選 `main` / `root`，等一兩分鐘就會有網址。
`start_url` 與 `scope` 都用相對路徑 `./`，放在子路徑（`帳號.github.io/repo/`）也能正常安裝。

## 安裝成 App（主畫面）

網站右上角的「📲 安裝到手機」會自動判斷你的手機，給對應的步驟：

- **Android Chrome / Edge**：按下去會直接跳出系統的安裝視窗。
- **Android Samsung Internet**：☰ 選單 →「新增頁面至」→「主畫面」。
- **Android Firefox**：⋮ 選單 →「安裝」。
- **iPhone / iPad Safari**：分享按鈕 →「加入主畫面」。

Android 主畫面上會用 `icons/icon-maskable-512.png`（配合各家圓形／方形／水滴形外框自動裁切），
啟動時的白畫面用 `manifest` 的 `background_color` 與 512 圖示自動組成。
長按主畫面圖示還會有「飛鴿驛站」「八位夥伴」兩個捷徑。

裝好之後，**Android 的返回鍵／返回手勢會先關掉彈出的視窗**，而不是直接退出 App。

## 改完內容要記得

改過 `index.html` 之後，把 `sw.js` 第 2 行的 `VERSION` 加一（`v1` → `v2`），
使用者下次開啟才會拿到新版（網站會跳出「村子有新版本了」的提示）。

## 後台

右上角「管理後台」，示範密碼 `village`。
可以管理留言（公開／隱藏／刪除）與編輯八位夥伴的文字。

> 注意：留言與編輯內容存在瀏覽器的 `localStorage`，只存在該裝置上，換手機或清除瀏覽資料就會不見。
> 若要多人共用同一份留言，需要接後端（例如 Firebase）。

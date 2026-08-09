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

## 觀心氣象站（雷鳴山頂）

點地圖最上方的光點、上方選單的「觀心氣象站」，或村莊圖例的「觀心氣象站」，
會用整頁蓋住的方式打開氣象站，頂部有 4 個分頁鈕：

| 分頁 | 內容 | 計分 |
| --- | --- | --- |
| 🌤 觀測站 | 12 題題庫**每次隨機盲抽 4 題**；撥動銅製指針作答（左 A／上 B／右 C／下 D），放開手指即選定，最後判定八種心靈氣候之一 | 有 |
| 🩹 OK蹦撕撕樂 | 9 款 OK 繃，往右滑「斯啦」一聲撕開，露出長老的一句話 | 無 |
| 🕊 飛鴿攔截戰 | 點正在飛的鴿子，抽讀一封匿名心事，寫回信送進村長信箱 | 無 |
| 🤫 長老的秘密 | 施工中彩蛋，之後要加新遊戲就寫在 `renderSecret()` 裡 | 無 |

- 音效（齒輪喀喀聲、撕貼紙、鴿子咕咕、打雷）都是用 Web Audio **即時合成**的，不需要音檔；
  右上角 🔊 可以關掉，設定會記住。
- 同分時會一次發布兩站的「多站引導」。
- 題目、選項、加分代碼在 `index.html` 的 `QUESTIONS`；八種氣候的名稱與長老開示在 `CLIMATE`；
  9 句 OK 繃語錄在 `BANDAIDS`。改文字不用動任何程式邏輯。

### 接上 Google 試算表（選用）

`index.html` 裡搜尋 `var STATION = {`，只要改三行：

```js
var STATION = {
  GAS_URL:   '',          // Apps Script 網頁應用程式網址
  SHEET_URL: '',          // 村長私人的 Google 試算表網址
  ADMIN_PASS:'joan888'    // 底部暗門的暗號
};
```

**沒填也能用**：測驗趨勢與飛鴿回信會存在本機，村長後台的「氣象站數據」分頁照樣看得到，
飛鴿讀到的信會從留言牆＋內建的幾封範例信裡抽。

要真的連到試算表時，在試算表按 **擴充功能 → Apps Script**，貼上：

```js
function doPost(e){
  var d = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = d.type === 'reply' ? '飛鴿回信' : '觀測趨勢';
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (d.type === 'reply') sh.appendRow([new Date(), d.from, d.letter, d.reply]);
  else sh.appendRow([new Date(), d.code, d.name, JSON.stringify(d.scores)]);
  return ContentService.createTextOutput('ok');
}
function doGet(e){
  // 回傳「飛鴿驛站」工作表裡可以公開流傳的匿名心事
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('飛鴿驛站');
  var rows = sh ? sh.getDataRange().getValues().slice(1) : [];
  var letters = rows.map(function(r){
    return {nick:String(r[1]||'匿名旅人'), mood:String(r[2]||''), text:String(r[3]||''),
            date:Utilities.formatDate(new Date(r[0]), 'Asia/Taipei', 'yyyy/MM/dd')};
  }).filter(function(x){ return x.text; });
  var body = JSON.stringify({letters:letters});
  var cb = e && e.parameter && e.parameter.callback;
  return cb
    ? ContentService.createTextOutput(cb + '(' + body + ')').setMimeType(ContentService.MimeType.JAVASCRIPT)
    : ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}
```

**部署 → 新增部署作業 → 網頁應用程式**，執行身分選「我」，存取權選「**所有人**」，
把產生的網址貼進 `GAS_URL`。村民端全程免登入、非同步送出，不會跳任何 Google 畫面。

### 試算表權限（最關鍵）

試算表右上角「共用」要設成 **「限制（僅獲得存取權的使用者可以開啟）」**，
清單裡只加村長本人的 Google 帳號。
這樣村長手機本來就登入了自己的帳號，點暗門一秒進表；外人就算猜到暗號，
也會被 Google 直接擋在門外。

### 隱形暗門

網頁最底部的灰色小字「© 2026 喬安老師的情緒小參室」，**連續快點 5 下**，
會跳出「【OK洞暗門】請輸入長老的單片眼鏡暗號：」。
輸入對的暗號 → 新分頁打開村長的私人試算表（沒設定 `SHEET_URL` 時改開本機後台）；
輸入錯的 → 直接被擋下來。

## 後台

右上角「管理後台」，示範密碼 `village`。
可以管理留言（公開／隱藏／刪除）、編輯八位夥伴的文字，
以及在「氣象站數據」看心靈氣候的判定趨勢與收到的飛鴿回信。

> 注意：留言與編輯內容存在瀏覽器的 `localStorage`，只存在該裝置上，換手機或清除瀏覽資料就會不見。
> 若要多人共用同一份留言，需要接後端（例如 Firebase）。

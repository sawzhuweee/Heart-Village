# 心之村 Emotion Village

響應式網頁 + PWA（可安裝成手機 App）版本。

## 檔案

| 檔案                     | 用途                                           |
| ------------------------ | ---------------------------------------------- |
| `index.html`           | 網站本體（含樣式與程式，純前端、不需要後端）   |
| `manifest.webmanifest` | PWA 設定（App 名稱、圖示、開啟方式）           |
| `sw.js`                | Service Worker：離線快取                       |
| `icons/`               | App 圖示（192 / 512 / maskable / apple-touch） |
| `情緒村.dc.html`       | 原始的 DC 預覽檔（保留，不會被使用）           |
| `picture/`             | 圖片原稿（線上圖走 Cloudinary）                |

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

| 分頁          | 內容                                                                                                                       | 計分 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- | ---- |
| 🌤 觀測站     | 12 題題庫**每次隨機盲抽 4 題**；撥動銅製指針作答（左 A／上 B／右 C／下 D），放開手指即選定，最後判定八種心靈氣候之一 | 有   |
| 🩹 OK蹦撕撕樂 | 9 款 OK 繃，往右滑「斯啦」一聲撕開，露出長老的一句話                                                                       | 無   |
| 🕊 飛鴿攔截戰 | 點正在飛的鴿子，抽讀一封匿名心事，寫回信送進村長信箱                                                                       | 無   |
| 🤫 長老的秘密 | 施工中彩蛋，之後要加新遊戲就寫在`renderSecret()` 裡                                                                      | 無   |

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

**沒填也能用**：測驗趨勢、飛鴿回信、瀏覽次數都先記在本機，村長後台的「氣象站數據」分頁照樣看得到。

要真的連到試算表時，在試算表按 **擴充功能 → Apps Script**，貼上：

```js
/* 心之村 · 觀心氣象站 後台
   用 openById 指定試算表，所以「獨立的 Apps Script 專案」也能用，
   不必一定要從試算表的「擴充功能 → Apps Script」開。 */
// 換一張試算表時，把網址中 /d/ 和 /edit 之間那一長串換掉
var SHEET_ID = '1CpqT6jwV2WfCk0LBF9AgzWfNDUt-6RFso9EQc5SR8KE';

function ss_(){ return SpreadsheetApp.openById(SHEET_ID); }

function sheet_(name, header){
  var sh = ss_().getSheetByName(name);
  if (!sh) { sh = ss_().insertSheet(name); sh.appendRow(header); }
  return sh;
}

var LETTER_COLS = ['時間','暱稱','心情','內容','可公開','編號','檢舉'];

// 用編號找出某封信在「飛鴿驛站」的第幾列
function findLetter_(id){
  var sh = sheet_('飛鴿驛站', LETTER_COLS);
  if (!id) return {sh:sh, row:0};
  var v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][5]) === String(id)) return {sh:sh, row:i+1};
  return {sh:sh, row:0};
}

function doPost(e){
  var d = JSON.parse(e.postData.contents);
  if (d.type === 'view') {
    sheet_('瀏覽紀錄', ['時間']).appendRow([new Date()]);
  } else if (d.type === 'letter') {
    sheet_('飛鴿驛站', LETTER_COLS)
      .appendRow([new Date(), d.nick, d.mood, d.text, d.pub ? '是' : '否', d.id, 0]);
  } else if (d.type === 'deleteLetter') {
    // 村長在留言牆或後台按刪除：把試算表這一列也刪掉
    var f = findLetter_(d.id);
    if (f.row) f.sh.deleteRow(f.row);
  } else if (d.type === 'flag') {
    // 村民回報不對勁的信：檢舉數 +1，並另外記一筆給村長看
    var g = findLetter_(d.id);
    if (g.row) g.sh.getRange(g.row, 7).setValue(Number(g.sh.getRange(g.row, 7).getValue() || 0) + 1);
    sheet_('檢舉回報', ['時間','編號','被回報的內容']).appendRow([new Date(), d.id, d.text]);
  } else if (d.type === 'reply') {
    sheet_('飛鴿回信', ['時間','回給誰','原信','回信']).appendRow([new Date(), d.from, d.letter, d.reply]);
  } else {
    sheet_('觀測趨勢', ['時間','代碼','心靈氣候','分數']).appendRow([new Date(), d.code, d.name, JSON.stringify(d.scores)]);
  }
  return ContentService.createTextOutput('ok');
}

function doGet(e){
  var action = (e && e.parameter && e.parameter.action) || 'letters';
  var out;
  if (action === 'stats') {
    // 真實瀏覽人次 = 瀏覽紀錄的筆數（扣掉標題列）
    var v = ss_().getSheetByName('瀏覽紀錄');
    out = {views: v ? Math.max(0, v.getLastRow() - 1) : 0};
  } else {
    // 只回傳「可公開」且沒被回報過的信；私訊與被檢舉的都不會被飛鴿抽到
    var sh = ss_().getSheetByName('飛鴿驛站');
    var rows = sh ? sh.getDataRange().getValues().slice(1) : [];
    out = {letters: rows.filter(function(r){
      return String(r[4]) === '是' && Number(r[6] || 0) < 1;
    }).map(function(r){
      return {id:String(r[5]||''), nick:String(r[1]||'匿名旅人'), mood:String(r[2]||''), text:String(r[3]||''),
              date: r[0] ? Utilities.formatDate(new Date(r[0]), 'Asia/Taipei', 'yyyy/MM/dd') : ''};
    }).filter(function(x){ return x.text; })};
  }
  var body = JSON.stringify(out), cb = e && e.parameter && e.parameter.callback;
  return cb
    ? ContentService.createTextOutput(cb + '(' + body + ')').setMimeType(ContentService.MimeType.JAVASCRIPT)
    : ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}
```

被回報過的信會立刻停止流通（`檢舉 >= 1`）。想改成「兩個人回報才收掉」，把 `< 1` 改成 `< 2`；
想讓某封信重新流通，把該列的「檢舉」欄改回 `0`。

貼上後**先在編輯器按一次「執行」**（選 `doGet`），Google 會跳授權視窗，按「允許」讓它有權限開你的試算表。
之後每次改程式碼，都要回「部署 → 管理部署作業 → ✏️ → 版本：新版本 → 部署」，**網址不會變**。

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

## 首頁的三個數字

全部都是真的，**沒有任何預設或示範數字**：

| 數字       | 怎麼算                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 瀏覽人次   | 沒接試算表：這台裝置真的開過幾次，從**0** 開始。<br />接了試算表：每次開站免登入送一筆進「瀏覽紀錄」，顯示全站真實總數。 |
| 收到的信   | 真的被寫出來的留言數，一開始是**0**。                                                                                    |
| 位陪伴夥伴 | 固定 8 位。                                                                                                                    |

飛鴿攔截戰也一樣：一封真的信都還沒有時，鴿子會老實說「信袋是空的」並請村民先寫一封，
不會生一封假的心事給人讀。

> 已經開過網站的手機，`localStorage` 裡還留著舊的數字。
> 想歸零：後台 →「內容編輯」→「還原成預設」不會清數字，
> 要清請在手機瀏覽器清除該網站的資料，或無痕視窗開一次確認。

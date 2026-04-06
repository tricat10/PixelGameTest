# 像素風闖關問答遊戲 (Pixel Quiz)

這是一個以 Vite + React + TypeScript 打造的像素風格（Pixel Art）問答遊戲。
後端資料庫使用 **Google Sheets** 與 **Google Apps Script (GAS)** 來儲存題目與記錄玩家成績。不僅不需要部署正式後台伺服器，所有人也都可以免費、輕鬆地架設自己的機智問答站。

---

## 🚀 系統需求

- [Node.js](https://nodejs.org/) (建議 v18 以上版本)
- 一個 Google 帳號（用來建立試算表表格）

---

## 🛠️ 第一階段：Google Sheets 與 GAS 後端設定

### 1. 建立試算表與工作表
1. 登入 Google 雲端硬碟，新增一個 **Google 試算表 (Google Sheets)**。
2. 建立兩個工作表，並精準命名為：
   - **`題目`**
   - **`回答`**

### 2. 設定「題目」工作表
請在 `題目` 工作表的第一列（A1~G1）分別填入以下標題：
`題號` | `題目` | `A` | `B` | `C` | `D` | `解答`

**你可以直接複製以下 10 題測試題貼上進行測試：**
*(請從 A2 欄位開始貼上資料)*

| 題號 | 題目 | A | B | C | D | 解答 |
|---|---|---|---|---|---|---|
| 1 | 這個專案的前端使用哪個框架建置？ | Vue | React | Angular | Svelte | B |
| 2 | JavaScript 的創造者是誰？ | Brendan Eich | Linus Torvalds | Bill Gates | Steve Jobs | A |
| 3 | 被認為是世界上第一款電子遊戲的是？ | Pong | 太空侵略者 | 俄羅斯方塊 | Tennis for Two | D |
| 4 | 下列何者「不是」關聯式資料庫引擎？ | MySQL | PostgreSQL | MongoDB | SQLite | C |
| 5 | 任天堂 (Nintendo) 創立初期主要生產什麼？ | 腳踏車 | 電視機 | 花札 (紙牌) | 街機機台 | C |
| 6 | 在 HTML 中，用來表示最重要標題的標籤是？ | &lt;header&gt; | &lt;h6&gt; | &lt;title&gt; | &lt;h1&gt; | D |
| 7 | Linux 系統的核心 (Kernel) 由誰主導開發？ | Richard Stallman | Linus Torvalds | Ken Thompson | Dennis Ritchie | B |
| 8 | 第一款以 3D 視角帶來革命性影響的射擊遊戲？ | 毀滅戰士 (Doom) | 德軍總部3D (Wolfenstein 3D) | 半條命 (Half-Life) | 雷神之鎚 (Quake) | B |
| 9 | HTTP 狀態碼 `404` 代表的意思為何？ | 伺服器錯誤 | 請求成功 | 尚未授權 | 找不到資源 | D |
| 10 | 此專案頭像使用的 API 提供商為？ | DiceBear | Gravatar | RoboHash | Unsplash | A |

### 3. 設定「回答」工作表
這個工作表用來記錄遊玩結果。請在第一列（A1~G1）填入：
`ID` | `闖關次數` | `總分` | `最高分` | `第一次通關分數` | `花了幾次通關` | `最近遊玩時間`

### 4. 部署 Google Apps Script
1. 在試算表的上方選單，點擊 **「擴充功能」 > 「Apps Script」**。
2. 開啟後，刪除預設的內容。
3. 將專案內 `google_apps_script/Code.gs` 的完整程式碼複製，貼到編輯器內並按 `Ctrl+S` 儲存。
4. 點擊右上角 **「部署」 > 「新增部署」**。
5. 點擊「選取類型」旁的齒輪，選擇 **「網頁應用程式 (Web App)」**。
6. 設定存取權限：
   - 執行身分：選擇**「我 (你的信箱)」**。
   - 誰可以存取：選擇**「所有人 (Anyone)」** *(這非常重要，否則前端無法抓資料)*。
7. 點擊「部署」。*(第一次部署可能會跳出驗證您的帳號，請點進階 -> 前往 Code (不安全) 並允許權限)*
8. 部署成功後，你會拿到一組 **「網頁應用程式網址」**(URL)。將其**複製**下來。

---

## 💻 第二階段：本地端開發與啟動

### 1. 安裝依賴套件
開啟終端機（Terminal）並進入此專案目錄，輸入以下指令安裝套件庫：
```bash
npm install
```

### 2. 環境變數設定
開啟專案根目錄的 `.env` 檔案，填寫對應的參數：
```env
# 將等號後方替換為你在上方 GAS 部署獲得的網頁應用程式網址
VITE_GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/.../exec

# 幾分才算通關 (預設3分)
VITE_PASS_THRESHOLD=3

# 每次遊戲從題庫抽幾題 (預設5題)
VITE_QUESTION_COUNT=5
```

### 3. 啟動開發伺服器
執行以下指令來啟動 Vite 開發伺服器：
```bash
npm run dev
```

成功後，終端機將提示你開啟 `http://localhost:5173`。
點擊連結即可開始在你的專屬街機機台上闖關答題！

---

## 🚀 第三階段：GitHub Pages 自動部署

本專案已配置好 GitHub Actions 工作流程，只要推送至 GitHub 即可自動發布成免費網頁。

### 1. 設定 Repository Secrets
確保你的後端連結不會外洩，這三個從 `.env` 中定義的參數需要在 GitHub 上被設置為 Secret：
1. 前往 GitHub 你的 Repository 頁面，點擊上方選單 **Settings**。
2. 尋找左側 **Secrets and variables** > **Actions**。
3. 點擊 **New repository secret**，依次新增以下三個變數與對應的值 (直接將你在 `.env.example` 決定好的值填入即可)：
   - `VITE_GOOGLE_APP_SCRIPT_URL`
   - `VITE_PASS_THRESHOLD`
   - `VITE_QUESTION_COUNT`

### 2. 開啟 Pages 權限
1. 同樣在 **Settings** 頁面的左側，點擊 **Pages**。
2. 在 **Build and deployment** 區段，將 **Source** (來源) 設定為 **GitHub Actions**。

### 3. 推送與發布
將此專案推送（Commit & Push）並放上 `main` 或 `master` 分支，GitHub 就會自動執行幫你把這個遊戲打包好。完成後，回到剛剛的 Pages 頁面頂端就會看到你的正式遊戲連結了！

---

## 🤔 常見問題排解 (Troubleshooting)

- **Q: 點擊 START 顯示 FETCH ERROR？**
  A: 檢查 `.env` 的 `VITE_GOOGLE_APP_SCRIPT_URL` 是否正確。如果最近修改過 `.gs` 的程式碼，請務必點擊**「部署」>「管理部署」> 編輯 (鉛筆圖示) > 版本選擇「新增」** 來發布最新版本的設定！

- **Q: 字體沒有顯示像素風？**
  A: 本專案引入了 Google Font 的 `DotGothic16`。如果無法載入，請確認你的網路沒有阻擋 Google Fonts 的來源。

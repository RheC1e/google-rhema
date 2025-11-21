# RHEMA 員工資訊入口

航冠國際聯運有限公司的員工個人資訊入口網站，使用 Microsoft 365 登入。

## 專案簡介

這是一個 PWA (Progressive Web App) 架構的網站，讓公司員工可以使用 Microsoft 365 帳號登入，查看個人資訊。

### 主要功能

- ✅ Microsoft 365 單一登入 (SSO)
- ✅ 顯示員工個人資訊（姓名、電子郵件、職稱、部門等）
- ✅ 顯示群組成員資格
- ✅ PWA 支援（可安裝到主畫面）
- ✅ 離線快取支援
- ✅ 現代化 UI 設計（Glassmorphism + 深色主題）

### 技術棧

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **身份驗證**: MSAL.js 2.x (Microsoft Authentication Library)
- **API**: Microsoft Graph API
- **PWA**: Service Worker, Web App Manifest
- **部署**: Vercel

## Azure 設定

### 應用程式資訊

- **應用程式（用戶端）ID**: `f2ae1812-de3c-47a0-8663-a8374a559401`
- **租戶 ID**: `cd4e36bd-ac9a-4236-9f91-a6718b6b5e45`
- **租戶網域**: `rhema.com.tw`

### 需要設定的重定向 URI

在 Azure Portal → 應用程式註冊 → 驗證 → 單頁應用程式 (SPA)，新增以下 URI：

**Vercel 部署後**：
```
https://your-vercel-app-name.vercel.app
```

**本地開發**（可選）：
```
http://localhost:5500
http://localhost:8080
```

### API 權限

已授權的權限：
- `User.Read` - 登入並讀取用戶設定檔
- `User.ReadBasic.All` - 讀取所有用戶的基本資料
- `email` - 查看用戶電子郵件地址
- `profile` - 查看用戶基本資料
- `GroupMember.Read.All` - 讀取群組成員

## 本地開發

### 1. 克隆專案

```bash
git clone https://github.com/RheC1e/google-rhema.git
cd google-rhema
```

### 2. 啟動本地伺服器

使用 Python 3:
```bash
python3 -m http.server 8080
```

或使用 VS Code Live Server 擴充功能。

### 3. 開啟瀏覽器

訪問 `http://localhost:8080`

### 4. Azure 設定

確保在 Azure 應用程式註冊中新增對應的重定向 URI（例如 `http://localhost:8080`）。

## Vercel 部署

### 方法一：從 GitHub Import（推薦）

1. 前往 [Vercel](https://vercel.com)
2. 點擊 "New Project"
3. Import Git Repository: `https://github.com/RheC1e/google-rhema`
4. 保持預設設定，點擊 "Deploy"
5. 部署完成後，複製 Vercel 提供的網址

### 方法二：使用 Vercel CLI

```bash
npm i -g vercel
vercel
```

### 部署後設定

1. **取得 Vercel 網址**（例如 `https://google-rhema.vercel.app`）
2. **前往 Azure Portal**
3. **新增重定向 URI**:
   - 路徑：應用程式註冊 → 您的應用程式 → 驗證
   - 平台：單頁應用程式 (SPA)
   - URI: `https://your-vercel-app-name.vercel.app`
   - 儲存變更
4. **測試登入**：使用公司帳號 (如 `ivan.chen@rhema.com.tw`) 登入

## 檔案結構

```
RHEMA/
├── index.html          # 主頁面
├── styles.css          # 樣式表
├── app.js             # 應用程式邏輯
├── manifest.json      # PWA manifest
├── sw.js              # Service Worker
├── vercel.json        # Vercel 配置
├── icons/             # PWA 圖示
│   ├── icon-192x192.png
│   └── icon-512x512.png
└── README.md          # 本檔案
```

## PWA 安裝

### iOS (Safari)

1. 開啟網站
2. 點擊分享按鈕
3. 選擇「加入主畫面」

### Android (Chrome)

1. 開啟網站
2. 點擊選單（三個點）
3. 選擇「安裝應用程式」或「加到主畫面」

### 桌面 (Chrome/Edge)

1. 開啟網站
2. 點擊網址列右側的安裝圖示
3. 點擊「安裝」

## 故障排除

### 登入失敗

1. **檢查重定向 URI**: 確保 Azure 中的重定向 URI 與當前網址完全一致
2. **清除快取**: 清除瀏覽器快取和 cookies
3. **檢查權限**: 確認 API 權限已授予管理員同意
4. **彈出視窗**: 確保瀏覽器沒有阻擋彈出視窗

### Service Worker 問題

```javascript
// 在瀏覽器控制台執行
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
});
```

### 無法載入個人資訊

1. 檢查 Microsoft Graph API 權限
2. 確認使用者有正確的授權
3. 檢查瀏覽器控制台的錯誤訊息

## 授權

© 2025 航冠國際聯運有限公司 (RHEMA INTERNATIONAL LOGISTICS CORP.)

## 聯絡資訊

- **公司網域**: rhema.com.tw
- **管理員**: ivan.chen@rhema.com.tw

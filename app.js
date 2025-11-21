// MSAL 配置
const msalConfig = {
    auth: {
        clientId: 'f2ae1812-de3c-47e0-8663-a8374a559401', // Azure 應用程式 ID
        authority: 'https://login.microsoftonline.com/cd4e36bd-ac9a-4236-9f91-a6718b6b5e45', // 租戶 ID
        redirectUri: window.location.origin, // 當前網址
    },
    cache: {
        cacheLocation: 'sessionStorage', // 使用 sessionStorage
        storeAuthStateInCookie: false,
    }
};

// 登入請求配置
const loginRequest = {
    scopes: [
        'User.Read',
        'User.ReadBasic.All',
        'email',
        'profile',
        'GroupMember.Read.All'
    ]
};

// Graph API endpoints
const graphConfig = {
    graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
    graphGroupsEndpoint: 'https://graph.microsoft.com/v1.0/me/memberOf'
};

// 初始化 MSAL
const myMSALObj = new msal.PublicClientApplication(msalConfig);

// DOM 元素
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const loginScreen = document.getElementById('loginScreen');
const profileScreen = document.getElementById('profileScreen');
const errorMessage = document.getElementById('errorMessage');

// 事件監聽器
loginButton.addEventListener('click', handleLogin);
logoutButton.addEventListener('click', handleLogout);

// 初始化
initialize();

async function initialize() {
    try {
        // 處理重定向回應
        const response = await myMSALObj.handleRedirectPromise();

        if (response) {
            // 登入成功
            console.log('登入成功', response);
            await displayProfile(response.accessToken);
        } else {
            // 檢查是否已有帳號登入
            const accounts = myMSALObj.getAllAccounts();
            if (accounts.length > 0) {
                // 有帳號，嘗試靜默登入
                await silentLogin();
            }
        }
    } catch (error) {
        console.error('初始化錯誤:', error);
        showError(`初始化失敗: ${error.message || '未知錯誤'}`);
    }
}

async function handleLogin() {
    try {
        loginButton.disabled = true;
        loginButton.innerHTML = '<span>登入中...</span>';

        // 使用頁面跳轉登入
        await myMSALObj.loginRedirect(loginRequest);

        // 注意：loginRedirect 會導致頁面跳轉，以下的程式碼在跳轉前可能不會執行完畢
        // 登入後的處理會在 initialize() 中的 handleRedirectPromise() 進行

    } catch (error) {
        console.error('登入錯誤:', error);
        showError(`登入失敗: ${error.message || '未知錯誤'}`);

        loginButton.disabled = false;
        loginButton.innerHTML = `
            <svg class="microsoft-icon" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            <span>使用 Microsoft 365 登入</span>
        `;
    }
}

async function silentLogin() {
    try {
        const accounts = myMSALObj.getAllAccounts();
        if (accounts.length === 0) {
            return;
        }

        const silentRequest = {
            ...loginRequest,
            account: accounts[0]
        };

        const tokenResponse = await myMSALObj.acquireTokenSilent(silentRequest);
        await displayProfile(tokenResponse.accessToken);

    } catch (error) {
        console.log('靜默登入失敗:', error);
        // 靜默失敗不顯示錯誤，等待用戶手動登入
    }
}

async function displayProfile(accessToken) {
    try {
        // 獲取用戶資料
        const userProfile = await callMSGraph(graphConfig.graphMeEndpoint, accessToken);

        console.log('用戶資料:', userProfile);

        // 更新 UI
        updateProfileUI(userProfile);

        // 獲取群組成員資格
        await loadGroupMembership(accessToken);

        // 切換到個人資料頁面
        loginScreen.style.display = 'none';
        profileScreen.style.display = 'block';

    } catch (error) {
        console.error('載入個人資料錯誤:', error);
        showError('無法載入個人資料');
    }
}

function updateProfileUI(profile) {
    // 姓名首字母
    const initials = getInitials(profile.displayName || profile.userPrincipalName);
    document.getElementById('userInitials').textContent = initials;

    // 基本資訊
    document.getElementById('userName').textContent = profile.displayName || '未提供姓名';
    document.getElementById('userEmail').textContent = profile.mail || profile.userPrincipalName;

    // 詳細資訊
    document.getElementById('displayName').textContent = profile.displayName || '-';
    document.getElementById('emailAddress').textContent = profile.mail || profile.userPrincipalName || '-';
    document.getElementById('jobTitle').textContent = profile.jobTitle || '-';
    document.getElementById('department').textContent = profile.department || '-';
    document.getElementById('officeLocation').textContent = profile.officeLocation || '-';
    document.getElementById('mobilePhone').textContent = profile.mobilePhone || '-';
    document.getElementById('businessPhone').textContent = profile.businessPhones?.[0] || '-';
    document.getElementById('userPrincipalName').textContent = profile.userPrincipalName || '-';
}

async function loadGroupMembership(accessToken) {
    const groupContainer = document.getElementById('groupMembership');

    try {
        const groupsData = await callMSGraph(graphConfig.graphGroupsEndpoint, accessToken);

        if (groupsData.value && groupsData.value.length > 0) {
            groupContainer.innerHTML = '';

            groupsData.value.forEach(group => {
                if (group.displayName) {
                    const badge = document.createElement('span');
                    badge.className = 'group-badge';
                    badge.textContent = group.displayName;
                    groupContainer.appendChild(badge);
                }
            });
        } else {
            groupContainer.innerHTML = '<div class="info-value">無群組成員資格</div>';
        }

    } catch (error) {
        console.error('載入群組錯誤:', error);
        groupContainer.innerHTML = '<div class="info-value text-error">無法載入群組資訊</div>';
    }
}

async function callMSGraph(endpoint, accessToken) {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${accessToken}`);

    const options = {
        method: 'GET',
        headers: headers
    };

    const response = await fetch(endpoint, options);

    if (!response.ok) {
        throw new Error(`API 呼叫失敗: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

function handleLogout() {
    const logoutRequest = {
        account: myMSALObj.getAllAccounts()[0],
        postLogoutRedirectUri: window.location.origin
    };

    myMSALObj.logoutRedirect(logoutRequest);
}

function getInitials(name) {
    if (!name) return '?';

    const parts = name.split(' ').filter(p => p.length > 0);

    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }

    return '?';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');

    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// PWA Service Worker 註冊
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker 註冊成功:', registration);
            })
            .catch(error => {
                console.log('Service Worker 註冊失敗:', error);
            });
    });
}

// PWA 安裝提示
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // 可以在這裡顯示自定義的安裝提示
    console.log('PWA 可以安裝');
});

window.addEventListener('appinstalled', () => {
    console.log('PWA 已安裝');
    deferredPrompt = null;
});

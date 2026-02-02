
import { SyncSettings } from '../types';

/**
 * 精準提取 Gist ID
 * 支援：完整網址、使用者/ID 格式、純 ID
 */
export const sanitizeGistId = (id: string) => {
  if (!id) return '';
  const trimmed = id.trim();
  
  // 1. 匹配標準 Gist 網址: gist.github.com/username/ID
  const urlMatch = trimmed.match(/gist\.github\.com\/[^/]+\/([a-f0-9]{20,32})/i);
  if (urlMatch) return urlMatch[1];
  
  // 2. 如果看起來像純 ID (20-32位 16進制)
  if (/^[a-f0-9]{20,32}$/i.test(trimmed)) return trimmed;

  // 3. 如果包含斜槓，嘗試取最後一段並檢查是否為 ID 格式
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/').filter(p => p.length > 0);
    const last = parts[parts.length - 1];
    if (/^[a-f0-9]{20,32}$/i.test(last)) return last;
  }
  
  // 4. 如果都不匹配，回傳原始字串（後續由 syncToGitHub 判斷是否為無效格式並轉為新建模式）
  return trimmed;
};

export const syncToGoogle = async (url: string, data: any) => {
  if (!url) return false;
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return true; 
  } catch (error) {
    console.error("Google Sync Error:", error);
    return false;
  }
};

export const fetchFromGoogle = async (url: string) => {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Google Fetch Error:", error);
    return null;
  }
};

/**
 * 同步到 GitHub
 * 如果 ID 無效，會自動建立一個新的 Gist 並回傳 ID
 */
export const syncToGitHub = async (token: string, rawGistId: string, data: any) => {
  if (!token) return { success: false, message: '請先輸入 GitHub Token' };
  
  const gistId = sanitizeGistId(rawGistId);
  // 只有符合 16 進位 20-32 碼的才是有效 ID，否則視為「需要新建」
  const isValidId = /^[a-f0-9]{20,32}$/i.test(gistId);
  
  const url = isValidId 
    ? `https://api.github.com/gists/${gistId}` 
    : `https://api.github.com/gists`;
  
  const method = isValidId ? 'PATCH' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        description: "SeniorCare OpsCentre Backup",
        public: false, 
        files: {
          "opscentre_data.json": {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });
    
    if (!response.ok) {
        const err = await response.json();
        if (response.status === 404) {
          return { success: false, message: '找不到該 Gist。如果您貼的是網址，請確保是 Gist 的網址而非個人主頁。' };
        }
        if (response.status === 401) {
          return { success: false, message: 'Token 無效或已過期。' };
        }
        return { success: false, message: err.message || '同步失敗' };
    }

    const result = await response.json();
    return { success: true, gistId: result.id };
  } catch (error) {
    return { success: false, message: '網路連線失敗，請檢查後再試。' };
  }
};

export const fetchFromGitHub = async (token: string, rawGistId: string) => {
  if (!token || !rawGistId) return null;
  const gistId = sanitizeGistId(rawGistId);

  // 下載前強制檢查 ID 格式
  if (!/^[a-f0-9]{20,32}$/i.test(gistId)) {
    console.error("無效的 Gist ID 格式，無法下載。");
    return null;
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
        return null;
    }

    const gist = await response.json();
    if (!gist?.files?.["opscentre_data.json"]) return null;

    const content = gist.files["opscentre_data.json"].content;
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error("GitHub 數據下載錯誤:", error);
    return null;
  }
};

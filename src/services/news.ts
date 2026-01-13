import { API_BASE_URL } from "../config/api";

// -----------------------------------------------------
// 💡 类型定义
// -----------------------------------------------------
export interface NewsItem {
    id: number;
    title: string;
    content: string;
    publish_date: string;
    created_at?: string;
}

export interface NewsCreateData {
    title: string;
    content: string;
    publish_date: string;
}

const NEWS_API_URL = `${API_BASE_URL}/news`;

// 辅助函数：获取Token
const getAuthToken = () => localStorage.getItem('authToken');

// -----------------------------------------------------
// 💡 API 函数
// -----------------------------------------------------

/** 获取所有通知 */
export const fetchNewsListApi = async (): Promise<NewsItem[]> => {
    const response = await fetch(`${NEWS_API_URL}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('通知一覧の取得に失敗しました');
    return await response.json();
};

/** 创建通知 */
export const createNewsApi = async (data: NewsCreateData): Promise<NewsItem> => {
    const token = getAuthToken();
    const response = await fetch(`${NEWS_API_URL}/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('新規作成に失敗しました');
    return await response.json();
};

/** 更新通知 */
export const updateNewsApi = async (id: number, data: NewsCreateData): Promise<NewsItem> => {
    const token = getAuthToken();
    const response = await fetch(`${NEWS_API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('更新に失敗しました');
    return await response.json();
};

/** 删除通知 */
export const deleteNewsApi = async (id: number): Promise<void> => {
    const token = getAuthToken();
    const response = await fetch(`${NEWS_API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('削除に失敗しました');
};
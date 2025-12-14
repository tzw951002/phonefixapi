// src/services/old.ts

import {API_BASE_URL} from "../config/api"; // 确保 API_BASE_URL 导入路径正确

// -------------------------------------------------------------------------
// 💡 类型定义 (Old 配置)
// -------------------------------------------------------------------------

// 🎯 统一类型别名 (配置类型，沿用 BatchType)
export type OldType = 1 | 2 | 3 | 4;

// 对应数据库表的行数据结构 (DBOld)
export interface OldItem {
    id: number;
    good_name: string;
    makeshop_identifier: string;
    kakaku_product_id: string;
    batch_type: OldType;
    is_enabled: boolean;
    min_price_threshold: number | null;

    // ⬇️ 新增的字段 ⬇️
    good_status: string | null;
    missing_info: string | null;
    accessories_info: string | null;
    detail_comment: string | null;
    serial_number: string | null;
    // ⬆️ 新增的字段 ⬆️
}

// 检索表单的字段结构 (OldQuery)
export interface OldQuery {
    good_name?: string;
    makeshop_identifier?: string;
    kakaku_product_id?: string;
    batch_type?: OldType;
    is_enabled?: boolean;
    good_status?: string; // 增加 good_status 过滤
    // 可以继续增加其他新增字段的过滤，这里仅以 good_status 为例
}

// 创建/更新 Old 项目所需的数据结构
export interface OldCreateData {
    good_name: string;
    makeshop_identifier: string;
    kakaku_product_id: string;
    batch_type: OldType;
    is_enabled: boolean;
    min_price_threshold: number | null;

    // ⬇️ 新增的字段 ⬇️
    good_status: string | null;
    missing_info: string | null;
    accessories_info: string | null;
    detail_comment: string | null;
    serial_number: string | null;
    // ⬆️ 新增的字段 ⬆️
}


// -------------------------------------------------------------------------
// 💡 API URL
// -------------------------------------------------------------------------

// 基础 API URL (用于删除/获取单个/更新)
const BASE_API_OLD_URL = `${API_BASE_URL}/old`;

// 新增 API URL
const CREATE_OLD_API_URL = `${API_BASE_URL}/old/create`;

// 列表 API URL
const OLD_LIST_API_URL = `${API_BASE_URL}/old/getList`;

// -------------------------------------------------------------------------
// 💡 辅助函数
// -------------------------------------------------------------------------

/**
 * 从 localStorage 获取认证 Token
 * @returns Token 字符串或 null
 */
const getAuthToken = (): string | null => {
    // 假设 Token 存储在 localStorage 的 'authToken' 键中
    return localStorage.getItem('authToken');
};

// -------------------------------------------------------------------------
// 💡 API 函数 (Old 配置)
// -------------------------------------------------------------------------

/**
 * 根据 ID 获取单个 Old 配置详情
 */
export const fetchOldItemByIdApi = async (id: number): Promise<OldItem> => {

    const token = getAuthToken();
    if (!token) {
        throw new Error('認証トークンが見つかりません。再ログインしてください。');
    }

    const url = `${BASE_API_OLD_URL}/${id}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const defaultErrorMessage = `ID: ${id} のデータ取得に失敗しました`;

        if (!response.ok) {
            let errorMessage = defaultErrorMessage;
            const clonedResponse = response.clone();

            if (response.status === 401) {
                throw new Error('認証失敗またはトークン期限切れです。再ログインしてください。');
            }
            if (response.status === 404) {
                throw new Error(`Old 設定 (ID: ${id}) が見つかりませんでした。`);
            }

            try {
                const errorData = await clonedResponse.json();
                errorMessage = errorData.detail || errorData.message || defaultErrorMessage;
            } catch (e) {
                errorMessage = (response.status >= 400 && response.status < 600)
                    ? `${defaultErrorMessage} (HTTP Status: ${response.status})`
                    : `HTTP エラー: ${response.status} ${response.statusText}`;
            }

            throw new Error(errorMessage);
        }

        return await response.json();

    } catch (error) {
        console.error('Fetch Old Item By ID API Error:', error);
        throw error;
    }
};


/**
 * 更新单个 Old 配置
 */
export const updateOldItemApi = async (id: number, data: OldCreateData): Promise<OldItem> => {

    const token = getAuthToken();
    if (!token) {
        throw new Error('認証トークンが見つかりません。再ログインしてください。');
    }

    const url = `${BASE_API_OLD_URL}/${id}`;

    try {
        const response = await fetch(url, {
            method: 'PATCH', // PATCH メソッドを使用
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // 更新データを送信
        });

        const defaultErrorMessage = `ID: ${id} の更新に失敗しました`;

        if (!response.ok) {
            let errorMessage = defaultErrorMessage;
            const clonedResponse = response.clone();

            if (response.status === 401) {
                throw new Error('認証失敗またはトークン期限切れです。再ログインしてください。');
            }
            if (response.status === 404) {
                throw new Error(`Old configuration with ID ${id} not found`);
            }

            try {
                const errorData = await clonedResponse.json();
                errorMessage = errorData.detail || errorData.message || defaultErrorMessage;
            } catch (e) {
                errorMessage = (response.status >= 400 && response.status < 600)
                    ? `${defaultErrorMessage} (HTTP Status: ${response.status})`
                    : `HTTP エラー: ${response.status} ${response.statusText}`;
            }

            throw new Error(errorMessage);
        }

        return await response.json();

    } catch (error) {
        console.error('Update Old Item API Error:', error);
        throw error;
    }
};


/**
 * 创建新的 Old 配置项目
 */
export const createOldItemApi = async (data: OldCreateData): Promise<OldItem> => {

    const token = getAuthToken();
    if (!token) {
        throw new Error('認証トークンが見つかりません。再ログインしてください。');
    }

    try {
        const response = await fetch(CREATE_OLD_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // 提交数据
        });

        const defaultErrorMessage = '新規作成に失敗しました';

        if (!response.ok) {
            let errorMessage = defaultErrorMessage;
            const clonedResponse = response.clone();

            if (response.status === 401) {
                throw new Error('認証失敗またはトークン期限切れです。再ログインしてください。');
            }
            // 409 冲突也需要处理（组合标识符已存在）
            if (response.status === 409) {
                throw new Error('このMakeshop/Kakaku IDの組み合わせは既に存在します。');
            }

            try {
                const errorData = await clonedResponse.json();
                errorMessage = errorData.detail || errorData.message || defaultErrorMessage;
            } catch (e) {
                errorMessage = (response.status >= 400 && response.status < 600)
                    ? `${defaultErrorMessage} (HTTP Status: ${response.status})`
                    : `HTTP エラー: ${response.status} ${response.statusText}`;
            }

            throw new Error(errorMessage);
        }

        return await response.json();

    } catch (error) {
        console.error('Create Old Item API Error:', error);
        throw error;
    }
};


/**
 * 获取 Old 配置列表数据
 */
export const fetchOldListApi = async (query: OldQuery): Promise<OldItem[]> => {

    const token = getAuthToken();
    if (!token) {
        throw new Error('認証トークンが見つかりません。再ログインしてください。');
    }

    // 构建 URL 和查询参数
    const params = new URLSearchParams();
    if (query.good_name) {
        params.append('good_name', query.good_name);
    }
    if (query.makeshop_identifier) {
        params.append('makeshop_identifier', query.makeshop_identifier);
    }
    if (query.kakaku_product_id) {
        params.append('kakaku_product_id', query.kakaku_product_id);
    }
    if (query.batch_type !== undefined) {
        params.append('batch_type', String(query.batch_type));
    }
    if (query.is_enabled !== undefined) {
        params.append('is_enabled', String(query.is_enabled));
    }
    // 增加新增字段的查询参数
    if (query.good_status) {
        params.append('good_status', query.good_status);
    }


    const url = `${OLD_LIST_API_URL}?${params.toString()}`;

    try {
        // 发送请求
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const defaultErrorMessage = 'データ取得に失敗しました';

        if (!response.ok) {
            let errorMessage = defaultErrorMessage;
            const clonedResponse = response.clone();

            if (response.status === 401) {
                throw new Error('認証失敗またはトークン期限切れです。再ログインしてください。');
            }

            try {
                const errorData = await clonedResponse.json();
                errorMessage = errorData.detail || errorData.message || defaultErrorMessage;
            } catch (e) {
                errorMessage = (response.status >= 400 && response.status < 600)
                    ? `${defaultErrorMessage} (HTTP Status: ${response.status})`
                    : `HTTP エラー: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        // 成功响应处理
        return await response.json();

    } catch (error) {
        console.error('OldList API Error:', error);
        throw error;
    }
};


/**
 * 删除 Old 配置项目
 */
export const deleteOldItemApi = async (id: number): Promise<void> => {

    const token = getAuthToken();
    if (!token) {
        throw new Error('認証トークンが見つかりません。再ログインしてください。');
    }

    const url = `${BASE_API_OLD_URL}/${id}`; // 构造带 ID 的删除 URL

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const defaultErrorMessage = `ID: ${id} の削除に失敗しました`;

        if (!response.ok) {

            if (response.status === 401) {
                throw new Error('認証失敗またはトークン期限切れです。再ログインしてください。');
            }
            if (response.status === 404) {
                throw new Error(`Old configuration with ID ${id} not found`);
            }

            let errorMessage = defaultErrorMessage;
            const clonedResponse = response.clone();

            try {
                const errorData = await clonedResponse.json();
                errorMessage = errorData.detail || errorData.message || defaultErrorMessage;
            } catch (e) {
                errorMessage = (response.status >= 400 && response.status < 600)
                    ? `${defaultErrorMessage} (HTTP Status: ${response.status})`
                    : `HTTP エラー: ${response.status} ${response.statusText}`;
            }

            throw new Error(errorMessage);
        }

        // 成功删除，不返回内容
    } catch (error) {
        console.error('Delete Old Item API Error:', error);
        throw error;
    }
};
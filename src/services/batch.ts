// src/services/batch.ts

import {API_BASE_URL} from "../config/api"; // 确保 API_BASE_URL 导入路径正确

// -------------------------------------------------------------------------
// 💡 类型定义
// -------------------------------------------------------------------------

// 🎯 统一类型别名
export type BatchType = 1 | 2 | 3 | 4;

// 对应数据库表的行数据结构
export interface BatchItem {
    id: number;
    good_name: string;
    makeshop_identifier: string;
    kakaku_product_id: string;
    batch_type: BatchType; // 👈 统一使用 1 | 2 | 3 | 4
    is_enabled: boolean;
    min_price_threshold: number | null;
}

// 检索表单的字段结构
export interface BatchQuery {
    good_name?: string;
    makeshop_identifier?: string;
    kakaku_product_id?: string;
}

// 创建批次项目所需的数据结构（与 BatchItem 类似，但不包含 id）
export interface BatchCreateData {
    good_name: string;
    makeshop_identifier: string;
    kakaku_product_id: string;
    batch_type: BatchType; // 👈 统一使用 1 | 2 | 3 | 4
    is_enabled: boolean;
    min_price_threshold: number | null;
}

// -------------------------------------------------------------------------
// 💡 API URL
// -------------------------------------------------------------------------

// 基础 API URL (用于删除)
const BASE_API_URL = `${API_BASE_URL}/batch`;

// 新增 API URL
const CREATE_API_URL = `${API_BASE_URL}/batch/create`;

// 列表 API URL
const BATCH_LIST_API_URL = `${API_BASE_URL}/batch/getList`;

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
// 💡 API 函数
// -------------------------------------------------------------------------

export const fetchBatchItemByIdApi = async (id: number): Promise<BatchItem> => {

    const token = getAuthToken();
    if (!token) {
        throw new Error('認証トークンが見つかりません。再ログインしてください。');
    }

    const url = `${BASE_API_URL}/${id}`; // エンドポイントは /batch/{id}

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
                throw new Error(`バッチ設定 (ID: ${id}) が見つかりませんでした。`);
            }

            try {
                const errorData = await clonedResponse.json();
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                    errorMessage = defaultErrorMessage;
                }
            } catch (e) {
                if (response.status >= 400 && response.status < 600) {
                    errorMessage = `${defaultErrorMessage} (HTTP Status: ${response.status})`;
                } else {
                    errorMessage = `HTTP エラー: ${response.status} ${response.statusText}`;
                }
            }

            throw new Error(errorMessage);
        }

        return await response.json();

    } catch (error) {
        console.error('Fetch Batch Item By ID API Error:', error);
        throw error;
    }
};


export const updateBatchItemApi = async (id: number, data: BatchCreateData): Promise<BatchItem> => {

    const token = getAuthToken();
    if (!token) {
        throw new Error('認証トークンが見つかりません。再ログインしてください。');
    }

    // 🎯 エンドポイントを /batch/{id} に修正
    const url = `${BASE_API_URL}/${id}`;

    try {
        const response = await fetch(url, {
            method: 'PATCH', // 💡 PATCH メソッドを使用
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
            if (response.status === 404) { // 404 も明確に処理
                throw new Error(`Batch configuration with ID ${id} not found`);
            }

            try {
                const errorData = await clonedResponse.json();
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                    errorMessage = defaultErrorMessage;
                }
            } catch (e) {
                if (response.status >= 400 && response.status < 600) {
                    errorMessage = `${defaultErrorMessage} (HTTP Status: ${response.status})`;
                } else {
                    errorMessage = `HTTP エラー: ${response.status} ${response.statusText}`;
                }
            }

            throw new Error(errorMessage);
        }

        return await response.json();

    } catch (error) {
        console.error('Update Batch Item API Error:', error);
        throw error;
    }
};


/**
 * 封装的新增批次项目 API 调用
 */
export const createBatchItemApi = async (data: BatchCreateData): Promise<BatchItem> => {

    const token = getAuthToken();
    if (!token) {
        throw new Error('認証トークンが見つかりません。再ログインしてください。');
    }

    try {
        const response = await fetch(CREATE_API_URL, {
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

            try {
                const errorData = await clonedResponse.json();
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                    errorMessage = defaultErrorMessage;
                }
            } catch (e) {
                if (response.status >= 400 && response.status < 600) {
                    errorMessage = `${defaultErrorMessage} (HTTP Status: ${response.status})`;
                } else {
                    errorMessage = `HTTP エラー: ${response.status} ${response.statusText}`;
                }
            }

            throw new Error(errorMessage);
        }

        return await response.json();

    } catch (error) {
        console.error('Create Batch Item API Error:', error);
        throw error;
    }
};


/**
 * 封装的批次列表数据获取 API 调用
 */
export const fetchBatchListApi = async (query: BatchQuery): Promise<BatchItem[]> => {

    // 1. 获取认证 Token
    const token = getAuthToken();
    if (!token) {
        throw new Error('認証トークンが見つかりません。再ログインしてください。');
    }

    // 2. 构建 URL 和查询参数
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

    const url = `${BATCH_LIST_API_URL}?${params.toString()}`;

    try {
        // 3. 发送请求，包含 Authorization Header
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // 👈 Bearer Token 认证
                'Content-Type': 'application/json',
            },
        });

        const defaultErrorMessage = 'データ取得に失敗しました';

        if (!response.ok) {
            let errorMessage = defaultErrorMessage;
            const clonedResponse = response.clone();

            // 特殊处理 401 认证失败
            if (response.status === 401) {
                throw new Error('認証失敗またはトークン期限切れです。再ログインしてください。');
            }

            try {
                // 尝试解析后端返回的 JSON 错误体
                const errorData = await clonedResponse.json();

                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                    errorMessage = defaultErrorMessage;
                }

            } catch (e) {
                // 如果不是 JSON 错误体
                if (response.status >= 400 && response.status < 600) {
                    errorMessage = `${defaultErrorMessage} (HTTP Status: ${response.status})`;
                } else {
                    errorMessage = `HTTP エラー: ${response.status} ${response.statusText}`;
                }
            }
            throw new Error(errorMessage);
        }

        console.log(response)
        // 成功响应处理
        return await response.json();

    } catch (error) {
        console.error('BatchList API Error:', error);
        throw error;
    }
};


/**
 * 封装的删除批次项目 API 调用
 * @param id 要删除的批次项目 ID
 */
export const deleteBatchItemApi = async (id: number): Promise<void> => {

    const token = getAuthToken();
    if (!token) {
        throw new Error('認証トークンが見つかりません。再ログインしてください。');
    }

    const url = `${BASE_API_URL}/${id}`; // 构造带 ID 的删除 URL

    try {
        const response = await fetch(url, {
            method: 'DELETE', // 使用 DELETE 方法
            headers: {
                'Authorization': `Bearer ${token}`, // Bearer Token 认证
                'Content-Type': 'application/json',
            },
        });

        const defaultErrorMessage = `ID: ${id} の削除に失敗しました`;

        if (!response.ok) {

            // 特殊处理 401 认证失败
            if (response.status === 401) {
                throw new Error('認証失敗またはトークン期限切れです。再ログインしてください。');
            }

            // 处理其他 HTTP 错误
            let errorMessage = defaultErrorMessage;
            const clonedResponse = response.clone();

            try {
                const errorData = await clonedResponse.json();
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                    errorMessage = defaultErrorMessage;
                }
            } catch (e) {
                if (response.status >= 400 && response.status < 600) {
                    errorMessage = `${defaultErrorMessage} (HTTP Status: ${response.status})`;
                } else {
                    errorMessage = `HTTP エラー: ${response.status} ${response.statusText}`;
                }
            }

            throw new Error(errorMessage);
        }

        // 成功删除，不返回内容
    } catch (error) {
        console.error('Delete Batch Item API Error:', error);
        throw error;
    }
};
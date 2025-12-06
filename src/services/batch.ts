// src/services/batch.ts

import {API_BASE_URL} from "../config/api"; // 确保 API_BASE_URL 导入路径正确
// 对应数据库表的行数据结构
export interface BatchItem {
    id: number;
    makeshop_identifier: string;
    kakaku_product_id: string;
    batch_type: 1 | 2 | 3 | 4 ;
    is_enabled: boolean;
    min_price_threshold: number | null;
}

// 检索表单的字段结构
export interface BatchQuery {
    makeshop_identifier?: string;
    kakaku_product_id?: string;
}

// 创建批次项目所需的数据类型（与 BatchItem 类似，但不包含 id）
export interface BatchCreateData {
    makeshop_identifier: string;
    kakaku_product_id: string;
    batch_type: 1 | 2;
    is_enabled: boolean;
    min_price_threshold: number | null;
}

const CREATE_API_URL = `${API_BASE_URL}/batch/create`;

// 基础 API URL
const BATCH_API_URL = `${API_BASE_URL}/batch/getList`;

/**
 * 从 localStorage 获取认证 Token
 * @returns Token 字符串或 null
 */
const getAuthToken = (): string | null => {
    // 假设 Token 存储在 localStorage 的 'authToken' 键中
    return localStorage.getItem('authToken');
};


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
 * @param query 检索参数，例如 makeshop_identifier, kakaku_product_id
 * @returns 批次项目列表
 */
export const fetchBatchListApi = async (query: BatchQuery): Promise<BatchItem[]> => {

    // 1. 获取认证 Token
    const token = getAuthToken();
    if (!token) {
        throw new Error('認証トークンが見つかりません。再ログインしてください。');
    }

    // 2. 构建 URL 和查询参数
    const params = new URLSearchParams();
    if (query.makeshop_identifier) {
        params.append('makeshop_identifier', query.makeshop_identifier);
    }
    if (query.kakaku_product_id) {
        params.append('kakaku_product_id', query.kakaku_product_id);
    }

    const url = `${BATCH_API_URL}?${params.toString()}`;

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

        // 成功响应处理
        return await response.json();

    } catch (error) {
        console.error('BatchList API Error:', error);
        throw error;
    }
};
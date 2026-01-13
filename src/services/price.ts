import { API_BASE_URL } from "../config/api";

export interface PriceItem {
    id: number;
    category_id: number;
    repair_type_id: number;
    model_name: string;
    price: number;
    price_suffix: string;
    is_visible: boolean; // 建议加上，控制显示隐藏
    sort_order: number;  // 【新增】排序权重
}

const PRICE_API_URL = `${API_BASE_URL}/prices`;
const getAuthToken = () => localStorage.getItem('authToken');

/** 联动查询价格列表 */
export const fetchPriceListApi = async (catId: number, rtId: number): Promise<PriceItem[]> => {
    const response = await fetch(`${PRICE_API_URL}/?category_id=${catId}&repair_type_id=${rtId}`, {
        method: 'GET'
    });
    if (!response.ok) throw new Error('価格データの取得に失敗しました');
    return await response.json();
};

/** 保存价格 (支持新增和更新) */
export const savePriceApi = async (data: Partial<PriceItem>, priceId?: number): Promise<PriceItem> => {
    const token = getAuthToken();
    const url = priceId ? `${PRICE_API_URL}/?price_id=${priceId}` : `${PRICE_API_URL}/`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return await response.json();
};

/** 删除价格 */
export const deletePriceApi = async (id: number): Promise<void> => {
    const token = getAuthToken();
    await fetch(`${PRICE_API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
};
import { API_BASE_URL } from "../config/api";

export interface CategoryItem {
    id: number;
    name: string;
    sort_order: number;
}

export interface RepairTypeItem {
    id: number;
    name: string;
    sort_order: number;
}

const CAT_API_URL = `${API_BASE_URL}/categories`;
const getAuthToken = () => localStorage.getItem('authToken');

/** 获取所有机种分类 */
export const fetchCategoriesApi = async (): Promise<CategoryItem[]> => {
    const response = await fetch(`${CAT_API_URL}/`, { method: 'GET' });
    return await response.json();
};

/** 新增分类 */
export const createCategoryApi = async (data: Partial<CategoryItem>) => {
    const token = getAuthToken();
    const response = await fetch(`${CAT_API_URL}/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
};

/** 获取所有维修项目 */
export const fetchRepairTypesApi = async (): Promise<RepairTypeItem[]> => {
    const response = await fetch(`${CAT_API_URL}/repair-types`, { method: 'GET' });
    return await response.json();
};
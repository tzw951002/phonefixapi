// src/pages/BatchList/types.ts

// 对应数据库表的行数据结构
export interface BatchItem {
    id: number;
    makeshop_identifier: string;
    kakaku_product_id: string;
    batch_type: 1 | 2 | 3 | 4 ; // 假设 1=第一位价格 2=最低 3=2位 4=3位
    is_enabled: boolean;
    min_price_threshold: number | null;
}

// 检索表单的字段结构
export interface BatchQuery {
    makeshop_identifier?: string;
    kakaku_product_id?: string;
}
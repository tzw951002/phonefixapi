// 定义侧边栏菜单的 Key 类型，防止拼写错误
export type MenuKey = 'news' | 'categories' | 'prices';

// 基础的通知数据模型
export interface NewsItem {
    id: number;
    publish_date: string;
    title: string;
    content: string;
}

// 机种分类模型
export interface CategoryItem {
    id: number;
    name: string;
    sort_order: number;
}
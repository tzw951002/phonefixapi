// src/pages/BatchList/BatchList.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Table, Form, Input, Button, Space, Tag, Popconfirm, message, Menu, Layout } from 'antd';
import type { TableProps, ColumnType } from 'antd/lib/table';
// 🌟 新增图标导入
import { MenuFoldOutlined, MenuUnfoldOutlined, AppstoreOutlined, ShopOutlined, LogoutOutlined } from '@ant-design/icons'; // 💡 导入 LogoutOutlined

// 💡 导入 Batch 相关的 API 和类型 (保持不变)
import { fetchBatchListApi, deleteBatchItemApi, BatchItem, BatchQuery } from '../../services/batch';

// 💡 导入 Old 相关的 API 和类型 (新增)
import { fetchOldListApi, deleteOldItemApi, OldItem, OldQuery } from '../../services/old';

// 💡 导入 useLocation 来获取 URL 参数
import { useNavigate, useLocation } from 'react-router-dom';

import styles from './style.module.css';

type ProductTypeKey = 'new' | 'used'; // 'new' 对应 Batch, 'used' 对应 Old

// 统一使用的查询类型，OldQuery 包含了 BatchQuery 的所有字段
type UnifiedQuery = OldQuery;
// 统一使用的展示类型，OldItem 包含了 BatchItem 的所有字段
type UnifiedItem = OldItem;

const BatchList: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 💡 获取当前 URL 信息

    // 1. 从 URL 中读取 'tab' 参数来确定初始选中的菜单项
    const getInitialActiveKey = (): ProductTypeKey => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab') as ProductTypeKey;

        // 如果 URL 中有 'used' 或 'new' 参数，则使用它，否则默认 'new'
        return (tab === 'new' || tab === 'used') ? tab : 'new';
    };

    const [data, setData] = useState<UnifiedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<UnifiedQuery>();

    // 💡 使用 URL 参数初始化 activeKey
    const [activeKey, setActiveKey] = useState<ProductTypeKey>(getInitialActiveKey);
    const [collapsed, setCollapsed] = useState(false); // 控制折叠

    // 侧边菜单项
    const menuItems = [
        {
            key: 'new',
            icon: <AppstoreOutlined />,
            label: '新品一覧',
        },
        {
            key: 'used',
            icon: <ShopOutlined />,
            label: '中古品一覧',
        },
        // 💡 退出按钮
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'ログアウト',
            danger: true, // 标记为危险操作，通常会显示红色
        },
    ];

    // 💡 核心逻辑：根据 activeKey 调用不同的 API
    const loadData = async (values: UnifiedQuery) => {
        setLoading(true);
        try {
            let list: UnifiedItem[] = [];

            // 提取共享的查询参数
            const sharedQueryParams = {
                good_name: values.good_name,
                makeshop_identifier: values.makeshop_identifier,
                kakaku_product_id: values.kakaku_product_id,
            };

            if (activeKey === 'new') {
                // 调用 Batch API
                list = await fetchBatchListApi(sharedQueryParams as BatchQuery) as UnifiedItem[];
            } else if (activeKey === 'used') {
                // 调用 Old API (不带 good_status 过滤)
                list = await fetchOldListApi(sharedQueryParams as OldQuery);
            }

            setData(list);
        } catch (error) {
            console.error(error);
            message.error(error instanceof Error ? error.message : 'Error');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 在切换 tab 时，清空表单字段，然后加载数据
        form.resetFields();
        loadData(form.getFieldsValue());

        // 💡 确保 URL 中的 tab 参数与当前 activeKey 保持一致
        if (location.search.includes('tab=') && location.search !== `?tab=${activeKey}`) {
            // 如果 URL 参数与当前状态不符，则更新 URL (但不触发页面刷新或组件重新挂载)
            navigate(`/batchList?tab=${activeKey}`, { replace: true });
        } else if (!location.search.includes('tab=') && activeKey !== 'new') {
            // 如果默认是 'new' 却没有参数，但 activeKey 却是 'used' (通过直接访问 /batchList?tab=used)
            // 此时应确保 URL 有参数
            navigate(`/batchList?tab=${activeKey}`, { replace: true });
        }

    }, [activeKey, location.search]); // 依赖 activeKey 和 location.search 变化

    const onFinish = (values: UnifiedQuery) => { loadData(values); };

    // 💡 菜单点击处理逻辑
    const handleMenuClick = (e: { key: string }) => {
        if (e.key === 'logout') {
            // 1. 清空本地缓存
            localStorage.clear();
            message.success('ログアウトしました。');

            // 2. 导航到主页面 (/)
            navigate('/', { replace: true });
            return;
        }

        // 处理其他菜单项（new / used）
        setActiveKey(e.key as ProductTypeKey);
        // 切换菜单时，更新 URL 参数
        navigate(`/batchList?tab=${e.key}`, { replace: true });
    };

    // --- ⬇️ 删除逻辑：根据 activeKey 调用不同的 API ---
    const handleDelete = async (id: number) => {
        try {
            message.loading({ content: '削除処理中...', key: 'delete' });

            if (activeKey === 'new') {
                await deleteBatchItemApi(id);
            } else {
                await deleteOldItemApi(id);
            }

            message.success({ content: `ID: ${id} 削除成功`, key: 'delete' });
            loadData(form.getFieldsValue());
        } catch (error) {
            message.error({ content: '削除失敗', key: 'delete' });
        }
    };

    const getBatchTypeText = (type: UnifiedItem['batch_type']) => {
        const types = { 1: '最安値', 2: '1位と同じ', 3: '2位価格', 4: '3位価格' };
        return types[type as keyof typeof types] || '不明';
    };

    // 💡 使用 useMemo 动态生成 columns
    const columns: TableProps<UnifiedItem>['columns'] = useMemo(() => {
        // 1. 基础共有列（无论新品还是中古都显示的字段）
        const baseColumns: ColumnType<UnifiedItem>[] = [
            { title: '商品名', dataIndex: 'good_name', key: 'good_name', width: 180 },
            { title: 'Makeshop独自商品コード', dataIndex: 'makeshop_identifier', key: 'makeshop_identifier', width: 150 },
            { title: '価格.com商品ID', dataIndex: 'kakaku_product_id', key: 'kakaku_product_id', width: 150 },
        ];

        // 2. 中古特有列：状态、欠品、SN + コメント (仅中古显示)
        const oldSpecificColumns: ColumnType<UnifiedItem>[] = [
            { title: '状態', dataIndex: 'good_status', key: 'good_status', width: 120, render: (t) => t || '-' },
            { title: '欠品', dataIndex: 'missing_info', key: 'missing_info', width: 150, render: (t) => t || '-' },
            { title: '附属品', dataIndex: 'accessories_info', key: 'accessories_info', width: 150, render: (t) => t || '-' },
            { title: '製造番号', dataIndex: 'serial_number', key: 'serial_number', width: 150, render: (t) => t || '-' },
            {
                title: 'コメント',
                dataIndex: 'detail_comment',
                key: 'detail_comment',
                width: 200,
                ellipsis: true, // 防止备注过长撑破表格
                render: (t) => t || '-'
            },
        ];

        // 3. 新品特有列：順位、閾値 (仅新品显示)
        const newSpecificColumns: ColumnType<UnifiedItem>[] = [
            { title: 'JANコード', dataIndex: 'jancode', key: 'jancode', width: 140, render: (t) => t || '-' },
            { title: '順位', dataIndex: 'batch_type', width: 100, render: (t) => getBatchTypeText(t) },
            { title: '閾値', dataIndex: 'min_price_threshold', width: 120, align: 'right', render: (p) => p ? `${p.toLocaleString()} 円` : '-' }
        ];

        // 4. 结尾共有列：有效状态、操作按钮
        const commonEndColumns: ColumnType<UnifiedItem>[] = [
            { title: '有効', dataIndex: 'is_enabled', width: 80, align: 'center', render: (e) => <Tag color={e ? 'green' : 'red'}>{e ? '有効' : '無効'}</Tag> },
            {
                title: '操作', key: 'action', width: 150, fixed: 'right',
                render: (_, record) => (
                    <Space>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => navigate(activeKey === 'new' ? `/batchEdit/${record.id}` : `/oldEdit/${record.id}`)}
                        >
                            編集
                        </Button>
                        <Popconfirm title="削除しますか？" onConfirm={() => handleDelete(record.id)}>
                            <Button type="link" size="small" danger>削除</Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ];

        // 💡 核心逻辑：根据 activeKey 严格分发列
        if (activeKey === 'used') {
            // 中古：基础 + 中古特有(含备注) + 结尾
            return [...baseColumns, ...oldSpecificColumns, ...commonEndColumns];
        } else {
            // 新品：基础 + 新品特有(顺位/阈值) + 结尾
            return [...baseColumns, ...newSpecificColumns, ...commonEndColumns];
        }
    }, [activeKey, navigate]);// 依赖 activeKey 变化和 navigate 函数

    // 💡 动态决定跳转路径
    const createPath = activeKey === 'new' ? '/batchCreate' : '/oldCreate';

    // 💡 动态计算表格滚动宽度
    // 基础宽度 930px，中古模式下增加 420px
    const scrollX = activeKey === 'used' ? 1350 : 930;

    return (
        <div className={styles['clean-dashboard-container']}>
            <Layout style={{ minHeight: '100vh' }}>
                <Layout.Sider
                    theme="light"
                    width={220}
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    className={styles['custom-sider']}
                >
                    <div className={styles['sider-header']}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className={styles['trigger-button']}
                        />
                        {!collapsed && <span className={styles['sider-title']}>管理メニュー</span>}
                    </div>

                    <Menu
                        mode="inline"
                        selectedKeys={[activeKey]}
                        onClick={handleMenuClick}
                        items={menuItems}
                        className={styles['custom-menu']}
                        // 💡 将退出按钮放在底部
                        style={{ height: 'calc(100% - 64px)' }}
                    />

                    {/* 💡 另一个更 Ant Design 风格的做法是将 Logout 放在 Menu 外，这里使用 Menu 内嵌的方式，
                         但需要调整 Menu 的高度使其能推到底部，或者使用 Footer/Divider 隔离。
                         为保持代码简洁，暂时使用内嵌并设置高度的方式。 */}

                </Layout.Sider>

                <Layout className={styles['site-layout']}>
                    <Layout.Content style={{ margin: '24px 24px', minHeight: 280 }}>
                        <div className={styles['clean-panel']}>
                            <h2 className={styles['clean-title']}>
                                {activeKey === 'new' ? '📦 新品一覧' : '♻️ 中古品一覧'}
                            </h2>

                            {/* 检索表单 */}
                            <Form form={form} layout="inline" onFinish={onFinish} className={styles['clean-search-form']}>
                                <Form.Item label="商品名" name="good_name">
                                    <Input className={styles['clean-input-small']} placeholder="Name..." allowClear />
                                </Form.Item>
                                <Form.Item label="Makeshop独自商品コード" name="makeshop_identifier">
                                    <Input className={styles['clean-input-small']} placeholder="M_SKU..." allowClear />
                                </Form.Item>
                                <Form.Item label="価格.com商品ID" name="kakaku_product_id">
                                    <Input className={styles['clean-input-small']} placeholder="K_ID..." allowClear />
                                </Form.Item>

                                {/* 💡 中古模式下不显示额外的搜索框 */}

                                <Form.Item>
                                    <Button className={styles['clean-button-search']} type="primary" htmlType="submit">検索</Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button className={styles['clean-button-reset']} onClick={() => form.resetFields()}>クリア</Button>
                                </Form.Item>
                            </Form>

                            <div className={styles['clean-toolbar']}>
                                {/* 💡 新增按钮的跳转路径使用动态变量 */}
                                <Button
                                    className={styles['clean-button-primary']}
                                    type="primary"
                                    onClick={() => navigate(createPath)}
                                >
                                    新規作成
                                </Button>
                            </div>

                            <Table
                                className={styles['clean-table']}
                                columns={columns} // 使用 useMemo 后的动态列
                                dataSource={data}
                                rowKey="id"
                                loading={loading}
                                pagination={false}
                                scroll={{ x: scrollX }} // 使用动态滚动宽度
                            />
                        </div>
                    </Layout.Content>
                </Layout>
            </Layout>
        </div>
    );
};

export default BatchList;
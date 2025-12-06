// src/pages/BatchList/BatchList.tsx

import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Space, Tag, Popconfirm, message } from 'antd';
import type { TableProps } from 'antd';

// 🎯 从 service 文件导入 API 函数和类型，不再需要导入 './types'
import { fetchBatchListApi, BatchItem, BatchQuery } from '../../services/batch';
import { useNavigate } from 'react-router-dom';

import styles from './style.module.css';


// -------------------------------------------------------------------------
// 💡 MOCK 数据和 API (已移除，替换为实际 API 调用)
// -------------------------------------------------------------------------
// 🚨 MOCK 数据和 API 逻辑已移除，请确保您的 services/batch.ts 文件已就绪。
// -------------------------------------------------------------------------


// -------------------------------------------------------------------------
// 💡 组件主体
// -------------------------------------------------------------------------

const BatchList: React.FC = () => {
    // 状态定义
    const [data, setData] = useState<BatchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<BatchQuery>();

    const navigate = useNavigate();


    /**
     * 异步加载数据函数，调用封装的 API
     * @param values 检索表单的值
     */
    const loadData = async (values: BatchQuery) => {
        setLoading(true);
        try {
            // 🎯 调用封装好的 API 函数
            const list = await fetchBatchListApi(values);
            setData(list);
        } catch (error) {
            console.error(error);
            // 显示 API 封装中返回的日文错误信息
            message.error(error instanceof Error ? error.message : 'データ取得中に不明なエラーが発生しました。');

            // 如果是认证错误，可以在这里处理重定向
            if (error instanceof Error && error.message.includes('認証')) {
                // 示例: 可以在此添加跳转到登录页面的逻辑
                // console.log("Redirecting to login...");
            }

            setData([]); // 发生错误时清空数据
        } finally {
            setLoading(false);
        }
    };

    // 页面初次加载时执行一次查询
    useEffect(() => {
        // 初始加载时不带参数，使用 API 中的默认 batch_type=1
        loadData({});
    }, []);

    // 检索表单提交
    const onFinish = (values: BatchQuery) => {
        loadData(values);
    };

    // 操作：模拟删除 (实际项目中应调用删除 API)
    const handleDelete = (id: number) => {
        // 实际操作是调用删除 API
        message.success(`ID: ${id} の設定を削除しました。`);
        // 重新加载数据
        loadData(form.getFieldsValue());
    };

    // 批次类型文本映射
    const getBatchTypeText = (type: BatchItem['batch_type']) => {
        // 🎯 更新后的日文映射
        switch (type) {
            case 1:
                return '最安値'; // 第一位价格/最低价格
            case 2:
                return '1位と同じ価格'; // 第二位价格
            case 3:
                return '2位価格'; // 第三位价格
            case 4:
                return '3位価格'; // 价格更新 (假设您需要保留一个价格更新的类别)
            default:
                return '不明';
        }
    };

    // 表格列配置
    const columns: TableProps<BatchItem>['columns'] = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Makeshop識別子',
            dataIndex: 'makeshop_identifier',
            key: 'makeshop_identifier',
            width: 200,
        },
        {
            title: '価格.com商品ID',
            dataIndex: 'kakaku_product_id',
            key: 'kakaku_product_id',
            width: 200,
        },
        {
            title: 'バッチ種類',
            dataIndex: 'batch_type',
            key: 'batch_type',
            width: 120,
            render: (type: BatchItem['batch_type']) => getBatchTypeText(type),
        },
        {
            title: '最低価格閾値',
            dataIndex: 'min_price_threshold',
            key: 'min_price_threshold',
            width: 150,
            align: 'right',
            render: (price: number | null) => (price ? `${price.toLocaleString()} 円` : 'なし'),
        },
        {
            title: '有効状態',
            dataIndex: 'is_enabled',
            key: 'is_enabled',
            width: 100,
            align: 'center',
            render: (enabled: boolean) => (
                <Tag color={enabled ? 'green' : 'red'}>
                    {enabled ? '有効' : '無効'}
                </Tag>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" size="small" className={styles['tech-cursor-action']} onClick={() => message.info(`ID: ${record.id} を編集`)}>
                        編集
                    </Button>
                    <Popconfirm
                        title="削除しますか？"
                        description="この設定は元に戻せません。"
                        onConfirm={() => handleDelete(record.id)}
                        okText="はい"
                        cancelText="いいえ"
                    >
                        <Button type="link" size="small" danger className={styles['tech-cursor-action']}>
                            削除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        // 外部容器：应用全局光标样式
        <div className={styles['tech-dashboard-container']}>
            <div className={styles['tech-background-glow']}></div>

            <div className={styles['tech-panel']}>
                <h2 className={styles['tech-title']}>⚙️ バッチ設定管理</h2>

                {/* 检索表单 */}
                <Form
                    form={form}
                    name="batch_search"
                    layout="inline"
                    onFinish={onFinish} // 👈 确保 onFinish 被使用
                    className={styles['tech-search-form']}
                >
                    <Form.Item
                        label={<span className={styles['tech-label']}>Makeshop識別子</span>}
                        name="makeshop_identifier"
                    >
                        <Input className={styles['tech-input']} placeholder="M_SKU_..." allowClear />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles['tech-label']}>価格.com商品ID</span>}
                        name="kakaku_product_id"
                    >
                        <Input className={styles['tech-input']} placeholder="K_ID_..." allowClear />
                    </Form.Item>

                    <Form.Item>
                        {/* 搜索按钮 */}
                        <Button className={`${styles['tech-button-small']} ${styles['tech-cursor-action']}`} type="primary" htmlType="submit">
                            検索
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        {/* 重置按钮 */}
                        <Button className={`${styles['tech-button-small-secondary']} ${styles['tech-cursor-action']}`} onClick={() => form.resetFields()}>
                            リセット
                        </Button>
                    </Form.Item>
                </Form>

                {/* 工具栏（新增按钮） */}
                <div className={styles['tech-toolbar']}>
                    <Button className={`${styles['tech-button']} ${styles['tech-cursor-action']}`} type="primary" onClick={() => navigate('/batchCreate')}>
                        新規作成
                    </Button>
                </div>

                {/* 表格 */}
                <Table
                    className={styles['tech-table']}
                    columns={columns}
                    dataSource={data} // 👈 确保 data 被使用
                    rowKey="id"
                    loading={loading} // 👈 确保 loading 被使用
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                />
            </div>
        </div>
    );
};

export default BatchList;
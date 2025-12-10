// src/pages/BatchList/BatchList.tsx

import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Space, Tag, Popconfirm, message } from 'antd';
import type { TableProps } from 'antd';

// 🎯 API 関数と型を service ファイルからインポート
import { fetchBatchListApi, deleteBatchItemApi, BatchItem, BatchQuery } from '../../services/batch';
import { useNavigate } from 'react-router-dom';

import styles from './style.module.css';


// -------------------------------------------------------------------------
// 💡 コンポーネント本体
// -------------------------------------------------------------------------

const BatchList: React.FC = () => {
    // 状態定義
    const [data, setData] = useState<BatchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<BatchQuery>();

    const navigate = useNavigate();


    /**
     * データを非同期でロードする関数（API呼び出し）
     * @param values 検索フォームの値
     */
    const loadData = async (values: BatchQuery) => {
        setLoading(true);
        try {
            const list = await fetchBatchListApi(values);
            setData(list);
        } catch (error) {
            console.error(error);
            // API 封装で返される日本語のエラーメッセージを表示
            message.error(error instanceof Error ? error.message : 'データ取得中に不明なエラーが発生しました。');

            // 認証エラーの場合の処理（例：ログインページへリダイレクト）
            if (error instanceof Error && error.message.includes('認証')) {
                // ここにリダイレクト処理を追加できます
            }

            setData([]); // エラー発生時はデータをクリア
        } finally {
            setLoading(false);
        }
    };

    // ページ初回のロード時に一度検索を実行
    useEffect(() => {
        loadData({});
    }, []);

    // 検索フォーム送信
    const onFinish = (values: BatchQuery) => {
        loadData(values);
    };

    /**
     * 💡 操作：実際の削除ロジック（API呼び出し）
     * @param id 削除対象のレコード ID
     */
    const handleDelete = async (id: number) => {
        try {
            message.loading({ content: '削除処理中...', key: 'delete' });

            // 🎯 deleteBatchItemApi を呼び出す
            await deleteBatchItemApi(id);

            message.success({ content: `ID: ${id} の設定を削除しました。`, key: 'delete', duration: 3 });

            // 削除後、現在の検索条件でデータを再ロード
            loadData(form.getFieldsValue());
        } catch (error) {
            console.error('Delete Error:', error);
            // API 封装で返されるエラーメッセージを表示
            message.error({ content: error instanceof Error ? error.message : '削除中に不明なエラーが発生しました。', key: 'delete', duration: 5 });
        }
    };

    // 批次タイプを日本語テキストに変換
    const getBatchTypeText = (type: BatchItem['batch_type']) => {
        switch (type) {
            case 1:
                return '最安値';
            case 2:
                return '1位と同じ価格';
            case 3:
                return '2位価格';
            case 4:
                return '3位価格';
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
                    <Button
                        type="link"
                        size="small"
                        className={styles['tech-cursor-action']}
                        // 🎯 修正: /batchEdit/{id} へ遷移するように navigate を設定
                        onClick={() => navigate(`/batchEdit/${record.id}`)}
                    >
                        編集
                    </Button>
                    <Popconfirm
                        title="削除しますか？"
                        description="この設定は元に戻せません。"
                        onConfirm={() => handleDelete(record.id)} // 🎯 実際の削除関数を呼び出し
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
                    onFinish={onFinish} // 👈 確保 onFinish が使用されている
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
                        {/* 検索ボタン */}
                        <Button className={`${styles['tech-button-small']} ${styles['tech-cursor-action']}`} type="primary" htmlType="submit">
                            検索
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        {/* リセットボタン */}
                        <Button className={`${styles['tech-button-small-secondary']} ${styles['tech-cursor-action']}`} onClick={() => form.resetFields()}>
                            リセット
                        </Button>
                    </Form.Item>
                </Form>

                {/* ツールバー（新規作成ボタン） */}
                <div className={styles['tech-toolbar']}>
                    <Button className={`${styles['tech-button']} ${styles['tech-cursor-action']}`} type="primary" onClick={() => navigate('/batchCreate')}>
                        新規作成
                    </Button>
                </div>

                {/* 表格 */}
                <Table
                    className={styles['tech-table']}
                    columns={columns}
                    dataSource={data} // 👈 確保 data が使用されている
                    rowKey="id"
                    loading={loading} // 👈 確保 loading が使用されている
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                />
            </div>
        </div>
    );
};

export default BatchList;
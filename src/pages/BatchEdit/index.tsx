// src/pages/BatchList/BatchEdit.tsx

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Switch, Button, Space, message, Spin } from 'antd';
import styles from './style.module.css';
// 🎯 fetchBatchItemByIdApi もインポート
import { BatchItem, BatchCreateData, updateBatchItemApi, fetchBatchItemByIdApi } from '../../services/batch';
import { useNavigate, useParams } from 'react-router-dom';

const { Option } = Select;

const BatchEdit: React.FC = () => {
    const [form] = Form.useForm<BatchCreateData>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // URL から ID を取得
    const [loading, setLoading] = useState(true);
    const itemId = id ? parseInt(id, 10) : null;

    // 1. 初期データロード
    useEffect(() => {
        if (itemId === null || isNaN(itemId)) {
            message.error('無効なバッチタスクIDです。');
            setLoading(false);
            return;
        }

        const loadInitialData = async () => {
            try {
                // 🎯 実際の API 呼び出しに置き換え
                const itemData = await fetchBatchItemByIdApi(itemId);

                // フォームに初期値をセット
                form.setFieldsValue({
                    ...itemData,
                    // null を undefined に変換して InputNumber のプレースホルダーを有効にする
                    min_price_threshold: itemData.min_price_threshold || undefined,
                });
            } catch (error) {
                console.error('データのロードに失敗しました:', error);
                message.error(error instanceof Error ? error.message : 'データのロードに失敗しました。');
                // エラー時はリストに戻るなどの処理も検討
                // navigate('/batchList');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [itemId, form, navigate]); // navigate を依存配列に追加


    // 2. 更新処理
    const onFinish = async (values: BatchCreateData) => {
        if (itemId === null) {
            message.error('更新対象のIDが見つかりません。');
            return;
        }

        const dataToSubmit: BatchCreateData = {
            ...values,
            // 空の文字列 ('') を null に変換して API に送信
            min_price_threshold: values.min_price_threshold || null,
        };

        try {
            message.loading({ content: 'データを更新中...', key: 'update' });

            // 🎯 updateBatchItemApi を呼び出す
            const result = await updateBatchItemApi(itemId, dataToSubmit);

            message.success({ content: `バッチタスク (ID: ${result.id}) を更新しました！`, key: 'update', duration: 3 });

            // 成功後、リストページに戻る
            navigate('/batchList');

        } catch (error) {
            console.error('Update Error:', error);
            message.error({ content: error instanceof Error ? error.message : '更新中に不明なエラーが発生しました。', key: 'update', duration: 5 });
        }
    };


    if (loading) {
        return (
            <div className={styles['tech-dashboard-container']} style={{ textAlign: 'center', paddingTop: 100 }}>
                <Spin size="large" tip="データロード中..." />
            </div>
        );
    }

    return (
        // 外部容器：应用浅色背景
        <div className={styles['clean-dashboard-container']}>
            {/* 移除发光背景 <div className={styles['tech-background-glow']}></div> */}

            <div className={styles['clean-panel']} style={{ maxWidth: 800, margin: '0 auto' }}>
                <h2 className={styles['clean-title']}>対象編集</h2>

                <Form
                    form={form}
                    name="batch_create_form"
                    onFinish={onFinish}
                    layout="vertical" // 垂直布局，更适合表单
                    className={styles['clean-form-container']} // 新增的 form 容器样式
                    initialValues={{ batch_type: 1, is_enabled: true, min_price_threshold: undefined }}
                >
                    <Form.Item
                        label={<span className={styles['clean-label']}>商品名</span>}
                        name="good_name"
                        rules={[{ required: true, message: '商品名は必須です' }]}
                    >
                        <Input className={styles['clean-input']} placeholder="Good Name" />
                    </Form.Item>
                    {/* 1. Makeshop识别符 (文本输入) */}
                    <Form.Item
                        label={<span className={styles['clean-label']}>Makeshop独自商品コード</span>}
                        name="makeshop_identifier"
                        rules={[{ required: true, message: 'Makeshop独自商品コードは必須です' }]}
                    >
                        <Input className={styles['clean-input']} placeholder="M_SKU_XXXX" />
                    </Form.Item>

                    {/* 2. 価格.com商品ID (文本输入) */}
                    <Form.Item
                        label={<span className={styles['clean-label']}>価格.com商品ID</span>}
                        name="kakaku_product_id"
                        rules={[{ required: true, message: '価格.com商品IDは必須です' }]}
                    >
                        <Input className={styles['clean-input']} placeholder="K_ID_YYYY" />
                    </Form.Item>

                    {/* 3. 批次类型 (下拉选择) */}
                    <Form.Item
                        label={<span className={styles['clean-label']}>価格順位</span>}
                        name="batch_type"
                        rules={[{ required: true, message: '価格順位を選んでください' }]}
                    >
                        <Select
                            className={styles['clean-select']} // 针对 Select 的新样式
                            placeholder="选择类型"
                        >
                            <Option value={1}>最安値</Option>
                            <Option value={2}>1位と同じ価格</Option>
                            <Option value={3}>2位価格</Option>
                            <Option value={4}>3位価格</Option>
                        </Select>
                    </Form.Item>

                    {/* 4. 最低价格阈值 (数字输入，可选) */}
                    <Form.Item
                        label={<span className={styles['clean-label']}>最低価格閾値</span>}
                        name="min_price_threshold"
                        rules={[{ type: 'number', min: 0, message: '请输入0以上的数值。' }]}
                    >
                        <InputNumber
                            className={styles['clean-input']} // 复用输入框样式
                            style={{ width: '100%' }}
                            placeholder="5000 (可选)"
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                    </Form.Item>

                    {/* 5. 有效状态 (开关) */}
                    <Form.Item
                        label={<span className={styles['clean-label']}>状態</span>}
                        name="is_enabled"
                        valuePropName="checked"
                    >
                        <Switch className={styles['clean-switch']} /> {/* 针对 Switch 的新样式 */}
                    </Form.Item>

                    {/* 6. 操作按钮 */}
                    <Form.Item style={{ marginTop: 30 }}>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={styles['clean-button-primary']} // 强调色按钮
                            >
                                保存
                            </Button>
                            <Button
                                className={styles['clean-button-reset']} // 次要按钮
                                onClick={() => navigate('/batchList')}
                            >
                                キャンセル
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default BatchEdit;
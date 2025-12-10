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
        <div className={styles['tech-dashboard-container']}>
            <div className={styles['tech-background-glow']}></div>

            <div className={styles['tech-panel']} style={{ maxWidth: 800, margin: '0 auto' }}>
                <h2 className={styles['tech-title']}>🖊️ バッチタスク編集 (ID: {itemId})</h2>

                <Form
                    form={form}
                    name="batch_edit_form"
                    onFinish={onFinish}
                    layout="vertical"
                    className={styles['tech-search-form']}
                    // initialValues は useEffect で設定するためここでは不要
                >
                    {/* 1. Makeshop識別子 */}
                    <Form.Item
                        label={<span className={styles['tech-label']}>Makeshop識別子</span>}
                        name="makeshop_identifier"
                        rules={[{ required: true, message: 'Makeshop識別子は必須です。' }]}
                    >
                        <Input className={styles['tech-input']} placeholder="M_SKU_XXXX" />
                    </Form.Item>

                    {/* 2. 価格.com商品ID */}
                    <Form.Item
                        label={<span className={styles['tech-label']}>価格.com商品ID</span>}
                        name="kakaku_product_id"
                        rules={[{ required: true, message: '価格.com商品IDは必須です。' }]}
                    >
                        <Input className={styles['tech-input']} placeholder="K_ID_YYYY" />
                    </Form.Item>

                    {/* 3. バッチ種類 */}
                    <Form.Item
                        label={<span className={styles['tech-label']}>バッチ種類</span>}
                        name="batch_type"
                        rules={[{ required: true, message: 'バッチ種類を選択してください。' }]}
                    >
                        <Select
                            className={styles['tech-input']}
                            placeholder="種類を選択"
                            dropdownStyle={{ background: '#0a192f', border: '1px solid #4DD0E1' }}
                        >
                            <Option value={1}>最安値 (1)</Option>
                            <Option value={2}>1位と同じ価格 (2)</Option>
                            <Option value={3}>2位価格 (3)</Option>
                            <Option value={4}>3位価格 (4)</Option>
                        </Select>
                    </Form.Item>

                    {/* 4. 最低価格閾値 */}
                    <Form.Item
                        label={<span className={styles['tech-label']}>最低価格閾値 (円)</span>}
                        name="min_price_threshold"
                        rules={[{ type: 'number', min: 0, message: '0以上の数値を入力してください。' }]}
                    >
                        <InputNumber
                            className={styles['tech-input']}
                            style={{ width: '100%' }}
                            placeholder="5000 (オプション)"
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            // parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                        />
                    </Form.Item>

                    {/* 5. 有効状態 */}
                    <Form.Item
                        label={<span className={styles['tech-label']}>有効状態</span>}
                        name="is_enabled"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    {/* 6. 操作ボタン */}
                    <Form.Item style={{ marginTop: 30 }}>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={`${styles['tech-button']} ${styles['tech-cursor-action']}`}
                            >
                                更新して保存
                            </Button>
                            <Button
                                className={`${styles['tech-button-small-secondary']} ${styles['tech-cursor-action']}`}
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
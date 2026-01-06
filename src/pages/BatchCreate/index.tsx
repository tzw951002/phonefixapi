// src/pages/BatchList/BatchCreate.tsx

import React from 'react';
import { Form, Input, Select, InputNumber, Switch, Button, Space, message } from 'antd';
import styles from './style.module.css';
import { BatchCreateData, createBatchItemApi } from '../../services/batch';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const BatchCreate: React.FC = () => {
    const [form] = Form.useForm<BatchCreateData>();
    const navigate = useNavigate();

    const onFinish = async (values: BatchCreateData) => {
        const dataToSubmit: BatchCreateData = {
            ...values,
            // 确保可选字段如果是空值，则处理为 undefined 或 null 传给后端
            jancode: values.jancode || undefined,
            min_price_threshold: values.min_price_threshold || null,
        };

        try {
            message.loading({ content: 'データを保存中...', key: 'create' });
            const result = await createBatchItemApi(dataToSubmit);
            message.success({ content: `新規バッチタスク (ID: ${result.id}) を作成しました！`, key: 'create', duration: 3 });

            form.resetFields();
            navigate('/batchList'); // 创建成功后跳转回列表页

        } catch (error) {
            console.error('Create Error:', error);
            message.error({ content: error instanceof Error ? error.message : '作成中に不明なエラーが発生しました。', key: 'create', duration: 5 });
        }
    };

    return (
        <div className={styles['clean-dashboard-container']}>
            <div className={styles['clean-panel']} style={{ maxWidth: 800, margin: '0 auto' }}>
                <h2 className={styles['clean-title']}>新品対象新規</h2>

                <Form
                    form={form}
                    name="batch_create_form"
                    onFinish={onFinish}
                    layout="vertical"
                    className={styles['clean-form-container']}
                    initialValues={{ batch_type: 1, is_enabled: true, min_price_threshold: undefined }}
                >
                    <Form.Item
                        label={<span className={styles['clean-label']}>商品名</span>}
                        name="good_name"
                        rules={[{ required: true, message: '商品名は必須です' }]}
                    >
                        <Input className={styles['clean-input']} placeholder="Good Name" />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles['clean-label']}>Makeshop独自商品コード</span>}
                        name="makeshop_identifier"
                        rules={[{ required: true, message: 'Makeshop独自商品コードは必須です' }]}
                    >
                        <Input className={styles['clean-input']} placeholder="M_SKU_XXXX" />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles['clean-label']}>価格.com商品ID</span>}
                        name="kakaku_product_id"
                        rules={[{ required: true, message: '価格.com商品IDは必須です' }]}
                    >
                        <Input className={styles['clean-input']} placeholder="K_ID_YYYY" />
                    </Form.Item>

                    {/* 🌟 新增字段: JANコード (非必填) */}
                    <Form.Item
                        label={<span className={styles['clean-label']}>JANコード</span>}
                        name="jancode"
                    >
                        <Input className={styles['clean-input']} placeholder="4901234567890 (任意)" />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles['clean-label']}>価格順位</span>}
                        name="batch_type"
                        rules={[{ required: true, message: '価格順位を選んでください' }]}
                    >
                        <Select className={styles['clean-select']} placeholder="选择类型">
                            <Option value={1}>最安値</Option>
                            <Option value={2}>1位と同じ価格</Option>
                            <Option value={3}>2位価格</Option>
                            <Option value={4}>3位価格</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles['clean-label']}>最低価格閾値</span>}
                        name="min_price_threshold"
                        rules={[{ type: 'number', min: 0, message: '请输入0以上的数值。' }]}
                    >
                        <InputNumber
                            className={styles['clean-input']}
                            style={{ width: '100%' }}
                            placeholder="5000 (可选)"
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles['clean-label']}>状態</span>}
                        name="is_enabled"
                        valuePropName="checked"
                    >
                        <Switch className={styles['clean-switch']} />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 30 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" className={styles['clean-button-primary']}>
                                新規
                            </Button>
                            <Button className={styles['clean-button-reset']} onClick={() => navigate('/batchList')}>
                                キャンセル
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default BatchCreate;
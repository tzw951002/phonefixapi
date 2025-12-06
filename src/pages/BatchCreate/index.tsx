// src/pages/BatchList/BatchCreate.tsx

import React from 'react';
import { Form, Input, Select, InputNumber, Switch, Button, Space, message } from 'antd';
import styles from './style.module.css'; // 导入样式
import { BatchCreateData, createBatchItemApi } from '../../services/batch'; // 导入 API 和类型
import { useNavigate } from 'react-router-dom'; // 假设您使用 React Router 进行页面跳转

const { Option } = Select;

const BatchCreate: React.FC = () => {
    const [form] = Form.useForm<BatchCreateData>();
    const navigate = useNavigate(); // 用于跳转回列表页

    const onFinish = async (values: BatchCreateData) => {
        // 确保 min_price_threshold 字段如果是空字符串，转换为 null，以匹配后端接口的 null | number
        const dataToSubmit: BatchCreateData = {
            ...values,
            min_price_threshold: values.min_price_threshold || null,
        };

        try {
            message.loading({ content: 'データを保存中...', key: 'create' });

            const result = await createBatchItemApi(dataToSubmit);

            message.success({ content: `新規バッチタスク (ID: ${result.id}) を作成しました！`, key: 'create', duration: 3 });

            // 成功后，跳转回列表页或重置表单
            navigate('/batchList'); // 假设列表页路由是 /batch-list

        } catch (error) {
            console.error('Create Error:', error);
            message.error({ content: error instanceof Error ? error.message : '作成中に不明なエラーが発生しました。', key: 'create', duration: 5 });
        }
    };

    return (
        // 外部容器：应用全局光标样式和背景
        <div className={styles['tech-dashboard-container']}>
            <div className={styles['tech-background-glow']}></div>

            <div className={styles['tech-panel']} style={{ maxWidth: 800, margin: '0 auto' }}>
                <h2 className={styles['tech-title']}>✨ 新規バッチ対象作成</h2>

                <Form
                    form={form}
                    name="batch_create_form"
                    onFinish={onFinish}
                    layout="vertical" // 垂直布局，更适合表单
                    className={styles['tech-search-form']} // 复用 form 容器样式
                    initialValues={{ batch_type: 1, is_enabled: true, min_price_threshold: undefined }}
                >
                    {/* 1. Makeshop識別子 (文本输入) */}
                    <Form.Item
                        label={<span className={styles['tech-label']}>Makeshop識別子</span>}
                        name="makeshop_identifier"
                        rules={[{ required: true, message: 'Makeshop識別子は必須です。' }]}
                    >
                        <Input className={styles['tech-input']} placeholder="M_SKU_XXXX" />
                    </Form.Item>

                    {/* 2. 価格.com商品ID (文本输入) */}
                    <Form.Item
                        label={<span className={styles['tech-label']}>価格.com商品ID</span>}
                        name="kakaku_product_id"
                        rules={[{ required: true, message: '価格.com商品IDは必須です。' }]}
                    >
                        <Input className={styles['tech-input']} placeholder="K_ID_YYYY" />
                    </Form.Item>

                    {/* 3. バッチ種類 (下拉选择) */}
                    <Form.Item
                        label={<span className={styles['tech-label']}>バッチ種類</span>}
                        name="batch_type"
                        rules={[{ required: true, message: 'バッチ種類を選択してください。' }]}
                    >
                        {/* 注意：下拉选择器需要全局样式覆盖，这里仅应用 Input 的样式类 */}
                        <Select
                            className={styles['tech-input']} // 复用输入框的样式类
                            placeholder="種類を選択"
                            dropdownStyle={{ background: '#0a192f', border: '1px solid #4DD0E1' }}
                        >
                            <Option value={1}>最安値</Option>
                            <Option value={2}>1位と同じ価格</Option>
                            <Option value={3}>2位価格</Option>
                            <Option value={4}>3位価格</Option>
                        </Select>
                    </Form.Item>

                    {/* 4. 最低価格閾値 (数字输入，可选) */}
                    <Form.Item
                        label={<span className={styles['tech-label']}>最低価格閾値 (円)</span>}
                        name="min_price_threshold"
                        // 注意：InputNumber 默认值不能是 null，使用 undefined 或 0
                        rules={[{ type: 'number', min: 0, message: '0以上の数値を入力してください。' }]}
                    >
                        <InputNumber
                            className={styles['tech-input']} // 复用输入框样式
                            style={{ width: '100%' }}
                            placeholder="5000 (オプション)"
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} // 格式化为千位分隔
                            // parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                        />
                    </Form.Item>

                    {/* 5. 有効状態 (开关) */}
                    <Form.Item
                        label={<span className={styles['tech-label']}>有効状態</span>}
                        name="is_enabled"
                        valuePropName="checked" // Switch 使用 checked 属性而非 value
                    >
                        {/* 注意：Switch 样式需要单独覆盖 */}
                        <Switch />
                    </Form.Item>

                    {/* 6. 操作按钮 */}
                    <Form.Item style={{ marginTop: 30 }}>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={`${styles['tech-button']} ${styles['tech-cursor-action']}`}
                            >
                                作成して保存
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

export default BatchCreate;
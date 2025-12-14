// src/pages/OldList/OldCreate.tsx

import React from 'react';
import { Form, Input, Select, InputNumber, Switch, Button, Space, message } from 'antd';
import styles from './style.module.css'; // 导入样式
// 💡 导入 Old 相关的 API 和类型
import { OldCreateData, createOldItemApi } from '../../services/old';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input; // 引入 TextArea 用于详细备注

// 💡 将组件名改为 OldCreate
const OldCreate: React.FC = () => {
    // 💡 表单类型改为 OldCreateData
    const [form] = Form.useForm<OldCreateData>();
    const navigate = useNavigate();

    const onFinish = async (values: OldCreateData) => {
        // 确保 min_price_threshold 字段如果是空字符串或 undefined，转换为 null
        const dataToSubmit: OldCreateData = {
            ...values,
            // 数字类型字段的空值处理
            min_price_threshold: values.min_price_threshold || null,

            // 字符串类型字段的空值处理 (确保空字符串传 null 或保持空字符串，这里我们倾向于保持字符串以匹配 Pydantic/TS 接口，但后端 NULLABLE 建议传 null)
            good_status: values.good_status || null,
            missing_info: values.missing_info || null,
            accessories_info: values.accessories_info || null,
            detail_comment: values.detail_comment || null,
            serial_number: values.serial_number || null,
        };

        try {
            message.loading({ content: 'データを保存中...', key: 'create' });

            // 💡 调用新的 API 函数
            const result = await createOldItemApi(dataToSubmit);

            message.success({ content: `新規 Old タスク (ID: ${result.id}) を作成しました！`, key: 'create', duration: 3 });

            // 成功后，跳转回列表页
            form.resetFields(); // 💡 假设新的列表页路由是 /oldList

        } catch (error) {
            console.error('Create Error:', error);
            message.error({ content: error instanceof Error ? error.message : '作成中に不明なエラーが発生しました。', key: 'create', duration: 5 });
        }
    };

    return (
        // 外部容器
        <div className={styles['clean-dashboard-container']}>
            <div className={styles['clean-panel']} style={{ maxWidth: 1000, margin: '0 auto' }}>
                <h2 className={styles['clean-title']}>中古新規作成</h2>

                <Form
                    form={form}
                    name="old_create_form" // 💡 表单名称修改
                    onFinish={onFinish}
                    layout="vertical"
                    className={styles['clean-form-container']}
                    // 💡 确保 initialValues 与 OldCreateData 匹配
                    initialValues={{
                        batch_type: 1,
                        is_enabled: true,
                        min_price_threshold: undefined,
                        good_status: undefined,
                        missing_info: undefined,
                        accessories_info: undefined,
                        detail_comment: undefined,
                        serial_number: undefined,
                    }}
                >
                    {/* 基础配置字段 */}
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

                    {/* 任务/控制字段 */}
                    <Form.Item
                        label={<span className={styles['clean-label']}>価格順位</span>}
                        name="batch_type"
                        rules={[{ required: true, message: '価格順位を選んでください' }]}
                    >
                        <Select
                            className={styles['clean-select']}
                            placeholder="选择类型"
                        >
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
                        label={<span className={styles['clean-label']}>状態 (有効)</span>}
                        name="is_enabled"
                        valuePropName="checked"
                    >
                        <Switch className={styles['clean-switch']} />
                    </Form.Item>

                    {/* ⬇️ 新增的商品详情字段 ⬇️ */}
                    <h3 className={styles['clean-subtitle']}>商品詳細情報 (Optional)</h3>

                    <Form.Item
                        label={<span className={styles['clean-label']}>商品状態</span>}
                        name="good_status"
                    >
                        <Input className={styles['clean-input']} placeholder="中古美品、新品未開封 等" />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles['clean-label']}>欠品情報 (缺失配件)</span>}
                        name="missing_info"
                    >
                        <Input className={styles['clean-input']} placeholder="充電器なし、説明書欠品 等" />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles['clean-label']}>附属品情報 (包含配件)</span>}
                        name="accessories_info"
                    >
                        <Input className={styles['clean-input']} placeholder="元箱あり、SDカード付き 等" />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles['clean-label']}>製造番号 / 序列号</span>}
                        name="serial_number"
                    >
                        <Input className={styles['clean-input']} placeholder="SN1234567890" />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles['clean-label']}>詳細コメント (备注)</span>}
                        name="detail_comment"
                    >
                        <TextArea
                            className={styles['clean-input']}
                            rows={4}
                            placeholder="商品の特殊な歴史、注意点など詳細な備考"
                        />
                    </Form.Item>
                    {/* ⬆️ 新增的商品详情字段 ⬆️ */}

                    {/* 操作按钮 */}
                    <Form.Item style={{ marginTop: 30 }}>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={styles['clean-button-primary']}
                            >
                                新規作成
                            </Button>
                            <Button
                                className={styles['clean-button-reset']}
                                onClick={() => navigate('/batchList?tab=used')} // 💡 跳转到 Old 列表页
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

export default OldCreate;
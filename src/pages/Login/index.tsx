import React from 'react';
import { Form, Input, Button, message } from 'antd'; // 引入 message
import styles from './style.module.css';
import { LoginFormValues } from './types';
import { loginApi } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [form] = Form.useForm<LoginFormValues>();
    const navigate = useNavigate();

    // 💡 关键修改 1: 使用 message.useMessage() Hook
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: LoginFormValues) => {
        try {
            const res = await loginApi(values.username, values.password);
            // 💡 关键修改 2: 使用 messageApi 实例代替全局 message
            messageApi.success('ログイン成功しました');
            localStorage.setItem('authToken', res.token);
            navigate('/batchList');
        } catch (err: any) {
            // 💡 关键修改 3: 使用 messageApi 实例代替全局 message
            messageApi.error(err.message || 'ログインに失敗しました');
        }
    };

    return (
        // 💡 关键修改 4: 渲染 contextHolder
        <div className={styles['tech-container']}>
            {contextHolder} {/* 必须放置在需要使用 messageApi 的组件的渲染树中 */}
            {/* 新增用于实现流线型动画的元素 */}
            <div className={styles['dynamic-lines-background']}></div>

            <Form
                form={form}
                name="loginForm"
                onFinish={onFinish}
                className={styles['tech-form-panel']}
                layout="vertical"
            >
                {/* ... 其他 Form 内容保持不变 ... */}
                <h2 className={styles['tech-title']}>価格ネットバッチ</h2>

                <Form.Item
                    label={<span className={styles['tech-label']}>ユーザーID</span>}
                    name="username"
                    rules={[{ required: true, message: 'ユーザーIDを入力してください' }]}
                >
                    <Input className={styles['tech-input']} placeholder="ADMIN_UNIT_01" />
                </Form.Item>

                <Form.Item
                    label={<span className={styles['tech-label']}>セキュリティキー</span>}
                    name="password"
                    rules={[{ required: true, message: 'セキュリティキーを入力してください' }]}
                >
                    <Input.Password className={styles['tech-input']} placeholder="********" />
                </Form.Item>

                <Form.Item className={styles['tech-item-button']}>
                    <Button
                        className={styles['tech-button']}
                        type="primary"
                        htmlType="submit"
                        block
                    >
                        認証ログイン
                    </Button>
                </Form.Item>

                <div className={styles['tech-footer-text']}>システムステータス：認証待機中...</div>
            </Form>
        </div>
    );
};

export default Login;
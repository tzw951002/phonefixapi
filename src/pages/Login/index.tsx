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
        <div className={styles['clean-container']}>
            {contextHolder}


            <Form
                form={form}
                name="loginForm"
                onFinish={onFinish}
                className={styles['clean-form-panel']}
                layout="vertical"
            >
                <h2 className={styles['clean-title']}>価格.com連携管理</h2>

                <Form.Item
                    label={<span className={styles['clean-label']}>ユーザID</span>}
                    name="username"
                    rules={[{ required: true, message: 'ユーザIDを入力してください' }]}
                >
                    <Input className={styles['clean-input']} placeholder="ADMIN_UNIT_01" />
                </Form.Item>

                <Form.Item
                    label={<span className={styles['clean-label']}>パスワード</span>}
                    name="password"
                    rules={[{ required: true, message: 'パスワードを入力してください' }]}
                >
                    <Input.Password className={styles['clean-input']} placeholder="********" />
                </Form.Item>

                <Form.Item className={styles['clean-item-button']}>
                    <Button
                        className={styles['clean-button']}
                        type="primary"
                        htmlType="submit"
                        block
                    >
                        ログイン
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
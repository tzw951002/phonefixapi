import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, message } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    NotificationOutlined,
    AppstoreAddOutlined,
    DollarOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import styles from './style.module.css';
import { MenuKey } from './types';

// 暂时在这里定义子组件，后期建议移到独立文件
const NewsManager = () => <div>通知一览管理界面</div>;
const CategoryManager = () => <div>机种分类管理界面</div>;
const PriceManager = () => <div>价格编辑界面</div>;

const { Header, Sider, Content } = Layout;

const Home: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState<MenuKey>('news');
    const navigate = useNavigate();

    // 检查登录状态
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            message.warning('ログインしてください');
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        message.success('ログアウトしました');
        navigate('/login');
    };

    return (
        <Layout className={styles.layoutContainer}>
            {/* 侧边栏 */}
            <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
                <div className={styles.logoSection}>
                    <img src="/logo.png" alt="logo" className={styles.logoImage} />
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={({ key }) => setSelectedKey(key as MenuKey)}
                    items={[
                        { key: 'news', icon: <NotificationOutlined />, label: '通知一覧管理' },
                        { key: 'categories', icon: <AppstoreAddOutlined />, label: '机种分类设置' },
                        { key: 'prices', icon: <DollarOutlined />, label: '维修价格编辑' },
                    ]}
                />
            </Sider>

            <Layout>
                {/* 顶部工具栏 */}
                <Header className={styles.header}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    <Button
                        type="link"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        danger
                    >
                        ログアウト
                    </Button>
                </Header>

                {/* 动态内容区 */}
                <Content className={styles.contentArea}>
                    {selectedKey === 'news' && <NewsManager />}
                    {selectedKey === 'categories' && <CategoryManager />}
                    {selectedKey === 'prices' && <PriceManager />}
                </Content>
            </Layout>
        </Layout>
    );
};

export default Home;
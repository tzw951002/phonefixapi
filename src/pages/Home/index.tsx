"use client";

import React, { useState } from 'react';
import { Layout, Menu, Button, ConfigProvider } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    NotificationOutlined,
    AppstoreAddOutlined,
    DollarOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

// --- 强制显示的子组件 ---
const NewsManager = () => (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '2px solid #EADDCA' }}>
        <h2 style={{ color: '#5D4037', marginBottom: '16px' }}>📢 通知一覧管理</h2>
        <div style={{ height: '200px', background: '#FDFBF7', border: '1px dashed #A67C52', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            这里是通知数据表格区域 (测试显示正常)
        </div>
    </div>
);

const CategoryManager = () => (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '2px solid #EADDCA' }}>
        <h2 style={{ color: '#5D4037', marginBottom: '16px' }}>📂 机种分类设置</h2>
        <p>这里可以添加 iPhone, Android 等大类</p>
    </div>
);

const PriceManager = () => (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '2px solid #EADDCA' }}>
        <h2 style={{ color: '#5D4037', marginBottom: '16px' }}>💰 维修价格编辑</h2>
        <p>这里可以修改具体的修理金额</p>
    </div>
);

const Home: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState('news');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        /* 使用 ConfigProvider 强制注入原木色系主题 */
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#4A6741', // 森林绿
                    colorBgLayout: '#FDFBF7', // 米色背景
                },
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                {/* 侧边栏 */}
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    theme="light"
                    style={{ borderRight: '1px solid #EADDCA' }}
                >
                    <div style={{
                        height: '64px',
                        margin: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#F5EFE6',
                        borderRadius: '8px'
                    }}>
                        <span style={{ fontWeight: 'bold', color: '#5D4037' }}>
                            {collapsed ? 'SD' : 'スマドク管理'}
                        </span>
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        onClick={({ key }) => setSelectedKey(key)}
                        items={[
                            { key: 'news', icon: <NotificationOutlined />, label: '通知一覧管理' },
                            { key: 'categories', icon: <AppstoreAddOutlined />, label: '机种分类设置' },
                            { key: 'prices', icon: <DollarOutlined />, label: '维修价格编辑' },
                        ]}
                    />
                </Sider>

                <Layout>
                    {/* 顶部栏 */}
                    <Header style={{
                        padding: '0 24px',
                        background: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #EADDCA'
                    }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px', width: 64, height: 64 }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <span style={{ color: '#8B7E74', fontSize: '12px' }}>管理者：ADMIN_01</span>
                            <Button
                                type="link"
                                icon={<LogoutOutlined />}
                                onClick={handleLogout}
                                danger
                            >
                                ログアウト
                            </Button>
                        </div>
                    </Header>

                    {/* 内容展示区 */}
                    <Content style={{ margin: '24px', minHeight: '280px' }}>
                        {selectedKey === 'news' && <NewsManager />}
                        {selectedKey === 'categories' && <CategoryManager />}
                        {selectedKey === 'prices' && <PriceManager />}
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default Home;
"use client";

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, ConfigProvider, message } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    NotificationOutlined,
    AppstoreAddOutlined,
    DollarOutlined,
    LogoutOutlined,
    QuestionCircleOutlined, SettingOutlined // 导入 FAQ 图标
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// --- 正确导入已创建的子组件 ---
import NewsManager from './components/NewsManager';
import CategoryManager from './components/CategoryManager';
import PriceManager from './components/PriceManager';
import FaqManager from './components/FaqManager';
import ConfigManager from "./components/ConfigManager"; // 1. 导入 FAQ 组件

const { Header, Sider, Content } = Layout;

const Home: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState('news');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        message.success('ログアウトしました');
        navigate('/');
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#4A6741',
                    borderRadius: 8,
                }
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ borderRight: '1px solid #EADDCA' }}>
                    <div style={{ height: '64px', margin: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFBF7', borderRadius: '12px' }}>
                        {/* 这里的 logo 路径请确保正确 */}
                        <img src="/logo.png" alt="logo" style={{ height: '32px', display: collapsed ? 'none' : 'block' }} />
                        {collapsed && <span style={{ color: '#4A6741', fontWeight: 'bold' }}>SD</span>}
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        onClick={({ key }) => setSelectedKey(key)}
                        items={[
                            { key: 'news', icon: <NotificationOutlined />, label: 'お知らせ一覧' },
                            { key: 'categories', icon: <AppstoreAddOutlined />, label: '修理機種一覧' },
                            { key: 'prices', icon: <DollarOutlined />, label: '修理料金一覧' },
                            { key: 'faq', icon: <QuestionCircleOutlined />, label: 'よくあるご質問' }, // 2. 增加 FAQ 菜单
                            { key: 'config', icon: <SettingOutlined />, label: 'サイト内容編集' }
                        ]}
                    />
                </Sider>

                <Layout>
                    <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F5EFE6' }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '18px', width: 64, height: 64 }}
                        />
                        <div style={{ fontWeight: '500', color: '#8B7E74' }}>マスドク管理システム</div>
                        <Button type="primary" ghost icon={<LogoutOutlined />} onClick={handleLogout}>ログアウト</Button>
                    </Header>

                    <Content style={{ margin: '24px 16px' }}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            {selectedKey === 'news' && <NewsManager />}
                            {selectedKey === 'categories' && <CategoryManager />}
                            {selectedKey === 'prices' && <PriceManager />}
                            {selectedKey === 'faq' && <FaqManager />} {/* 3. 增加 FAQ 渲染逻辑 */}
                            {selectedKey === 'config' && <ConfigManager />}
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default Home;
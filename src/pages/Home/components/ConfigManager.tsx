"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Space, Typography, message, Divider, Spin, Row, Col } from 'antd';
import {
    SaveOutlined,
    GlobalOutlined,
    ShareAltOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    VideoCameraOutlined,
    PictureOutlined
} from '@ant-design/icons';
import { API_BASE_URL } from "../../../config/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ConfigManager: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // 1. 加载配置数据
    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/config/`);
            if (res.ok) {
                const data = await res.json();
                form.setFieldsValue(data);
            }
        } catch (error) {
            message.error("配置加载失败");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    // 2. 提交更新
    const onFinish = async (values: any) => {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`${API_BASE_URL}/config/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(values)
            });

            if (res.ok) {
                message.success("全站配置更新成功！");
            } else {
                throw new Error();
            }
        } catch (error) {
            message.error("保存失败，请稍后再试");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

    return (
        <div style={{ padding: '20px' }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0, color: '#4A6741' }}>全站情报管理</Title>
                    <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading} size="large">
                        保存修改
                    </Button>
                </div>

                <Row gutter={[24, 24]}>
                    {/* --- HERO 模块配置 --- */}
                    <Col span={24}>
                        <Card title={<span><GlobalOutlined /> HERO 模块 (首屏展示)</span>} bordered={false} style={{ borderRadius: '12px', border: '1px solid #EADDCA' }}>
                            <Form.Item name="hero_title" label="HERO 大标题" rules={[{ required: true }]}>
                                <TextArea
                                    rows={2}
                                    placeholder="例：iPhone・スマホ修理の&#10;プロフェッショナル"
                                />
                            </Form.Item>
                            <Form.Item name="hero_content" label="HERO 内容描述 (支持换行)">
                                <TextArea rows={4} placeholder="请输入首屏显示的详细描述文字..." />
                            </Form.Item>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="hero_image_url" label={<span><PictureOutlined /> 背景图片链接</span>}>
                                        <Input placeholder="https://example.com/hero.jpg" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="hero_video_url" label={<span><VideoCameraOutlined /> 视频链接 (可选)</span>}>
                                        <Input placeholder="https://example.com/video.mp4" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* --- 社交媒体链接 --- */}
                    <Col span={12}>
                        <Card title={<span><ShareAltOutlined /> 社交媒体 (SNS)</span>} bordered={false} style={{ borderRadius: '12px', height: '100%', border: '1px solid #EADDCA' }}>
                            <Form.Item name="line_url" label="LINE 官方账号链接">
                                <Input placeholder="https://line.me/R/ti/p/..." />
                            </Form.Item>
                            <Form.Item name="x_url" label="X (Twitter) 链接">
                                <Input placeholder="https://x.com/your_account" />
                            </Form.Item>
                            <Text type="secondary">这些链接通常用于页面底部的社交图标跳转。</Text>
                        </Card>
                    </Col>

                    {/* --- 公司/店铺信息 --- */}
                    <Col span={12}>
                        <Card title={<span><EnvironmentOutlined /> 访问情报</span>} bordered={false} style={{ borderRadius: '12px', height: '100%', border: '1px solid #EADDCA' }}>
                            <Form.Item name="company_address" label="公司地址">
                                <TextArea rows={2} placeholder="请输入详细的公司或店铺地址..." />
                            </Form.Item>
                            <Form.Item name="business_hours" label={<span><ClockCircleOutlined /> 营业时间 (支持换行)</span>}>
                                <TextArea rows={3} placeholder="例：平日 10:00 - 19:00&#10;土日祝 11:00 - 18:00" />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading} size="large" style={{ width: '200px' }}>
                        保存所有修改
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default ConfigManager;
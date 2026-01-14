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

    // 1. 設定データの読み込み
    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/config/`);
            if (res.ok) {
                const data = await res.json();
                form.setFieldsValue(data);
            }
        } catch (error) {
            message.error("設定の読み込みに失敗しました");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    // 2. 更新の送信
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
                message.success("設定を更新しました！");
            } else {
                throw new Error();
            }
        } catch (error) {
            message.error("保存に失敗しました。時間をおいて再度お試しください。");
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
                    <Title level={3} style={{ margin: 0, color: '#4A6741' }}>サイト基本情報管理</Title>
                    <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading} size="large">
                        変更を保存
                    </Button>
                </div>

                <Row gutter={[24, 24]}>
                    {/* --- HERO セクション設定 --- */}
                    <Col span={24}>
                        <Card title={<span><GlobalOutlined /> メイン表示内容</span>} bordered={false} style={{ borderRadius: '12px', border: '1px solid #EADDCA' }}>
                            <Form.Item name="hero_title" label="タイトル" rules={[{ required: true, message: 'メインキャッチコピーを入力してください' }]}>
                                <TextArea
                                    rows={2}
                                    placeholder="例：iPhone・スマホ修理の&#10;プロフェッショナル"
                                />
                            </Form.Item>
                            <Form.Item name="hero_content" label="説明文(改行可)">
                                <TextArea rows={4} placeholder="メインビジュアルに表示される詳細な説明文を入力してください..." />
                            </Form.Item>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="hero_image_url" label={<span><PictureOutlined /> 表示画像URL</span>}>
                                        <Input placeholder="https://example.com/hero.jpg" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="hero_video_url" label={<span><VideoCameraOutlined /> Youtube動画URL</span>}>
                                        <Input placeholder="https://example.com/video.mp4" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* --- ソーシャルメディアリンク --- */}
                    <Col span={12}>
                        <Card title={<span><ShareAltOutlined /> SNS連携</span>} bordered={false} style={{ borderRadius: '12px', height: '100%', border: '1px solid #EADDCA' }}>
                            <Form.Item name="line_url" label="LINE公式アカウント URL">
                                <Input placeholder="https://line.me/R/ti/p/..." />
                            </Form.Item>
                            <Form.Item name="x_url" label="X (旧Twitter) URL">
                                <Input placeholder="https://x.com/your_account" />
                            </Form.Item>
                        </Card>
                    </Col>

                    {/* --- 会社/店舗情報 --- */}
                    <Col span={12}>
                        <Card title={<span><EnvironmentOutlined /> アクセス・店舗情報</span>} bordered={false} style={{ borderRadius: '12px', height: '100%', border: '1px solid #EADDCA' }}>
                            <Form.Item name="company_address" label="店舗住所">
                                <TextArea rows={2} placeholder="住所を入力してください..." />
                            </Form.Item>
                            <Form.Item name="business_hours" label={<span><ClockCircleOutlined /> 営業時間 (改行可)</span>}>
                                <TextArea rows={3} placeholder="例：平日 10:00 - 19:00&#10;土日祝 11:00 - 18:00" />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading} size="large" style={{ width: '200px' }}>
                        設定を保存する
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default ConfigManager;
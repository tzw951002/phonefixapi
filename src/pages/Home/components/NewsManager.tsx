"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, DatePicker, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// 导入刚才写好的 API 函数
import { fetchNewsListApi, createNewsApi, updateNewsApi, deleteNewsApi, NewsItem } from '../../../services/news';

const NewsManager: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<NewsItem | null>(null);
    const [dataSource, setDataSource] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false); // 加载状态
    const [form] = Form.useForm();

    // -----------------------------------------------------
    // 🔄 数据初始化获取
    // -----------------------------------------------------
    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchNewsListApi();
            // 确保后端字段名匹配，后端是 publish_date，前端展示用 date
            setDataSource(data);
        } catch (error: any) {
            message.error(error.message || 'データの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // -----------------------------------------------------
    // ➕ 打开弹窗
    // -----------------------------------------------------
    const showModal = (record: NewsItem | null = null) => {
        setEditingRecord(record);
        if (record) {
            form.setFieldsValue({
                ...record,
                // 将后端返回的字符串转换为 dayjs 对象给 DatePicker 使用
                publish_date: dayjs(record.publish_date)
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ publish_date: dayjs() });
        }
        setIsModalOpen(true);
    };

    // -----------------------------------------------------
    // 💾 提交数据 (新增或更新)
    // -----------------------------------------------------
    const handleOk = () => {
        form.validateFields().then(async (values) => {
            // 格式化数据以符合后端 API 结构
            const apiData = {
                title: values.title,
                content: values.content,
                publish_date: values.publish_date.format('YYYY-MM-DD'),
            };

            setLoading(true);
            try {
                if (editingRecord) {
                    // 调用更新接口
                    await updateNewsApi(editingRecord.id, apiData);
                    message.success('更新しました');
                } else {
                    // 调用新增接口
                    await createNewsApi(apiData);
                    message.success('追加しました');
                }
                setIsModalOpen(false);
                loadData(); // 重新加载列表刷新视图
            } catch (error: any) {
                message.error(error.message || '保存に失敗しました');
            } finally {
                setLoading(false);
            }
        });
    };

    // -----------------------------------------------------
    // 🗑️ 删除数据
    // -----------------------------------------------------
    const handleDelete = async (id: number) => {
        try {
            await deleteNewsApi(id);
            message.success('削除しました');
            loadData(); // 刷新列表
        } catch (error: any) {
            message.error(error.message || '削除に失敗しました');
        }
    };

    const columns = [
        {
            title: '日付',
            dataIndex: 'publish_date',
            key: 'publish_date',
            width: 120,
            render: (text: string) => <Tag color="orange">{text}</Tag>
        },
        {
            title: 'タイトル',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <span style={{ fontWeight: 600, color: '#5D4037' }}>{text}</span>
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            render: (_: any, record: NewsItem) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)}>修正</Button>
                    <Popconfirm title="本当に削除しますか？" onConfirm={() => handleDelete(record.id)} okText="はい" cancelText="いいえ">
                        <Button type="text" danger icon={<DeleteOutlined />}>削除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #EADDCA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, color: '#5D4037', fontSize: '1.25rem' }}>お知らせ一覧</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ background: '#4A6741', borderColor: '#4A6741' }}
                    onClick={() => showModal(null)}
                >
                    新規
                </Button>
            </div>

            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey="id"
                loading={loading} // 表格加载遮罩
                pagination={{ pageSize: 5 }}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title={editingRecord ? "お知らせ編集" : "お知らせ新規"}
                open={isModalOpen}
                onOk={handleOk}
                confirmLoading={loading} // 按钮加载状态
                onCancel={() => setIsModalOpen(false)}
                okText="保存"
                cancelText="キャンセル"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item name="publish_date" label="日付" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="title" label="タイトル" rules={[{ required: true, message: 'タイトルを入力してください' }]}>
                        <Input placeholder="例：年末年始の営業について" />
                    </Form.Item>
                    <Form.Item name="content" label="内容">
                        <Input.TextArea rows={6} placeholder="詳細内容を入力してください..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NewsManager;
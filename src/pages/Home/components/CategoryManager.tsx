"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
// 导入 API 服务
import {
    fetchCategoriesApi,
    createCategoryApi,
    fetchRepairTypesApi
} from '../../../services/category';
import { API_BASE_URL } from "../../../config/api";

const CategoryManager: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // 数据状态
    const [categories, setCategories] = useState<any[]>([]);
    const [repairTypes, setRepairTypes] = useState<any[]>([]);

    // 弹窗状态
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);

    // -----------------------------------------------------
    // 🔄 数据获取
    // -----------------------------------------------------
    const loadData = async () => {
        setLoading(true);
        try {
            const [catData, rtData] = await Promise.all([
                fetchCategoriesApi(),
                fetchRepairTypesApi()
            ]);

            // 💡 关键防御逻辑：确保 catData 和 rtData 是数组
            // 如果后端返回的是 { data: [...] }，请改为 catData.data
            setCategories(Array.isArray(catData) ? catData : []);
            setRepairTypes(Array.isArray(rtData) ? rtData : []);

        } catch (error: any) {
            console.error("Fetch Error:", error);
            message.error('データの取得に失敗しました。サーバーが起動しているか確認してください。');
            // 出错时设置为空数组，防止 Table 崩溃
            setCategories([]);
            setRepairTypes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // -----------------------------------------------------
    // 🛠️ 通用工具函数 (处理 API 请求)
    // -----------------------------------------------------
    const getAuthToken = () => localStorage.getItem('authToken');

    // -----------------------------------------------------
    // 📂 机种分类操作 (Category)
    // -----------------------------------------------------
    const showCatModal = (record: any = null) => {
        setEditingRecord(record);
        if (record) form.setFieldsValue(record);
        else { form.resetFields(); form.setFieldsValue({ sort_order: 0 }); }
        setIsCatModalOpen(true);
    };

    const handleCatSubmit = async () => {
        const values = await form.validateFields();
        const token = getAuthToken();
        setLoading(true);
        try {
            if (editingRecord) {
                // 更新逻辑 - 匹配后端 /category/{id}
                const res = await fetch(`${API_BASE_URL}/categories/${editingRecord.id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });
                if (!res.ok) throw new Error();
                message.success('更新成功');
            } else {
                // 新增逻辑
                await createCategoryApi(values);
                message.success('追加成功');
            }
            setIsCatModalOpen(false);
            loadData();
        } catch (e) {
            message.error('操作失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleCatDelete = async (id: number) => {
        const token = getAuthToken();
        try {
            await fetch(`${API_BASE_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            message.success('削除成功');
            loadData();
        } catch (e) {
            message.error('削除失敗');
        }
    };

    // -----------------------------------------------------
    // 🔧 维修项目操作 (Repair Type)
    // -----------------------------------------------------
    const showRepairModal = (record: any = null) => {
        setEditingRecord(record);
        if (record) form.setFieldsValue(record);
        else { form.resetFields(); form.setFieldsValue({ sort_order: 0 }); }
        setIsRepairModalOpen(true);
    };

    const handleRepairSubmit = async () => {
        const values = await form.validateFields();
        const token = getAuthToken();
        setLoading(true);
        try {
            // 匹配后端 /category/repair-types
            const url = editingRecord
                ? `${API_BASE_URL}/categories/repair-types/${editingRecord.id}`
                : `${API_BASE_URL}/categories/repair-types`;

            const res = await fetch(url, {
                method: editingRecord ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            if (!res.ok) throw new Error();
            message.success('保存成功');
            setIsRepairModalOpen(false);
            loadData();
        } catch (e) {
            message.error('操作失敗');
        } finally {
            setLoading(false);
        }
    };

    // 表格列定义 (保持 UI 不变)
    const catColumns = [
        { title: '表示順', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
        { title: '机种分类名称', dataIndex: 'name', key: 'name', render: (text: string) => <Tag color="brown">{text}</Tag> },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    <Button type="text" size="small" icon={<EditOutlined />} onClick={() => showCatModal(record)} />
                    <Popconfirm title="削除しますか？" onConfirm={() => handleCatDelete(record.id)}>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const repairColumns = [
        { title: '表示順', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
        { title: '维修种类项目', dataIndex: 'name', key: 'name', render: (text: string) => <Tag color="green">{text}</Tag> },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    <Button type="text" size="small" icon={<EditOutlined />} onClick={() => showRepairModal(record)} />
                    <Popconfirm title="削除しますか？" onConfirm={() => { /* 补充删除维修项目 API */ }}>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #EADDCA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ color: '#5D4037', margin: 0 }}><SettingOutlined /> 一级目录：机种分类</h3>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showCatModal()}>分类追加</Button>
                </div>
                <Table dataSource={categories} columns={catColumns} rowKey="id" pagination={false} size="small" loading={loading} />
            </div>

            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #EADDCA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ color: '#5D4037', margin: 0 }}><SettingOutlined /> 二级目录：维修项目</h3>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showRepairModal()}>项目追加</Button>
                </div>
                <Table dataSource={repairTypes} columns={repairColumns} rowKey="id" pagination={false} size="small" loading={loading} />
            </div>

            {/* 弹窗部分保持不变，仅增加 confirmLoading={loading} */}
            <Modal title="机种分类编辑" open={isCatModalOpen} onOk={handleCatSubmit} onCancel={() => setIsCatModalOpen(false)} confirmLoading={loading}>
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
                        <Input placeholder="例：iPhone" />
                    </Form.Item>
                    <Form.Item name="sort_order" label="排序 (数字越小越靠前)">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="维修项目编辑" open={isRepairModalOpen} onOk={handleRepairSubmit} onCancel={() => setIsRepairModalOpen(false)} confirmLoading={loading}>
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item name="name" label="项目名称" rules={[{ required: true }]}>
                        <Input placeholder="例：液晶修理(軽度)" />
                    </Form.Item>
                    <Form.Item name="sort_order" label="排序">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManager;
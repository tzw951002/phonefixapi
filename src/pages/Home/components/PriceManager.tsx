"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Popconfirm, message, Card, Empty, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SortDescendingOutlined } from '@ant-design/icons';
// 导入相关 Service
import { fetchCategoriesApi, fetchRepairTypesApi } from '../../../services/category';
import { fetchPriceListApi } from '../../../services/price';
import { API_BASE_URL } from "../../../config/api";

const { Option } = Select;

const PriceManager: React.FC = () => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [repairTypes, setRepairTypes] = useState<any[]>([]);
    const [dataSource, setDataSource] = useState<any[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedRepairType, setSelectedRepairType] = useState<number | null>(null);

    useEffect(() => {
        const initOptions = async () => {
            try {
                const [cats, rts] = await Promise.all([
                    fetchCategoriesApi(),
                    fetchRepairTypesApi()
                ]);
                setCategories(cats);
                setRepairTypes(rts);

                if (cats.length > 0) setSelectedCategory(cats[0].id);
                if (rts.length > 0) setSelectedRepairType(rts[0].id);
            } catch (e) {
                message.error("配置项获取失败");
            }
        };
        initOptions();
    }, []);

    const loadPrices = async () => {
        if (selectedCategory !== null && selectedRepairType !== null) {
            setLoading(true);
            try {
                const data = await fetchPriceListApi(selectedCategory, selectedRepairType);
                // 这里的 data 已经是后端按 sort_order 排序后的结果
                setDataSource(Array.isArray(data) ? data : []);
            } catch (e) {
                setDataSource([]);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadPrices();
    }, [selectedCategory, selectedRepairType]);

    const getAuthToken = () => localStorage.getItem('authToken');

    const showModal = (record: any = null) => {
        setEditingRecord(record);
        if (record) {
            form.setFieldsValue(record);
        } else {
            form.resetFields();
            form.setFieldsValue({
                category_id: selectedCategory,
                repair_type_id: selectedRepairType,
                price_suffix: '税込',
                sort_order: 0 // 新增时默认为 0
            });
        }
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const token = getAuthToken();
            setLoading(true);

            // 修改点：这里的 values 会包含 sort_order
            const url = editingRecord
                ? `${API_BASE_URL}/prices/${editingRecord.id}`
                : `${API_BASE_URL}/prices/`;
            const method = editingRecord ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });

            if (!res.ok) throw new Error();

            message.success(editingRecord ? '更新成功' : '追加成功');
            setIsModalOpen(false);
            loadPrices();
        } catch (e) {
            message.error('保存失败，请检查网络或登录状态');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const token = getAuthToken();
        try {
            await fetch(`${API_BASE_URL}/prices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            message.success('削除成功');
            loadPrices();
        } catch (e) {
            message.error('削除失败');
        }
    };

    const columns = [
        {
            title: '排序权重',
            dataIndex: 'sort_order',
            key: 'sort_order',
            width: 100,
            sorter: (a: any, b: any) => a.sort_order - b.sort_order,
            render: (val: number) => <Tag color="blue">{val}</Tag>
        },
        {
            title: '机种名',
            dataIndex: 'model_name',
            key: 'model_name',
            render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>
        },
        {
            title: '修理价格',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => (
                <span style={{ color: '#B36D61', fontWeight: 'bold' }}>
                    ¥{price.toLocaleString()}
                </span>
            )
        },
        { title: '备注', dataIndex: 'price_suffix', key: 'price_suffix', width: 100 },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
                    <Popconfirm title="本当に削除しますか？" onConfirm={() => handleDelete(record.id)}>
                        <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card style={{ border: '1px solid #EADDCA', borderRadius: '12px' }}>
                <Space size="large" wrap>
                    <div>
                        <span style={{ marginRight: 8, color: '#8B7E74' }}>机种分类:</span>
                        <Select
                            value={selectedCategory}
                            style={{ width: 160 }}
                            onChange={v => setSelectedCategory(v)}
                        >
                            {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </div>
                    <div>
                        <span style={{ marginRight: 8, color: '#8B7E74' }}>维修项目:</span>
                        <Select
                            value={selectedRepairType}
                            style={{ width: 200 }}
                            onChange={v => setSelectedRepairType(v)}
                        >
                            {repairTypes.map(r => <Option key={r.id} value={r.id}>{r.name}</Option>)}
                        </Select>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                        loading={loading}
                    >
                        新规价格追加
                    </Button>
                </Space>
            </Card>

            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #EADDCA' }}>
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Tag color="brown">{categories.find(c => c.id === selectedCategory)?.name || '未选择'}</Tag>
                        <span style={{ color: '#EADDCA' }}>/</span>
                        <Tag color="green">{repairTypes.find(r => r.id === selectedRepairType)?.name || '未选择'}</Tag>
                        <span style={{ color: '#8B7E74', fontSize: '12px' }}>共 {dataSource.length} 条记录</span>
                    </div>
                    <div style={{ color: '#faad14', fontSize: '12px' }}>
                        <SortDescendingOutlined /> 提示：数字越大在页面显示越靠前
                    </div>
                </div>

                <Table
                    dataSource={dataSource}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    locale={{ emptyText: <Empty description="该目录下暂无价格数据" /> }}
                />
            </div>

            <Modal
                title={editingRecord ? "价格编辑" : "新规追加"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={loading}
                okText="确认保存"
                cancelText="取消"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    {/* ... 之前的 Form.Item 保持不变 ... */}
                    <Form.Item name="category_id" label="机种分类" rules={[{ required: true }]}>
                        <Select disabled={!!editingRecord}>
                            {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="repair_type_id" label="维修项目" rules={[{ required: true }]}>
                        <Select disabled={!!editingRecord}>
                            {repairTypes.map(r => <Option key={r.id} value={r.id}>{r.name}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item name="model_name" label="具体机型名称" rules={[{ required: true }]}>
                        <Input placeholder="例：iPhone 15 Pro" />
                    </Form.Item>

                    {/* 新增的 sort_order 输入框 */}
                    <Form.Item
                        name="sort_order"
                        label="排序权重 (数字越大越靠前)"
                        tooltip="默认 0。如果您想让此项置顶，可以设为 100"
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item name="price" label="修理价格 (仅数字)" rules={[{ required: true }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/¥\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                    <Form.Item name="price_suffix" label="价格后缀 (如：税込、起)">
                        <Input placeholder="税込" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PriceManager;
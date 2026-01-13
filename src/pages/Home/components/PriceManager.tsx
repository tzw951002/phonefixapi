"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Popconfirm, message, Card, Empty, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SortDescendingOutlined, MenuOutlined } from '@ant-design/icons';

// --- DnD Kit 相关 ---
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { fetchCategoriesApi, fetchRepairTypesApi } from '../../../services/category';
import { fetchPriceListApi } from '../../../services/price';
import { API_BASE_URL } from "../../../config/api";

const { Option } = Select;

// --- 1. 拖拽手柄组件 ---
const DragHandle = ({ id }: { id: number }) => {
    const { attributes, listeners, setNodeRef } = useSortable({ id: String(id) });
    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={{ cursor: 'grab', padding: '4px 10px' }}>
            <MenuOutlined style={{ color: '#999' }} />
        </div>
    );
};

// --- 2. 拖拽行组件 (修复了数据不显示的问题) ---
const EditableRow = (props: any) => {
    const { children, ...restProps } = props;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: String(restProps['data-row-key']),
    });

    const style: React.CSSProperties = {
        ...restProps.style,
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999, background: '#fafafa' } : {}),
    };

    // 必须渲染 {children}，否则数据不会显示
    return (
        <tr {...restProps} ref={setNodeRef} style={style} {...attributes}>
            {children}
        </tr>
    );
};

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

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => {
        const initOptions = async () => {
            try {
                const [cats, rts] = await Promise.all([fetchCategoriesApi(), fetchRepairTypesApi()]);
                setCategories(cats); setRepairTypes(rts);
                if (cats.length > 0) setSelectedCategory(cats[0].id);
                if (rts.length > 0) setSelectedRepairType(rts[0].id);
            } catch (e) { message.error("数据加载失败"); }
        };
        initOptions();
    }, []);

    const loadPrices = async () => {
        if (selectedCategory !== null && selectedRepairType !== null) {
            setLoading(true);
            try {
                const data = await fetchPriceListApi(selectedCategory, selectedRepairType);
                setDataSource(Array.isArray(data) ? data : []);
            } catch (e) { setDataSource([]); } finally { setLoading(false); }
        }
    };

    useEffect(() => { loadPrices(); }, [selectedCategory, selectedRepairType]);

    // --- 拖拽结束逻辑：全量重排序号 ---
    const onDragEnd = async ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const oldIndex = dataSource.findIndex((item) => String(item.id) === String(active.id));
        const newIndex = dataSource.findIndex((item) => String(item.id) === String(over.id));

        if (oldIndex !== -1 && newIndex !== -1) {
            const newData = arrayMove(dataSource, oldIndex, newIndex);
            setDataSource(newData); // 立即更新UI

            const token = localStorage.getItem('authToken');
            const total = newData.length;
            try {
                // 遍历新数组，按位置分配 100, 90, 80... 的权重
                const promises = newData.map((item, index) => {
                    const newSortOrder = (total - index) * 10;
                    if (item.sort_order === newSortOrder) return Promise.resolve();
                    return fetch(`${API_BASE_URL}/prices/${item.id}`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...item, sort_order: newSortOrder })
                    });
                });
                await Promise.all(promises);
                message.success("排序已更新");
            } catch (e) {
                message.error("排序保存失败");
                loadPrices();
            }
        }
    };

    const columns = [
        {
            title: '排序',
            key: 'sort',
            width: 60,
            render: (_: any, record: any) => <DragHandle id={record.id} />,
        },
        {
            title: '权重',
            dataIndex: 'sort_order',
            width: 80,
            render: (v: number) => <Tag color="blue">{v}</Tag>
        },
        {
            title: '机种名',
            dataIndex: 'model_name',
            render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>
        },
        {
            title: '修理价格',
            dataIndex: 'price',
            render: (price: number) => (
                <span style={{ color: '#B36D61', fontWeight: 'bold' }}>
                    ¥{Number(price).toLocaleString()}
                </span>
            )
        },
        { title: '备注', dataIndex: 'price_suffix', width: 100 },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
                    <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
                        <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const token = localStorage.getItem('authToken');
            setLoading(true);
            const url = editingRecord ? `${API_BASE_URL}/prices/${editingRecord.id}` : `${API_BASE_URL}/prices/`;
            const res = await fetch(url, {
                method: editingRecord ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            if (!res.ok) throw new Error();
            message.success('保存成功');
            setIsModalOpen(false);
            loadPrices();
        } catch (e) { message.error('保存失败'); } finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        const token = localStorage.getItem('authToken');
        try {
            await fetch(`${API_BASE_URL}/prices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            message.success('删除成功');
            loadPrices();
        } catch (e) { message.error('删除失败'); }
    };

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
                sort_order: 0
            });
        }
        setIsModalOpen(true);
    };

    // 转换所有 ID 为字符串供 dnd-kit 使用
    const rowIds = useMemo(() => dataSource.map(i => String(i.id)), [dataSource]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card style={{ border: '1px solid #EADDCA', borderRadius: '12px' }}>
                <Space size="large">
                    <Select value={selectedCategory} style={{ width: 160 }} onChange={v => setSelectedCategory(v)}>
                        {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                    </Select>
                    <Select value={selectedRepairType} style={{ width: 200 }} onChange={v => setSelectedRepairType(v)}>
                        {repairTypes.map(r => <Option key={r.id} value={r.id}>{r.name}</Option>)}
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>追加价格</Button>
                </Space>
            </Card>

            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #EADDCA' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                        <Tag color="brown">{categories.find(c => c.id === selectedCategory)?.name}</Tag>
                        <Tag color="green">{repairTypes.find(r => r.id === selectedRepairType)?.name}</Tag>
                    </Space>
                    <span style={{ color: '#faad14', fontSize: '12px' }}>
                        <SortDescendingOutlined /> 拖动左侧图标重新排序
                    </span>
                </div>

                <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                    <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                        <Table
                            components={{ body: { row: EditableRow } }}
                            rowKey="id"
                            dataSource={dataSource}
                            columns={columns}
                            loading={loading}
                            pagination={false}
                        />
                    </SortableContext>
                </DndContext>
            </div>

            <Modal title={editingRecord ? "编辑" : "新增"} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)} confirmLoading={loading}>
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item name="category_id" hidden><Input /></Form.Item>
                    <Form.Item name="repair_type_id" hidden><Input /></Form.Item>
                    <Form.Item name="model_name" label="机型名称" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="sort_order" label="排序权重"><InputNumber style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="price" label="价格" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="price_suffix" label="备注"><Input /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PriceManager;
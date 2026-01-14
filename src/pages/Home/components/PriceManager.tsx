"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Popconfirm, message, Card, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SortDescendingOutlined, MenuOutlined } from '@ant-design/icons';

// --- DnD Kit 関連 ---
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { fetchCategoriesApi, fetchRepairTypesApi } from '../../../services/category';
import { fetchPriceListApi } from '../../../services/price';
import { API_BASE_URL } from "../../../config/api";

const { Option } = Select;

// --- 1. ドラッグハンドルコンポーネント ---
const DragHandle = ({ id }: { id: number }) => {
    const { attributes, listeners, setNodeRef } = useSortable({ id: String(id) });
    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={{ cursor: 'grab', padding: '4px 10px' }}>
            <MenuOutlined style={{ color: '#999' }} />
        </div>
    );
};

// --- 2. ドラッグ可能行コンポーネント ---
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
            } catch (e) { message.error("データの読み込みに失敗しました"); }
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

    // --- ドラッグ終了ロジック ---
    const onDragEnd = async ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const oldIndex = dataSource.findIndex((item) => String(item.id) === String(active.id));
        const newIndex = dataSource.findIndex((item) => String(item.id) === String(over.id));

        if (oldIndex !== -1 && newIndex !== -1) {
            const newData = arrayMove(dataSource, oldIndex, newIndex);
            setDataSource(newData);

            const token = localStorage.getItem('authToken');
            const total = newData.length;
            try {
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
                message.success("並べ替え順を更新しました");
            } catch (e) {
                message.error("並べ替え順の保存に失敗しました");
                loadPrices();
            }
        }
    };

    const columns = [
        {
            title: '移動',
            key: 'sort',
            width: 60,
            render: (_: any, record: any) => <DragHandle id={record.id} />,
        },
        {
            title: '表示順',
            dataIndex: 'sort_order',
            width: 80,
            render: (v: number) => <Tag color="blue">{v}</Tag>
        },
        {
            title: '機種名',
            dataIndex: 'model_name',
            render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>
        },
        {
            title: '修理料金',
            dataIndex: 'price',
            render: (price: number) => (
                <span style={{ color: '#B36D61', fontWeight: 'bold' }}>
                    ¥{Number(price).toLocaleString()}
                </span>
            )
        },
        { title: '備考', dataIndex: 'price_suffix', width: 100 },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)}>編集</Button>
                    <Popconfirm title="削除してもよろしいですか？" onConfirm={() => handleDelete(record.id)} okText="はい" cancelText="いいえ">
                        <Button type="text" danger icon={<DeleteOutlined />}>削除</Button>
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
            message.success('保存が完了しました');
            setIsModalOpen(false);
            loadPrices();
        } catch (e) { message.error('保存に失敗しました'); } finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        const token = localStorage.getItem('authToken');
        try {
            await fetch(`${API_BASE_URL}/prices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            message.success('削除しました');
            loadPrices();
        } catch (e) { message.error('削除に失敗しました'); }
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>料金を追加</Button>
                </Space>
            </Card>

            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #EADDCA' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                        <Tag color="brown">{categories.find(c => c.id === selectedCategory)?.name}</Tag>
                        <Tag color="green">{repairTypes.find(r => r.id === selectedRepairType)?.name}</Tag>
                    </Space>
                    <span style={{ color: '#faad14', fontSize: '12px' }}>
                        <SortDescendingOutlined /> 左のアイコンをドラッグして並べ替え
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

            <Modal
                title={editingRecord ? "料金編集" : "新規料金追加"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={loading}
                okText="保存"
                cancelText="キャンセル"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item name="category_id" hidden><Input /></Form.Item>
                    <Form.Item name="repair_type_id" hidden><Input /></Form.Item>
                    <Form.Item name="model_name" label="機種名" rules={[{ required: true, message: '機種名を入力してください' }]}><Input placeholder="例：iPhone 13" /></Form.Item>
                    <Form.Item name="sort_order" label="表示順ウェイト"><InputNumber style={{ width: '100%' }} placeholder="数値が大きいほど上位に表示されます" /></Form.Item>
                    <Form.Item name="price" label="料金" rules={[{ required: true, message: '料金を入力してください' }]}><InputNumber style={{ width: '100%' }} formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
                    <Form.Item name="price_suffix" label="備考"><Input placeholder="例：税込 / 期間特別価格" /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PriceManager;
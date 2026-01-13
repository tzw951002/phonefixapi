"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, message, Card, Empty, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SortDescendingOutlined, MenuOutlined } from '@ant-design/icons';

// --- DnD Kit 拖拽相关 ---
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { API_BASE_URL } from "../../../config/api";

// --- 1. 拖拽手柄组件 ---
const DragHandle = ({ id }: { id: number }) => {
    const { attributes, listeners, setNodeRef } = useSortable({ id: String(id) });
    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={{ cursor: 'grab', padding: '10px', display: 'inline-flex', alignItems: 'center', touchAction: 'none' }}>
            <MenuOutlined style={{ color: '#999', fontSize: '16px' }} />
        </div>
    );
};

// --- 2. 可拖拽行容器 ---
const EditableRow = (props: any) => {
    const { children, ...restProps } = props;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: String(restProps['data-row-key']),
    });

    const style: React.CSSProperties = {
        ...restProps.style,
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 999, background: '#fafafa' } : {}),
    };

    return <tr {...restProps} ref={setNodeRef} style={style} {...attributes}>{children}</tr>;
};

const FaqManager: React.FC = () => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<any[]>([]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // 获取 FAQ 列表
    const loadFaqs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/faq/`); // 注意这里的 prefix 要和后端一致
            const data = await res.json();
            setDataSource(Array.isArray(data) ? data : []);
        } catch (e) {
            message.error("获取数据失败");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadFaqs(); }, []);

    // --- 核心：拖拽后全量重排序号 ---
    const onDragEnd = async ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const oldIndex = dataSource.findIndex((item) => String(item.id) === String(active.id));
        const newIndex = dataSource.findIndex((item) => String(item.id) === String(over.id));

        if (oldIndex !== -1 && newIndex !== -1) {
            const newData = arrayMove(dataSource, oldIndex, newIndex);
            setDataSource(newData); // 立即更新 UI

            const token = localStorage.getItem('authToken');
            const total = newData.length;

            try {
                const promises = newData.map((item, index) => {
                    const newSortOrder = (total - index) * 10;
                    if (item.sort_order === newSortOrder) return Promise.resolve();

                    return fetch(`${API_BASE_URL}/faq/${item.id}`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...item, sort_order: newSortOrder })
                    });
                });
                await Promise.all(promises);
                message.success("显示顺序已保存");
            } catch (e) {
                message.error("排序同步失败");
                loadFaqs();
            }
        }
    };

    const columns = [
        {
            title: '排序',
            key: 'sort',
            width: 60,
            align: 'center' as const,
            render: (_: any, record: any) => <DragHandle id={record.id} />,
        },
        {
            title: '标题 (问题)',
            dataIndex: 'title',
            key: 'title',
            width: '30%',
            render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>
        },
        {
            title: '内容 (回答)',
            dataIndex: 'content',
            key: 'content',
            render: (text: string) => (
                <div style={{
                    whiteSpace: 'pre-wrap', // 关键：在表格里显示换行预览
                    maxHeight: '100px',
                    overflowY: 'auto',
                    fontSize: '13px',
                    color: '#666'
                }}>
                    {text}
                </div>
            )
        },
        {
            title: '权重',
            dataIndex: 'sort_order',
            width: 80,
            render: (v: number) => <Tag color="orange">{v}</Tag>
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
                    <Popconfirm title="确定删除这条问答吗？" onConfirm={() => handleDelete(record.id)}>
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
            const url = editingRecord ? `${API_BASE_URL}/faq/${editingRecord.id}` : `${API_BASE_URL}/faq/`;
            const res = await fetch(url, {
                method: editingRecord ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            if (!res.ok) throw new Error();
            message.success('保存成功');
            setIsModalOpen(false);
            loadFaqs();
        } catch (e) { message.error('保存失败'); } finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        const token = localStorage.getItem('authToken');
        try {
            await fetch(`${API_BASE_URL}/faq/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            message.success('删除成功');
            loadFaqs();
        } catch (e) { message.error('删除失败'); }
    };

    const showModal = (record: any = null) => {
        setEditingRecord(record);
        if (record) {
            form.setFieldsValue(record);
        } else {
            form.resetFields();
            form.setFieldsValue({ sort_order: 0, is_visible: true });
        }
        setIsModalOpen(true);
    };

    const rowIds = useMemo(() => dataSource.map(i => String(i.id)), [dataSource]);

    return (
        <div style={{ padding: '20px' }}>
            <Card style={{ marginBottom: 20, border: '1px solid #EADDCA', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B7E74' }}>よくあるご質問 (FAQ) 管理</div>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                        追加问题
                    </Button>
                </div>
            </Card>

            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #EADDCA' }}>
                <div style={{ marginBottom: 16, textAlign: 'right', color: '#faad14', fontSize: '12px' }}>
                    <SortDescendingOutlined /> 拖动左侧图标可调整前台显示顺序
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
                            locale={{ emptyText: <Empty description="暂无问答数据" /> }}
                        />
                    </SortableContext>
                </DndContext>
            </div>

            <Modal
                title={editingRecord ? "编辑问答" : "新增问答"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={loading}
                width={700}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item
                        name="title"
                        label="问题标题 (Question)"
                        rules={[{ required: true, message: '请输入问题标题' }]}
                    >
                        <Input placeholder="例：修理時間はどのくらいかかりますか？" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="回答内容 (Answer)"
                        rules={[{ required: true, message: '请输入回答内容' }]}
                    >
                        <Input.TextArea
                            rows={6}
                            placeholder="支持换行。直接按回车键输入即可。"
                        />
                    </Form.Item>

                    <Form.Item name="sort_order" label="排序权重">
                        <InputNumber style={{ width: '100%' }} placeholder="数字越大越靠前" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FaqManager;
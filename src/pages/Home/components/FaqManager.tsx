"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, message, Card, Empty, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SortDescendingOutlined, MenuOutlined } from '@ant-design/icons';

// --- DnD Kit 関連 ---
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { API_BASE_URL } from "../../../config/api";

// --- 1. ドラッグハンドルコンポーネント ---
const DragHandle = ({ id }: { id: number }) => {
    const { attributes, listeners, setNodeRef } = useSortable({ id: String(id) });
    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={{ cursor: 'grab', padding: '10px', display: 'inline-flex', alignItems: 'center', touchAction: 'none' }}>
            <MenuOutlined style={{ color: '#999', fontSize: '16px' }} />
        </div>
    );
};

// --- 2. ドラッグ可能行コンポーネント ---
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

    // FAQリスト取得
    const loadFaqs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/faq/`);
            const data = await res.json();
            // 初期表示は sort_order の昇順でソート
            const sortedData = Array.isArray(data) ? data.sort((a, b) => a.sort_order - b.sort_order) : [];
            setDataSource(sortedData);
        } catch (e) {
            message.error("データの取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadFaqs(); }, []);

    // --- ドラッグ終了ロジック (昇順ルールに修正) ---
    const onDragEnd = async ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const oldIndex = dataSource.findIndex((item) => String(item.id) === String(active.id));
        const newIndex = dataSource.findIndex((item) => String(item.id) === String(over.id));

        if (oldIndex !== -1 && newIndex !== -1) {
            const newData = arrayMove(dataSource, oldIndex, newIndex);
            setDataSource(newData); // UIを即時更新

            const token = localStorage.getItem('authToken');

            try {
                const promises = newData.map((item, index) => {
                    // ルール：上にあるほど数値が小さい (10, 20, 30...)
                    const newSortOrder = (index + 1) * 10;
                    if (item.sort_order === newSortOrder) return Promise.resolve();

                    return fetch(`${API_BASE_URL}/faq/${item.id}`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...item, sort_order: newSortOrder })
                    });
                });
                await Promise.all(promises);
                message.success("表示順を保存しました");
            } catch (e) {
                message.error("並べ替えの同期に失敗しました");
                loadFaqs();
            }
        }
    };

    const columns = [
        {
            title: '移動',
            key: 'sort',
            width: 60,
            align: 'center' as const,
            render: (_: any, record: any) => <DragHandle id={record.id} />,
        },
        {
            title: 'タイトル (質問)',
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
                    whiteSpace: 'pre-wrap',
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
            title: '表示順',
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
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)}>編集</Button>
                    <Popconfirm
                        title="この問答を削除してもよろしいですか？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="はい"
                        cancelText="いいえ"
                    >
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
            const url = editingRecord ? `${API_BASE_URL}/faq/${editingRecord.id}` : `${API_BASE_URL}/faq/`;
            const res = await fetch(url, {
                method: editingRecord ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            if (!res.ok) throw new Error();
            message.success('保存しました');
            setIsModalOpen(false);
            loadFaqs();
        } catch (e) { message.error('保存に失敗しました'); } finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        const token = localStorage.getItem('authToken');
        try {
            await fetch(`${API_BASE_URL}/faq/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            message.success('削除しました');
            loadFaqs();
        } catch (e) { message.error('削除に失敗しました'); }
    };

    const showModal = (record: any = null) => {
        setEditingRecord(record);
        if (record) {
            form.setFieldsValue(record);
        } else {
            form.resetFields();
            form.setFieldsValue({ sort_order: 0 });
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
                        質問を追加
                    </Button>
                </div>
            </Card>

            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #EADDCA' }}>
                <div style={{ marginBottom: 16, textAlign: 'right', color: '#faad14', fontSize: '12px' }}>
                    <SortDescendingOutlined /> 左のアイコンをドラッグして表示順を調整できます（上ほど優先）
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
                            locale={{ emptyText: <Empty description="FAQデータがありません" /> }}
                        />
                    </SortableContext>
                </DndContext>
            </div>

            <Modal
                title={editingRecord ? "FAQ編集" : "新規FAQ追加"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={loading}
                width={700}
                okText="保存"
                cancelText="キャンセル"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item
                        name="title"
                        label="質問内容 (Question)"
                        rules={[{ required: true, message: '質問タイトルを入力してください' }]}
                    >
                        <Input placeholder="例：修理時間はどのくらいかかりますか？" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="回答内容 (Answer)"
                        rules={[{ required: true, message: '回答内容を入力してください' }]}
                    >
                        <Input.TextArea
                            rows={6}
                            placeholder="改行対応しています。"
                        />
                    </Form.Item>

                    <Form.Item name="sort_order" label="表示順ウェイト">
                        <InputNumber style={{ width: '100%' }} placeholder="数値が小さいほど上位に表示されます" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FaqManager;
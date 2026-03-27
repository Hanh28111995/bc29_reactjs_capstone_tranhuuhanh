import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Popconfirm, Space, Tag, Card } from 'antd';
import { useAsync, safeArray } from '../../hooks/useAsync';
import React, { useState, useEffect } from 'react';
import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { getAllSeatTypesApi, updateSeatTypeApi, addOneSeatTypeApi, deleteOneSeatTypeApi } from 'services/seatType';
import './index.scss'; // Link SCSS

export default function SeatTypeTable() {
    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [toggle, setToggle] = useState(false);
    const [deleteIds, setDeleteIds] = useState([]);
    const [updatedIds, setUpdatedIds] = useState([]);
    const { message, notification } = App.useApp();

    const { state: rawData, loading } = useAsync({
        dependencies: [toggle],
        service: getAllSeatTypesApi,
    });
    const data = safeArray(rawData);

    useEffect(() => {
        if (data) setDataSource(data);
    }, [data]);

    const handleDelete = (record) => {
        const isNew = record._id?.toString().startsWith('new_');
        if (!isNew) {
            setDeleteIds((prev) => [...prev, record._id]);
        }
        setDataSource(dataSource.filter((item) => item._id !== record._id));
        message.info("Đã xóa tạm thời. Nhấn LƯU TẤT CẢ để áp dụng.");
    };

    const handleRowSave = async (key) => {
        const isNew = key?.toString().startsWith('new_');
        if (!isNew) {
            setUpdatedIds((prev) => [...new Set([...prev, key])]);
        }
        message.info("Đã lưu thay đổi. Nhấn LƯU TẤT CẢ để áp dụng.");
    };

    const columns = [
        {
            title: 'Tên loại ghế',
            dataIndex: 'name',
            width: '15%',
            valueType: 'select',
            fieldProps: {
                options: [
                    { label: 'Standard', value: 'Standard' },
                    { label: 'VIP', value: 'VIP' },
                    { label: 'Double', value: 'Double' },
                ],
            },
            formItemProps: { rules: [{ required: true, message: 'Trống' }] },
        },
        {
            title: 'Giá vé (VNĐ)',
            dataIndex: 'price',
            valueType: 'digit',
            width: '15%',
            fieldProps: {
                formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            },
        },
        {
            title: 'Màu sắc',
            dataIndex: 'color',
            width: '10%',
            renderFormItem: () => <input type="color" className="color-input-custom" />,
            render: (text) => (
                <Space>
                    <div style={{
                        width: '1.2rem', height: '1.2rem', backgroundColor: text,
                        borderRadius: '0.25rem', border: '1px solid #ddd'
                    }} />
                    <Tag style={{ fontSize: '0.9rem' }}>{text}</Tag>
                </Space>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            valueType: 'textarea',
        },
        {
            title: 'Thao tác',
            valueType: 'option',
            width: '10%',
            render: (text, record, _, action) => [
                <div className="action-btns">
                    <Button
                        key="edit"
                        type="text"
                        icon={<EditOutlined style={{ color: '#1677ff' }} />}
                        onClick={() => action?.startEditable?.(record._id)}
                    />,
                    <Popconfirm
                        key="delete"
                        title="Xóa?"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>,
            ],
        },
    ];

    const handleSaveAll = async () => {
        try {
            const promises = [];

            // Delete
            deleteIds.forEach(id => promises.push(deleteOneSeatTypeApi(id)));

            // Add mới (new_)
            dataSource
                .filter(item => item._id?.toString().startsWith('new_'))
                .forEach(item => {
                    const { _id, ...rest } = item;
                    promises.push(addOneSeatTypeApi(rest));
                });

            // Update những item đã được sửa
            updatedIds.forEach(id => {
                const item = dataSource.find(d => d._id === id);
                if (item) promises.push(updateSeatTypeApi(item));
            });

            if (promises.length === 0) return message.warning("Không có thay đổi");

            await Promise.all(promises);
            notification.success({ message: "Thành công", description: "Dữ liệu đã được cập nhật." });
            setDeleteIds([]);
            setUpdatedIds([]);
            setToggle(t => !t);
        } catch (error) {
            notification.error({ message: "Lỗi", description: "Vui lòng thử lại" });
        }
    };

    return (
        <div className="seat-type-container">
            <Card title="Quản lý loại ghế & Giá vé">
                <EditableProTable
                    tableLayout='fixed'
                    className="custom-editable-table"
                    rowKey="_id"
                    loading={loading}
                    columns={columns}
                    value={dataSource}
                    onChange={setDataSource}
                    recordCreatorProps={{
                        position: 'bottom',
                        record: () => ({ _id: `new_${Date.now()}` }),
                        creatorButtonText: "Thêm loại ghế mới"
                    }}
                    editable={{
                        type: 'multiple',
                        editableKeys,
                        onChange: setEditableRowKeys,
                        onSave: handleRowSave,
                        saveText: 'Lưu',
                        cancelText: 'Hủy',
                        actionRender: (row, config, defaultDoms) => [
                            defaultDoms.save,
                            defaultDoms.cancel,
                        ],
                    }}
                />

                <div className="save-all-wrapper">
                    <Button
                        type="primary"
                        className="btn-save-all"
                        icon={<SaveOutlined />}
                        onClick={handleSaveAll}
                        disabled={dataSource.length === 0}
                    >
                        LƯU TẤT CẢ THAY ĐỔI
                    </Button>
                </div>
            </Card>
        </div>
    );
}

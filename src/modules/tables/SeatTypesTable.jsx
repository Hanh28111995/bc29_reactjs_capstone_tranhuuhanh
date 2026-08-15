import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Popconfirm, Space, Tag, Card } from 'antd';
import { useAsync, safeArray } from '../../hooks/useAsync';
import React, { useState, useEffect } from 'react';
import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { getAllSeatTypesApi, updateSeatTypeApi, addOneSeatTypeApi, deleteOneSeatTypeApi } from 'services/seatType';
import './index.scss'; 

export default function SeatTypeTable() {
    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [deleteIds, setDeleteIds] = useState([]);
    const [updatedIds, setUpdatedIds] = useState([]);
    const { message, notification } = App.useApp();

    // Sử dụng useAsync chuẩn của dự án kết hợp queryKey để dễ dàng refetch
    const { state: rawData, loading, refetch } = useAsync({
        service: getAllSeatTypesApi,
        queryKey: ['seatTypes'],
    });
    
    const data = safeArray(rawData);

    // Đồng bộ dữ liệu gốc vào local state khi fetch thành công
    useEffect(() => {
        if (data && data.length > 0) {
            setDataSource(data);
            setDeleteIds([]);
            setUpdatedIds([]);
        }
    }, [data]);

    const handleDelete = (record) => {
        const isNew = record._id?.toString().startsWith('new_');
        if (!isNew) {
            setDeleteIds((prev) => [...new Set([...prev, record._id])]);
            setUpdatedIds((prev) => prev.filter(id => id !== record._id));
        }
        setDataSource(dataSource.filter((item) => item._id !== record._id));
        message.info("Đã xóa tạm thời. Nhấn LƯU TẤT CẢ để áp dụng.");
    };

    const handleRowSave = async (key) => {
        const isNew = key?.toString().startsWith('new_');
        if (!isNew) {
            setUpdatedIds((prev) => [...new Set([...prev, key])]);
        }
        message.info("Đã ghi nhận thay đổi dòng. Nhấn LƯU TẤT CẢ để cập nhật server.");
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
            render: (text, record, _, action) => {
                const isEditing = editableKeys.includes(record._id);
                if (isEditing) return null;

                return [
                    <div className="action-btns" key="actions">
                        <Button
                            key="edit"
                            type="text"
                            icon={<EditOutlined style={{ color: '#1677ff' }} />}
                            onClick={() => action?.startEditable?.(record._id)}
                        />
                        <Popconfirm
                            key="delete"
                            title="Xóa tạm thời loại ghế này?"
                            onConfirm={() => handleDelete(record)}
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </div>
                ];
            },
        },
    ];

    const handleSaveAll = async () => {
        if (editableKeys.length > 0) {
            return message.warning("Vui lòng nhấn 'Lưu' hoặc 'Hủy' trên các dòng đang sửa trước!");
        }

        try {
            const promises = [];

            deleteIds.forEach(id => promises.push(deleteOneSeatTypeApi(id)));

            dataSource
                .filter(item => item._id?.toString().startsWith('new_'))
                .forEach(item => {
                    const { _id, ...rest } = item;
                    promises.push(addOneSeatTypeApi(rest));
                });

            updatedIds.forEach(id => {
                const item = dataSource.find(d => d._id === id);
                if (item && !deleteIds.includes(id)) {
                    promises.push(updateSeatTypeApi(item));
                }
            });

            if (promises.length === 0) return message.warning("Không có thay đổi nào để lưu!");

            await Promise.all(promises);
            notification.success({ message: "Thành công", description: "Dữ liệu loại ghế đã được cập nhật." });
            
            refetch(); // Làm mới dữ liệu chuẩn xác từ server
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
                        record: () => ({ _id: `new_${Date.now()}`, name: 'Standard', price: 0, color: '#1677ff', description: '' }),
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
                    search={false}
                    options={false}
                />

                <div className="save-all-wrapper" style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button
                        type="primary"
                        size="large"
                        className="btn-save-all"
                        icon={<SaveOutlined />}
                        onClick={handleSaveAll}
                        disabled={loading || (deleteIds.length === 0 && updatedIds.length === 0 && !dataSource.some(item => item._id?.toString().startsWith('new_')))}
                    >
                        LƯU TẤT CẢ THAY ĐỔI
                    </Button>
                </div>
            </Card>
        </div>
    );
}
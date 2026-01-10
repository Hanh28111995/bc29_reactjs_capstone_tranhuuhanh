import { EditableProTable, ProCard, ProFormField } from '@ant-design/pro-components';
import { Button, App, Popconfirm, Space, Tag, Card } from 'antd';
import { useAsync } from '../../hooks/useAsync';
import React, { useState, useEffect } from 'react';
import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { getAllSeatTypesApi, updateSeatTypeApi, addOneSeatTypeApi, deleteOneSeatTypeApi } from 'services/seatType';

export default function SeatTypeTable() {
    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [toggle, setToggle] = useState(false);
    const [deleteIds, setDeleteIds] = useState([]);

    // Lấy công cụ thông báo từ context của Antd App
    const { message, notification } = App.useApp();

    // 1. Lấy dữ liệu từ server
    const { state: data = [], loading } = useAsync({
        dependencies: [toggle],
        service: getAllSeatTypesApi,
    });

    // 2. Đồng bộ dữ liệu khi API trả về kết quả
    useEffect(() => {
        if (data) {
            setDataSource(data);
        }
    }, [data]);

    // 3. Xử lý xóa dòng (Lưu lại ID để xóa thật khi nhấn SAVE ALL)
    const handleDelete = (record) => {
        const isNew = record._id?.toString().startsWith('new_');
        if (!isNew) {
            setDeleteIds((prev) => [...prev, record._id]);
        }
        setDataSource(dataSource.filter((item) => item._id !== record._id));
        message.info("Đã xóa tạm thời. Nhấn SAVE ALL để áp dụng thay đổi.");
    };

    const columns = [
        {
            title: 'Tên loại ghế',
            dataIndex: 'name',
            width: '20%',
            formItemProps: {
                rules: [{ required: true, message: 'Không được để trống' }],
            },
        },
        {
            title: 'Giá vé (VNĐ)',
            dataIndex: 'price',
            valueType: 'digit',
            width: '20%',
            fieldProps: {
                formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            },
        },
        {
            title: 'Màu sắc',
            dataIndex: 'color',
            width: '15%',
            // Tận dụng Input color của trình duyệt
            renderFormItem: () => <input type="color" style={{ width: '100%', height: '32px', cursor: 'pointer' }} />,
            render: (text) => (
                <Space>
                    <div style={{
                        width: 16, height: 16, backgroundColor: text,
                        borderRadius: '4px', border: '1px solid #ddd'
                    }} />
                    <Tag>{text}</Tag>
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
            width: 120,
            render: (text, record, _, action) => [
                <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined style={{ color: '#1677ff' }} />}
                    onClick={() => action?.startEditable?.(record._id)}
                />,
                <Popconfirm
                    key="delete"
                    title="Xóa tạm thời?"
                    onConfirm={() => handleDelete(record)}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
            ],
        },
    ];

    // 4. Lưu tất cả thay đổi (Thêm, Sửa, Xóa) về Backend
    const handleSaveAll = async () => {
        try {
            const promises = [];

            // Xử lý Xóa
            if (deleteIds.length > 0) {
                deleteIds.forEach(id => promises.push(deleteOneSeatTypeApi(id)));
            }

            // Xử lý Cập nhật & Thêm mới
            const updateData = dataSource.filter(item => item._id && !item._id.toString().startsWith('new_'));
            const newData = dataSource.filter(item => item._id && item._id.toString().startsWith('new_'));

            if (updateData.length > 0) {
                promises.push(updateSeatTypeApi(updateData));
            }

            if (newData.length > 0) {
                newData.forEach(item => {
                    const { _id, ...rest } = item; // Loại bỏ ID tạm 'new_...'
                    promises.push(addOneSeatTypeApi(rest));
                });
            }

            if (promises.length === 0) {
                return message.warning("Không có thay đổi nào để lưu");
            }

            await Promise.all(promises);
            notification.success({
                message: "Thành công",
                description: "Tất cả thay đổi đã được cập nhật lên hệ thống.",
            });

            setDeleteIds([]);
            setToggle(!toggle); // Refetch dữ liệu chuẩn từ server
        } catch (error) {
            notification.error({
                message: "Lỗi lưu dữ liệu",
                description: error.response?.data?.message || "Vui lòng thử lại sau",
            });
        }
    };

    return (
        <Card>
            <EditableProTable
                rowKey="_id"
                headerTitle="Quản lý loại ghế & Giá vé"
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

                    // --- CHỈNH SỬA TẠI ĐÂY ---
                    saveText: 'Lưu',        // Thay cho chữ "Cứu"
                    cancelText: 'Hủy',      // Thay cho "Quản lý" (nếu có)
                    deleteText: 'Xóa',

                    actionRender: (row, config, defaultDoms) => [
                        defaultDoms.save,
                        defaultDoms.cancel,
                    ],
                    onSave: async (key, row) => {
                        console.log(row);
                    },
                }}
            />

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleSaveAll}
                    disabled={dataSource.length === 0}
                >
                    LƯU TẤT CẢ THAY ĐỔI
                </Button>
            </div>

            <ProCard
                title="Dữ liệu JSON (Debug)"
                headerBordered
                collapsible
                defaultCollapsed
                style={{ marginTop: 20 }}
            >
                <ProFormField
                    mode="read"
                    valueType="jsonCode"
                    text={JSON.stringify(dataSource, null, 2)}
                />
            </ProCard>
        </Card>
    );
}
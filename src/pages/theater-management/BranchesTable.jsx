import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Popconfirm, Card } from 'antd';
import { useAsync } from '../../hooks/useAsync';
import React, { useState, useEffect } from 'react';
import { getAllBranches, deleteOneBranchApi, updateBranhesApi, addOneBranchApi } from 'services/branches';
import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';

export default function BranchesTable() {
    // Sử dụng hook App để lấy notification và message chuẩn Antd 5
    const { notification, message } = App.useApp();

    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [deleteIds, setDeleteIds] = useState([]);
    const [toggle, setToggle] = useState(false);

    // 1. Lấy dữ liệu từ service
    const { state: data = [], loading } = useAsync({
        dependencies: [toggle],
        service: getAllBranches,
    });

    // 2. Cập nhật dataSource khi có dữ liệu mới
    useEffect(() => {
        if (data) setDataSource(data);
    }, [data]);

    // 3. Xử lý xóa dòng tạm thời
    const handleDelete = (record) => {
        const isNew = record._id?.toString().startsWith('new_');
        if (!isNew) {
            setDeleteIds((prev) => [...prev, record._id]);
        }
        setDataSource(dataSource.filter((item) => item._id !== record._id));
        message.info("Đã xóa tạm thời. Nhấn SAVE ALL để hoàn tất.");
    };

    const columns = [
        {
            title: 'Tên rạp',
            dataIndex: 'cinemaName',
            width: '25%',
            formItemProps: { rules: [{ required: true, message: 'Vui lòng nhập tên rạp' }] },
        },
        {
            title: 'Tên chi nhánh',
            dataIndex: 'branch',
            width: '25%',
            formItemProps: { rules: [{ required: true, message: 'Vui lòng nhập tên chi nhánh' }] },
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            width: '35%',
            formItemProps: { rules: [{ required: true, message: 'Vui lòng nhập địa chỉ' }] },
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
                    title="Xóa tạm thời dòng này?"
                    onConfirm={() => handleDelete(record)}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ],
        },
    ];

    // 4. Lưu tất cả thay đổi
    const handleSaveAll = async () => {
        try {
            const promises = [];

            // Lọc dữ liệu cần cập nhật và thêm mới
            const updateData = dataSource.filter(item => item._id && !item._id.toString().startsWith('new_'));
            const newData = dataSource.filter(item => item._id && item._id.toString().startsWith('new_'));

            // Thêm các request xóa vào hàng đợi
            if (deleteIds.length > 0) {
                deleteIds.forEach(id => promises.push(deleteOneBranchApi(id)));
            }

            // Thêm các request cập nhật
            if (updateData.length > 0) {
                promises.push(updateBranhesApi(updateData));
            }

            // Thêm các request thêm mới (duyệt qua từng item)
            if (newData.length > 0) {
                newData.forEach(item => {
                    const { _id, ...payload } = item;
                    promises.push(addOneBranchApi(payload));
                });
            }

            if (promises.length === 0) return message.warning("Không có thay đổi nào để lưu!");

            await Promise.all(promises);

            notification.success({
                message: 'Thành công',
                description: 'Tất cả chi nhánh đã được cập nhật!',
                placement: 'bottomRight',
            });

            setDeleteIds([]);
            setToggle(prev => !prev); // Refresh data
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể lưu dữ liệu, vui lòng kiểm tra lại.',
            });
        }
    };

    return (
        <Card>
            <EditableProTable
                rowKey="_id"
                headerTitle="Quản lý chi nhánh rạp"
                loading={loading}
                columns={columns}
                value={dataSource}
                onChange={setDataSource}
                recordCreatorProps={{
                    position: 'bottom',
                    record: () => ({ _id: `new_${Date.now()}` }),
                    creatorButtonText: "Thêm chi nhánh mới"
                }}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    onChange: setEditableRowKeys,
                    // Sửa tiếng Việt trực tiếp tại đây để tránh lỗi dịch thuật "Cứu"
                    saveText: 'Lưu',
                    cancelText: 'Hủy',
                    actionRender: (row, config, defaultDoms) => [
                        defaultDoms.save,
                        defaultDoms.cancel,
                    ],
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
        </Card>
    );
}
import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Card, Input, Space } from 'antd';
import { useAsync } from '../../hooks/useAsync';
import React, { useState, useEffect, useMemo } from 'react';
import { getAllBranches, deleteOneBranchApi, updateBranhesApi, addOneBranchApi } from 'services/branches';
import { DeleteOutlined, EditOutlined, SaveOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';

const { Search } = Input;

export default function BranchesTable() {
    const { notification, message } = App.useApp();

    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]); // Data gốc từ API
    const [searchText, setSearchText] = useState(""); // Từ khóa tìm kiếm
    const [deleteIds, setDeleteIds] = useState([]);
    const [toggle, setToggle] = useState(false);

    const { state: data = [], loading } = useAsync({
        dependencies: [toggle],
        service: getAllBranches,
    });

    useEffect(() => {
        if (data) setDataSource(data);
    }, [data]);

    // --- LOGIC LỌC DỮ LIỆU ---
    // Bảng sẽ hiển thị dữ liệu dựa trên displayData này
    const displayData = useMemo(() => {
        if (!searchText) return dataSource;
        const lowerSearch = searchText.toLowerCase();
        return dataSource.filter(item =>
            item.cinemaName?.toLowerCase().includes(lowerSearch) ||
            item.branch?.toLowerCase().includes(lowerSearch) ||
            item.address?.toLowerCase().includes(lowerSearch)
        );
    }, [dataSource, searchText]);

    const handleDelete = (record) => {
        const isNew = record._id?.toString().startsWith('new_');
        if (!isNew) setDeleteIds((prev) => [...prev, record._id]);
        setDataSource(dataSource.filter((item) => item._id !== record._id));
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
                <Button
                    key="delete"
                    type="text"
                    icon={<DeleteOutlined style={{ color: "red" }} />}
                    onClick={() => handleDelete(record)}
                />
            ],
        },
    ];

    const handleSaveAll = async () => {
        if (editableKeys.length > 0) {
            return message.warning("Vui lòng nhấn Lưu hoặc Hủy ở các dòng đang chỉnh sửa trước!");
        }
        try {
            const promises = [];
            const updateData = dataSource.filter(item => item._id && !item._id.toString().startsWith('new_'));
            const newData = dataSource.filter(item => item._id && item._id.toString().startsWith('new_'));

            if (deleteIds.length > 0) deleteIds.forEach(id => promises.push(deleteOneBranchApi(id)));
            if (updateData.length > 0) promises.push(updateBranhesApi(updateData));
            if (newData.length > 0) {
                newData.forEach(item => {
                    const { _id, ...payload } = item;
                    promises.push(addOneBranchApi(payload));
                });
            }

            if (promises.length === 0 && deleteIds.length === 0) return message.warning("Không có thay đổi!");

            await Promise.all(promises);
            notification.success({ message: 'Thành công', description: 'Đã cập nhật hệ thống!' });
            setDeleteIds([]);
            setToggle(prev => !prev);
        } catch (error) {
            notification.error({ message: 'Lỗi', description: 'Lưu thất bại.' });
        }
    };

    return (
        <Card>
            {/* THANH TÌM KIẾM PHÍA TRÊN BẢNG */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Search
                    placeholder="Tìm kiếm rạp, chi nhánh hoặc địa chỉ..."
                    allowClear
                    enterButton={<Button icon={<SearchOutlined />}>Search</Button>}
                    size="large"
                    onSearch={(value) => setSearchText(value)}
                    onChange={(e) => {
                        if (!e.target.value) setSearchText(""); // Reset khi xóa trắng input
                    }}
                    style={{ maxWidth: 500 }}
                />

                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveAll}
                    disabled={loading}
                >
                    LƯU TẤT CẢ
                </Button>
            </div>

            <EditableProTable
                rowKey="_id"
                loading={loading}
                columns={columns}
                // CHÌA KHÓA: value dùng displayData đã lọc, nhưng onChange cập nhật vào dataSource gốc
                value={displayData}
                onChange={(updatedList) => {
                    // Khi có sự thay đổi trong bảng (sửa/xóa), ta cập nhật vào bộ data gốc
                    setDataSource(updatedList);
                }}
                recordCreatorProps={{
                    position: 'bottom',
                    creatorButtonText: "Thêm chi nhánh mới",
                    record: () => ({
                        _id: `new_${Date.now()}`,
                        // Mồi sẵn text đang tìm kiếm vào tên rạp để dòng mới không bị ẩn
                        cinemaName: searchText || '',
                    }),
                }}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    saveText: 'Lưu',
                    cancelText: 'Hủy',
                    actionRender: (row, config, defaultDoms) => [
                        defaultDoms.save,
                        defaultDoms.cancel,
                    ],
                    onChange: setEditableRowKeys,
                    onCancel: async (key) => {
                        if (key?.toString().startsWith('new_')) {
                            setTimeout(() => {
                                setDataSource((prev) => prev.filter((item) => item._id !== key));
                            }, 0);
                        }
                    },
                    onValuesChange: (record, recordList) => {
                        // Đồng bộ dữ liệu đang sửa vào dataSource gốc
                        setDataSource(recordList);
                    },
                }}
                // Ẩn search mặc định của ProTable vì ta đã tự làm ở trên
                search={false}
                options={false}
            />
        </Card>
    );
}
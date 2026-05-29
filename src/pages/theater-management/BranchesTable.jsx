import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Card, Input, Popconfirm } from 'antd';
import { useAsync, safeArray } from '../../hooks/useAsync';
import React, { useState, useEffect, useMemo } from 'react';
import { getAllBranches, deleteOneBranchApi, addOneBranchApi, updateBranhesApi } from 'services/branches';
import { DeleteOutlined, EditOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import './index.scss'; 

const { Search } = Input;

export default function BranchesTable() {
    const { notification, message } = App.useApp();

    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [deleteIds, setDeleteIds] = useState([]);
    const [updatedIds, setUpdatedIds] = useState([]); 
    const [toggle, setToggle] = useState(false);

    const { state: rawData, loading } = useAsync({
        dependencies: [toggle],
        service: getAllBranches,
    });
    const data = safeArray(rawData);

    useEffect(() => {
        if (data) {
            setDataSource(data);
            setDeleteIds([]);
            setUpdatedIds([]);
        }
    }, [data]);

    // ✅ SỬA: Lọc dữ liệu hiển thị mượt mà liên tục từ State gốc
    const displayData = useMemo(() => {
        if (!searchText) return dataSource;
        const lowerSearch = searchText.toLowerCase().trim();
        return dataSource.filter(item =>
            item.cinemaName?.toLowerCase().includes(lowerSearch) ||
            item.branch?.toLowerCase().includes(lowerSearch) ||
            item.address?.toLowerCase().includes(lowerSearch)
        );
    }, [dataSource, searchText]);

    const handleDelete = (record) => {
        const isNew = record._id?.toString().startsWith('new_');
        if (!isNew) {
            setDeleteIds((prev) => [...new Set([...prev, record._id])]);
            // Nếu dòng cũ nằm trong danh sách đã sửa, loại bỏ khỏi updatedIds
            setUpdatedIds((prev) => prev.filter(id => id !== record._id));
        }
        setDataSource(dataSource.filter((item) => item._id !== record._id));
        message.info("Đã xóa tạm thời. Nhấn LƯU TẤT CẢ để áp dụng.");
    };

    // ✅ SỬA: Hàm lưu dòng ghi nhận chính xác record thay đổi
    const handleRowSave = async (key, record) => {
        const isNew = key?.toString().startsWith('new_');
        if (!isNew) {
            setUpdatedIds((prev) => [...new Set([...prev, key])]);
        }
        message.info("Đã ghi nhận thay đổi dòng. Nhấn LƯU TẤT CẢ để cập nhật server.");
    };

    const columns = [
        {
            title: 'Tên rạp',
            dataIndex: 'cinemaName',
            width: '15%',
            formItemProps: { rules: [{ required: true, message: 'Không được để trống' }] },
        },
        {
            title: 'Tên chi nhánh',
            dataIndex: 'branch',
            width: '25%',
            formItemProps: { rules: [{ required: true, message: 'Không được để trống' }] },
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            formItemProps: { rules: [{ required: true, message: 'Không được để trống' }] },
        },
        {
            title: 'Thao tác',
            valueType: 'option',
            width: '15%',
            render: (text, record, _, action) => {
                // ✅ SỬA: Nếu dòng này đang được Edit, ẩn nút Edit/Xóa mặc định của mình đi
                const isEditing = editableKeys.includes(record._id);
                if (isEditing) return null;

                return [
                    <div className='action-btns' key="actions">
                        <Button
                            key="edit"
                            type="text"
                            icon={<EditOutlined style={{ color: '#1677ff' }} />}
                            onClick={() => action?.startEditable?.(record._id)}
                        />
                        <Popconfirm
                            key="delete-confirm"
                            title="Xóa tạm thời chi nhánh này?"
                            onConfirm={() => handleDelete(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                type="text"
                                icon={<DeleteOutlined style={{ color: "red" }} />}
                            />
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

            // 1. Xử lý Xóa
            deleteIds.forEach(id => promises.push(deleteOneBranchApi(id)));

            // 2. Xử lý Thêm mới
            dataSource
                .filter(item => item._id?.toString().startsWith('new_'))
                .forEach(item => {
                    const { _id, ...payload } = item;
                    promises.push(addOneBranchApi(payload));
                });

            // 3. Xử lý Cập nhật
            updatedIds.forEach(id => {
                const item = dataSource.find(d => d._id === id);
                if (item && !deleteIds.includes(id)) {
                    promises.push(updateBranhesApi(item)); 
                }
            });

            if (promises.length === 0) return message.warning("Không có thay đổi nào để lưu!");

            await Promise.all(promises);
            notification.success({ message: 'Thành công', description: 'Hệ thống chi nhánh đã được cập nhật thành công.' });
            
            setToggle(prev => !prev); // Reload data từ API để làm sạch state ẩn
        } catch (error) {
            notification.error({ message: 'Lỗi', description: 'Lưu thất bại. Vui lòng kiểm tra lại hệ thống.' });
        }
    };

    return (
        <div className="branches-table-container">
            <Card title="Quản lý chi nhánh rạp">
                <div className="table-header-toolbar">
                    <div className="search-box">
                        <Search
                            placeholder="Tìm kiếm rạp, chi nhánh hoặc địa chỉ..."
                            allowClear
                            enterButton={<Button icon={<SearchOutlined />}></Button>}
                            size="large"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)} // Cập nhật text liên tục để đồng bộ mảng displayData
                        />
                    </div>
                </div>

                <EditableProTable
                    className="custom-editable-table"
                    rowKey="_id"
                    loading={loading}
                    columns={columns}
                    value={displayData}
                    // ✅ SỬA: Đồng bộ ngược lại dữ liệu thay đổi trên dòng vào State tổng dataSource
                    onChange={(updatedList) => {
                        if (!searchText) {
                            setDataSource(updatedList);
                        } else {
                            // Nếu đang search, chỉ merge các dòng thay đổi ngược lại mảng gốc dataSource
                            setDataSource(prev => prev.map(item => updatedList.find(u => u._id === item._id) || item));
                        }
                    }}
                    recordCreatorProps={{
                        position: 'bottom',
                        creatorButtonText: "Thêm chi nhánh mới",
                        record: () => ({
                            _id: `new_${Date.now()}`,
                            cinemaName: '',
                            branch: '',
                            address: ''
                        }),
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

                <div className='save-all-wrapper' style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button
                        type="primary"
                        size="large"
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
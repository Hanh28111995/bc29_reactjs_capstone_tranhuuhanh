import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Card, Input, Popconfirm } from 'antd';
import { useAsync } from '../../hooks/useAsync';
import React, { useState, useEffect, useMemo } from 'react';
import { getAllBranches,  } from 'services/branches';
import { DeleteOutlined, EditOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import './index.scss'; 
import { deleteOneBranchApi } from 'services/branches';
import { addOneBranchApi } from 'services/branches';
import { updateBranhesApi } from 'services/branches';

const { Search } = Input;

export default function BranchesTable() {
    const { notification, message } = App.useApp();

    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [deleteIds, setDeleteIds] = useState([]);
    const [updatedIds, setUpdatedIds] = useState([]); // State theo dõi các ID đã sửa
    const [toggle, setToggle] = useState(false);

    const { state: data = [], loading } = useAsync({
        dependencies: [toggle],
        service: getAllBranches,
    });

    useEffect(() => {
        if (data) setDataSource(data);
    }, [data]);

    // Lọc dữ liệu hiển thị dựa trên ô tìm kiếm
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
        if (!isNew) {
            setDeleteIds((prev) => [...new Set([...prev, record._id])]);
        }
        setDataSource(dataSource.filter((item) => item._id !== record._id));
        message.info("Đã xóa tạm thời. Nhấn LƯU TẤT CẢ để áp dụng.");
    };

    // Khi nhấn nút "Lưu" trên từng dòng
    const handleRowSave = async (key) => {
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
            formItemProps: { rules: [{ required: true, message: 'Trống' }] },
        },
        {
            title: 'Tên chi nhánh',
            dataIndex: 'branch',
            width: '25%',
            formItemProps: { rules: [{ required: true, message: 'Trống' }] },
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            formItemProps: { rules: [{ required: true, message: 'Trống' }] },
        },
        {
            title: 'Thao tác',
            valueType: 'option',
            width: '15%',
            render: (text, record, _, action) => [
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
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined style={{ color: "red" }} />}
                        />
                    </Popconfirm>
                </div>
            ],
        },
    ];

    const handleSaveAll = async () => {
        // Kiểm tra xem còn dòng nào đang ở trạng thái Edit (chưa nhấn Lưu/Hủy trên dòng)
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

            // 3. Xử lý Cập nhật (Chỉ cập nhật những dòng nằm trong updatedIds)
            updatedIds.forEach(id => {
                const item = dataSource.find(d => d._id === id);
                // Nếu item vẫn tồn tại (chưa bị xóa trong lúc chưa save all)
                if (item && !deleteIds.includes(id)) {
                    promises.push(updateBranhesApi(item)); 
                    // Lưu ý: Nếu updateBranhesApi của bạn nhận Array, hãy gom lại rồi push 1 lần.
                    // Ở đây tôi đang giả định updateBranhesApi nhận 1 object giống SeatType.
                }
            });

            if (promises.length === 0) return message.warning("Không có thay đổi nào để lưu!");

            await Promise.all(promises);
            notification.success({ message: 'Thành công', description: 'Hệ thống chi nhánh đã được cập nhật.' });
            
            // Reset các trạng thái
            setDeleteIds([]);
            setUpdatedIds([]);
            setToggle(prev => !prev); // Reload data từ API
        } catch (error) {
            notification.error({ message: 'Lỗi', description: 'Lưu thất bại. Vui lòng kiểm tra lại.' });
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
                            onSearch={(value) => setSearchText(value)}
                            onChange={(e) => { if (!e.target.value) setSearchText(""); }}
                        />
                    </div>
                </div>

                <EditableProTable
                    className="custom-editable-table"
                    rowKey="_id"
                    loading={loading}
                    columns={columns}
                    value={displayData}
                    onChange={(updatedList) => setDataSource(updatedList)}
                    recordCreatorProps={{
                        position: 'bottom',
                        creatorButtonText: "Thêm chi nhánh mới",
                        record: () => ({
                            _id: `new_${Date.now()}`,
                            cinemaName: '',
                        }),
                    }}
                    editable={{
                        type: 'multiple',
                        editableKeys,
                        onChange: setEditableRowKeys,
                        onSave: handleRowSave, // Kích hoạt khi nhấn nút Lưu trên dòng
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
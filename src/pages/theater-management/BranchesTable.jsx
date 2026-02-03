import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Card, Input } from 'antd';
import { useAsync } from '../../hooks/useAsync';
import React, { useState, useEffect, useMemo } from 'react';
import { getAllBranches, deleteOneBranchApi, updateBranhesApi, addOneBranchApi } from 'services/branches';
import { DeleteOutlined, EditOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import './index.scss'; // Dùng chung file SCSS

const { Search } = Input;

export default function BranchesTable() {
    const { notification, message } = App.useApp();

    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [deleteIds, setDeleteIds] = useState([]);
    const [toggle, setToggle] = useState(false);

    const { state: data = [], loading } = useAsync({
        dependencies: [toggle],
        service: getAllBranches,
    });

    useEffect(() => {
        if (data) setDataSource(data);
    }, [data]);

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
                <div className='action-btns'>
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
                </div>
            ],
        },
    ];

    const handleSaveAll = async () => {
        if (editableKeys.length > 0) {
            return message.warning("Vui lòng hoàn tất chỉnh sửa trên dòng trước!");
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
        <div className="branches-table-container"> {/* Class bao ngoài để nhận SCSS shared */}
            <Card title="Quản lý chi nhánh rạp">
                <div className="table-header-toolbar"> {/* Thanh tìm kiếm và nút Save */}
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
                    className="custom-editable-table" // Class dùng chung
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
                        onValuesChange: (record, recordList) => setDataSource(recordList),
                    }}
                    search={false}
                    options={false}
                    // pagination={{
                    //     pageSize: 10,                        
                    //     showSizeChanger: false,
                    //     showTotal: false
                    // }}
                />
                <div className='save-all-wrapper'>
                    <Button
                        type="primary"
                        className="btn-save-all"
                        icon={<SaveOutlined />}
                        onClick={handleSaveAll}
                        disabled={loading}
                    >
                        LƯU TẤT CẢ THAY ĐỔI
                    </Button>
                </div>
            </Card>
        </div>
    );
}
import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Popconfirm, Space, Card, Image, Input } from 'antd';
import { useAsync, safeArray } from '../../hooks/useAsync';
import React, { useState, useEffect } from 'react';
import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { getBannerListAPI, addBannerAPI, updateBannerAPI, deleteBannerAPI } from 'services/banner';
import './index.scss';

export default function BannerTable() {
    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [deleteIds, setDeleteIds] = useState([]);
    const [updatedIds, setUpdatedIds] = useState([]);
    const { message, notification } = App.useApp();

    
    const { state: rawData, loading, refetch } = useAsync({
        service: getBannerListAPI,
        queryKey: ['banners'],
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
        message.info("Đã xóa tạm thời. Nhấn LƯU TẤT CẢ để áp dụng lên server.");
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
            title: 'ID',
            dataIndex: '_id',
            editable: false,
            width: '20%',
            render: (text) => <span className="font-mono text-xs" style={{ color: '#888' }}>{text}</span>,
        },
        {
            title: 'Banner URL & Xem trước',
            dataIndex: 'url',
            width: '45%',
            formItemProps: { rules: [{ required: true, message: 'URL banner không được để trống' }] },
            render: (text) => (
                <Space align="center" size={12}>
                    {text && (
                        <Image 
                            src={text} 
                            alt="Banner Preview" 
                            width={70} 
                            height={38} 
                            style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                        />
                    )}
                    <a href={text} target="_blank" rel="noopener noreferrer" className="banner-link" style={{ maxWidth: 300, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {text}
                    </a>
                </Space>
            ),
        },
        {
            title: 'Movie ID',
            dataIndex: 'movie_id',
            width: '20%',
            formItemProps: { rules: [{ required: true, message: 'Movie ID không được để trống' }] },
            render: (text) => (
                <span style={{ background: '#e6f7ff', color: '#1890ff', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>
                    {text}
                </span>
            ),
        },
        {
            title: 'Thao tác',
            valueType: 'option',
            width: '15%',
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
                            title="Xóa tạm thời banner này?"
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
            return message.warning("Vui lòng nhấn 'Lưu' hoặc 'Hủy' trên các dòng đang sửa trước khi lưu tất cả!");
        }

        try {
            const promises = [];

            // 1. Xử lý các ID bị xóa
            deleteIds.forEach(id => promises.push(deleteBannerAPI(id)));

            // 2. Xử lý các dòng mới thêm (bắt đầu bằng new_)
            dataSource
                .filter(item => item._id?.toString().startsWith('new_'))
                .forEach(item => {
                    const { _id, ...rest } = item;
                    promises.push(addBannerAPI(rest));
                });

            // 3. Xử lý các dòng bị chỉnh sửa (update)
            updatedIds.forEach(id => {
                const item = dataSource.find(d => d._id === id);
                if (item && !deleteIds.includes(id)) {
                    // Truyền chuẩn tham số theo hàm updateBannerAPI(Id, data) của bạn
                    promises.push(updateBannerAPI(id, { url: item.url, movie_id: item.movie_id }));
                }
            });

            if (promises.length === 0) return message.warning("Không có thay đổi nào để lưu!");

            await Promise.all(promises);
            notification.success({ message: "Thành công", description: "Dữ liệu banner đã được cập nhật thành công." });
            
            refetch(); // Làm mới lại dữ liệu từ server
        } catch (error) {
            console.error(error);
            notification.error({ message: "Lỗi", description: "Có lỗi xảy ra khi lưu thay đổi, vui lòng thử lại." });
        }
    };

    return (
        <div className="banner-table-container">
            <Card 
                title="Quản lý Banner" 
                extra={<span style={{ color: '#d46b08', background: '#fffbe6', padding: '6px 12px', border: '1px solid #ffe58f', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>Lưu ý: Duy trì số lượng banner là 5</span>}
            >
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
                        record: () => ({ _id: `new_${Date.now()}`, url: '', movie_id: '' }),
                        creatorButtonText: "Thêm banner mới"
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
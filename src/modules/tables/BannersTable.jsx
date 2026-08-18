import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Card, Popconfirm, Space, Image, AutoComplete, Spin } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { useAsync, safeArray } from '../../hooks/useAsync';
import { getBannerListAPI, addBannerAPI, updateBannerAPI, deleteBannerAPI } from 'services/banner';
import { fetchSearchMovieAPI } from 'services/movie';
import { DeleteOutlined, EditOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import './index.scss';

// --- Component con xử lý upload và preview trực tiếp ---
const BannerImageUploader = ({ value, record, setDataSource }) => {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(record.url || value);

    // Đồng bộ lại preview nếu record.url thay đổi từ ngoài vào
    useEffect(() => {
        setPreviewUrl(record.url || value);
    }, [record.url, value]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log("👉 File được chọn từ ổ cứng:", file);

        // 1. Lưu trực tiếp file object vào record của dòng này
        record.fileObj = file;

        // 2. Tạo preview base64 hiển thị lên giao diện ngay lập tức
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64Url = ev.target.result;
            record.url = base64Url;
            setPreviewUrl(base64Url);
            // Trigger cập nhật lại state của bảng để render lại toàn bộ
            setDataSource(prev => [...prev]);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input 
                type="file" 
                ref={inputRef}
                hidden 
                accept="image/*" 
                onChange={handleFileChange} 
            />
            <Button icon={<UploadOutlined />} onClick={() => inputRef.current?.click()}>
                Chọn ảnh
            </Button>
            {previewUrl && (
                <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ width: 40, height: 20, objectFit: 'cover', borderRadius: 2 }} 
                />
            )}
        </div>
    );
};

// --- Component hỗ trợ chọn phim ---
const MovieIdSelect = ({ value, onChange }) => {
    const [keyword, setKeyword] = useState('');
    const [options, setOptions] = useState([]);
    const [searching, setSearching] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            if (!keyword.trim()) { setOptions([]); return; }
            setSearching(true);
            try {
                const res = await fetchSearchMovieAPI({ title: keyword.trim(), page: 1, limit: 10 });
                const list = res.data.content.movies || [];
                setOptions(list.map(m => ({
                    value: m.id_movie || m._id,
                    label: m.title,
                })));
            } finally { setSearching(false); }
        }, 500);
    }, [keyword]);

    return (
        <AutoComplete
            value={value}
            onChange={onChange}
            onSearch={setKeyword}
            options={options}
            placeholder="Tìm tên phim..."
            style={{ width: '100%' }}
            notFoundContent={searching ? <Spin size="small" /> : null}
        />
    );
};

export default function BannerTable() {
    const { notification, message } = App.useApp();
    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [deleteIds, setDeleteIds] = useState([]);
    const [updatedIds, setUpdatedIds] = useState([]);
    
    const formRef = useRef();

    const { state: rawData, loading, refetch } = useAsync({
        service: getBannerListAPI,
        queryKey: ['banners'],
    });

    useEffect(() => {
        if (rawData) {
            const initializedData = safeArray(rawData).map(item => ({ ...item, fileObj: null }));
            setDataSource(initializedData);
        }
    }, [rawData]);

    const handleSaveAll = async () => {
        const tableFormValues = formRef.current?.getFieldsValue() || {};
        
        try {
            const promises = [];
            deleteIds.forEach(id => promises.push(deleteBannerAPI(id)));

            dataSource.forEach(item => {
                const isNew = item._id?.toString().startsWith('new_');
                const rowFormValues = tableFormValues[item._id] || {};
                const currentMovieId = rowFormValues.movie_id !== undefined ? rowFormValues.movie_id : item.movie_id;

                if (isNew || updatedIds.includes(item._id) || editableKeys.includes(item._id)) {
                    const formData = new FormData();
                    formData.append("movie_id", currentMovieId || "");
                    
                    if (item.fileObj) {
                        formData.append("file", item.fileObj);
                    } else if (item.url && !item.url.startsWith('data:')) {
                        formData.append("url", item.url);
                    }

                    // =========================================================================
                    // 🔍 CONSOLE.LOG CHECK PAYLOAD TRƯỚC KHI GỬI API (HÃY MỞ F12 ĐỂ XEM)
                    // =========================================================================
                    console.log(`========================================`);
                    console.log(`📌 Đang kiểm tra Payload cho row ID: ${item._id}`);
                    console.log(`📌 item.fileObj hiện tại:`, item.fileObj);
                    console.log(`📌 Các trường dữ liệu trong FormData:`);
                    for (let pair of formData.entries()) {
                        console.log(`   - Key: [${pair[0]}] => Value:`, pair[1]);
                    }
                    console.log(`========================================`);
                    // =========================================================================

                    if (isNew) {
                        promises.push(addBannerAPI(formData));
                    } else {
                        promises.push(updateBannerAPI(item._id, formData));
                    }
                }
            });

            if (promises.length === 0) return message.warning("Không có thay đổi nào để lưu!");

            await Promise.all(promises);
            notification.success({ message: 'Thành công', description: 'Cập nhật banner thành công.' });
            refetch();
            setDeleteIds([]);
            setUpdatedIds([]);
            setEditableRowKeys([]);
        } catch (e) {
            console.error("Lỗi khi lưu:", e);
            notification.error({ message: 'Lỗi', description: 'Lưu thất bại.' });
        }
    };

    const columns = [
        {
            title: 'Banner',
            dataIndex: 'url',
            width: '40%',
            render: (text) => (
                <Space>
                    <Image 
                        src={text} 
                        width={80} 
                        height={40} 
                        style={{ objectFit: 'cover', borderRadius: 4 }} 
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                    />
                    <span style={{ fontSize: '11px', color: '#888' }}>
                        {text?.startsWith('data:') ? 'Ảnh tạm' : 'Ảnh server'}
                    </span>
                </Space>
            ),
            renderFormItem: (_, config) => {
                const recordPath = config.path ? config.path.slice(0, -1) : [];
                const record = formRef.current?.getFieldValue(recordPath) || {};
                
                if (!record._id && config.record) Object.assign(record, config.record);

                return <BannerImageUploader value={config.value} record={record} setDataSource={setDataSource} />;
            }
        },
        {
            title: 'Movie ID',
            dataIndex: 'movie_id',
            width: '30%',
            renderFormItem: (_, { value, onChange }) => (
                <MovieIdSelect value={value} onChange={onChange} />
            )
        },
        {
            title: 'Thao tác',
            valueType: 'option',
            width: '15%',
            render: (_, record, __, action) => {
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
                            key="delete"
                            title="Xóa tạm thời banner này?"
                            onConfirm={() => {
                                const isNew = record._id?.toString().startsWith('new_');
                                if (!isNew) {
                                    setDeleteIds(prev => [...new Set([...prev, record._id])]);
                                    setUpdatedIds(prev => prev.filter(id => id !== record._id));
                                }
                                setDataSource(prev => prev.filter(i => i._id !== record._id));
                                message.info("Đã xóa tạm thời.");
                            }}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button type="text" icon={<DeleteOutlined style={{ color: 'red' }} />} />
                        </Popconfirm>
                    </div>
                ];
            }
        }
    ];

    return (
        <div className="banner-table-container">
            <Card title="Quản lý Banner">
                <EditableProTable
                    className="custom-editable-table"
                    rowKey="_id"
                    formRef={formRef}
                    loading={loading}
                    columns={columns}
                    value={dataSource}
                    onChange={setDataSource}
                    recordCreatorProps={{
                        position: 'bottom',
                        creatorButtonText: "Thêm banner mới",
                        record: () => ({ 
                            _id: `new_${Date.now()}`, 
                            url: '', 
                            movie_id: '',
                            fileObj: null 
                        })
                    }}
                    editable={{
                        type: 'multiple',
                        editableKeys,
                        onChange: setEditableRowKeys,
                        onSave: (key) => {
                            if (!key.toString().startsWith('new_')) {
                                setUpdatedIds(prev => [...new Set([...prev, key])]);
                            }
                            message.info("Đã ghi nhận dòng. Nhấn LƯU TẤT CẢ để gửi lên server.");
                        },
                        saveText: 'Lưu',
                        cancelText: 'Hủy'
                    }}
                    search={false}
                    options={false}
                />

                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button
                        type="primary"
                        size="large"
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
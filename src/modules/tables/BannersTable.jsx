import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Card, Popconfirm, Space, Image, AutoComplete, Spin } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { useAsync, safeArray } from '../../hooks/useAsync';
import { getBannerListAPI, addBannerAPI, updateBannerAPI, deleteBannerAPI } from 'services/banner';
import { fetchSearchMovieAPI } from 'services/movie';
import { DeleteOutlined, EditOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import './index.scss';

// Khai báo một object ngoài component BannerTable để lưu tạm file theo ID của dòng
const fileMap = {};

const BannerImageUploader = ({ value, record }) => {
    const inputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Lưu file vào map dựa theo _id của row
        fileMap[record._id] = file;

        const reader = new FileReader();
        reader.onload = (ev) => {
            // Trigger re-render nhẹ nếu cần hiển thị preview ảnh base64 ngay lập tức
            record.url = ev.target.result;
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
            {record.url && (
                <img 
                    src={record.url} 
                    alt="Preview" 
                    style={{ width: 40, height: 20, objectFit: 'cover', borderRadius: 2 }} 
                />
            )}
        </div>
    );
};

// --- Component hỗ trợ chọn phim ---
const MovieIdSelect = ({ value, onChange, setMovieTitleCache }) => {
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
                setMovieTitleCache(prev => ({ ...prev, ...Object.fromEntries(list.map(m => [m.id_movie || m._id, m.title])) }));
            } finally { setSearching(false); }
        }, 500);
    }, [keyword, setMovieTitleCache]);

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
    const [movieTitleCache, setMovieTitleCache] = useState({});
    
    // Thêm formRef để lấy dữ liệu từ các dòng đang edit trực tiếp
    const formRef = useRef();

    const { state: rawData, loading, refetch } = useAsync({
        service: getBannerListAPI,
        queryKey: ['banners'],
    });

    useEffect(() => {
        if (rawData) setDataSource(safeArray(rawData));
    }, [rawData]);

   const handleSaveAll = async () => {
        const tableFormValues = formRef.current?.getFieldsValue() || {};
        
        try {
            const promises = [];
            deleteIds.forEach(id => promises.push(deleteBannerAPI(id)));

            dataSource.forEach(item => {
                const isNew = item._id?.toString().startsWith('new_');
                // Lấy thông tin form mới nhất của dòng (ví dụ: movie_id mới nhập)
                const rowFormValues = tableFormValues[item._id] || {};
                const currentMovieId = rowFormValues.movie_id !== undefined ? rowFormValues.movie_id : item.movie_id;

                if (isNew || updatedIds.includes(item._id) || editableKeys.includes(item._id)) {
                    const formData = new FormData();
                    formData.append("movie_id", currentMovieId || "");
                    
                    // Lấy file từ fileMap theo _id của dòng
                    const selectedFile = fileMap[item._id];

                    if (selectedFile) {
                        formData.append("file", selectedFile);
                    } else if (item.url && !item.url.startsWith('data:')) {
                        formData.append("url", item.url);
                    }

                    // Console log kiểm tra kỹ payload trước khi bắn API
                    console.log(`--- Payload cho row ${item._id} ---`);
                    for (let pair of formData.entries()) {
                        console.log(`${pair[0]}:`, pair[1]);
                    }

                    if (isNew) {
                        promises.push(addBannerAPI(formData));
                    } else {
                        promises.push(updateBannerAPI(item._id, formData));
                    }
                }
            });

            if (promises.length === 0) return message.warning("Không có thay đổi nào để lưu!");

            await Promise.all(promises);
            notification.success({ message: 'Thành công', description: 'Hệ thống banner đã được cập nhật thành công.' });
            
            // Clear lại fileMap sau khi lưu thành công
            Object.keys(fileMap).forEach(key => delete fileMap[key]);

            refetch();
            setDeleteIds([]);
            setUpdatedIds([]);
            setEditableRowKeys([]);
        } catch (e) {
            console.error("Lỗi:", e);
            notification.error({ message: 'Lỗi', description: 'Lưu thất bại. Vui lòng kiểm tra lại hệ thống.' });
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
            renderFormItem: (schema, config, form) => {
                // Lấy record từ đường dẫn form hiện tại của Ant Design ProTable
                const recordPath = config.path ? config.path.slice(0, -1) : [];
                const record = form.getFieldValue(recordPath) || {};
                
                return <BannerImageUploader value={config.value} record={record} />;
            }
        },
        {
            title: 'Movie ID',
            dataIndex: 'movie_id',
            width: '30%',
            renderFormItem: (_, { value, onChange }) => (
                <MovieIdSelect 
                    value={value} 
                    onChange={onChange} 
                    setMovieTitleCache={setMovieTitleCache} 
                />
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
                                message.info("Đã xóa tạm thời. Nhấn LƯU TẤT CẢ để áp dụng.");
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
                    formRef={formRef} // Truyền formRef vào đây để lấy giá trị realtime đang nhập
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
                            message.info("Đã ghi nhận thay đổi dòng. Nhấn LƯU TẤT CẢ để cập nhật server.");
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
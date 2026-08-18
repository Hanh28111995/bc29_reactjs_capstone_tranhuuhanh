import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Popconfirm, Space, Card, Image, AutoComplete, Spin, Input } from 'antd';
import { useAsync, safeArray, useAsyncMutation } from '../../hooks/useAsync';
import React, { useState, useEffect, useRef } from 'react';
import { DeleteOutlined, EditOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { getBannerListAPI, addBannerAPI, updateBannerAPI, deleteBannerAPI } from 'services/banner';
import { fetchSearchMovieAPI } from 'services/movie';
import './index.scss';

// ===============================
// ===== MovieIdSelect component =====
// ===============================
const MovieIdSelect = ({ value, onChange, movieTitleCache, setMovieTitleCache }) => {
    const [keyword, setKeyword] = useState('');
    const [debounced, setDebounced] = useState('');
    const [options, setOptions] = useState([]);
    const [searching, setSearching] = useState(false);
    const timerRef = useRef(null);
    const latestReqRef = useRef(0);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setDebounced(keyword.trim());
        }, 1000);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [keyword]);

    useEffect(() => {
        let cancel = false;
        const reqId = ++latestReqRef.current;
        const run = async () => {
            if (!debounced) {
                setOptions([]);
                setSearching(false);
                return;
            }
            setSearching(true);
            try {
                const res = await fetchSearchMovieAPI({ title: debounced, page: 1, limit: 20 });
                if (cancel || reqId !== latestReqRef.current) return;                            
                
                const list = res?.content?.movies || res?.data?.content?.movies || [];

                const newOptions = list.map(m => {
                    const movieId = m.id_movie || m._id;
                    return {
                        value: movieId,
                        label: (
                            <Space size={12} align="center">
                                {m.banner && (
                                    <Image
                                        src={m.banner}
                                        alt={m.title}
                                        width={40}
                                        height={22}
                                        style={{ objectFit: 'cover', borderRadius: 3 }}
                                        preview={false}
                                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                                    />
                                )}
                                <div style={{ lineHeight: 1.2 }}>
                                    <div style={{ fontWeight: 500 }}>{m.title}</div>
                                    <div style={{ color: '#888', fontSize: 11 }}>id: {movieId}</div>
                                </div>
                            </Space>
                        ),
                        title: m.title,
                        _title: m.title,
                    };
                });

                setOptions(newOptions);

                setMovieTitleCache(prev => {
                    const next = { ...prev };
                    list.forEach(m => { 
                        const movieId = m.id_movie || m._id;
                        next[movieId] = m.title; 
                    });
                    return next;
                });
            } catch (err) {
                if (cancel) return;
                setOptions([]);
            } finally {
                if (!cancel) setSearching(false);
            }
        };
        run();
        return () => { cancel = true; };
    }, [debounced, setMovieTitleCache]);

    useEffect(() => {
        if (!value || movieTitleCache[value]) return;
        setMovieTitleCache(prev => prev[value] ? prev : { ...prev, [value]: value });
    }, [value, movieTitleCache, setMovieTitleCache]);

    const handleSelect = (val, option) => {
        onChange?.(val);
        if (option?._title) {
            setMovieTitleCache(prev => prev[val] === option._title
                ? prev
                : { ...prev, [val]: option._title });
        }
    };

    return (
        <AutoComplete
            value={value}
            onChange={(val) => onChange?.(val)}
            onSelect={handleSelect}
            onSearch={setKeyword}
            options={options}
            allowClear
            placeholder="Gõ tên phim để tìm..."
            size="middle"
            style={{ width: '100%' }}
            notFoundContent={
                searching ? (
                    <div style={{ textAlign: 'center', padding: 8 }}><Spin size="small" /> Đang tìm...</div>
                ) : keyword ? 'Không tìm thấy phim nào' : 'Nhập tên phim để tìm kiếm'
            }
        />
    );
};

export default function BannerTable() {
    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [deleteIds, setDeleteIds] = useState([]);
    const [updatedIds, setUpdatedIds] = useState([]);
    const { message, notification } = App.useApp();

    const [movieTitleCache, setMovieTitleCache] = useState({});

    const { state: rawData, loading, refetch } = useAsync({
        service: getBannerListAPI,
        queryKey: ['banners'],
    });

    const data = safeArray(rawData);

    useEffect(() => {
        if (data && data.length > 0) {
            setDataSource(data);
            setDeleteIds([]);
            setUpdatedIds([]);
        }
    }, [data]);

    const renderMovieId = (id) => {
        if (!id) return <span style={{ color: '#aaa' }}>—</span>;
        const title = movieTitleCache[id];
        return (
            <Space direction="vertical" size={0}>
                {title && title !== id && (
                    <span style={{ fontWeight: 500, color: '#222', fontSize: 13 }}>{title}</span>
                )}
                <span style={{ background: '#e6f7ff', color: '#1890ff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>
                    {id}
                </span>
            </Space>
        );
    };

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
            width: '18%',
            render: (text) => <span className="font-mono text-xs" style={{ color: '#888' }}>{text}</span>,
        },
      {
            title: 'Banner',
            dataIndex: 'url',
            width: '42%',
            formItemProps: { rules: [{ required: true, message: 'Vui lòng chọn ảnh banner' }] },
            renderFormItem: (_, { value, onChange }, record) => {
                // Tạo một sub-component nhẹ để quản lý preview riêng biệt cho từng dòng
                const CellUpload = () => {
                    const [localPreview, setLocalPreview] = useState(value || '');

                    const handleFileChange = (e) => {
                        const fileUploaded = e.target.files[0];
                        if (!fileUploaded) return;

                        const reader = new FileReader();
                        reader.readAsDataURL(fileUploaded);
                        reader.onload = (event) => {
                            const result = event.target.result;
                            setLocalPreview(result); // Hiển thị preview ngay lập tức
                            onChange?.(result);      // Cập nhật giá trị cho ProTable
                            if (record) record.fileObj = fileUploaded; // Lưu file để gọi FormData khi lưu
                        };
                    };

                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <input 
                                type="file" 
                                id={`file_${record?._id}`} 
                                hidden 
                                onChange={handleFileChange} 
                                accept="image/*" 
                            />
                            <Space>
                                <Button 
                                    icon={<UploadOutlined />} 
                                    onClick={() => document.getElementById(`file_${record?._id}`).click()}
                                    size="small"
                                    type="dashed"
                                >
                                    Chọn ảnh từ máy
                                </Button>
                                <Input 
                                    value={localPreview && !localPreview.startsWith('data:') ? localPreview : ''}
                                    onChange={(e) => {
                                        setLocalPreview(e.target.value);
                                        onChange?.(e.target.value);
                                        if (record) record.fileObj = null;
                                    }}
                                    placeholder="Hoặc dán URL ảnh..." 
                                    size="small"
                                />
                            </Space>

                            {/* Khung hiển thị preview ảnh */}
                            {localPreview && (
                                <div style={{ marginTop: 4 }}>
                                    <Image
                                        src={localPreview}
                                        alt="Preview"
                                        width={100}
                                        height={45}
                                        style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #d9d9d9' }}
                                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                                    />
                                    <span style={{ marginLeft: 8, color: '#52c41a', fontSize: 12, fontWeight: 500 }}>
                                        ✓ Đã chọn ảnh
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                };

                return <CellUpload />;
            },
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
                    <a href={text} target="_blank" rel="noopener noreferrer" className="banner-link" style={{ maxWidth: 260, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {text}
                    </a>
                </Space>
            ),
        },
        {
            title: 'Phim (Movie ID)',
            dataIndex: 'movie_id',
            width: '25%',
            renderFormItem: (_, { value, onChange }) => (
                <MovieIdSelect
                    value={value}
                    onChange={onChange}
                    movieTitleCache={movieTitleCache}
                    setMovieTitleCache={setMovieTitleCache}
                />
            ),
            formItemProps: { rules: [{ required: true, message: 'Vui lòng chọn phim cho banner' }] },
            render: (text) => renderMovieId(text),
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

            deleteIds.forEach(id => promises.push(deleteBannerAPI(id)));

            dataSource
                .filter(item => item._id?.toString().startsWith('new_'))
                .forEach(item => {
                    if (item.fileObj) {
                        const formData = new FormData();
                        formData.append("File", item.fileObj);
                        formData.append("movie_id", item.movie_id || "");
                        promises.push(addBannerAPI(formData));
                    } else {
                        promises.push(addBannerAPI({ url: item.url, movie_id: item.movie_id }));
                    }
                });

            updatedIds.forEach(id => {
                const item = dataSource.find(d => d._id === id);
                if (item && !deleteIds.includes(id)) {
                    if (item.fileObj) {
                        const formData = new FormData();
                        formData.append("File", item.fileObj);
                        formData.append("movie_id", item.movie_id || "");
                        promises.push(updateBannerAPI(id, formData));
                    } else {
                        promises.push(updateBannerAPI(id, { url: item.url, movie_id: item.movie_id }));
                    }
                }
            });

            if (promises.length === 0) return message.warning("Không có thay đổi nào để lưu!");

            await Promise.all(promises);
            notification.success({ message: "Thành công", description: "Dữ liệu banner đã được cập nhật thành công." });

            refetch();
        } catch (error) {
            console.error(error);
            notification.error({ message: "Lỗi", description: "Có lỗi xảy ra khi lưu thay đổi, vui lòng thử lại." });
        }
    };

    const _unused = useAsyncMutation;

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
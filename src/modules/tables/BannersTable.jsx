import { EditableProTable } from '@ant-design/pro-components';
import { Button, App, Card, Input, Popconfirm, Space, Image, AutoComplete, Spin, message as antMessage } from 'antd';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAsync, safeArray } from '../../hooks/useAsync';
import { getBannerListAPI, addBannerAPI, updateBannerAPI, deleteBannerAPI } from 'services/banner';
import { fetchSearchMovieAPI } from 'services/movie';
import { DeleteOutlined, EditOutlined, SaveOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import './index.scss';

const { Search } = Input;

// --- Component hỗ trợ chọn phim ---
const MovieIdSelect = ({ value, onChange, movieTitleCache, setMovieTitleCache }) => {
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
                const list = res?.content?.movies || [];
                setOptions(list.map(m => ({
                    value: m.id_movie || m._id,
                    label: m.title,
                    _title: m.title
                })));
                setMovieTitleCache(prev => ({ ...prev, ...Object.fromEntries(list.map(m => [m.id_movie || m._id, m.title])) }));
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
    const [searchText, setSearchText] = useState("");
    const [deleteIds, setDeleteIds] = useState([]);
    const [updatedIds, setUpdatedIds] = useState([]);
    const [movieTitleCache, setMovieTitleCache] = useState({});

    const { state: rawData, loading, refetch } = useAsync({
        service: getBannerListAPI,
        queryKey: ['banners'],
    });

    useEffect(() => {
        if (rawData) setDataSource(safeArray(rawData));
    }, [rawData]);

    const displayData = useMemo(() => {
        if (!searchText) return dataSource;
        return dataSource.filter(item => item.url?.includes(searchText) || item.movie_id?.toString().includes(searchText));
    }, [dataSource, searchText]);

    const handleSaveAll = async () => {
        try {
            const promises = [];
            deleteIds.forEach(id => promises.push(deleteBannerAPI(id)));

            dataSource.forEach(item => {
                const isNew = item._id?.toString().startsWith('new_');
                if (isNew || updatedIds.includes(item._id)) {
                    const formData = new FormData();
                    formData.append("movie_id", item.movie_id);
                    if (item.fileObj) formData.append("File", item.fileObj);
                    else formData.append("url", item.url);

                    if (isNew) promises.push(addBannerAPI(formData));
                    else promises.push(updateBannerAPI(item._id, formData));
                }
            });

            await Promise.all(promises);
            notification.success({ message: 'Cập nhật thành công' });
            refetch();
            setDeleteIds([]);
            setUpdatedIds([]);
        } catch (e) {
            notification.error({ message: 'Lưu thất bại' });
        }
    };

    const columns = [
        {
            title: 'Banner',
            dataIndex: 'url',
            width: '40%',
            render: (text) => (
                <Space>
                    <Image src={text} width={80} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
                    <span style={{ fontSize: '11px', color: '#888' }}>{text?.startsWith('data:') ? 'Ảnh tạm' : 'Ảnh server'}</span>
                </Space>
            ),
            renderFormItem: (_, { value, onChange }, record) => (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="file" id={`f_${record._id}`} hidden accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            onChange(ev.target.result);
                            record.fileObj = file; // Đánh dấu có file để gửi FormData
                        };
                        reader.readAsDataURL(file);
                    }} />
                    <Button icon={<UploadOutlined />} onClick={() => document.getElementById(`f_${record._id}`).click()}>Chọn ảnh</Button>
                    {value && <img src={value} style={{ width: 40, height: 20 }} />}
                </div>
            )
        },
        {
            title: 'Movie ID',
            dataIndex: 'movie_id',
            renderFormItem: (_, { value, onChange }) => (
                <MovieIdSelect value={value} onChange={onChange} movieTitleCache={movieTitleCache} setMovieTitleCache={setMovieTitleCache} />
            )
        },
        {
            title: 'Thao tác',
            valueType: 'option',
            render: (_, record, __, action) => [
                <Button key="edit" type="text" onClick={() => action?.startEditable?.(record._id)} icon={<EditOutlined />} />,
                <Popconfirm key="del" title="Xóa?" onConfirm={() => {
                    if (!record._id.startsWith('new_')) setDeleteIds(prev => [...prev, record._id]);
                    setDataSource(prev => prev.filter(i => i._id !== record._id));
                }}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ]
        }
    ];

    return (
        <Card title="Quản lý Banner">
            <Search placeholder="Tìm kiếm..." style={{ marginBottom: 16, width: 300 }} onChange={e => setSearchText(e.target.value)} />
            <EditableProTable
                rowKey="_id"
                columns={columns}
                value={displayData}
                onChange={setDataSource}
                recordCreatorProps={{
                    record: () => ({ _id: `new_${Date.now()}`, url: '', movie_id: '' })
                }}
                editable={{
                    editableKeys,
                    onChange: setEditableRowKeys,
                    onSave: (key) => { if (!key.toString().startsWith('new_')) setUpdatedIds(prev => [...new Set([...prev, key])]); }
                }}
            />
            <Button type="primary" size="large" onClick={handleSaveAll} style={{ marginTop: 20 }} icon={<SaveOutlined />}>
                LƯU TẤT CẢ THAY ĐỔI
            </Button>
        </Card>
    );
}
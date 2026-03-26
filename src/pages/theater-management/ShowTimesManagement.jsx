import { Space, Table, Input, Button, App, Popconfirm, Card, Tag, Tooltip } from 'antd';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    CalendarOutlined,
    SearchOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import { getShowTimeToday, getShowTimeUpcoming, getAllShowTimes, deleteOneShowTime } from 'services/showtime';
import { useAsync } from 'hooks/useAsync';
import './index.scss';

const { Search } = Input;

export default function ShowtimeManagement() {
    const navigate = useNavigate();
    const [toggle, setToggle] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [overrideData, setOverrideData] = useState(null); // null = dùng useAsync
    const [overrideLoading, setOverrideLoading] = useState(false);
    const { notification } = App.useApp();

    const { state: rawData, loading: asyncLoading } = useAsync({
        dependencies: [toggle],
        service: getAllShowTimes,
    });

    const loading = overrideLoading || asyncLoading;
    const baseData = overrideData ?? (Array.isArray(rawData) ? rawData : []);

    const showtimeList = useMemo(() => {
        if (!keyword) return baseData;
        const key = keyword.toLowerCase().trim();
        return baseData.filter(ele =>
            ele.id_movie?.title?.toLowerCase().includes(key) ||
            ele.theater?.name?.toLowerCase().includes(key)
        );
    }, [baseData, keyword]);

    const handleFilter = async (service) => {
        setOverrideLoading(true);
        try {
            const res = await service();
            const content = res.data.content;
            const data = Array.isArray(content)
                ? content
                : Object.values(content ?? {}).find(v => Array.isArray(v)) ?? [];
            setOverrideData(data);
        } catch {
            notification.error({ message: "Lỗi tải dữ liệu" });
        } finally {
            setOverrideLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteOneShowTime(id);
            notification.success({ message: "Xóa suất chiếu thành công" });
            setOverrideData(null);
            setToggle(prev => !prev);
        } catch (error) {
            notification.error({ message: "Xóa thất bại", description: error.response?.data?.message });
        }
    };

    const columns = [
        {
            title: 'Phim',
            dataIndex: ['id_movie', 'title'],
            key: 'movieTitle',
            width: '25%',
            render: (text) => (
                <p style={{ color: 'blue', fontWeight: 'bold' }}>
                    {text}
                </p>
            ),
        },
        {
            title: 'Phòng Chiếu',
            dataIndex: ['theater', 'name'],
            key: 'theaterName',
            render: (text) => <Tag color="volcano" className="branch-tag">{text}</Tag>,
        },
        {
            title: 'Thời gian',
            dataIndex: 'startTime',
            key: 'startTime',
            width: '15%',
            sorter: (a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
            render: (date) => (
                <Space>
                    {dayjs(date?.replace('Z', '').replace('+07:00', '')).format('DD/MM/YYYY - HH:mm')}
                </Space>
            ),
        },
        {
            title: 'Ghế',
            key: 'seatsStatus',
            width: '10%',
            render: (_, record) => {
                const total = record.seats?.length || 0;
                const booked = record.seats?.filter(s => s.isBooked).length || 0;
                return (
                    <Tooltip title={`Đã đặt ${booked}/${total} ghế`}>
                        <span style={{ whiteSpace: 'nowrap' }}>{booked} / {total}</span>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: "15%",
            render: (_, record) => (
                <Space size="small" className="action-btns">
                    <Button
                        type="text"
                        icon={<EditOutlined style={{ color: '#1677ff' }} />}
                        onClick={() => navigate(`/admin/showtimes/${record._id}/update`)}
                    />
                    <Popconfirm
                        title="Xóa suất chiếu?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="showtime-management-container">
            <Card
                title={
                    <Space>
                        <CalendarOutlined />
                        <span>Quản lý lịch chiếu phim</span>
                    </Space>
                }
            >
                <div className="table-header">
                    <Search
                        className="search-box"
                        placeholder="Tìm theo tên phim hoặc phòng chiếu..."
                        onSearch={setKeyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        allowClear
                        enterButton={<Button icon={<SearchOutlined />}></Button>}
                        size="large"
                    />
                    <Space className='ml-auto'>
                        <Button
                            type="default"
                            icon={<CalendarOutlined />}
                            onClick={() => handleFilter(getShowTimeToday)}
                        >
                            SUẤT CHIẾU HÔM NAY
                        </Button>
                        <Button
                            type="default"
                            icon={<CalendarOutlined />}
                            onClick={() => handleFilter(getShowTimeUpcoming)}
                        >
                            SUẤT CHIẾU SẮP ĐẾN
                        </Button>
                        <Button
                            type="default"
                            icon={<CalendarOutlined />}
                            onClick={() => { setOverrideData(null); setToggle(p => !p); }}
                        >
                            TẤT CẢ
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/admin/showtimes/create')}
                        >
                            THÊM SUẤT CHIẾU
                        </Button>
                    </Space>
                </div>

                <Table
                    tableLayout='fixed'
                    className="custom-table"
                    rowKey="_id"
                    columns={columns}
                    dataSource={showtimeList}
                    loading={loading}
                    bordered
                    pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
                />
            </Card>
        </div>
    );
}
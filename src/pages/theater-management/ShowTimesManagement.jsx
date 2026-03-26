import { Space, Table, Input, Button, App, Popconfirm, Card, Tag, Tooltip } from 'antd';
import React, { useState, useEffect } from 'react';
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
import './index.scss';

const { Search } = Input;

export default function ShowtimeManagement() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const [paginationMeta, setPaginationMeta] = useState({ total: 0, totalPages: 1 });
    const [showtimeList, setShowtimeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const { notification } = App.useApp();

    const fetchData = async (params = {}) => {
        setLoading(true);
        try {
            const res = await getAllShowTimes({ page: pagination.page, limit: pagination.limit, ...params });
            const content = res.data.content;
            const data = Array.isArray(content.showtimes) ? content.showtimes : (Array.isArray(content) ? content : []);
            const meta = content.pagination ?? {};
            setShowtimeList(data);
            setPaginationMeta({ total: meta.total ?? data.length, totalPages: meta.totalPages ?? 1 });
        } catch {
            notification.error({ message: "Lỗi tải dữ liệu" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData({ page: pagination.page, limit: pagination.limit });
    }, [pagination]);

    const handleFilter = async (service) => {
        setLoading(true);
        try {
            const res = await service();
            const content = res.data.content;
            const data = Array.isArray(content)
                ? content
                : Object.values(content ?? {}).find(v => Array.isArray(v)) ?? [];
            setShowtimeList(data);
            setPaginationMeta({ total: data.length, totalPages: 1 });
        } catch {
            notification.error({ message: "Lỗi tải dữ liệu" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteOneShowTime(id);
            notification.success({ message: "Xóa suất chiếu thành công" });
            fetchData({ page: pagination.page, limit: pagination.limit });
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
                            onClick={() => { setPagination({ page: 1, limit: pagination.limit }); }}
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
                    pagination={{ 
                        current: pagination.page,
                        pageSize: pagination.limit,
                        total: paginationMeta.total,
                        showTotal: (total) => `Tổng ${total} suất chiếu`,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        onChange: (page, limit) => setPagination({ page, limit }),
                    }}
                />
            </Card>
        </div>
    );
}
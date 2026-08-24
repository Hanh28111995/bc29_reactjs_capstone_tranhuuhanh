import { Space, Table, Input, Button, App, Popconfirm, Card, Tag, Tooltip } from 'antd';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    CalendarOutlined    
} from "@ant-design/icons";
import dayjs from 'dayjs';
import { getShowTimeToday, getShowTimeUpcoming, getAllShowTimes, deleteOneShowTime } from 'services/showtime';
import { useAsync, useAsyncMutation } from '../../hooks/useAsync'; // Chuẩn hóa hook của dự án
import "./index.scss";

export default function ShowtimeTable() {
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const [keyword, setKeyword] = useState("");
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const [activeFilter, setActiveFilter] = useState("all"); // Quản lý trạng thái đang xem: 'all' | 'today' | 'upcoming'

    const [showtimeList, setShowtimeList] = useState([]);
    const [paginationMeta, setPaginationMeta] = useState({ total: 0 });

    // 1. Gọi API lấy dữ liệu linh hoạt dựa theo tab filter đang chọn và phân trang
    const { data: responseContent, loading: isLoading } = useAsync({
        dependencies: [pagination.page, pagination.limit, activeFilter],
        queryKey: ['showtimes-list', pagination.page, pagination.limit, activeFilter],
        service: () => {
            if (activeFilter === 'today') return getShowTimeToday();
            if (activeFilter === 'upcoming') return getShowTimeUpcoming();
            return getAllShowTimes({ page: pagination.page, limit: pagination.limit, keyword });
        },
    });

    // 2. Đồng bộ dữ liệu trả về từ API vào state của bảng
    useEffect(() => {
        if (responseContent) {
            const content = responseContent.data?.content ?? responseContent.content ?? responseContent;
            
            // Xử lý linh hoạt cấu trúc trả về (mảng thuần hoặc object bọc phân trang)
            const data = Array.isArray(content?.showtimes) 
                ? content.showtimes 
                : (Array.isArray(content) ? content : (content?.data ?? []));
                
            const meta = content?.pagination ?? {};

            // Nếu đang dùng filter Today/Upcoming mà API trả về mảng danh sách
            setShowtimeList(data);
            setPaginationMeta({
                total: meta.total ?? data.length,
            });
        }
    }, [responseContent]);

    // 3. Xử lý Xóa suất chiếu với useAsyncMutation chuẩn
    const { mutateAsync: deleteShowtime, isPending: isDeleting } = useAsyncMutation({
        service: (id) => deleteOneShowTime(id),
        invalidateQueries: [['showtimes-list']],
        onSuccess: () => {
            notification.success({ message: "Xóa suất chiếu thành công" });
        },
        onError: (error) => {
            notification.error({ message: "Xóa thất bại", description: error.response?.data?.message });
        },
    });

    const handleDelete = async (id) => {
        await deleteShowtime(id);
    };

    // Các hàm chuyển đổi bộ lọc
    const handleFilterChange = (filterType) => {
        setActiveFilter(filterType);
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang 1 khi đổi bộ lọc
    };

    const columns = [
        {
            title: 'Phim',
            dataIndex: ['id_movie', 'title'],
            key: 'movieTitle',
            width: '25%',
            render: (text) => (
                <p style={{ color: 'blue', fontWeight: 'bold', margin: 0 }}>
                    {text || '---'}
                </p>
            ),
        },
        {
            title: 'Phòng Chiếu',
            dataIndex: ['theater', 'name'],
            key: 'theaterName',
            render: (text) => <Tag color="volcano" className="branch-tag">{text || '---'}</Tag>,
        },
        {
            title: 'Thời gian',
            dataIndex: 'startTime',
            key: 'startTime',
            width: '15%',
            sorter: (a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
            render: (date) => (
                <Space>
                    {date ? dayjs(date.replace('Z', '').replace('+07:00', '')).format('DD/MM/YYYY - HH:mm') : '---'}
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
                        <Button type="text" danger icon={<DeleteOutlined />} disabled={isDeleting} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="movie-management-container">
            <Card
                title={
                    <Space>
                        <CalendarOutlined />
                        <span>Quản lý lịch chiếu phim</span>
                    </Space>
                }
            >
                <div className="table-header">
                    <Input
                        className="search-box"
                        placeholder="Tìm theo tên phim..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onPressEnter={() => setPagination(p => ({ ...p, page: 1 }))}
                        allowClear
                        size="large"
                        style={{ width: 300 }}
                    />
                    <Space className='ml-auto' wrap>
                        <Button
                            type={activeFilter === 'today' ? 'primary' : 'default'}
                            icon={<CalendarOutlined />}
                            onClick={() => handleFilterChange('today')}
                        >
                            HÔM NAY
                        </Button>
                        <Button
                            type={activeFilter === 'upcoming' ? 'primary' : 'default'}
                            icon={<CalendarOutlined />}
                            onClick={() => handleFilterChange('upcoming')}
                        >
                            SẮP ĐẾN
                        </Button>
                        <Button
                            type={activeFilter === 'all' ? 'primary' : 'default'}
                            icon={<CalendarOutlined />}
                            onClick={() => handleFilterChange('all')}
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
                    loading={isLoading || isDeleting}
                    bordered
                    pagination={
                        activeFilter !== 'all' 
                            ? false // Ẩn phân trang nếu đang xem danh sách lọc (Hôm nay / Sắp đến) vì thường API trả về dạng danh sách đầy đủ không phân trang
                            : {
                                current: pagination.page,
                                pageSize: pagination.limit,
                                total: paginationMeta.total,
                                showTotal: (total) => `Tổng ${total} suất chiếu`,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50'],
                                onChange: (page, limit) => setPagination({ page, limit }),
                            }
                    }
                />
            </Card>
        </div>
    );
}
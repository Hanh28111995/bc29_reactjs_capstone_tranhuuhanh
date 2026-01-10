import { Space, Table, Input, Button, App, Popconfirm, Card, Tag, Tooltip } from 'antd';
import React, { useMemo, useState } from 'react';
import { useAsync } from "../../hooks/useAsync";
import { useNavigate } from 'react-router-dom';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import dayjs from 'dayjs';
import { getAllShowTimes, deleteOneShowTime } from 'services/showtime';

const { Search } = Input;

export default function ShowtimeManagement() {
    const navigate = useNavigate();
    const [toggle, setToggle] = useState(false);
    const [keyword, setKeyword] = useState("");
    const { notification } = App.useApp();

    // 1. Lấy dữ liệu suất chiếu từ backend
    const { state: data = [], loading } = useAsync({
        dependencies: [toggle],
        service: getAllShowTimes,
    });

    // 2. Bộ lọc tìm kiếm theo tên phim hoặc tên phòng chiếu
    const showtimeList = useMemo(() => {
        if (!keyword) return data;
        const key = keyword.toLowerCase().trim();

        return data.filter(ele =>
            (ele.movie?.title?.toLowerCase().includes(key)) ||
            (ele.theater?.name?.toLowerCase().includes(key))
        );
    }, [data, keyword]);

    const handleDelete = async (id) => {
        try {
            await deleteOneShowTime(id);
            notification.success({ message: "Xóa suất chiếu thành công" });
            setToggle(prev => !prev);
        } catch (error) {
            notification.error({ message: "Xóa thất bại", description: error.response?.data?.message });
        }
    };

    const columns = [
        {
            title: 'Phim',
            dataIndex: ['movie', 'title'],
            key: 'movieTitle',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <b style={{ color: '#1677ff' }}>{text}</b>
                    <small style={{ color: '#8c8c8c' }}>ID: {record.movie?._id?.slice(-6)}</small>
                </Space>
            ),
        },
        {
            title: 'Phòng Chiếu',
            dataIndex: ['theater', 'name'],
            key: 'theaterName',
            render: (text) => <Tag color="volcano">{text}</Tag>,
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'startTime',
            key: 'startTime',
            sorter: (a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
            render: (date) => (
                <Space>
                    <CalendarOutlined />
                    {dayjs(date).format('DD/MM/YYYY - HH:mm')}
                </Space>
            ),
        },
        {
            title: 'Trạng thái ghế',
            key: 'seatsStatus',
            render: (_, record) => {
                const total = record.seats?.length || 0;
                const booked = record.seats?.filter(s => s.isBooked).length || 0;
                return (
                    <Tooltip title={`Đã đặt ${booked}/${total} ghế`}>
                        <Space direction="vertical" size={0} style={{ width: '100%' }}>
                            <span>{booked}/{total} Ghế</span>
                        </Space>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 'auto',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa suất chiếu">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1677ff' }} />}
                            onClick={() => navigate(`/admin/showtimes/${record._id}/update`)}
                        />
                    </Tooltip>

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
        <Card
            title={
                <Space>
                    <CalendarOutlined />
                    <span>Quản lý lịch chiếu phim</span>
                </Space>
            }
        >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Search
                    placeholder="Tìm theo tên phim hoặc phòng chiếu..."
                    onSearch={setKeyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    allowClear
                    enterButton
                    style={{ width: 400 }}
                />

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/admin/showtimes/create')}
                >
                    TẠO SUẤT CHIẾU MỚI
                </Button>
            </div>

            <Table
                rowKey="_id"
                columns={columns}
                dataSource={showtimeList}
                loading={loading}
                bordered
                pagination={{
                    pageSize: 8,
                    showTotal: (total) => `Tổng cộng ${total} suất chiếu`,
                }}
            />
        </Card>
    );
}
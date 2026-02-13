import { Space, Table, Input, Button, App, Popconfirm, Card, Tag, Tooltip } from 'antd';
import React, { useMemo, useState } from 'react';
import { useAsync } from "../../hooks/useAsync";
import { useNavigate } from 'react-router-dom';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    CalendarOutlined,
    SearchOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import { getAllShowTimes, deleteOneShowTime } from 'services/showtime';
import './index.scss'; // Import file SCSS chung

const { Search } = Input;

export default function ShowtimeManagement() {
    const navigate = useNavigate();
    const [toggle, setToggle] = useState(false);
    const [keyword, setKeyword] = useState("");
    const { notification } = App.useApp();

    const { state: data = [],  } = useAsync({
        dependencies: [toggle],
        service: getAllShowTimes,
    });

    const showtimeList = useMemo(() => {
        if (!keyword) return data;
        const key = keyword.toLowerCase().trim();

        return data.filter(ele =>
            (ele.id_movie?.title?.toLowerCase().includes(key)) ||
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
            dataIndex: ['id_movie', 'title'],
            key: 'movieTitle',
            width: '25%',
            render: (text) => (
                <p style={{color:'blue', fontWeight:'bold'}}>
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
                    {/* <CalendarOutlined /> */}
                    {dayjs(date).format('DD/MM/YYYY - HH:mm')}
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

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className="add-btn"
                        onClick={() => navigate('/admin/showtimes/create')}
                    >
                        THÊM SUẤT CHIẾU
                    </Button>
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
                        pageSize: 8,
                    }}
                />
            </Card>
        </div>
    );
}
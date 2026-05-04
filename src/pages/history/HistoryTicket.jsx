import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Tag, Space, Card, Typography, Empty, Spin } from 'antd';
import { fetchHistoryAPI } from 'services/notificationAndHistory';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function HistoryTicket() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const userState = useSelector((state) => state.userReducer);
  const role = userState.userInfor?.user_inf?.role;

  useEffect(() => {
    const getHistory = async () => {
      if (!role) return;
      setLoading(true);
      try {
        const res = await fetchHistoryAPI(role);
        const data = res.data.content || [];
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử đặt vé:", error);
      } finally {
        setLoading(false);
      }
    };

    getHistory();
  }, [role]);

  const columns = [
    {
      title: 'Mã giao dịch',
      key: 'transactionId',
      render: (_, record) => {
        const ticket = record.id_ticket;
        return <strong>{ticket?.transactionId || '—'}</strong>;
      },
    },
    {
      title: 'Phim',
      key: 'movie',
      render: (_, record) => {
        const ticket = record.id_ticket;
        return <span>{ticket?.id_showtime?.id_movie?.title || ticket?.movieTitle || '—'}</span>;
      },
    },
    {
      title: 'Rạp / Phòng',
      key: 'theater',
      render: (_, record) => {
        const ticket = record.id_ticket;
        return (
          <span>
            {ticket?.id_showtime?.theater?.name || ticket?.theaterName || '—'}
          </span>
        );
      },
    },
    {
      title: 'Suất chiếu',
      key: 'startTime',
      render: (_, record) => {
        const ticket = record.id_ticket;
        const time = ticket?.id_showtime?.startTime || ticket?.startTime;
        return time ? dayjs(time.replace(/Z$/, '')).format('DD/MM/YYYY HH:mm') : '—';
      },
    },
    {
      title: 'Ghế',
      key: 'seats',
      render: (_, record) => {
        const ticket = record.id_ticket;
        const seats = ticket?.bookedSeat || ticket?.seatName || [];
        return (
          <Space wrap>
            {seats.map((s, i) => (
              <Tag color="blue" key={i}>{s.seatNumber}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Tổng tiền',
      key: 'totalPrice',
      render: (_, record) => {
        const ticket = record.id_ticket;
        const seats = ticket?.bookedSeat || ticket?.seatName || [];
        const total = seats.reduce((sum, s) => sum + (s.price || 0), 0);
        return <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{total.toLocaleString()} VNĐ</span>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note) => note || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'ticketStatus',
      key: 'ticketStatus',
      render: (status) => {
        let color = 'gold';
        if (status?.toLowerCase() === 'confirmed') color = 'green';
        if (status?.toLowerCase() === 'cancelled') color = 'red';
        return <Tag color={color}>{status?.toUpperCase() || 'PENDING'}</Tag>;
      },
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '—',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải lịch sử..." />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Card
        title={
          <Title level={3} style={{ margin: 0 }}>
            LỊCH SỬ ĐẶT VÉ
          </Title>
        }
        bordered={false}
        boxshadow="0 4px 12px rgba(0,0,0,0.1)"
      >
        {history.length > 0 ? (
          <Table
            columns={columns}
            dataSource={history}
            rowKey={(record) => record._id || record.transactionId}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        ) : (
          <Empty description="Bạn chưa có lịch sử đặt vé nào." />
        )}
      </Card>
    </div>
  );
}

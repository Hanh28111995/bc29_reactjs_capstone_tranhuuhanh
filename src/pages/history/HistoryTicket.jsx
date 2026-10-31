import React from 'react';
import { useSelector } from 'react-redux';
import { Table, Tag, Space, Card, Typography, Empty, Spin } from 'antd';
import { fetchHistoryAPI } from 'services/notificationAndHistory';
import { useAsync } from 'hooks/useAsync';
import dayjs from 'dayjs';
import { useTranslation } from "react-i18next";

const { Title } = Typography;

export default function HistoryTicket() {
  const { t } = useTranslation();
  const userState = useSelector((state) => state.userReducer);
  const role = userState.userInfor?.user_inf?.role;

  const { state: history = [], loading } = useAsync({
    service: () => fetchHistoryAPI(role),
    enabled: Boolean(role),
    queryKey: ['historyTickets', role],
  });

  const columns = [
    {
      title: t("history.transactionId"),
      key: 'transactionId',
      render: (_, record) => {
        const ticket = record.id_ticket;
        return <strong>{ticket?.transactionId || '—'}</strong>;
      },
    },
    {
      title: t("history.movie"),
      key: 'movie',
      render: (_, record) => {
        const ticket = record.id_ticket;
        return <span>{ticket?.id_showtime?.id_movie?.title || ticket?.movieTitle || '—'}</span>;
      },
    },
    {
      title: t("history.theaterRoom"),
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
      title: t("history.showtime"),
      key: 'startTime',
      render: (_, record) => {
        const ticket = record.id_ticket;
        const time = ticket?.id_showtime?.startTime || ticket?.startTime;
        return time ? dayjs(time.replace(/Z$/, '')).format('DD/MM/YYYY HH:mm') : '—';
      },
    },
    {
      title: t("history.seats"),
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
      title: t("history.total"),
      key: 'totalPrice',
      render: (_, record) => {
        const ticket = record.id_ticket;
        const seats = ticket?.bookedSeat || ticket?.seatName || [];
        const total = seats.reduce((sum, s) => sum + (s.price || 0), 0);
        return <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{total.toLocaleString()} VNĐ</span>;
      },
    },
    {
      title: t("history.note"),
      dataIndex: 'note',
      key: 'note',
      render: (note) => note || '—',
    },
    {
      title: t("history.status"),
      dataIndex: 'ticketStatus',
      key: 'ticketStatus',
      render: (status) => {
        let color = 'gold';
        if (status?.toLowerCase() === 'confirmed') color = 'green';
        if (status?.toLowerCase() === 'cancelled') color = 'red';
        return <Tag color={color}>{status?.toUpperCase() || t("history.pending")}</Tag>;
      },
    },
    {
      title: t("history.updatedAt"),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '—',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip={t("history.loading")} />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Card
        title={
          <Title level={3} style={{ margin: 0 }}>
            {t("history.title")}
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
          <Empty description={t("history.empty")} />
        )}
      </Card>
    </div>
  );
}

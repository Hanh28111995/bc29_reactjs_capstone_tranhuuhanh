import React, { useMemo, useState, useEffect } from 'react';
import { Table, Input, Button, App, Popconfirm, Tag, Select } from 'antd';
import { fetchAllTicketsAPI, deleteTicketAPI } from 'services/ticket';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Search } = Input;

export default function TicketTable() {
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, totalPages: 1 });
  const [ticketList, setTicketList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();
  const navigate = useNavigate();

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await fetchAllTicketsAPI({ page: pagination.page, limit: pagination.limit, ...params });
      const content = res.data.content;
      const data = Array.isArray(content) ? content : (content?.tickets ?? content?.data ?? []);
      const meta = content?.pagination ?? {};
      setTicketList(data);
      setPaginationMeta({ total: meta.total ?? data.length, totalPages: meta.totalPages ?? 1 });
    } catch {
      notification.error({ message: "Lỗi", description: "Không thể tải danh sách vé." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ page: pagination.page, limit: pagination.limit, status: statusFilter, keyword });
  }, [pagination, statusFilter]);

  const filtered = useMemo(() => {
    if (!keyword) return ticketList;
    const key = keyword.toLowerCase().trim();
    return ticketList.filter(e =>
      e.transactionId?.toLowerCase().includes(key) ||
      e.paymentMethod?.toLowerCase().includes(key)
    );
  }, [ticketList, keyword]);

  const handleDelete = async (id) => {
    try {
      await deleteTicketAPI(id);
      notification.success({ message: "Thành công", description: "Đã xóa vé!" });
      fetchData({ page: pagination.page, limit: pagination.limit, status: statusFilter, keyword });
    } catch {
      notification.error({ message: "Lỗi", description: "Không thể xóa." });
    }
  };

  const columns = [
    {
      title: 'Mã vé',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: '18%',
      ellipsis: true,
    },
    {
      title: 'Ghế',
      dataIndex: 'seatName',
      key: 'seats',
      render: (seats) => seats?.map(s => s.seatNumber).join(', '),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'seatName',
      key: 'total',
      width: '13%',
      render: (seats) => `${seats?.reduce((t, s) => t + (s.price || 0), 0).toLocaleString()} VNĐ`,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: '12%',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: '10%',
      render: (text) => (
        <Tag color={text === 'Completed' ? 'green' : text === 'Pending' ? 'orange' : 'red'}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Thời gian đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '8%',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => navigate(`/admin/ticket-management/edit/${record._id}`)}
          />
          <Popconfirm title="Xóa vé?" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="movie-table-container">
      <div className="table-header-actions">
        <Search
          placeholder="Tìm theo mã vé, phương thức..."
          onSearch={setKeyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="search-input"
          size="middle"
        />
        <Select
          allowClear
          placeholder="Lọc trạng thái"
          style={{ width: 160 }}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { label: 'Pending', value: 'Pending' },
            { label: 'Completed', value: 'Completed' },
            { label: 'Failed', value: 'Failed' },
          ]}
        />
      </div>
      <Table
        className="custom-table"
        tableLayout="fixed"
        rowKey="_id"
        columns={columns}
        dataSource={filtered}
        loading={loading}
        bordered
        pagination={{ 
          pageSize: pagination.limit,
          current: pagination.page,
          total: paginationMeta.total,
          size: 'small',
          showTotal: (total) => `Tổng ${total} vé`,
          onChange: (page, limit) => setPagination({ page, limit }),
        }}
      />
    </div>
  );
}

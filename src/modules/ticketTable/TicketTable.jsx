import React, { useEffect, useState } from 'react';
import { Table, Input, Button, App, Popconfirm, Tag, Select } from 'antd';
import { fetchAllTicketsAPI, deleteTicketAPI } from 'services/ticket';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Search } = Input;

export default function TicketTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const { notification } = App.useApp();
  const navigate = useNavigate();

  const fetchData = async (page = 1, pageSize = 10, status = statusFilter) => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize };
      if (status) params.paymentStatus = status;
      const res = await fetchAllTicketsAPI(params);
      // support both { data, total } and plain array
      if (Array.isArray(res)) {
        setData(res);
        setPagination(prev => ({ ...prev, current: page, pageSize, total: res.length }));
      } else {
        setData(res.data ?? res.content ?? []);
        setPagination(prev => ({ ...prev, current: page, pageSize, total: res.total ?? 0 }));
      }
    } catch {
      notification.error({ message: "Lỗi", description: "Không thể tải danh sách vé." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize, statusFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleTableChange = (pag) => {
    fetchData(pag.current, pag.pageSize, statusFilter);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTicketAPI(id);
      notification.success({ message: "Thành công", description: "Đã xóa vé!" });
      fetchData(pagination.current, pagination.pageSize);
    } catch {
      notification.error({ message: "Lỗi", description: "Không thể xóa." });
    }
  };

  const filtered = keyword
    ? data.filter(ele =>
        ele.transactionId?.toLowerCase().includes(keyword.toLowerCase().trim()) ||
        ele.paymentMethod?.toLowerCase().includes(keyword.toLowerCase().trim())
      )
    : data;

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
      dataIndex: 'bookedSeat',
      key: 'seats',
      render: (seats) => seats?.map(s => s.seatNumber).join(', '),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'bookedSeat',
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
        <Tag color={text === 'Paid' ? 'green' : text === 'Pending' ? 'orange' : 'red'}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Thời gian đặt',
      dataIndex: 'timeOfBooking',
      key: 'timeOfBooking',
      width: '15%',
      render: (text) => dayjs(text?.replace('Z', '')).format('DD/MM/YYYY HH:mm'),
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
            { label: 'Paid', value: 'Paid' },
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
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          size: 'small',
          showSizeChanger: false,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
}

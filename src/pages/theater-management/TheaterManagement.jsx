import { Space, Table, Input, Button, App, Popconfirm, Card, Tag } from 'antd';
import React, { useMemo, useState } from 'react';
import { useAsync } from "../../hooks/useAsync";
import { useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { fetchTheaterListAPI, deleteTheaterAPI } from 'services/theater';

const { Search } = Input;

export default function TheaterManagement() {
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const [keyword, setKeyword] = useState("");

  // Sử dụng context App của Antd 5 để lấy notification
  const { notification } = App.useApp();

  // Lấy dữ liệu từ backend  
  const { state: data = [], loading } = useAsync({
    dependencies: [toggle],
    service: fetchTheaterListAPI, 
  });

  // Bộ lọc tìm kiếm
  const theaterList = useMemo(() => {
    if (!keyword) return data;
    const key = keyword.toLowerCase().trim();

    return data.filter(ele =>
      (ele.branch?.toLowerCase().includes(key)) || 
      (ele.name?.toLowerCase().includes(key))
    );
  }, [data, keyword]);

  const handleDelete = async (id) => {
    try {
      await deleteTheaterAPI(id);
      notification.success({ 
        message: "Thành công", 
        description: "Phòng chiếu đã được xóa khỏi hệ thống." 
      });
      setToggle(prev => !prev);
    } catch (error) {
      notification.error({ 
        message: "Xóa thất bại", 
        description: error.response?.data?.message || "Vui lòng thử lại sau." 
      });
    }
  };

  const columns = [
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      render: (text) => <Tag color="blue">{text}</Tag>,
      // Tự động tạo bộ lọc từ dữ liệu thực tế
      filters: [...new Set(data.map(item => item.branch))].filter(Boolean).map(b => ({ text: b, value: b })),
      onFilter: (value, record) => record.branch === value,
    },
    {
      title: 'Tên Phòng Chiếu',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Số lượng ghế',
      key: 'totalSeats',
      render: (_, record) => {
        const rows = record.totalSeat?.rows || 0;
        const cols = record.totalSeat?.cols || 0;
        return (
          <span>
            <b>{rows * cols}</b> Ghế ({rows} hàng x {cols} cột)
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => navigate(`/admin/theater-management/${record._id}/update`)}
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa phòng chiếu này?"
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
    <Card title="Quản lý danh sách phòng chiếu">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Search
          placeholder="Tìm theo chi nhánh hoặc tên phòng..."
          onSearch={setKeyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          enterButton
          style={{ width: 400 }}
        />
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/theater-management/create')}
        >
          THÊM PHÒNG CHIẾU
        </Button>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={theaterList}
        loading={loading}
        bordered
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng cộng ${total} phòng chiếu`,
        }}
      />
    </Card>
  );
}
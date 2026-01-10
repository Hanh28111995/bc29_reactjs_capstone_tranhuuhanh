import React, { useMemo, useState } from 'react';
import { Space, Table, Button, Input, notification, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { useAsync } from "../../hooks/useAsync";
import { userListApi, deleteUserApi } from 'services/user';
import { removeVietnameseTones } from 'constants/common';

const { Search } = Input;

export default function UserTable() {
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const [keyword, setKeyword] = useState("");

  // 1. Khởi tạo Notification Hook của Antd 5
  const [api, contextHolder] = notification.useNotification();

  // Lấy dữ liệu từ API
  const { state: data = [], loading } = useAsync({
    dependencies: [toggle],
    service: userListApi,
  });

  // Logic lọc tìm kiếm (Memoized)
  const userlist = useMemo(() => {
    if (!keyword) return data;

    const key = removeVietnameseTones(keyword).toLowerCase().trim();

    return data.filter(ele =>
      removeVietnameseTones(ele.username || "")
        .toLowerCase()
        .includes(key)
    );
  }, [data, keyword]);

  // Logic xóa người dùng
  const handleDelete = async (id, username) => {
    try {
      await deleteUserApi(id);

      // Sử dụng api từ hook
      api.success({
        message: 'Thành công',
        description: `Người dùng ${username} đã được xóa khỏi hệ thống.`,
        placement: 'topRight',
      });

      setToggle(prev => !prev); // Trigger refetch dữ liệu
    } catch (err) {
      api.error({
        message: 'Lỗi xóa người dùng',
        description: err.response?.data?.content || "Đã có lỗi xảy ra, vui lòng thử lại.",
      });
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tài Khoản',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'userphone',
      key: 'userphone',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => navigate(`/admin/user-management/${record._id}/edit`)}
          />

          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc muốn xóa tài khoản ${record.username}?`}
            onConfirm={() => handleDelete(record._id, record.username)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 2. Cần render contextHolder để thông báo hiển thị được */}
      {contextHolder}

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space direction="vertical" style={{ width: 300 }}>
          <Search
            placeholder="Tìm kiếm tài khoản..."
            onSearch={setKeyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            enterButton={<SearchOutlined />}
          />
        </Space>

        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/admin/user-management/create')}
        >
          + Thêm người dùng
        </Button>
      </div>

      <Table
        rowKey="_id" // Đảm bảo trùng với field ID từ API (thường là _id hoặc id)
        columns={columns}
        dataSource={userlist}
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng cộng ${total} người dùng`,
        }}
        bordered
      />
    </div>
  );
}
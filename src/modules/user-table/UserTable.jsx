import React, { useMemo, useState } from 'react';
import { Space, Table, Button, Input, notification, Popconfirm } from 'antd'; // Giữ nguyên các import của bạn
import { EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { useAsync } from "../../hooks/useAsync";
import { userListApi, deleteUserApi } from 'services/user';
import { removeVietnameseTones } from 'constants/common';
import './index.scss'; // Link tới file scss mới

const { Search } = Input;

export default function UserTable() {
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [api, contextHolder] = notification.useNotification();

  const { state: data = [], loading } = useAsync({
    dependencies: [toggle],
    service: userListApi,
  });

  const userlist = useMemo(() => {
    if (!keyword) return data;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return data.filter(ele =>
      removeVietnameseTones(ele.username || "").toLowerCase().includes(key)
    );
  }, [data, keyword]);

  const handleDelete = async (id, username) => {
    try {
      await deleteUserApi(id);
      api.success({
        message: 'Thành công',
        description: `Người dùng ${username} đã được xóa khỏi hệ thống.`,
        placement: 'topRight',
      });
      setToggle(prev => !prev);
    } catch (err) {
      api.error({
        message: 'Lỗi xóa người dùng',
        description: err.response?.data?.content || "Đã có lỗi xảy ra, vui lòng thử lại.",
      });
    }
  };

  const columns = [
    {
      title: 'No',
      key: 'index',
      width: '5%',
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
      width: '15%',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <div className="action-btns">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => navigate(`/admin/user-management/${record._id}/edit`)}
          />
          <Popconfirm
            title="Xóa?"
            onConfirm={() => handleDelete(record._id, record.username)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="user-table-container"> {/* Thay style={{padding: '24px'}} */}
      {contextHolder}

      <div className="table-header"> {/* Thay thế div inline-style */}
        <div className="search-box"> {/* Bọc Search để quản lý width rem */}
          <Search
            placeholder="Tìm kiếm tài khoản..."
            onSearch={setKeyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="search-input"
            size="middle"
          />
        </div>

        <Button
          type="primary"
          size="large"
          className="add-user-btn" // Thêm class để chỉnh width rem
          onClick={() => navigate('/admin/user-management/create')}
        >
          + Thêm người dùng
        </Button>
      </div>

      <Table
        tableLayout='fixed'
        className="custom-table" // Thêm class để style pagination và font
        rowKey="_id"
        columns={columns}
        dataSource={userlist}
        loading={loading}
        pagination={{
          pageSize: 10,
        }}
        bordered
      />
    </div>
  );
}
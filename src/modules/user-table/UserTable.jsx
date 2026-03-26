import React, { useMemo, useState, useEffect } from 'react';
import { Table, Button, Input, notification, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined,} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { userListApi, deleteUserApi } from 'services/user';
import { removeVietnameseTones } from 'constants/common';
import './index.scss';

const { Search } = Input;

export default function UserTable() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, totalPages: 1 });
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await userListApi({ page: pagination.page, limit: pagination.limit, ...params });
      const content = res.data.content;
      const data = Array.isArray(content) ? content : (content?.users ?? content?.data ?? []);
      const meta = content?.pagination ?? {};
      setUserList(data);
      setPaginationMeta({ total: meta.total ?? data.length, totalPages: meta.totalPages ?? 1 });
    } catch {
      api.error({ message: 'Lỗi', description: 'Không thể tải danh sách người dùng.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ page: pagination.page, limit: pagination.limit, keyword });
  }, [pagination]);

  const userlist = useMemo(() => {
    if (!keyword) return userList;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return userList.filter(ele =>
      removeVietnameseTones(ele.username || "").toLowerCase().includes(key)
    );
  }, [userList, keyword]);

  const handleDelete = async (id, username) => {
    try {
      await deleteUserApi(id);
      api.success({
        message: 'Thành công',
        description: `Người dùng ${username} đã được xóa khỏi hệ thống.`,
        placement: 'topRight',
      });
      fetchData({ page: pagination.page, limit: pagination.limit, keyword });
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
        className="custom-table"
        rowKey="_id"
        columns={columns}
        dataSource={userlist}
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: paginationMeta.total,
          showTotal: (total) => `Tổng ${total} người dùng`,
          onChange: (page, limit) => setPagination({ page, limit }),
        }}
        bordered
      />
    </div>
  );
}
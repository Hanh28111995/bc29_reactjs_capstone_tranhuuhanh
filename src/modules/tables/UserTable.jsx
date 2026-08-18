import React, { useMemo, useState } from 'react';
import { Table, Button, Input, notification, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAsync, useAsyncMutation } from '../../hooks/useAsync';
import { userListApi, deleteUserApi } from 'services/user';
import { removeVietnameseTones } from 'constants/common';
import './index.scss';

const { Search } = Input;

export default function UserTable() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [api, contextHolder] = notification.useNotification();

  // 1. Sử dụng useAsync chuẩn của dự án để fetch danh sách người dùng
  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [pagination.page, pagination.limit, keyword],
    queryKey: ['users', pagination.page, pagination.limit, keyword],
    service: () => userListApi({ page: pagination.page, limit: pagination.limit, keyword }),    
  });

  // 2. Sử dụng useAsyncMutation chuẩn của dự án để xóa và tự động làm mới cache
  const { mutateAsync: deleteUser, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deleteUserApi(id),
    invalidateQueries: [['users']],
    onSuccess: () => {
      api.success({
        message: 'Thành công',
        description: 'Người dùng đã được xóa khỏi hệ thống.',
        placement: 'topRight',
      });
    },
    onError: (err) => {
      api.error({
        message: 'Lỗi xóa người dùng',
        description: err.response?.data?.content || 'Đã có lỗi xảy ra, vui lòng thử lại.',
      });
    },
  });

  // Tận dụng cơ chế bóc tách dữ liệu tự động từ normalizeResult của useAsync
  const userList = Array.isArray(responseContent)
    ? responseContent
    : responseContent?.users ?? responseContent?.data ?? [];
    
  const paginationMeta = responseContent?.pagination ?? { total: userList.length, totalPages: 1 };

  const userlist = useMemo(() => {
    if (!keyword) return userList;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return userList.filter((ele) =>
      removeVietnameseTones(ele.username || '').toLowerCase().includes(key)
    );
  }, [userList, keyword]);

  const handleDelete = async (id) => {
    await deleteUser(id);
  };

  const columns = [
    {
      title: 'No',
      key: 'index',
      width: '5%',
      render: (_, __, index) => (pagination.page - 1) * pagination.limit + index + 1,
    },
    {
      title: 'Tài Khoản',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => (a.username || '').localeCompare(b.username || ''),
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
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="user-table-container">
      {contextHolder}

      <div className="table-header">
        <div className="search-box">
          <Search
            placeholder="Tìm kiếm tài khoản..."
            onSearch={(val) => {
              setKeyword(val);
              setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang 1 khi tìm kiếm
            }}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang 1 khi gõ
            }}
            className="search-input"
            size="middle"
          />
        </div>

        <Button
          type="primary"
          size="large"
          className="add-user-btn"
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
        loading={isLoading || isDeleting}
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
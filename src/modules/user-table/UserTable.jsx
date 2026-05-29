import React, { useMemo, useState } from 'react';
import { Table, Button, Input, notification, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userListApi, deleteUserApi } from 'services/user';
import { removeVietnameseTones } from 'constants/common';
import './index.scss';

const { Search } = Input;

export default function UserTable() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const queryClient = useQueryClient();
  const [api, contextHolder] = notification.useNotification();

  const { data: response, isLoading } = useQuery(
    ['users', pagination.page, pagination.limit, keyword],
    () => userListApi({ page: pagination.page, limit: pagination.limit, keyword }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const deleteMutation = useMutation((id) => deleteUserApi(id), {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['users']);
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

  const content = response?.data?.content;
  const userList = Array.isArray(content)
    ? content
    : content?.users ?? content?.data ?? [];
  const paginationMeta = content?.pagination ?? { total: userList.length, totalPages: 1 };

  const userlist = useMemo(() => {
    if (!keyword) return userList;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return userList.filter((ele) =>
      removeVietnameseTones(ele.username || '').toLowerCase().includes(key)
    );
  }, [userList, keyword]);

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
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
        loading={isLoading || deleteMutation.isLoading}
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
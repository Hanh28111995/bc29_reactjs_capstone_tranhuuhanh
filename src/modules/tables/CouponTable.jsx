import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, App, Popconfirm, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAsync, useAsyncMutation } from '../../hooks/useAsync';
import { formatDate3 } from '../../utils/common';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  fetchAllCouponsAPI,
  fetchDeleteCouponAPI,
  fetchReactivateCouponAPI,
} from 'services/coupon';
import './index.scss';

function CouponTable() {
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const { data: responseContent, loading: isLoading } = useAsync({
    queryKey: ['coupons-list', 'all'],
    service: () => fetchAllCouponsAPI(),
  });

  const [couponList, setCouponList] = useState([]);

  useEffect(() => {
    if (responseContent) {
      const list = Array.isArray(responseContent)
        ? responseContent
        : responseContent?.coupons ?? responseContent?.data ?? [];
      setCouponList(list);
    }
  }, [responseContent]);

  const { mutateAsync: deleteCoupon, isPending: isDeleting } = useAsyncMutation({
    service: (id) => fetchDeleteCouponAPI(id),
    invalidateQueries: [['coupons-list']],
    onSuccess: () => notification.success({ message: 'Thành công', description: 'Đã xóa mã giảm giá!' }),
    onError: () => notification.error({ message: 'Lỗi', description: 'Không thể xóa mã giảm giá.' }),
  });

  const { mutateAsync: reactivateCoupon, isPending: isReactivating } = useAsyncMutation({
    service: (id) => fetchReactivateCouponAPI(id),
    invalidateQueries: [['coupons-list']],
    onSuccess: () => notification.success({ message: 'Thành công', description: 'Đã tái kích hoạt mã!' }),
    onError: () => notification.error({ message: 'Lỗi', description: 'Không thể tái kích hoạt.' }),
  });

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: '14%',
      render: (text) => <Tag color="volcano">{text}</Tag>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: '10%',
      render: (val) => <Tag color={val === 'redeem' ? 'blue' : 'default'}>{val}</Tag>,
    },
    {
      title: 'Giảm giá',
      key: 'discount',
      width: '16%',
      render: (_, record) => `${record.discountPercent}% (tối đa ${(record.maxDiscount || 0).toLocaleString()}đ)`,
    },
    {
      title: 'Lượt dùng',
      key: 'usage',
      width: '12%',
      render: (_, record) => `${record.usedCount || 0} / ${record.maxUsage}`,
    },
    {
      title: 'Thời gian',
      key: 'duration',
      width: '22%',
      render: (_, record) => (
        <span>
          {record.startDate ? formatDate3(record.startDate) : '---'} đến {record.endDate ? formatDate3(record.endDate) : '---'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: '10%',
      align: 'center',
      render: (val) => <Tag color={val ? 'success' : 'error'}>{val ? 'Hoạt động' : 'Tắt'}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '16%',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => navigate(`/admin/coupon-management/update/${record._id}`)}
          />
          {!record.active && (
            <Button
              type="text"
              icon={<ReloadOutlined style={{ color: '#52c41a' }} />}
              disabled={isReactivating}
              onClick={() => reactivateCoupon(record._id)}
            />
          )}
          <Popconfirm title="Bạn có chắc muốn xóa mã này?" onConfirm={() => deleteCoupon(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} disabled={isDeleting} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="movie-management-container">
      <div className="table-header-actions" style={{ justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          className="add-btn"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/coupon-management/create')}
        >
          THÊM MÃ GIẢM GIÁ
        </Button>
      </div>

      <Table
        className="custom-table"
        tableLayout="fixed"
        rowKey="_id"
        columns={columns}
        dataSource={Array.isArray(couponList) ? couponList : []}
        loading={isLoading || isDeleting || isReactivating}
        bordered
        scroll={{ x: '100%' }}
        pagination={false}
      />
    </div>
  );
}

export default CouponTable;
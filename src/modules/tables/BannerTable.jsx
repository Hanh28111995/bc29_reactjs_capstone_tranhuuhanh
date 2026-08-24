import React, { useState } from 'react';
import { Table, Button, Image, App, Popconfirm, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAsync, useAsyncMutation } from '../../hooks/useAsync';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import './index.scss';
import { deleteBannerAPI, getBannerListAPI } from 'services/banner';

export default function BannerTable() {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ page: 1, limit: 8 });
  const { notification } = App.useApp();

  // 1. Fetch danh sách banner trực tiếp theo phân trang
  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [pagination.page, pagination.limit],
    queryKey: ['banners-list', pagination.page, pagination.limit],
    service: () => getBannerListAPI({ page: pagination.page, limit: pagination.limit }),
  });

  // Bóc tách dữ liệu linh hoạt từ response API
  const bannerData = Array.isArray(responseContent)
    ? responseContent
    : responseContent?.banners ?? responseContent?.data ?? [];
    
  const paginationMeta = responseContent?.pagination ?? { total: bannerData.length, totalPages: 1 };

  // 2. Xóa banner và tự động làm mới toàn bộ cache bắt đầu bằng 'banners-list'
  const { mutateAsync: deleteBanner, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deleteBannerAPI(id),
    // Dùng tiền tố 'banners-list' để React Query tự động quét sạch cache của tất cả các trang
    invalidateQueries: [['banners-list']],
    onSuccess: () => {
      notification.success({ message: 'Thành công', description: 'Đã xóa banner!' });
      
      // Tự động lùi về trang trước nếu xóa hết sạch item ở trang cuối
      if (bannerData.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      }
    },
    onError: () => {
      notification.error({ message: 'Lỗi', description: 'Không thể xóa banner.' });
    },
  });

  const handleDelete = async (id) => {
    await deleteBanner(id);
  };

  const columns = [
    {
      title: 'Banner',
      dataIndex: 'url',
      key: 'url',
      width: '25%',
      render: (text) => (
        <Image src={text} style={{ width: 100, height: 50, objectFit: 'cover', borderRadius: 4 }} fallback="https://via.placeholder.com/100x50?text=No+Img" />
      ),
    },
    {
      title: 'Movie ID',
      dataIndex: 'movie_id',
      key: 'movie_id',
      ellipsis: true,
    },
    {
      title: 'Highlight',
      dataIndex: 'highlight',
      key: 'highlight',
      width: '15%',
      align: 'center',
      render: (val) => (
        <Tag color={val ? 'success' : 'default'}>
          {val ? 'Bật' : 'Tắt'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <div className="action-btns">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#1677ff' }} />} 
            onClick={() => navigate(`/admin/tools/banner-generator/update/${record._id}`)} 
          />
          <Popconfirm title="Xóa banner này?" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="movie-management-container">
      <div className="table-header-actions" style={{ justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button 
          className='add-btn' 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/admin/tools/banner-generator/create')}
        >
          THÊM BANNER
        </Button>
      </div>

      <Table
        className="custom-table"
        tableLayout="fixed"
        rowKey="_id"
        columns={columns}
        dataSource={bannerData}
        // Gộp chung loading fetch và deleting để khóa bảng khi đang xóa
        loading={isLoading || isDeleting}
        bordered
        pagination={{ 
          current: pagination.page,
          pageSize: pagination.limit,
          total: paginationMeta.total,
          size: 'small',
          showTotal: (total) => `Tổng ${total} banner`,
          onChange: (page, limit) => setPagination({ page, limit }),
        }}
      />
    </div>
  );
}
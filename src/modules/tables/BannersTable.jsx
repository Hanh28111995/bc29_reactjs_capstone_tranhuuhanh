import React, { useMemo, useState } from 'react';
import { Table, Input, Button, Image, App, Popconfirm, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAsync, useAsyncMutation } from '../../hooks/useAsync';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { removeVietnameseTones } from 'constants/common';
import './index.scss';
import { deleteBannerAPI, getBannerListAPI } from 'services/banner';

const { Search } = Input;

export default function BannerTable() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 8 });
  const { notification } = App.useApp();

  // 1. Sử dụng useAsync chuẩn xác theo mô hình ShopProductTable
  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [pagination.page, pagination.limit, keyword],
    queryKey: ['banners', pagination.page, pagination.limit, keyword],
    service: () => getBannerListAPI({ page: pagination.page, limit: pagination.limit, keyword }),
  });

  // 2. Sử dụng useAsyncMutation để xóa banner và tự động làm mới cache
  const { mutateAsync: deleteBanner, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deleteBannerAPI(id),
    invalidateQueries: [['banners']],
    onSuccess: () => {
      notification.success({ message: 'Thành công', description: 'Đã xóa banner!' });
    },
    onError: () => {
      notification.error({ message: 'Lỗi', description: 'Không thể xóa banner.' });
    },
  });

  // Bóc tách dữ liệu linh hoạt từ response API
  const bannerData = Array.isArray(responseContent)
    ? responseContent
    : responseContent?.banners ?? responseContent?.data ?? [];
    
  const paginationMeta = responseContent?.pagination ?? { total: bannerData.length, totalPages: 1 };

  const bannerList = useMemo(() => {
    if (!keyword) return bannerData;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return bannerData.filter((ele) =>
      removeVietnameseTones(ele.movie_id || ele.title || '').toLowerCase().includes(key)
    );
  }, [bannerData, keyword]);

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
            onClick={() => navigate(`/admin/banner-management/update/${record._id}`)} 
          />
          <Popconfirm title="Xóa banner này?" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="banner-table-container">
      <div className="table-header-actions">        
        <Button 
          className='add-btn' 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/admin/banner-management/create')}
        >
          THÊM BANNER
        </Button>
      </div>

      <Table
        className="custom-table"
        tableLayout="fixed"
        rowKey="_id"
        columns={columns}
        dataSource={bannerList}
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
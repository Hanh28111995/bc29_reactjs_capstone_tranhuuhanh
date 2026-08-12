import React, { useMemo, useState } from 'react';
import { Table, Input, Button, Image, App, Popconfirm, Switch, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { removeVietnameseTones } from 'constants/common';
import './index.scss';
import { deleteShopProductAPI, getShopProductListAPI } from 'services/shopProduct';

const { Search } = Input;

export default function ShopProductTable() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 8 });
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const { data: response, isLoading } = useQuery({
    queryKey: ['shop-products', pagination.page, pagination.limit, keyword],
    queryFn: () => getShopProductListAPI({ page: pagination.page, limit: pagination.limit, keyword }),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteShopProductAPI(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      notification.success({ message: 'Thành công', description: 'Đã xóa sản phẩm!' });
    },
    onError: () => {
      notification.error({ message: 'Lỗi', description: 'Không thể xóa sản phẩm.' });
    },
  });

  const content = response?.data?.content;
  const productData = Array.isArray(content)
    ? content
    : content?.shops ?? content?.data ?? [];
  const paginationMeta = content?.pagination ?? { total: productData.length, totalPages: 1 };

  const productList = useMemo(() => {
    if (!keyword) return productData;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return productData.filter((ele) =>
      removeVietnameseTones(ele.title || '').toLowerCase().includes(key)
    );
  }, [productData, keyword]);

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'banner',
      key: 'banner',
      width: '15%',
      render: (text) => (
        <Image src={text} style={{ width: 60, height: 60, objectFit: 'cover' }} fallback="https://via.placeholder.com/60x60?text=No+Img" />
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: '15%',
      render: (price) => `${price.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      width: '10%',
      render: (stock) => stock ?? <span style={{color: '#999'}}>Vô hạn</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: '12%',
      render: (active) => (
        <Badge status={active ? 'success' : 'default'} text={active ? 'Đang bán' : 'Ngừng'} />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '12%',
      render: (_, record) => (
        <div className="action-btns">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#1677ff' }} />} 
            onClick={() => navigate(`/admin/shop-management/update/${record._id}`)} 
          />
          <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="shop-table-container">
      <div className="table-header-actions">
        <Search
          placeholder="Tìm kiếm sản phẩm..."
          onSearch={setKeyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="search-input"
          size="middle"
        />
        <Button 
          className='add-btn' 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/admin/shop-management/create')}
        >
          THÊM SẢN PHẨM
        </Button>
      </div>

      <Table
        className="custom-table"
        tableLayout="fixed"
        rowKey="_id"
        columns={columns}
        dataSource={productList}
        loading={isLoading || deleteMutation.isPending}
        bordered
        pagination={{ 
          current: pagination.page,
          pageSize: pagination.limit,
          total: paginationMeta.total,
          size: 'small',
          showTotal: (total) => `Tổng ${total} sản phẩm`,
          onChange: (page, limit) => setPagination({ page, limit }),
        }}
      />
    </div>
  );
}


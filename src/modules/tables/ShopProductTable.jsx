import React, { useMemo, useState } from 'react';
import { Table, Input, Button, Image, App, Popconfirm, Badge, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAsync, useAsyncMutation } from '../../hooks/useAsync';
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
  const { notification } = App.useApp();

  // 1. Sử dụng useAsync chuẩn của dự án để fetch danh sách sản phẩm
  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [pagination.page, pagination.limit, keyword],
    queryKey: ['shopProducts', pagination.page, pagination.limit, keyword],
    service: () => getShopProductListAPI({ page: pagination.page, limit: pagination.limit, keyword }),
  });

  // 2. Sử dụng useAsyncMutation chuẩn của dự án để xóa và tự động làm mới cache
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deleteShopProductAPI(id),
    invalidateQueries: [['shopProducts']],
    onSuccess: () => {
      notification.success({ message: 'Thành công', description: 'Đã xóa sản phẩm!' });
    },
    onError: () => {
      notification.error({ message: 'Lỗi', description: 'Không thể xóa sản phẩm.' });
    },
  });

  // Tận dụng cơ chế bóc tách dữ liệu tự động từ normalizeResult của useAsync
  const productData = Array.isArray(responseContent)
    ? responseContent
    : responseContent?.shops ?? responseContent?.data ?? [];
    
  const paginationMeta = responseContent?.pagination ?? { total: productData.length, totalPages: 1 };

  const productList = useMemo(() => {
    if (!keyword) return productData;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return productData.filter((ele) =>
      removeVietnameseTones(ele.title || '').toLowerCase().includes(key)
    );
  }, [productData, keyword]);

  const handleDelete = async (id) => {
    await deleteProduct(id);
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'banner',
      key: 'banner',
      width: '12%',
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
      width: '13%',
      render: (price) => (price ? `${price.toLocaleString('vi-VN')} đ` : '0 đ'),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      width: '10%',
      render: (stock) => (stock !== undefined && stock !== null ? stock : <span style={{color: '#999'}}>Vô hạn</span>),
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
      title: 'Highlight',
      dataIndex: 'highlight',
      key: 'highlight',
      width: '11%',
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
        loading={isLoading || isDeleting}
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
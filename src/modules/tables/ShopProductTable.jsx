import React, { useState, useEffect } from 'react';
import { Table, Button, Image, App, Popconfirm, Badge, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAsync, useAsyncMutation } from '../../hooks/useAsync';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownOutlined,
} from '@ant-design/icons';
import './index.scss';
import { deleteShopProductAPI, getShopProductListAPI } from 'services/shopProduct';

export default function ShopProductTable() {
  const navigate = useNavigate();
  const { notification } = App.useApp();

  // Quản lý limit hiển thị ban đầu (8 item) thay cho phân trang số trang
  const [limit, setLimit] = useState(8);
  const [productList, setProductList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  // 1. Gọi API lấy danh sách sản phẩm theo limit hiện tại (luôn lấy từ trang 1 với số lượng = limit)
  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [limit],
    queryKey: ['shop-products-list',limit],
    service: () => getShopProductListAPI({ page: 1, limit }),
  });

  // Đồng bộ dữ liệu từ API vào state local để hỗ trợ Load More mượt mà
  useEffect(() => {
    if (responseContent) {
      const list = Array.isArray(responseContent)
        ? responseContent
        : responseContent?.shops ?? responseContent?.data ?? [];
        
      const totalRecord = responseContent?.pagination?.total || list.length;
      
      setProductList(list);
      setTotalItems(totalRecord);
    }
  }, [responseContent]);

  // 2. Sử dụng useAsyncMutation chuẩn của dự án để xóa và tự động làm mới cache
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deleteShopProductAPI(id),
    invalidateQueries: [['shop-products-list']],
    onSuccess: () => {
      notification.success({ message: 'Thành công', description: 'Đã xóa sản phẩm!' });
    },
    onError: () => {
      notification.error({ message: 'Lỗi', description: 'Không thể xóa sản phẩm.' });
    },
  });

  const handleDelete = async (id) => {
    await deleteProduct(id);
  };

  // Hàm xử lý khi bấm nút Load More (tăng limit lên thêm 8 item mỗi lần bấm)
  const handleLoadMore = () => {
    setLimit((prevLimit) => prevLimit + 8);
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'banner',
      key: 'banner',
      width: '12%',
      render: (text) => (
        <Image src={text} className="movie-banner" fallback="https://via.placeholder.com/60x60?text=No+Img" />
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
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={isDeleting} // Khóa nút khi đang xóa tránh double click
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Kiểm tra xem còn dữ liệu ở phía server để load tiếp hay không
  const hasMore = productList.length < totalItems;

  return (
    <div className="movie-management-container">
      <div className="table-header-actions" style={{ justifyContent: 'flex-end', marginBottom: 16 }}>
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
        scroll={{ x: '100%' }}
        pagination={false} // Tắt phân trang truyền thống
      />

      {/* Khu vực nút Load More */}
      {totalItems > 8 && (
        <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
          {hasMore ? (
            <Button 
              onClick={handleLoadMore} 
              loading={isLoading}
              icon={<DownOutlined />}
              size="large"
              style={{ minWidth: 200 }}
            >
              Xem thêm ({productList.length}/{totalItems})
            </Button>
          ) : (
            <span style={{ color: '#8c8c8c', fontStyle: 'italic' }}>
              Đã hiển thị tất cả {totalItems} sản phẩm.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
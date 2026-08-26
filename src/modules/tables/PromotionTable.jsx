import React, { useState, useEffect } from 'react';
import { Table, Button, Image, App, Popconfirm, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAsync, useAsyncMutation } from '../../hooks/useAsync';
import { formatDate3 } from '../../utils/common';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { deletePromotionAPI, getPromotionListAPI } from 'services/promotion';
import './index.scss';

function PromotionTable() {
  const navigate = useNavigate();
  const { notification } = App.useApp();

  // Quản lý limit hiển thị ban đầu (8 item)
  const [limit, setLimit] = useState(8);
  const [promoList, setPromoList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  // Gọi API lấy danh sách dựa theo limit hiện tại (luôn lấy từ trang 1 với số lượng = limit)
  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [limit],
    queryKey: ['promotions-list', 'all', limit],
    service: () => getPromotionListAPI({ page: 1, limit }),    
  });
  
  // Đồng bộ dữ liệu từ API vào state local để hỗ trợ Load More mượt mà
  useEffect(() => {
    if (responseContent) {
      const list = Array.isArray(responseContent)
        ? responseContent
        : responseContent?.promotions ?? responseContent?.data ?? [];
        
      const totalRecord = responseContent?.pagination?.total || list.length;
      
      setPromoList(list);
      setTotalItems(totalRecord);
    }
  }, [responseContent]);

  // Xóa khuyến mãi và làm mới cache
  const { mutateAsync: deletePromotion, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deletePromotionAPI(id),
    invalidateQueries: [['promotions-list']],
    onSuccess: () => {
      notification.success({ message: 'Thành công', description: 'Đã xóa chương trình khuyến mãi!' });
    },
    onError: () => {
      notification.error({ message: 'Lỗi', description: 'Không thể xóa khuyến mãi.' });
    },
  });

  const handleDelete = async (id) => {
    await deletePromotion(id);
  };

  // Hàm xử lý khi bấm nút Load More (tăng limit lên thêm 8 item mỗi lần bấm)
  const handleLoadMore = () => {
    setLimit((prevLimit) => prevLimit + 8);
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: '_id',
      key: '_id',
      width: '12%',      
    },
    {
      title: 'Banner',
      dataIndex: 'banner',
      key: 'banner',
      width: '18%',
      render: (text) => (
        <Image src={text} className="movie-banner" fallback="https://via.placeholder.com/120x60?text=No+Banner" />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
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
      title: 'Highlight',
      dataIndex: 'highlight',
      key: 'highlight',
      width: '12%',
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
            onClick={() => navigate(`/admin/promotion-management/update/${record._id}`)} 
          />
          <Popconfirm title="Bạn có chắc muốn xóa khuyến mãi này?" onConfirm={() => handleDelete(record._id)}>
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={isDeleting} 
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Kiểm tra xem còn dữ liệu ở phía server để load tiếp hay không
  const hasMore = promoList.length < totalItems;

  return (
    <div className="movie-management-container">
      <div className="table-header-actions" style={{ justifyContent: 'flex-end', marginBottom: 16 }}>      
        <Button 
          className='add-btn' 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/admin/promotion-management/create')}
        >
          THÊM KHUYẾN MÃI
        </Button>
      </div>

      <Table
        className="custom-table"
        tableLayout="fixed"
        rowKey="_id"
        columns={columns}
        dataSource={Array.isArray(promoList) ? promoList : []}
        loading={isLoading || isDeleting}
        bordered
        scroll={{ x: '100%' }}
        pagination={false} // Tắt hoàn toàn phân trang mặc định của Ant Design Table
      />

      {/* Khu vực hiển thị nút Load More nếu tổng số item thực tế lớn hơn số lượng đang hiển thị và còn dữ liệu để tải */}
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
              Xem thêm ({promoList.length}/{totalItems})
            </Button>
          ) : (
            <span style={{ color: '#8c8c8c', fontStyle: 'italic' }}>
              Đã hiển thị tất cả {totalItems} chương trình khuyến mãi.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default PromotionTable;
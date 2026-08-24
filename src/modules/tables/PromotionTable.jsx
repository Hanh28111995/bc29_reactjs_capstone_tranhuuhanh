import React, { useState } from 'react';
import { Table, Button, Image, App, Popconfirm, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAsync, useAsyncMutation } from '../../hooks/useAsync';
import { formatDate3 } from '../../utils/common';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { deletePromotionAPI, getPromotionListAPI } from 'services/promotion';
import './index.scss';

function PromotionTable() {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ page: 1, limit: 8 });
  const { notification } = App.useApp();

  // Đã loại bỏ 'keyword' khỏi dependencies và queryKey
  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [pagination.page, pagination.limit],
    queryKey: ['promotions', pagination.page, pagination.limit],
    service: () => getPromotionListAPI({ page: pagination.page, limit: pagination.limit }),    
  });
  
  const { mutateAsync: deletePromotion, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deletePromotionAPI(id),
    invalidateQueries: [['promotions']],
    onSuccess: () => {
      notification.success({ message: 'Thành công', description: 'Đã xóa chương trình khuyến mãi!' });
    },
    onError: () => {
      notification.error({ message: 'Lỗi', description: 'Không thể xóa khuyến mãi.' });
    },
  });

  const promoData = Array.isArray(responseContent)
    ? responseContent
    : responseContent?.promotions ?? responseContent?.data ?? [];
    
  const paginationMeta = responseContent?.pagination ?? { total: promoData.length, totalPages: 1 };

  const handleDelete = async (id) => {
    await deletePromotion(id);
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
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="movie-table-container">
      <div className="table-header-actions">      
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
        dataSource={promoData} // Dùng trực tiếp promoData phân trang từ server trả về
        loading={isLoading || isDeleting}
        bordered
        pagination={{ 
          current: pagination.page,
          pageSize: pagination.limit,
          total: paginationMeta.total,
          size: 'small',
          showTotal: (total) => `${total} chương trình`,
          onChange: (page, limit) => setPagination({ page, limit }),
        }}
      />
    </div>
  );
}

export default PromotionTable;
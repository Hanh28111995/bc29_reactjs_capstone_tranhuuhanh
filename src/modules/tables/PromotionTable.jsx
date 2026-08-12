import React, { useMemo, useState } from 'react';
import { Table, Input, Button, Image, App, Popconfirm, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate3 } from '../../utils/common';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { removeVietnameseTones } from 'constants/common';
import './index.scss';
import { deletePromotionAPI, getPromotionListAPI } from 'services/promotion';

const { Search } = Input;

function PromotionTable() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 8 });
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const { data: response, isLoading } = useQuery({
    queryKey: ['promotions', pagination.page, pagination.limit, keyword],
    queryFn: () => getPromotionListAPI({ page: pagination.page, limit: pagination.limit, keyword }),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePromotionAPI(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['promotions'] });
      notification.success({ message: 'Thành công', description: 'Đã xóa chương trình khuyến mãi!' });
    },
    onError: () => {
      notification.error({ message: 'Lỗi', description: 'Không thể xóa khuyến mãi.' });
    },
  });

  const content = response?.data?.content;
  const promoData = Array.isArray(content)
    ? content
    : content?.promotions ?? content?.data ?? [];
  const paginationMeta = content?.pagination ?? { total: promoData.length, totalPages: 1 };

  const promotionList = useMemo(() => {
    if (!keyword) return promoData;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return promoData.filter((ele) =>
      removeVietnameseTones(ele.title || '').toLowerCase().includes(key)
    );
  }, [promoData, keyword]);

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: '_id',
      key: '_id',
      width: '15%',
      render: (text) => text?.slice(-6).toUpperCase(), // Rút gọn ID hiển thị cho đẹp
    },
    {
      title: 'Banner',
      dataIndex: 'banner',
      key: 'banner',
      width: '20%',
      render: (text) => (
        <Image src={text} className="promo-banner" fallback="https://via.placeholder.com/120x60?text=No+Banner" />
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
      width: '25%',
      render: (_, record) => (
        <span>
          {record.startDate ? formatDate3(record.startDate) : '---'} đến {record.endDate ? formatDate3(record.endDate) : '---'}
        </span>
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
    <div className="promotion-table-container">
      <div className="table-header-actions">
        <Search
          placeholder="Tìm kiếm khuyến mãi..."
          onSearch={setKeyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="search-input"
          size="middle"
        />
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
        dataSource={promotionList}
        loading={isLoading || deleteMutation.isPending}
        bordered
        pagination={{ 
          current: pagination.page,
          pageSize: pagination.limit,
          total: paginationMeta.total,
          size: 'small',
          showTotal: (total) => `Tổng ${total} chương trình`,
          onChange: (page, limit) => setPagination({ page, limit }),
        }}
      />
    </div>
  );
}

export default PromotionTable;
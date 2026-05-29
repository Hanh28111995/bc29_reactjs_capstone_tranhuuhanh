import React, { useMemo, useState } from 'react';
import { Table, Input, Button, Image, App, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMovieListAPI, deleteMovieAPI } from 'services/movie';
import { formatDate3 } from '../../utils/common';
import {
  EditOutlined,
  DeleteOutlined,
  CarryOutOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { removeVietnameseTones } from 'constants/common';
import './index.scss';

const { Search } = Input;

function MovieTable() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 8 });
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const { data: response, isLoading } = useQuery(
    ['movies', pagination.page, pagination.limit, keyword],
    () => fetchMovieListAPI({ page: pagination.page, limit: pagination.limit, keyword }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const deleteMutation = useMutation((id) => deleteMovieAPI(id), {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['movies']);
      notification.success({ message: 'Thành công', description: 'Đã xóa phim!' });
    },
    onError: () => {
      notification.error({ message: 'Lỗi', description: 'Không thể xóa.' });
    },
  });

  const content = response?.data?.content;
  const movieData = Array.isArray(content)
    ? content
    : content?.movies ?? content?.data ?? [];
  const paginationMeta = content?.pagination ?? { total: movieData.length, totalPages: 1 };

  const movielist = useMemo(() => {
    if (!keyword) return movieData;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return movieData.filter((ele) =>
      removeVietnameseTones(ele.tenPhim || ele.title || '').toLowerCase().includes(key)
    );
  }, [movieData, keyword]);

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'id_movie',
      key: 'id_movie',
      width: '15%',
    },
    {
      title: 'Ảnh',
      dataIndex: 'banner',
      key: 'banner',
      width: '25%',
      render: (text) => (
        <Image src={text} className="movie-banner" fallback="https://via.placeholder.com/60x90?text=No+Image" />
      ),
    },
    {
      title: 'Tên phim',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true, // Chống tràn cực kỳ quan trọng
    },
    {
      title: 'Khởi chiếu',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      width: '15%',
      render: (text) => formatDate3(text),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <div className="action-btns">
          <Button type="text" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => navigate(`/admin/movie-management/${record.id_movie}/update`)} />
          <Button type="text" icon={<CarryOutOutlined style={{ color: '#52c41a' }} />} onClick={() => navigate(`/admin/movie-management/${record.id_movie}/edit-showtime`)} />
          <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.id_movie)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (    
    <div className="movie-table-container">
      <div className="table-header-actions">
        <Search
          placeholder="Tìm kiếm..."
          onSearch={setKeyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="search-input"
          size="middle"
        />
        <Button className='add-btn' type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/movie-management/create')}>
          THÊM PHIM
        </Button>
      </div>

      <Table
        className="custom-table"
        tableLayout="fixed"
        rowKey="id_movie"
        columns={columns}
        dataSource={movielist}
        loading={isLoading || deleteMutation.isLoading}
        bordered
        pagination={{ 
          current: pagination.page,
          pageSize: pagination.limit,
          total: paginationMeta.total,
          size: 'small',
          showTotal: (total) => `Tổng ${total} phim`,
          onChange: (page, limit) => setPagination({ page, limit }),
        }}
      />
    </div>
  );
}

export default MovieTable;
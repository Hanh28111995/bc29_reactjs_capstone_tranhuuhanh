import React, { useMemo, useState } from 'react';
import { Table, Input, Button, Image, App, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAsync, useAsyncMutation } from '../../hooks/useAsync';
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
  const { notification } = App.useApp();

  // Sử dụng useAsync chuẩn của dự án để fetch danh sách phim
  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [pagination.page, pagination.limit, keyword],
    service: () => fetchMovieListAPI({ page: pagination.page, limit: pagination.limit, keyword }),
    placeholderData: (previousData) => previousData,
  });

  // Sử dụng useAsyncMutation chuẩn của dự án để xóa phim và tự động invalidate cache
  const { mutateAsync: deleteMovie, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deleteMovieAPI(id),
    invalidateQueries: [['fetchMovieListAPI']],
    onSuccess: () => {
      notification.success({ message: 'Thành công', description: 'Đã xóa phim!' });
    },
    onError: () => {
      notification.error({ message: 'Lỗi', description: 'Không thể xóa.' });
    },
  });

  // normalizeResult từ useAsync đã tự bóc tách content, ta chỉ cần mapping an toàn
  const movieData = Array.isArray(responseContent)
    ? responseContent
    : responseContent?.movies ?? responseContent?.data ?? [];
    
  const paginationMeta = responseContent?.pagination ?? { total: movieData.length, totalPages: 1 };

  const movielist = useMemo(() => {
    if (!keyword) return movieData;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return movieData.filter((ele) =>
      removeVietnameseTones(ele.tenPhim || ele.title || '').toLowerCase().includes(key)
    );
  }, [movieData, keyword]);

  const handleDelete = async (id) => {
    await deleteMovie(id);
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
      ellipsis: true, 
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
          onSearch={(val) => {
            setKeyword(val);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
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
        loading={isLoading || isDeleting}
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
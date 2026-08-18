import React, { useMemo, useState } from 'react';
import { Table, Input, Button, Image, App, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAsync, useAsyncMutation } from '../../hooks/useAsync';
import { fetchMovieListAPI, fetchSearchMovieAPI, deleteMovieAPI } from 'services/movie';
import { formatDate3 } from '../../utils/common';
import {
  EditOutlined,
  DeleteOutlined,
  CarryOutOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import './index.scss';

// Hàm debounce tự viết
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function MovieTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(''); // State cho ô input gõ liên tục mượt mà
  const [keyword, setKeyword] = useState('');         // State lưu từ khóa đã debounce để gọi API
  const [pagination, setPagination] = useState({ page: 1, limit: 8 });
  const { notification } = App.useApp();

  // Tạo hàm debounce gọi sau 500ms dừng gõ
  const debouncedSetKeyword = useMemo(
    () =>
      debounce((val) => {
        setKeyword(val.trim());
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang 1 khi tìm kiếm
      }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    debouncedSetKeyword(val);
  };

  // Sử dụng useAsync linh hoạt:
  // - Khi có từ khóa: Dùng fetchSearchMovieAPI (chỉ truyền { title })
  // - Khi không có từ khóa: Dùng fetchMovieListAPI (có phân trang page, limit)
  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [pagination.page, pagination.limit, keyword],
    queryKey: ['movies', pagination.page, pagination.limit, keyword],
    service: () => {
      if (keyword) {
        return fetchSearchMovieAPI({ title: keyword, page: 1, limit: 20 });
      }
      return fetchMovieListAPI({ page: pagination.page, limit: pagination.limit });
    },    
  });

  // Sử dụng useAsyncMutation chuẩn của dự án để xóa phim và tự động invalidate cache
  const { mutateAsync: deleteMovie, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deleteMovieAPI(id),
    invalidateQueries: [['movies']],
    onSuccess: () => {
      notification.success({ message: 'Thành công', description: 'Đã xóa phim!' });
    },
    onError: () => {
      notification.error({ message: 'Lỗi', description: 'Không thể xóa.' });
    },
  });

  // Bóc tách dữ liệu linh hoạt
  const movielist = Array.isArray(responseContent)
    ? responseContent
    : responseContent?.movies ?? responseContent?.data?.movies ?? responseContent?.data ?? [];
    
  // Nếu đang search (vì API search trả về list không phân trang), tổng số item chính là chiều dài mảng kết quả
  const paginationMeta = keyword
    ? { total: movielist.length, totalPages: 1 }
    : (responseContent?.pagination ?? responseContent?.data?.pagination ?? { total: movielist.length, totalPages: 1 });

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
        <Input
          placeholder="Nhập tên phim để tìm kiếm..."
          allowClear
          value={searchTerm}
          onChange={handleSearchChange}
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
        pagination={
          keyword 
            ? false // Ẩn phân trang trên Table khi đang search theo title vì API trả về danh sách đầy đủ không phân trang
            : { 
                current: pagination.page,
                pageSize: pagination.limit,
                total: paginationMeta.total,
                size: 'small',
                showTotal: (total) => `${total} phim`,
                onChange: (page, limit) => setPagination({ page, limit }),
              }
        }
      />
    </div>
  );
}

export default MovieTable;
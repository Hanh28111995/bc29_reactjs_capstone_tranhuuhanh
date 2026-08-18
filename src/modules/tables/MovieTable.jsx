import React, { useMemo, useState, useCallback } from 'react';
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

// Hàm debounce tự viết (Không cần cài thư viện)
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function MovieTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(''); // State riêng cho ô input gõ liên tục không bị giật
  const [keyword, setKeyword] = useState('');         // State dùng cho dependencies gọi API/lọc
  const [pagination, setPagination] = useState({ page: 1, limit: 8 });
  const { notification } = App.useApp();

  // Tạo hàm debounce gọi sau 500ms dừng gõ
  const debouncedSetKeyword = useMemo(
    () =>
      debounce((val) => {
        setKeyword(val);
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang 1 khi tìm kiếm
      }, 1000),
    []
  );

  // Xử lý khi người dùng nhập liệu vào ô input
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);       // Cập nhật ngay lập tức vào UI input để mượt mà
    debouncedSetKeyword(val); // Trì hoãn việc cập nhật keyword và gọi API
  };

  // Sử dụng useAsync chuẩn của dự án để fetch danh sách phim
  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [pagination.page, pagination.limit, keyword],
    queryKey: ['movies', pagination.page, pagination.limit, keyword],
    service: () => fetchMovieListAPI({ page: pagination.page, limit: pagination.limit, keyword }),    
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
        {/* Dùng Input thuần thay cho Search kèm theo cơ chế debounce tự viết */}
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
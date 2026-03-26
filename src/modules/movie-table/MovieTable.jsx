import React, { useMemo, useState, useEffect } from 'react';
import { Table, Input, Button, Image, App, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchMovieListAPI, deleteMovieAPI } from "services/movie";
import { formatDate3 } from "../../utils/common";
import {
  EditOutlined,
  DeleteOutlined,
  CarryOutOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { removeVietnameseTones } from 'constants/common';
import './index.scss';

const { Search } = Input;

function MovieTable() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 8 });
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, totalPages: 1 });
  const [movieData, setMovieData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await fetchMovieListAPI({ page: pagination.page, limit: pagination.limit, ...params });
      const content = res.data.content;
      const data = Array.isArray(content) ? content : (content?.movies ?? content?.data ?? []);
      const meta = content?.pagination ?? {};
      setMovieData(data);
      setPaginationMeta({ total: meta.total ?? data.length, totalPages: meta.totalPages ?? 1 });
    } catch {
      notification.error({ message: "Lỗi", description: "Không thể tải danh sách phim." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ page: pagination.page, limit: pagination.limit, keyword });
  }, [pagination]);

  const movielist = useMemo(() => {
    if (!keyword) return movieData;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return movieData.filter(ele =>
      removeVietnameseTones(ele.tenPhim || ele.title || "").toLowerCase().includes(key)
    );
  }, [movieData, keyword]);

  const handleDelete = async (id) => {
    try {
      await deleteMovieAPI(id);
      notification.success({ message: "Thành công", description: "Đã xóa phim!" });
      fetchData({ page: pagination.page, limit: pagination.limit, keyword });
    } catch (err) {
      notification.error({ message: "Lỗi", description: "Không thể xóa." });
    }
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
        loading={loading}
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
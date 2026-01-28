import React, { useMemo, useState } from 'react';
import { Space, Table, Input, Button, Image, App, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAsync } from "../../hooks/useAsync";
import { fetchMovieListAPI, deleteMovieAPI } from "services/movie";
import { formatDate3 } from "../../utils/common";
import {
  EditOutlined,
  DeleteOutlined,
  CarryOutOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { removeVietnameseTones } from 'constants/common';
import './index.scss'; // Import file SCSS vừa tạo

const { Search } = Input;

function MovieTable() {
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const [keyword, setKeyword] = useState("");
  const { notification } = App.useApp();

  const { state: data = [], loading } = useAsync({
    dependencies: [toggle],
    service: fetchMovieListAPI,
  });

  const movielist = useMemo(() => {
    if (!keyword) return data;
    const key = removeVietnameseTones(keyword).toLowerCase().trim();
    return data.filter(ele =>
      removeVietnameseTones(ele.tenPhim || ele.title || "").toLowerCase().includes(key)
    );
  }, [data, keyword]);

  const handleDelete = async (id) => {
    try {
      await deleteMovieAPI(id);
      notification.success({ message: "Thành công", description: "Đã xóa phim!" });
      setToggle(prev => !prev);
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
        pagination={{ pageSize: 8, size: 'small' }}
      />
    </div>
  );
}

export default MovieTable;
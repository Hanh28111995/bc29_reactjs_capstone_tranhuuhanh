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

const { Search } = Input;

function MovieTable() {
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const [keyword, setKeyword] = useState("");

  // Lấy notification từ context của Antd App đã bọc ở index.js
  const { notification } = App.useApp();

  const { state: data = [], loading } = useAsync({
    dependencies: [toggle],
    service: fetchMovieListAPI,
  });

  // Lọc phim theo tên (không dấu)
  const movielist = useMemo(() => {
    if (!keyword) return data;

    const key = removeVietnameseTones(keyword).toLowerCase().trim();

    return data.filter(ele =>
      removeVietnameseTones(ele.tenPhim || ele.title || "")
        .toLowerCase()
        .includes(key)
    );
  }, [data, keyword]);

  // Xử lý xóa phim
  const handleDelete = async (id) => {
    try {
      await deleteMovieAPI(id);
      notification.success({
        message: "Thành công",
        description: "Phim đã được xóa thành công!",
      });
      setToggle(prev => !prev); // Kích hoạt fetch lại dữ liệu
    } catch (err) {
      notification.error({
        message: "Lỗi",
        description: err.response?.data?.content || "Không thể xóa phim này.",
      });
    }
  };

  const columns = [
    {
      title: 'Mã Phim',
      dataIndex: 'id_movie',
      key: 'id_movie',
      width: 100,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'banner',
      key: 'banner',
      render: (text) => (
        <Image 
          src={text} 
          alt="banner" 
          width={60} 
          style={{ borderRadius: 4, objectFit: 'cover' }} 
          fallback="https://via.placeholder.com/60x90?text=No+Image"
        />
      ),
    },
    {
      title: 'Tên phim',
      dataIndex: 'title', // hoặc tenPhim tùy theo API của bạn
      key: 'title',
      sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
    },
    {
      title: 'Ngày Khởi Chiếu',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (text) => <span>{formatDate3(text)}</span>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {/* Nút Chỉnh sửa */}
          <Button 
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => navigate(`/admin/movie-management/${record.id_movie}/update`)}
          />
          
          {/* Nút Tạo lịch chiếu */}
          <Button 
            type="text"
            icon={<CarryOutOutlined style={{ color: '#52c41a' }} />}
            onClick={() => navigate(`/admin/movie-management/${record.id_movie}/edit-showtime`)}
          />

          {/* Nút Xóa có xác nhận */}
          <Popconfirm
            title="Xóa phim"
            description="Bạn có chắc chắn muốn xóa phim này không?"
            onConfirm={() => handleDelete(record.id_movie)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Search
          placeholder="Tìm kiếm phim..."
          allowClear
          onSearch={setKeyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 350 }}
        />
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/movie-management/create')}
        >
          THÊM PHIM
        </Button>
      </div>

      <Table
        rowKey="id_movie"
        columns={columns}
        dataSource={movielist}
        loading={loading}
        bordered
        pagination={{
          pageSize: 8,
          showTotal: (total) => `Tổng cộng ${total} phim`,
        }}
      />
    </div>
  );
}

export default MovieTable;
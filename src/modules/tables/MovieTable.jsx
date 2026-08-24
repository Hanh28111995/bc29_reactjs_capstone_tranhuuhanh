import React, { useState, useEffect, useRef } from "react";
import { Table, Input, Button, Image, App, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import { useAsync, useAsyncMutation } from "../../hooks/useAsync";
import {
  fetchMovieListAPI,
  fetchSearchMovieAPI,
  deleteMovieAPI,
} from "services/movie";
import { formatDate3 } from "../../utils/common";
import {
  EditOutlined,
  DeleteOutlined,
  CarryOutOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import "./index.scss";

function MovieTable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const [searchTerm, setSearchTerm] = useState(""); 
  const [keyword, setKeyword] = useState(""); 
  const [pagination, setPagination] = useState({ page: 1, limit: 8 });

  const [movieList, setMovieList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Gọi API danh sách mặc định (có phân trang) khi KHÔNG có keyword
  const { data: responseContent, loading: isLoadingList } = useAsync({
    dependencies: [pagination.page, pagination.limit],
    queryKey: ["movies-list", pagination.page, pagination.limit],
    service: () =>
      fetchMovieListAPI({ page: pagination.page, limit: pagination.limit }),
    enabled: !keyword, 
  });

  // Tự động đồng bộ data từ API danh sách vào state bảng khi không search
  useEffect(() => {
    if (!keyword && responseContent) {      
      const list = responseContent?.movies || [];          
      const totalRecord = responseContent?.pagination?.total || 0; 
      setMovieList(list);
      setTotalItems(totalRecord); 
    }
  }, [responseContent, keyword]);

  // 2. Xử lý Search với Debounce an toàn sử dụng useEffect chuẩn React
  useEffect(() => {
    if (!keyword) {
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetchSearchMovieAPI({
          title: keyword,
          page: 1,
          limit: 20,
        });
        const searchResult = res.data?.content?.movies ?? res.data?.movies ?? [];
        setMovieList(searchResult);
        setTotalItems(res.data?.content?.pagination?.total ?? searchResult.length);
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tìm kiếm phim.",
        });
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    const trimmed = val.trim();
    
    if (!trimmed) {
      setKeyword("");
      setPagination((prev) => ({ ...prev, page: 1 }));
    } else {
      setKeyword(trimmed);
    }
  };

  // 3. Sử dụng useAsyncMutation chuẩn của dự án để xóa phim
  const { mutateAsync: deleteMovie, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deleteMovieAPI(id),
    invalidateQueries: [["movies-list"]],
    onSuccess: () => {
      notification.success({
        message: "Thành công",
        description: "Đã xóa phim!",
      });
      // Nếu đang ở chế độ search mà xóa phim, ta chủ động cập nhật lại state danh sách hiển thị
      if (keyword) {
        setMovieList((prev) => prev.filter((item) => item._id !== id));
      }
    },
    onError: () => {
      notification.error({ message: "Lỗi", description: "Không thể xóa." });
    },
  });

  const handleDelete = async (id) => {
    await deleteMovie(id);
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "id_movie",
      key: "id_movie",
      width: "15%",
    },
    {
      title: "Ảnh",
      dataIndex: "banner",
      key: "banner",
      width: "20%",
      render: (text) => (
        <Image
          src={text}
          className="movie-banner"
          fallback="https://via.placeholder.com/60x90?text=No+Image"
        />
      ),
    },
    {
      title: "Tên phim",
      dataIndex: "title",
      key: "title",
      width: "30%",
      ellipsis: true,
    },
    {
      title: "Khởi chiếu",
      dataIndex: "releaseDate",
      key: "releaseDate",
      width: "20%",
      render: (text) => formatDate3(text),
    },
    {
      title: "Hành động",
      key: "action",
      width: "15%",
      render: (_, record) => {
        const movieId = record._id;
        return (
          <div className="action-btns">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#1677ff" }} />}
              onClick={() =>
                navigate(`/admin/movie-management/${movieId}/update`)
              }
            />
            <Button
              type="text"
              icon={<CarryOutOutlined style={{ color: "#52c41a" }} />}
              onClick={() =>
                navigate(`/admin/movie-management/${movieId}/edit-showtime`)
              }
            />
            <Popconfirm title="Xóa phim này?" onConfirm={() => handleDelete(movieId)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className="movie-management-container">
      <div className="table-header-actions">
        <Input
          placeholder="Nhập tên phim để tìm kiếm..."
          allowClear
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          size="middle"
        />
        <Button
          className="add-btn"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/movie-management/create")}
        >
          THÊM PHIM
        </Button>
      </div>

      <Table
        className="custom-table"
        tableLayout="fixed"
        rowKey="_id"
        columns={columns}
        dataSource={Array.isArray(movieList) ? movieList : []}
        loading={isLoadingList || isDeleting || isSearching}
        bordered
        scroll={{ x: '100%' }}
        pagination={
          keyword
            ? false // Ẩn phân trang khi đang search
            : {
                current: pagination.page,
                pageSize: pagination.limit,
                total: totalItems,
                size: "small",
                showTotal: (total) => `${total} phim`,
                onChange: (page, limit) => setPagination({ page, limit }),
              }
        }
      />
    </div>
  );
}

export default MovieTable;
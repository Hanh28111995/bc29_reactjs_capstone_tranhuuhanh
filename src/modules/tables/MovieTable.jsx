import React, { useMemo, useState, useEffect } from "react";
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
import "./index.scss";

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
  const [searchTerm, setSearchTerm] = useState(""); // State cho ô input gõ liên tục
  const [keyword, setKeyword] = useState(""); // State lưu từ khóa hiện tại
  const [pagination, setPagination] = useState({ page: 1, limit: 8 });

  // 🔥 State riêng biệt lưu danh sách phim hiển thị lên bảng
  const [movieList, setMovieList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const { notification } = App.useApp();

  // 1. Gọi API danh sách mặc định (có phân trang) khi KHÔNG có keyword
  const { data: responseContent, loading: isLoadingList } = useAsync({
    dependencies: [pagination.page, pagination.limit],
    queryKey: ["movies", pagination.page, pagination.limit],
    service: () =>
      fetchMovieListAPI({ page: pagination.page, limit: pagination.limit }),
    enabled: !keyword, // Chỉ gọi khi không ở chế độ search
  });

  // Tự động đồng bộ data từ API danh sách vào state bảng khi fetch xong và không có keyword
  useEffect(() => {
    if (!keyword && responseContent) {
      const list = Array.isArray(responseContent)
        ? responseContent
        : (responseContent?.movies ??
          responseContent?.data?.movies ??
          responseContent?.data ??
          []);

      const total =
        responseContent?.pagination?.total ??
        responseContent?.data?.pagination?.total ??
        list.length;

      setMovieList(list);
      setTotalItems(total);
    }
  }, [responseContent, keyword]);

  // 2. Hàm riêng gọi API Search đặt trong onChange / debounce
  const handleSearchAPI = async (titleKeyword) => {
    if (!titleKeyword) {
      // Nếu xóa trắng ô search, trả về phân trang ban đầu
      setPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }

    try {
      // Gọi trực tiếp fetchSearchMovieAPI khi người dùng tìm kiếm
      const res = await fetchSearchMovieAPI({
        title: titleKeyword,
        page: 1,
        limit: 20,
      });
      const searchResult = res?.content?.movies ?? [];
      setMovieList(searchResult);
      setTotalItems(res?.content?.pagination?.total ?? searchResult.length);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tìm kiếm phim.",
      });
    }
  };

  // Tạo hàm debounce cho input search
  const debouncedSearch = useMemo(
    () =>
      debounce((val) => {
        const trimmed = val.trim();
        setKeyword(trimmed);
        handleSearchAPI(trimmed);
      }, 500),
    [],
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    debouncedSearch(val);
  };

  // Sử dụng useAsyncMutation chuẩn của dự án để xóa phim
  const { mutateAsync: deleteMovie, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deleteMovieAPI(id),
    invalidateQueries: [["movies"]],
    onSuccess: () => {
      notification.success({
        message: "Thành công",
        description: "Đã xóa phim!",
      });
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
      width: "10%",
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
      width: "35%",
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
      render: (_, record) => (
        <div className="action-btns">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1677ff" }} />}
            onClick={() =>
              navigate(`/admin/movie-management/${record.id_movie}/update`)
            }
          />
          <Button
            type="text"
            icon={<CarryOutOutlined style={{ color: "#52c41a" }} />}
            onClick={() =>
              navigate(
                `/admin/movie-management/${record.id_movie}/edit-showtime`,
              )
            }
          />
          <Popconfirm
            title="Xóa?"
            onConfirm={() => handleDelete(record.id_movie)}
          >
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
        rowKey="id_movie"
        columns={columns}
        dataSource={Array.isArray(movieList) ? movieList : []}
        loading={isLoadingList || isDeleting}
        bordered
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

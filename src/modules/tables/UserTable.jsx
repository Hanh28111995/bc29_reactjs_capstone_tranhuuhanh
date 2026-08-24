import React, { useMemo, useState, useEffect } from "react";
import { Table, Input, Button, App, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import { useAsync, useAsyncMutation } from "../../hooks/useAsync";
import {
  fetchUserListAPI,
  fetchSearchUserAPI,  
  fetchDeleteUserApi,
} from "services/user"; // Thay thế đường dẫn service user của bạn
import { formatDate3 } from "../../utils/common"; // Hoặc format ngày tháng tương ứng
import {
  EditOutlined,
  DeleteOutlined,
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

function UserTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(""); // State cho ô input gõ liên tục
  const [keyword, setKeyword] = useState(""); // State lưu từ khóa hiện tại
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // State riêng biệt lưu danh sách user hiển thị lên bảng
  const [userList, setUserList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const { notification } = App.useApp();

  // 1. Gọi API danh sách mặc định (có phân trang) khi KHÔNG có keyword
  const { data: responseContent, loading: isLoadingList } = useAsync({
    dependencies: [pagination.page, pagination.limit],
    queryKey: ["users", pagination.page, pagination.limit],
    service: () =>
      fetchUserListAPI({ page: pagination.page, limit: pagination.limit }),
    enabled: !keyword, // Chỉ gọi khi không ở chế độ search
  });

  // Tự động đồng bộ data từ API danh sách vào state bảng khi fetch xong và không có keyword
  useEffect(() => {
    if (!keyword && responseContent) {
      const list = responseContent?.users || [];
      const totalRecord = responseContent?.pagination?.total || 0;
      setUserList(list);
      setTotalItems(totalRecord);
    }
  }, [responseContent, keyword]);

  // 2. Hàm riêng gọi API Search
  const handleSearchAPI = async (titleKeyword) => {
    if (!titleKeyword) {
      // Nếu xóa trắng ô search, reset lại keyword và trả về phân trang ban đầu
      setKeyword("");
      setPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }

    try {
      const res = await fetchSearchUserAPI({
        q: titleKeyword, // Hoặc tùy thuộc param backend của bạn (ví dụ: keyword / q)
        page: 1,
        limit: 20,
      });
      const searchResult = res?.data?.content?.users ?? [];
      setUserList(searchResult);
      setTotalItems(res?.data?.content?.pagination?.total ?? searchResult.length);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tìm kiếm người dùng.",
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

    // Nếu người dùng bấm nút clear (xóa trắng) trên ô input Antd
    if (!val) {
      setKeyword("");
      setSearchTerm("");
    }

    debouncedSearch(val);
  };

  // Sử dụng useAsyncMutation chuẩn của dự án để xóa user
  const { mutateAsync: deleteUser, isPending: isDeleting } = useAsyncMutation({
    service: (id) => fetchDeleteUserApi(id),
    invalidateQueries: [["users"]],
    onSuccess: () => {
      notification.success({
        message: "Thành công",
        description: "Đã xóa người dùng!",
      });
    },
    onError: () => {
      notification.error({ message: "Lỗi", description: "Không thể xóa." });
    },
  });

  const handleDelete = async (id) => {
    await deleteUser(id);
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: "10%",
      render: (_, __, index) => (pagination.page - 1) * pagination.limit + index + 1,
    },
    {
      title: "Tài khoản",
      dataIndex: "username",
      key: "username",
      width: "25%",
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "30%",
      ellipsis: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "userphone",
      key: "userphone",
      width: "20%",
    },
    {
      title: "Hành động",
      key: "action",
      width: "15%",
      render: (_, record) => {
        const userId = record._id;
        return (
          <div className="action-btns">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#1677ff" }} />}
              onClick={() =>
                navigate(`/admin/user-management/${userId}/update`)
              }
            />
            <Popconfirm title="Xóa?" onConfirm={() => handleDelete(userId)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className="user-management-container">
      <div className="table-header-actions">
        <Input
          placeholder="Nhập tên tài khoản hoặc email để tìm kiếm..."
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
          onClick={() => navigate("/admin/user-management/create")}
        >
          THÊM NGƯỜI DÙNG
        </Button>
      </div>

      <Table
        className="custom-table"
        tableLayout="fixed"
        rowKey="_id"
        columns={columns}
        dataSource={Array.isArray(userList) ? userList : []}
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
                showTotal: (total) => `Tổng ${total} người dùng`,
                onChange: (page, limit) => setPagination({ page, limit }),
              }
        }
      />
    </div>
  );
}

export default UserTable;
import React, { useMemo, useState, useEffect } from "react";
import { Table, Input, Button, App, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import { useAsync, useAsyncMutation } from "../../hooks/useAsync";
import {
  fetchUserListAPI,
  fetchSearchUserAPI,  
  fetchDeleteUserApi,
} from "services/user";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import "./index.scss";

// Hàm debounce tối ưu
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export default function UserTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(""); // State cho ô input gõ liên tục
  const [keyword, setKeyword] = useState("");       // State lưu từ khóa chính thức gọi API
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // State riêng biệt lưu danh sách user hiển thị lên bảng
  const [userList, setUserList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const { notification } = App.useApp();

  // 1. Gọi API danh sách mặc định (có phân trang) khi KHÔNG có keyword với queryKey chuẩn "users-list"
  const { data: responseContent, loading: isLoadingList } = useAsync({
    dependencies: [pagination.page, pagination.limit],
    queryKey: ["users-list", pagination.page, pagination.limit],
    service: () =>
      fetchUserListAPI({ page: pagination.page, limit: pagination.limit }),
    enabled: !keyword, // Chỉ gọi khi không ở chế độ search giống MovieTable
  });

  // Tự động đồng bộ data từ API danh sách vào state bảng khi fetch xong và không có keyword
  useEffect(() => {
    if (!keyword && responseContent) {
      const content = responseContent?.data ?? responseContent;
      const list = content?.users || content?.content?.users || [];
      const totalRecord = content?.pagination?.total || content?.content?.pagination?.total || list.length;
      
      setUserList(list);
      setTotalItems(totalRecord);
    }
  }, [responseContent, keyword]);

  // 2. Hàm riêng gọi API Search
  const handleSearchAPI = async (titleKeyword) => {
    if (!titleKeyword) {
      setKeyword("");
      setPagination((prev) => ({ ...prev, page: 1 }));
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetchSearchUserAPI({
        q: titleKeyword, // Hoặc keyword tùy theo API backend của bạn
        page: 1,
        limit: 50,
      });
      
      const content = res?.data ?? res;
      const searchResult = content?.users || content?.content?.users || [];
      const totalRecord = content?.pagination?.total || content?.content?.pagination?.total || searchResult.length;

      setUserList(searchResult);
      setTotalItems(totalRecord);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tìm kiếm người dùng.",
      });
    } finally {
      setIsSearching(false);
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
    []
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (!val.trim()) {
      setKeyword("");
      setSearchTerm("");
      setPagination((prev) => ({ ...prev, page: 1 }));
    }

    debouncedSearch(val);
  };

  // 3. Sử dụng useAsyncMutation chuẩn với invalidateQueries là ["users-list"]
  const { mutateAsync: deleteUser, isPending: isDeleting } = useAsyncMutation({
    service: (id) => fetchDeleteUserApi(id),
    invalidateQueries: [["users-list"]],
    onSuccess: () => {
      notification.success({
        message: "Thành công",
        description: "Đã xóa người dùng!",
      });

      if (keyword) {
        setUserList((prev) => prev.filter((item) => item._id !== id));
      } else {
        if (userList.length === 1 && pagination.page > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        }
      }
    },
    onError: (error) => {
      notification.error({ 
        message: "Lỗi", 
        description: error.response?.data?.message || "Không thể xóa." 
      });
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
      render: (_, __, index) => keyword ? index + 1 : (pagination.page - 1) * pagination.limit + index + 1,
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
          <div className="action-btns" style={{ display: 'flex', gap: 4 }}>
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#1677ff" }} />}
              onClick={() =>
                navigate(`/admin/user-management/${userId}/update`)
              }
            />
            <Popconfirm title="Xác nhận xóa người dùng?" onConfirm={() => handleDelete(userId)}>
              <Button type="text" danger icon={<DeleteOutlined />} disabled={isDeleting} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className="user-management-container">
      <div className="table-header-actions" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input
          placeholder="Nhập tên tài khoản hoặc email để tìm kiếm..."
          allowClear
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          size="large"
          style={{ width: 350 }}
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
        loading={isLoadingList || isDeleting || isSearching}
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
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                onChange: (page, limit) => setPagination({ page, limit }),
              }
        }
      />
    </div>
  );
}
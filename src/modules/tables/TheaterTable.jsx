import { Space, Table, Button, App, Popconfirm, Card, Tag } from "antd";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { fetchTheaterListAPI, deleteTheaterAPI } from "services/theater";
import { safeArray, useAsync, useAsyncMutation } from "hooks/useAsync";
import "./index.scss";

export default function TheaterTable() {
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const [theaterList, setTheaterList] = useState([]);

  // 1. Gọi API lấy toàn bộ danh sách phòng chiếu một lần duy nhất
  const { data: responseContent, loading: isLoading } = useAsync({
    queryKey: ["theaters_list"],
    service: () => fetchTheaterListAPI(),
  });

  // Đồng bộ dữ liệu trả về từ API vào state local
  useEffect(() => {
    if (responseContent) {
      const content = responseContent?.data ?? responseContent;
      const list = safeArray(content?.theaters ?? content);
      setTheaterList(list);
    }
  }, [responseContent]);

  // 2. Sử dụng useAsyncMutation chuẩn của dự án để xóa phòng chiếu
  const { mutateAsync: deleteTheater, isPending: isDeleting } =
    useAsyncMutation({
      service: (id) => deleteTheaterAPI(id),
      invalidateQueries: [["ttheaters-list"]],
      onSuccess: () => {
        notification.success({
          message: "Thành công",
          description: "Phòng chiếu đã được xóa khỏi hệ thống.",
        });
      },
      onError: (error) => {
        notification.error({
          message: "Xóa thất bại",
          description: error.response?.data?.message || "Vui lòng thử lại sau.",
        });
      },
    });

  const handleDelete = async (id) => {
    await deleteTheater(id);
  };

  const columns = [
    {
      title: "Chi nhánh",
      dataIndex: "branch",
      key: "branch",
      width: "35%",
      render: (text) => (
        <Tag color="blue" className="branch-tag">
          {text || "---"}
        </Tag>
      ),
    },
    {
      title: "Tên Phòng Chiếu",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: "Số lượng ghế",
      key: "totalSeats",
      render: (_, record) => {
        const rows = record.totalSeat?.rows || 0;
        const cols = record.totalSeat?.cols || 0;
        return (
          <span>
            <b>{rows * cols}</b> Ghế ({rows} x {cols})
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Space size="small" className="action-btns">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1677ff" }} />}
            onClick={() =>
              navigate(`/admin/theater-management/${record._id}/update`)
            }
          />
          <Popconfirm
            title="Xác nhận xóa"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={isDeleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="movie-management-container">
      <Card title="Quản lý rạp và phòng chiếu">
        <div
          className="table-header"
          style={{ justifyContent: "flex-end", marginBottom: 16 }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="add-btn"
            onClick={() => navigate("/admin/theater-management/create")}
          >
            THÊM PHÒNG CHIẾU
          </Button>
        </div>

        <Table
          tableLayout="fixed"
          className="custom-table"
          rowKey="_id"
          columns={columns}
          dataSource={theaterList}
          loading={isLoading || isDeleting}
          bordered
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} phòng chiếu`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </Card>
    </div>
  );
}
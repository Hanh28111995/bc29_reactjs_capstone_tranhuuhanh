import React, { useState, useEffect } from "react";
import { Table, Input, Button, App, Popconfirm, Tag, Select } from "antd";
import { useAsync, useAsyncMutation } from "../../hooks/useAsync";
import { fetchAllTicketsAPI, deleteTicketAPI } from "services/ticket";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function TicketTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const [ticketList, setTicketList] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({ total: 0 });
  const [isSearching, setIsSearching] = useState(false);

  const { notification } = App.useApp();
  const navigate = useNavigate();

  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [pagination.page, pagination.limit, statusFilter],
    queryKey: ["tickets-list", pagination.page, pagination.limit, statusFilter],
    service: () =>
      fetchAllTicketsAPI({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
      }),
    enabled: !keyword,
  });

  useEffect(() => {
    if (!keyword && responseContent) {
      const list = Array.isArray(responseContent)
        ? responseContent
        : (responseContent?.tickets ?? responseContent?.data ?? []);

      const meta = responseContent?.pagination ?? { total: list.length };

      setTicketList(list);
      setPaginationMeta(meta);
    }
  }, [responseContent, keyword]);

  useEffect(() => {
    if (!keyword) {
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetchAllTicketsAPI({
          keyword: keyword,
          status: statusFilter,
          page: 1,
          limit: 50,
        });

        const list = Array.isArray(res)
          ? res
          : (res?.tickets ?? res?.data ?? []);
        const meta = res?.pagination ?? { total: list.length };

        setTicketList(list);
        setPaginationMeta(meta);
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tìm kiếm vé.",
        });
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, statusFilter]);

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

  const { mutateAsync: deleteTicket, isPending: isDeleting } = useAsyncMutation(
    {
      service: (id) => deleteTicketAPI(id),
      invalidateQueries: [["tickets-list"]],
      onSuccess: () => {
        notification.success({
          message: "Thành công",
          description: "Đã xóa vé!",
        });

        if (keyword) {
          setTicketList((prev) => prev.filter((item) => item._id !== id));
        } else {
          if (ticketList.length === 1 && pagination.page > 1) {
            setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
          }
        }
      },
      onError: () => {
        notification.error({ message: "Lỗi", description: "Không thể xóa." });
      },
    },
  );

  const handleDelete = async (id) => {
    await deleteTicket(id);
  };

  const columns = [
    {
      title: "Mã vé",
      dataIndex: "transactionId",
      key: "transactionId",
      width: "18%",
      ellipsis: true,
    },
    {
      title: "Ghế",
      dataIndex: "seatName", // Sửa từ "seats" thành "seatName" khớp API
      key: "seatName",
      render: (seatName) =>
        Array.isArray(seatName) && seatName.length > 0
          ? seatName.map((s) => s.seatNumber || s.name).join(", ")
          : "---",
    },
    {
      title: "Tổng tiền",
      dataIndex: "seatName", // Dùng seatName để tính tiền khớp cấu trúc dữ liệu
      key: "total",
      width: "13%",
      render: (seatName) => {
        const totalMoney = Array.isArray(seatName)
          ? seatName.reduce((t, s) => t + (s.price || 0), 0)
          : 0;
        return `${totalMoney.toLocaleString("vi-VN")} đ`;
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: "14%",
      render: (method) => {
        const methodMap = {
          cash: { label: "Tiền mặt", color: "default" },
          momo: { label: "MoMo", color: "magenta" },
          vnpay: { label: "VNPay", color: "blue" },
        };
        const current = methodMap[method] || { label: method || "---", color: "default" };
        return <Tag color={current.color}>{current.label}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: "12%",
      render: (text) => (
        <Tag
          color={
            text === "Completed"
              ? "green"
              : text === "Pending"
                ? "orange"
                : "red"
          }
        >
          {text || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Thời gian đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "15%",
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY HH:mm") : "---"),
    },
    {
      title: "Hành động",
      key: "action",
      width: "8%",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 4 }}>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1677ff" }} />}
            onClick={() =>
              navigate(`/admin/ticket-management/edit/${record._id}`)
            }
          />
          <Popconfirm
            title="Xóa vé này?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={isDeleting}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="ticket-management-container">
      <div
        className="table-header-actions"
        style={{ marginBottom: 16, display: "flex", gap: 12 }}
      >
        <Input
          placeholder="Tìm theo mã vé, phương thức..."
          allowClear
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          size="middle"
          style={{ width: 300 }}
        />
        <Select
          allowClear
          placeholder="Lọc trạng thái"
          style={{ width: 160 }}
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          options={[
            { label: "Pending", value: "Pending" },
            { label: "Completed", value: "Completed" },
            { label: "Failed", value: "Failed" },
          ]}
        />
      </div>

      <Table
        className="custom-table"
        tableLayout="fixed"
        rowKey="_id"
        columns={columns}
        dataSource={ticketList}
        loading={isLoading || isDeleting || isSearching}
        bordered
        pagination={
          keyword
            ? false
            : {
                pageSize: pagination.limit,
                current: pagination.page,
                total: paginationMeta.total,
                size: "small",
                showTotal: (total) => `Tổng ${total} vé`,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                onChange: (page, limit) => setPagination({ page, limit }),
              }
        }
      />
    </div>
  );
}
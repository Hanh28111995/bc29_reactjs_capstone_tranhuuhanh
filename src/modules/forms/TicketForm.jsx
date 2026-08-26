import {
  Button, Form, Select, Space, Card, Divider,
  Descriptions, Tag, App, Row, Col
} from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync, useAsyncMutation } from "hooks/useAsync";
import { fetchTicketByIdAPI, updateTicketAPI } from "services/ticket";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function TicketForm() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const [isChanged, setIsChanged] = useState(false);

  const {
    state: response,
    loading,
    isError,
    error,
  } = useAsync({
    service: () => fetchTicketByIdAPI(ticketId),
    condition: !!ticketId,
    dependencies: [ticketId],
    queryKey: ["ticket", ticketId],
  });

  const updateTicketMutation = useAsyncMutation({
    service: (values) => updateTicketAPI(ticketId, values),
    invalidateQueries: [
      ["tickets-list"],
      ["ticket", ticketId],
    ],
  });

  // Lấy dữ liệu ticket an toàn
  const ticket = response?.content?.ticket || response?.ticket;

  useEffect(() => {
    if (ticket) {
      form.setFieldsValue({
        paymentStatus: ticket.paymentStatus,
        paymentMethod: ticket.paymentMethod,
      });
      setIsChanged(false);
    }
  }, [ticket, form]);

  const handleFormChange = (_, allValues) => {
    const hasChanged = 
      allValues.paymentStatus !== ticket?.paymentStatus ||
      allValues.paymentMethod !== ticket?.paymentMethod;
    setIsChanged(hasChanged);
  };

  const handleSave = async (values) => {
    try {
      await updateTicketMutation.mutateAsync(values);
      notification.success({ message: "Cập nhật vé thành công!" });
      navigate(-1);
    } catch (error) {
      notification.error({
        message: "Lỗi hệ thống",
        description: error.response?.data?.message || error.message || "Không thể cập nhật vé.",
      });
    }
  };

  // Tính toán thông tin hiển thị
  const seats = ticket?.seatName || [];
  const totalPrice = seats.reduce((t, s) => t + (s.price || 0), 0);

  // Xử lý hiển thị an toàn cho Object (Tránh lỗi render Object)
  const movieDisplay =
    typeof ticket?.id_movie === "object"
      ? ticket.id_movie?.title
      : ticket?.id_movie;
      
  const theaterDisplay =
    typeof ticket?.id_theater === "object"
      ? ticket.id_theater?.name
      : ticket?.id_theater;

  if (isError) {
    return (
      <Card title="Chi tiết vé" loading={false}>
        <div style={{ textAlign: "center", minHeight: "40vh", padding: "40px 0" }}>
          <p style={{ fontSize: "16px" }}>Không thể tải thông tin vé.</p>
          <p style={{ color: "#ff4d4f" }}>{error?.message || "Vui lòng thử lại sau."}</p>
          <Button type="primary" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>
            Quay lại
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="movie-form-card"
      loading={loading || updateTicketMutation.isLoading}
      title={
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          />
          <span>Chi tiết vé #{ticket?._id || ticketId}</span>
        </Space>
      }
    >
      {ticket && (
        <>
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2 }}
            style={{ marginBottom: 24 }}
            title="Thông tin chi tiết suất chiếu"
          >
            <Descriptions.Item label="Phim" span={2}>
              <strong style={{ fontSize: "16px" }}>
                {movieDisplay || "—"}
              </strong>
            </Descriptions.Item>

            <Descriptions.Item label="Rạp / Phòng" span={2}>
              {theaterDisplay || "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Thời gian">
              <Tag color="blue" style={{ fontSize: "14px" }}>
                {ticket.startTime
                  ? dayjs(ticket.startTime).format("HH:mm DD/MM/YYYY")
                  : "—"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Mã giao dịch">
              <code style={{ color: "#0958d9" }}>{ticket.transactionId || "—"}</code>
            </Descriptions.Item>

            <Descriptions.Item label="Ghế đã đặt" span={2}>
              <Space wrap>
                {seats.map((s, i) => (
                  <Tag color="orange" key={i} style={{ padding: "4px 10px" }}>
                    Ghế {s.seatNumber} — {s.price?.toLocaleString()} VNĐ
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Tổng tiền">
              <span
                style={{
                  color: "#cf1322",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                {totalPrice.toLocaleString()} VNĐ
              </span>
            </Descriptions.Item>

            <Descriptions.Item label="Ngày đặt">
              {ticket.createdAt
                ? dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")
                : "—"}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Quản lý trạng thái</Divider>

          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSave}
            onValuesChange={handleFormChange}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Phương thức thanh toán" name="paymentMethod">
                  <Select
                    size="large"
                    options={[
                      { label: "Tiền mặt (Cash)", value: "cash" },
                      { label: "Ví điện tử MoMo", value: "momo" },
                      { label: "Cổng VNPay", value: "vnpay" },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Trạng thái thanh toán" name="paymentStatus">
                  <Select
                    size="large"
                    options={[
                      { label: "Đang chờ xử lý (Pending)", value: "Pending" },
                      { label: "Thành công (Completed)", value: "Completed" },
                      { label: "Đã thất bại (Failed)", value: "Failed" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!isChanged}
                size="large"
                icon={<SaveOutlined />}
                block
                className="submit-btn"
              >
                LƯU THÔNG TIN CẬP NHẬT
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </Card>
  );
}
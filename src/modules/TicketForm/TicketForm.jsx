import React, { useEffect } from "react";
import { Button, Form, Select, Card, Space, App, Descriptions, Tag } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { updateTicketAPI, fetchTicketByIdAPI } from "services/ticket";
import dayjs from "dayjs";

export default function TicketForm() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const { state: ticketRaw, loading } = useAsync({
    service: () => fetchTicketByIdAPI(ticketId),
    dependencies: [ticketId],
    condition: !!ticketId,
  });

  // API trả về content: { tickets: {...} } hoặc object trực tiếp
  const ticket = ticketRaw?.tickets ?? ticketRaw?.ticket ?? ticketRaw;

  useEffect(() => {
    if (ticket) {
      form.setFieldsValue({
        paymentStatus: ticket.paymentStatus,
        paymentMethod: ticket.paymentMethod,
      });
    }
  }, [ticket, form]);

  const handleSave = async (values) => {
    try {
      await updateTicketAPI(ticketId, values);
      notification.success({ message: "Cập nhật vé thành công!" });
      navigate(-1);
    } catch (error) {
      notification.error({ message: "Lỗi", description: error.response?.data?.message });
    }
  };

  // Hỗ trợ cả 2 field name: bookedSeat hoặc seatName
  const seats = ticket?.bookedSeat ?? ticket?.seatName ?? [];
  const totalPrice = seats.reduce((t, s) => t + (s.price || 0), 0);

  // Lấy thông tin user (có thể là object populated hoặc string id)
  const user = ticket?.id_user;
  const userName = user?.name || user?.username || user?.email || (typeof user === "string" ? user : "—");
  const userEmail = user?.email || "—";

  // Lấy thông tin showtime (có thể là object populated hoặc string id)
  const showtime = ticket?.id_showtime;
  const movieTitle = showtime?.id_movie?.title || showtime?.movieTitle || "—";
  const theaterName = showtime?.theater?.name || showtime?.theaterName || "—";
  const startTime = showtime?.startTime
    ? dayjs(showtime.startTime.replace(/Z$/, "")).format("DD/MM/YYYY HH:mm")
    : "—";

  return (
    <Card
      loading={loading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          <span>Chi tiết vé</span>
        </Space>
      }
    >
      {ticket && (
        <>
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2 }}
            style={{ marginBottom: 24 }}
            title="Thông tin vé"
          >
            <Descriptions.Item label="Mã giao dịch" span={2}>
              {ticket.transactionId || "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Khách hàng">{userName}</Descriptions.Item>
            <Descriptions.Item label="Email">{userEmail}</Descriptions.Item>

            <Descriptions.Item label="Phim">{movieTitle}</Descriptions.Item>
            <Descriptions.Item label="Phòng chiếu">{theaterName}</Descriptions.Item>

            <Descriptions.Item label="Suất chiếu" span={2}>
              {startTime}
            </Descriptions.Item>

            <Descriptions.Item label="Ghế đã đặt" span={2}>
              <Space wrap>
                {seats.length > 0
                  ? seats.map((s, i) => (
                      <Tag key={s._id || i}>
                        {s.seatNumber} — {s.price?.toLocaleString()} VNĐ
                      </Tag>
                    ))
                  : "—"}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Tổng tiền">
              <strong>{totalPrice.toLocaleString()} VNĐ</strong>
            </Descriptions.Item>

            <Descriptions.Item label="Thời gian đặt">
              {ticket.createdAt
                ? dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")
                : ticket.timeOfBooking
                ? dayjs(ticket.timeOfBooking.replace(/Z$/, "")).format("DD/MM/YYYY HH:mm")
                : "—"}
            </Descriptions.Item>
          </Descriptions>

          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item label="Phương thức thanh toán" name="paymentMethod">
              <Select
                options={[
                  { label: "Tiền mặt", value: "cash" },
                  { label: "MoMo", value: "momo" },
                  { label: "VNPay", value: "vnpay" },
                ]}
              />
            </Form.Item>

            <Form.Item label="Trạng thái thanh toán" name="paymentStatus">
              <Select
                options={[
                  { label: "Pending", value: "Pending" },
                  { label: "Completed", value: "Completed" },
                  { label: "Failed", value: "Failed" },
                ]}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} block>
                CẬP NHẬT VÉ
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </Card>
  );
}

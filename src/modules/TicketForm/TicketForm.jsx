import React, { useEffect } from "react";
import { Button, Form, Select, Card, Space, App, Descriptions, Tag } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { updateTicketAPI } from "services/ticket";
import dayjs from "dayjs";

const fetchTicketDetailAPI = (id) =>
  import("services/ticket").then(({ fetchAllTicketsAPI }) =>
    fetchAllTicketsAPI().then((list) => list.find((t) => t._id === id))
  );

export default function TicketForm() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const { state: ticket, loading } = useAsync({
    service: () => fetchTicketDetailAPI(ticketId),
    dependencies: [ticketId],
    condition: !!ticketId,
  });

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

  const totalPrice = ticket?.bookedSeat?.reduce((t, s) => t + (s.price || 0), 0) || 0;

  return (
    <Card
      loading={loading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          <span>Chỉnh sửa vé</span>
        </Space>
      }
    >
      {ticket && (
        <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Mã vé">{ticket.transactionId}</Descriptions.Item>
          <Descriptions.Item label="Ghế đã đặt">
            {ticket.bookedSeat?.map((s) => (
              <Tag key={s._id}>{s.seatNumber} — {s.price?.toLocaleString()} VNĐ</Tag>
            ))}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            {totalPrice.toLocaleString()} VNĐ
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian đặt">
            {ticket.timeOfBooking
              ? dayjs(ticket.timeOfBooking.replace("Z", "")).format("DD/MM/YYYY HH:mm")
              : "—"}
          </Descriptions.Item>
        </Descriptions>
      )}

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
              { label: "Paid", value: "Paid" },
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
    </Card>
  );
}

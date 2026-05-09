import React, { useEffect } from "react";
import { Button, Form, Select, Card, Space, App, Descriptions, Tag, Divider } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { updateTicketAPI, fetchTicketByIdAPI } from "../../services/ticket";
import dayjs from "dayjs";

export default function TicketForm() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const { state: response, loading } = useAsync({
    service: () => fetchTicketByIdAPI(ticketId),
    dependencies: [ticketId],
    condition: !!ticketId,
  });

  // Truy xuất đúng vào content.ticket từ response data của bạn
  const ticket = response?.content?.ticket || response?.ticket || response;

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
      notification.error({ 
        message: "Lỗi", 
        description: error.response?.data?.message || "Không thể cập nhật" 
      });
    }
  };

  // Ánh xạ đúng trường từ JSON: seatName và user_id
  const seats = ticket?.seatName || [];
  const totalPrice = seats.reduce((t, s) => t + (s.price || 0), 0);

  const user = ticket?.user_id;
  const userName = user?.username || "—";
  const userPhone = user?.userphone || "—";
  const userEmail = user?.email || "—";

  // Định dạng thời gian (Dùng dayjs để format ISO string)
  const startTime = ticket?.startTime
    ? dayjs(ticket.startTime).format("HH:mm DD/MM/YYYY")
    : "—";

  return (
    <Card
      loading={loading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          <span>Chi tiết vé #{ticket?._id?.slice(-6).toUpperCase()}</span>
        </Space>
      }
    >
      {ticket && (
        <>
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2 }}
            style={{ marginBottom: 24 }}
            title="Thông tin khách hàng & Phim"
          >
            <Descriptions.Item label="Khách hàng" className="font-bold">
              {userName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{userPhone}</Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>{userEmail}</Descriptions.Item>
            
            <Descriptions.Item label="ID Phim">{ticket.id_movie}</Descriptions.Item>
            <Descriptions.Item label="ID Rạp">{ticket.id_theater}</Descriptions.Item>
            
            <Descriptions.Item label="Suất chiếu" span={2}>
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                {startTime}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Ghế đã đặt" span={2}>
              <Space wrap>
                {seats.map((s, i) => (
                  <Tag color="orange" key={i}>
                    {s.seatNumber} — {s.price?.toLocaleString()} VNĐ
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Tổng tiền">
              <span style={{ color: '#cf1322', fontWeight: 'bold', fontSize: '16px' }}>
                {totalPrice.toLocaleString()} VNĐ
              </span>
            </Descriptions.Item>
            
            <Descriptions.Item label="Mã giao dịch">
               <code style={{ color: '#0958d9' }}>{ticket.transactionId}</code>
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Chỉnh sửa trạng thái</Divider>

          <Form form={form} layout="vertical" onFinish={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                            { label: "Đang chờ (Pending)", value: "Pending" },
                            { label: "Thành công (Completed)", value: "Completed" },
                            { label: "Thất bại (Failed)", value: "Failed" },
                        ]}
                    />
                </Form.Item>
            </div>

            <Form.Item style={{ marginTop: 16 }}>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" block>
                LƯU THAY ĐỔI
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </Card>
  );
}
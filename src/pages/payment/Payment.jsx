import React, { useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  Card,
  Button,
  Radio,
  Divider,
  Typography,
  Space,
  Modal,
  notification,
  Input,
} from "antd";

import {
  CreditCardOutlined,
  WalletOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  GiftOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchCreateMomoPayment,
  fetchCreateCashPayment,
  fetchCreateVnpayPayment,
  fetchTicketBookingAPI,
} from "services/ticket";

import { fetchValidateCouponAPI } from "services/coupon";

import {
  fetchNotificationAPI,
  formatNotificationsForStore,
} from "services/notificationAndHistory";

import { setNotificationsAction } from "store/actions/user.action";

import { useAsyncMutation } from "hooks/useAsync";

import "./index.scss";

import dayjs from "dayjs";

const { Title, Text } = Typography;

const { confirm } = Modal;

export default function Payment() {
  const userState = useSelector((state) => state.userReducer);

  const dispatch = useDispatch();

  const params = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const { bookingData, movieInfor, theater, time, customerInfo, mode } =
    location.state || {};

  const bookingMutation = useAsyncMutation({
    service: async ({ role, payload }) => fetchTicketBookingAPI(role, payload),

    raw: true,

    onError: (error) => {
      if (error?.response?.status === 409) {
        notification.error({
          message: "Ghế đã được đặt",

          description: "Vui lòng chọn ghế khác.",
        });

        return;
      }

      notification.error({ message: "Đặt vé thất bại" });
    },
  });

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal =
    bookingData?.reduce((total, el) => total + (el.price || 0), 0) || 0;

  const totalAmount = Math.max(0, subtotal - discount);

  if (!bookingData) {
    return <div className="error-state">Không có dữ liệu đơn hàng</div>;
  }

  const refreshNotificationsToStore = async () => {
    const role = userState.userInfor?.user_inf?.role;

    if (!role) return;

    const notiRes = await fetchNotificationAPI(role);

    const formatted = formatNotificationsForStore(notiRes.data?.content);

    dispatch(setNotificationsAction(formatted));
  };

  const handleApplyCoupon = async () => {
    const code = couponInput?.trim();
    if (!code) {
      return notification.warning({ message: "Vui lòng nhập mã giảm giá!" });
    }

    setCouponLoading(true);
    try {
      const res = await fetchValidateCouponAPI(code, subtotal);
      const data = res.data?.content || {};

      setAppliedCode(code.toUpperCase());
      setDiscount(Number(data.discount) || 0);
      notification.success({
        message: "Áp dụng mã thành công",
        description: `Bạn được giảm ${(Number(data.discount) || 0).toLocaleString()} VNĐ`,
      });
    } catch (error) {
      setAppliedCode(null);
      setDiscount(0);
      notification.error({
        message: "Mã giảm giá không hợp lệ",
        description: error?.response?.data?.message || "Vui lòng kiểm tra lại mã",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCode(null);
    setDiscount(0);
    setCouponInput("");
  };

  // Chế độ ĐẶT VÉ — tạo vé Pending, không qua cổng thanh toán

  const handleReserve = async () => {
    confirm({
      title: "Xác nhận đặt vé?",

      content: "Vé sẽ được giữ chỗ, bạn thanh toán tại quầy khi đến rạp.",

      icon: <ExclamationCircleOutlined />,

      okText: "Xác nhận",

      cancelText: "Hủy",

      async onOk() {
        try {
          const payload = {
            user_id: customerInfo?.id || userState.userInfor?.user_inf?.id,

            id_movie: movieInfor?._id,

            id_theater: theater?._id,

            startTime: time,

            showtime_id: params.id,

            timeOfBooking: dayjs().format("YYYY-MM-DD HH:mm:ss"),

            seatName: bookingData.map((seat) => ({
              seatNumber: seat.seatNumber,

              seatType: seat.seatType,

              price: seat.price,

              isBooked: true,
            })),

            couponCode: appliedCode || null,

            paymentMethod: "cash",

            paymentStatus: "Pending",
          };

          await bookingMutation.mutateAsync({
            role: userState.userInfor?.user_inf.role,
            payload,
          });

          await refreshNotificationsToStore();

          navigate("/");
        } catch (error) {
          // handled in mutation onError
        }
      },
    });
  };

  const handleFinishPayment = () => {
    if (!paymentMethod) {
      return notification.warning({
        message: "Vui lòng chọn phương thức thanh toán!",
      });
    }

    confirm({
      title: "Xác nhận đã thanh toán ?",

      icon: <ExclamationCircleOutlined />,

      okText: "Xác nhận",

      cancelText: "Hủy",

      onOk() {
        processBooking();
      },
    });
  };

  const processBooking = async () => {
    try {
      const payload = {
        user_id: userState.userInfor?.user_inf?.id,

        id_movie: movieInfor?._id,

        id_theater: theater?._id,

        startTime: time,

        showtime_id: params.id,

        timeOfBooking: dayjs().format("YYYY-MM-DD HH:mm:ss"),

        seatName: bookingData.map((seat) => ({
          seatNumber: seat.seatNumber,

          seatType: seat.seatType,

          price: seat.price,

          isBooked: true,
        })),

        couponCode: appliedCode || null,

        paymentMethod: paymentMethod,

        paymentStatus: "Pending",
      };

      const result = await bookingMutation.mutateAsync({
        role: userState.userInfor?.user_inf?.role,
        payload,
      });

      await refreshNotificationsToStore();

      const success = result?.data?.success;

      const ticket = result?.data?.content;

      if (success) {
        notification.success({
          message: "Thành công",

          description: "Đặt vé thành công!",
        });
      } else {
        const errorMsg = result?.data?.message;

        notification.error({
          message: "Đặt vé thất bại",

          description: Array.isArray(errorMsg)
            ? errorMsg.join(" | ")
            : errorMsg || "Lỗi không xác định từ hệ thống",
        });
      }

      if (!ticket) {
        return;
      }

      const keyword = ticket.paymentMethod?.toLowerCase();

      if (keyword === "cash") {
        await fetchCreateCashPayment(ticket);

        setTimeout(() => {
          const paymentState = {
            payUrl: null,
            booking: ticket,
            method: ticket.paymentMethod,
          };
          sessionStorage.setItem(
            "paymentResultState",
            JSON.stringify(paymentState),
          );

          const targetUrl = `/payment-result?status=success&method=cash&ticketId=${ticket._id}`;

          window.open(targetUrl, "_blank");
        }, 2000);
      }

      if (keyword === "momo") {
        const getCode = await fetchCreateMomoPayment(ticket);

        const payUrl = getCode?.data?.content?.paymentUrl;

        notification.success({ message: "Đang chuyển hướng đến MoMo..." });

        setTimeout(() => window.open(payUrl, "_blank"), 2000);
      }

      if (keyword === "internet banking") {
        const getCode = await fetchCreateVnpayPayment(ticket);

        const payUrl = getCode?.data?.content?.paymentUrl;

        notification.success({ message: "Đang chuyển hướng đến VNpay..." });

        setTimeout(() => window.open(payUrl, "_blank"), 2000);
      }
    } catch (error) {
      console.error("Qúa trình bị gián đoạn.", error);
    }
  };

  return (
    <div className="payment-page">
      <Button
        className="btn-back"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/booking/${params.id}`)}
      >
        Quay lại
      </Button>

      <div className="payment-container">
        {/* PHẦN CHỌN PHƯƠNG THỨC — ẩn khi mode=reserve */}

        {mode !== "reserve" && (
          <Card className="payment-methods" title="Chọn phương thức thanh toán">
            <Radio.Group
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              className="method-group"
            >
              <Space direction="vertical">
                <Radio.Button
                  value="internet banking"
                  className="payment-radio-btn"
                >
                  <CreditCardOutlined /> Internet Banking - VNpay
                </Radio.Button>

                <Radio.Button value="momo" className="payment-radio-btn">
                  <WalletOutlined /> Ví MoMo
                </Radio.Button>

                <Radio.Button
                  value="cash"
                  className="payment-radio-btn"
                  disabled={
                    userState.userInfor?.user_inf.role === "customer"
                      ? true
                      : false
                  }
                >
                  <DollarOutlined /> Thanh toán tại quầy
                </Radio.Button>
              </Space>
            </Radio.Group>
          </Card>
        )}

        {/* PHẦN THÔNG TIN ĐƠN HÀNG */}

        <Card className="order-info" title="Thông tin đơn hàng">
          <Title level={4} className="order-title">
            {movieInfor?.title}
          </Title>

          <p>
            <b>Rạp:</b> {theater?.branch}
          </p>

          <p>
            <b>Phòng:</b> {theater?.name}
          </p>

          <p>
            <b>Thời gian:</b>{" "}
            {dayjs(time?.replace("Z", "")).format("DD/MM/YYYY HH:mm")}
          </p>

          <Divider />

          <p>
            <b>Ghế:</b> {bookingData?.map((el) => el.seatNumber).join(", ")}
          </p>

          <p>
            <b>Số lượng:</b> {bookingData.length} ghế
          </p>

          <Divider />

          {/* PHẦN NHẬP MÃ GIẢM GIÁ */}

          <div className="coupon-section">
            {!appliedCode ? (
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  prefix={<GiftOutlined />}
                  placeholder="Nhập mã giảm giá (VD: GIAM20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onPressEnter={handleApplyCoupon}
                />
                <Button
                  type="primary"
                  onClick={handleApplyCoupon}
                  loading={couponLoading}
                >
                  Áp dụng
                </Button>
              </Space.Compact>
            ) : (
              <div className="coupon-applied">
                <Text strong style={{ color: "var(--success)" }}>
                  <GiftOutlined /> Mã {appliedCode} đã áp dụng
                </Text>
                <Button type="link" size="small" onClick={handleRemoveCoupon}>
                  Xóa mã
                </Button>
              </div>
            )}
          </div>

          <Divider />

          <div className="total-section">
            <Text strong className="total-label">
              Tạm tính:
            </Text>

            <Text className="total-amount">
              {subtotal.toLocaleString()} VNĐ
            </Text>
          </div>

          {discount > 0 && (
            <div className="total-section discount-line">
              <Text strong className="total-label">
                Giảm giá:
              </Text>

              <Text type="danger" className="total-amount">
                -{discount.toLocaleString()} VNĐ
              </Text>
            </div>
          )}

          <Divider />

          <div className="total-section">
            <Text strong className="total-label">
              Tổng cộng:
            </Text>

            <Title level={5} className="total-amount">
              {totalAmount.toLocaleString()} VNĐ
            </Title>
          </div>

          {mode === "reserve" ? (
            <Button
              type="default"
              size="large"
              block
              className="btn-confirm"
              onClick={handleReserve}
              loading={bookingMutation.isLoading}
            >
              XÁC NHẬN ĐẶT VÉ
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              block
              className="btn-confirm"
              onClick={handleFinishPayment}
              loading={bookingMutation.isLoading}
            >
              XÁC NHẬN THANH TOÁN
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
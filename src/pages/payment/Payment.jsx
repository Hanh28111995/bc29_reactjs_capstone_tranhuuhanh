import React, { useRef, useState } from "react";

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
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

const { confirm } = Modal;

export default function Payment() {
  const { t } = useTranslation();
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
          message: t("payment.seatTaken"),

          description: t("payment.chooseOtherSeat"),
        });

        return;
      }

      notification.error({ message: t("payment.bookingFailed") });
    },
  });

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const bookingFlowRef = useRef(false);

  const subtotal =
    bookingData?.reduce((total, el) => total + (el.price || 0), 0) || 0;

  const totalAmount = Math.max(0, subtotal - discount);

  if (!bookingData) {
    return <div className="error-state">{t("payment.orderMissing")}</div>;
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
      return notification.warning({ message: t("payment.enterCoupon") });
    }

    setCouponLoading(true);
    try {
      const res = await fetchValidateCouponAPI(code, subtotal);
      const data = res.data?.content || {};

      setAppliedCode(code.toUpperCase());
      setDiscount(Number(data.discount) || 0);
      notification.success({
        message: t("payment.couponApplied"),
        description: t("payment.couponDiscount", {
          amount: (Number(data.discount) || 0).toLocaleString(),
        }),
      });
    } catch (error) {
      setAppliedCode(null);
      setDiscount(0);
      notification.error({
        message: t("payment.couponInvalid"),
        description: error?.response?.data?.message || t("payment.checkCoupon"),
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

  const handleReserve = () => {
    if (bookingFlowRef.current) return;
    bookingFlowRef.current = true;

    confirm({
      title: t("payment.confirmReservation"),

      content: t("payment.reservationInstructions"),

      icon: <ExclamationCircleOutlined />,

      okText: t("payment.confirm"),

      cancelText: t("payment.cancel"),

      onCancel() {
        bookingFlowRef.current = false;
      },

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
        } finally {
          bookingFlowRef.current = false;
        }
      },
    });
  };

  const handleFinishPayment = () => {
    if (bookingFlowRef.current) return;

    if (!paymentMethod) {
      return notification.warning({
        message: t("payment.chooseMethod"),
      });
    }

    bookingFlowRef.current = true;
    confirm({
      title: t("payment.confirmPayment"),

      icon: <ExclamationCircleOutlined />,

      okText: t("payment.confirm"),

      cancelText: t("payment.cancel"),

      onCancel() {
        bookingFlowRef.current = false;
      },

      onOk() {
        return processBooking();
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
          message: t("payment.success"),

          description: t("payment.bookingSuccess"),
        });
      } else {
        const errorMsg = result?.data?.message;

        notification.error({
          message: t("payment.bookingFailed"),

          description: Array.isArray(errorMsg)
            ? errorMsg.join(" | ")
            : errorMsg || t("payment.unknownSystemError"),
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

        notification.success({ message: t("payment.redirectingMomo") });

        setTimeout(() => window.open(payUrl, "_blank"), 2000);
      }

      if (keyword === "internet banking") {
        const getCode = await fetchCreateVnpayPayment(ticket);

        const payUrl = getCode?.data?.content?.paymentUrl;

        notification.success({ message: t("payment.redirectingVnpay") });

        setTimeout(() => window.open(payUrl, "_blank"), 2000);
      }
    } catch (error) {
      console.error("Qúa trình bị gián đoạn.", error);
    } finally {
      bookingFlowRef.current = false;
    }
  };

  return (
    <div className="payment-page">
      <Button
        className="btn-back"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/booking/${params.id}`)}
      >
        {t("common.back")}
      </Button>

      <div className="payment-container">
        {/* PHẦN CHỌN PHƯƠNG THỨC — ẩn khi mode=reserve */}

        {mode !== "reserve" && (
          <Card className="payment-methods" title={t("payment.methodTitle")}>
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
                  <CreditCardOutlined /> {t("payment.internetBanking")}
                </Radio.Button>

                <Radio.Button value="momo" className="payment-radio-btn">
                  <WalletOutlined /> {t("payment.momoWallet")}
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
                  <DollarOutlined /> {t("payment.cashAtCinema")}
                </Radio.Button>
              </Space>
            </Radio.Group>
          </Card>
        )}

        {/* PHẦN THÔNG TIN ĐƠN HÀNG */}

        <Card className="order-info" title={t("payment.orderTitle")}>
          <Title level={4} className="order-title">
            {movieInfor?.title}
          </Title>

          <p>
            <b>{t("payment.cinema")}</b> {theater?.branch}
          </p>

          <p>
            <b>{t("payment.room")}</b> {theater?.name}
          </p>

          <p>
            <b>{t("payment.time")}</b>{" "}
            {dayjs(time?.replace("Z", "")).format("DD/MM/YYYY HH:mm")}
          </p>

          <Divider />

          <p>
            <b>{t("payment.seats")}</b> {bookingData?.map((el) => el.seatNumber).join(", ")}
          </p>

          <p>
            <b>{t("payment.seatCount")}</b> {bookingData.length} {t("payment.seatUnit")}
          </p>

          <Divider />

          {/* PHẦN NHẬP MÃ GIẢM GIÁ */}

          <div className="coupon-section">
            {!appliedCode ? (
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  prefix={<GiftOutlined />}
                  placeholder={t("payment.couponPlaceholder")}
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onPressEnter={handleApplyCoupon}
                />
                <Button
                  type="primary"
                  onClick={handleApplyCoupon}
                  loading={couponLoading}
                >
                  {t("common.apply")}
                </Button>
              </Space.Compact>
            ) : (
              <div className="coupon-applied">
                <Text strong style={{ color: "var(--success)" }}>
                  <GiftOutlined /> {t("payment.couponApplied")}: {appliedCode}
                </Text>
                <Button type="link" size="small" onClick={handleRemoveCoupon}>
                  {t("payment.couponRemove")}
                </Button>
              </div>
            )}
          </div>

          <Divider />

          <div className="total-section">
            <Text strong className="total-label">
              {t("payment.subtotal")}
            </Text>

            <Text className="total-amount">
              {subtotal.toLocaleString()} {t("booking.currency")}
            </Text>
          </div>

          {discount > 0 && (
            <div className="total-section discount-line">
              <Text strong className="total-label">
                {t("payment.discount")}
              </Text>

              <Text type="danger" className="total-amount">
                -{discount.toLocaleString()} {t("booking.currency")}
              </Text>
            </div>
          )}

          <Divider />

          <div className="total-section">
            <Text strong className="total-label">
              {t("payment.grandTotal")}
            </Text>

            <Title level={5} className="total-amount">
              {totalAmount.toLocaleString()} {t("booking.currency")}
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
              {t("payment.confirmReservationButton")}
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
              {t("payment.confirmPaymentButton")}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
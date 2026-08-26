import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Button, Result, message } from "antd";
import { fetchCancelTicketAPI, fetchTicketByIdAPI } from "services/ticket";
import { useSelector } from "react-redux";
import { useAsync, useAsyncMutation } from "hooks/useAsync";

export default function PaymentResult() {
  const userState = useSelector((state) => state.userReducer);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState(null); // 'success' | 'error'

  // Lấy params từ URL và state (phòng trường hợp mở tab mới từ window.open, ta fallback qua sessionStorage)
  const successParam = searchParams.get("status");
  const methodParam = searchParams.get("method");

  const savedPaymentState = JSON.parse(
    sessionStorage.getItem("paymentResultState") || "null",
  );

  const bookingId =
    location.state?.booking?._id || savedPaymentState?.booking?._id;
  const paymentMethod = (
    location.state?.method ||
    methodParam ||
    savedPaymentState?.method
  )?.toLowerCase();

  // Gọi API xác thực đơn hàng (chỉ gọi khi có bookingId và không phải tiền mặt)
  const {
    state: ticketData,
    loading: verifying,
    isError: verifyError,
  } = useAsync({
    service: () => fetchTicketByIdAPI(bookingId),
    enabled: Boolean(bookingId && paymentMethod !== "cash"),
    queryKey: ["paymentResult", bookingId],
  });

  const cancelMutation = useAsyncMutation({
    service: async ({ role, payload }) => fetchCancelTicketAPI(role, payload),
    raw: true,
    onError: (error) => {
      console.error("Update Status Failed:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
    },
  });

  useEffect(() => {
    // Nếu là thanh toán tiền mặt tại quầy (được mở qua tab mới hoặc luồng cash)
    if (paymentMethod === "cash") {
      setStatus("success");
      return;
    }

    if (verifying) {
      return;
    }

    if (verifyError) {
      setStatus("error");
      return;
    }

    const currentStatus = ticketData?.paymentStatus;
    if (currentStatus === "Completed") {
      setStatus("success");
    } else if (currentStatus === "Failed" || currentStatus === "Cancelled") {
      setStatus("error");
    }
  }, [paymentMethod, ticketData, verifying, verifyError]);

  // Đang xác thực (hiển thị loading)
  if (verifying && paymentMethod !== "cash") {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin
          size="large"
          tip="Đang xác thực giao dịch từ cổng thanh toán..."
        />
      </div>
    );
  }

  const isSuccess =
    successParam === "success" ||
    status === "success" ||
    paymentMethod === "cash";

  return (
    <div className="payment-result-container" style={{ padding: "50px" }}>
      {isSuccess ? (
        <Result
          status="success"
          title={
            paymentMethod === "cash"
              ? "Đặt Chỗ Giữ Ghế Thành Công!"
              : "Thanh Toán Thành Công!"
          }
          subTitle={
            paymentMethod === "cash"
              ? "Vui lòng đến rạp trước giờ chiếu để thanh toán và nhận vé."
              : "Cảm ơn bạn đã tin tưởng sử dụng dịch vụ đặt vé xem phim của chúng tôi."
          }
          extra={[
            <Button type="primary" key="home" onClick={() => navigate("/")}>
              Quay lại trang chủ
            </Button>,
            <Button key="history" onClick={() => navigate("/user-management")}>
              Lịch sử đặt vé
            </Button>,
          ]}
        />
      ) : (
        <Result
          status="error"
          title="Giao dịch không thành công"
          subTitle="Giao dịch đã bị hủy hoặc có lỗi xảy ra trong quá trình xử lý thanh toán."
          extra={[
            <Button type="primary" key="retry" onClick={() => navigate("/")}>
              Quay lại trang chủ
            </Button>,
          ]}
        />
      )}
    </div>
  );
}

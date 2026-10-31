import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Button, Result, message } from "antd";
import { fetchCancelTicketAPI, fetchTicketByIdAPI } from "services/ticket";
import { useSelector } from "react-redux";
import { useAsync, useAsyncMutation } from "hooks/useAsync";
import { useTranslation } from "react-i18next";

export default function PaymentResult() {
  const { t } = useTranslation();
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
      message.error(t("paymentResult.errorTryAgain"));
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
          tip={t("paymentResult.verifyLoading")}
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
              ? t("paymentResult.reservedSuccess")
              : t("paymentResult.paymentSuccess")
          }
          subTitle={
            paymentMethod === "cash"
              ? t("paymentResult.cashInstructions")
              : t("paymentResult.thankYou")
          }
          extra={[
            <Button type="primary" key="home" onClick={() => navigate("/")}>
              {t("paymentResult.home")}
            </Button>,
            <Button key="history" onClick={() => navigate("/user-management")}>
              {t("paymentResult.history")}
            </Button>,
          ]}
        />
      ) : (
        <Result
          status="error"
          title={t("paymentResult.failureTitle")}
          subTitle={t("paymentResult.failureDescription")}
          extra={[
            <Button type="primary" key="retry" onClick={() => navigate("/")}>
              {t("paymentResult.home")}
            </Button>,
          ]}
        />
      )}
    </div>
  );
}

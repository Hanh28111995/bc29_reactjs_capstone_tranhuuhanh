import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Button, Result, Modal, message } from "antd";
import {
  fetchCancelTicketAPI,  
  fetchTicketByIdAPI,
} from "services/ticket";
import { useSelector } from "react-redux";
import { useAsync, useAsyncMutation } from "hooks/useAsync";

export default function PaymentResult() {
  const userState = useSelector((state) => state.userReducer);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [cashModal, setCashModal] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const successParam = searchParams.get("status");
  const bookingId = location.state?.booking?._id;
  const paymentMethod = location.state?.method?.toLowerCase(); // Lấy từ state truyền sang

  const {
    state: ticketData,
    loading: verifying,
    isError: verifyError,
  } = useAsync({
    service: () => fetchTicketByIdAPI(bookingId),
    enabled: Boolean(bookingId && paymentMethod !== 'cash'),
    queryKey: ['paymentResult', bookingId],
  });

  const cancelMutation = useAsyncMutation({
    service: async ({ role, payload }) => fetchCancelTicketAPI(role, payload),
    raw: true,
    onError: (error) => {
      console.error('Update Status Failed:', error);
      message.error('Có lỗi xảy ra, vui lòng thử lại.');
    },
  });

  useEffect(() => {
    if (paymentMethod === 'cash') {
      setStatus(null);
      return;
    }

    if (verifying) {
      return;
    }

    if (verifyError) {
      setStatus('error');
      return;
    }

    const currentStatus = ticketData?.paymentStatus;
    if (currentStatus === 'Completed') {
      setStatus('success');
    } else if (currentStatus === 'Failed' || currentStatus === 'Cancelled') {
      setStatus('error');
    }
  }, [paymentMethod, ticketData, verifying, verifyError]);  
  

  if (verifying)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" tip="Đang xác thực giao dịch..." />
      </div>
    );

  return (
    <>
      <div className="payment-result-container" style={{ padding: "50px" }}>
        {/* Chỉ hiển thị kết quả khi đã có status hoặc có params từ cổng thanh toán */}
        {successParam === "success" || status === "success" ? (
          <Result
            status="success"
            title="Thanh Toán Thành Công!"
            subTitle="Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi."
            extra={[
              <Button type="primary" key="home" onClick={() => navigate("/")}>
                Quay lại trang chủ
              </Button>,
              <Button
                key="history"
                onClick={() => navigate("/user-management")}
              >
                Lịch sử đặt vé
              </Button>,
            ]}
          />
        ) : (
          // Chỉ hiện thông báo lỗi khi thực sự thất bại, tránh hiện nhầm khi đang chờ Modal
          (status === "error" ||
            (successParam && successParam !== "success")) && (
            <Result
              status="error"
              title="Giao dịch không thành công"
              subTitle="Giao dịch đã bị hủy hoặc có lỗi xảy ra trong quá trình thanh toán."
              extra={[
                <Button
                  type="primary"
                  key="retry"
                  onClick={() => navigate("/")}
                >
                  Quay lại trang chủ
                </Button>,
              ]}
            />
          )
        )}
      </div>
    </>
  );
}

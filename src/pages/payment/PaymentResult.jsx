import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Button, Result, Modal, message } from "antd";
import {
  fetchCancelTicketAPI,
  fetchCompletedTicketAPI,
  fetchTicketByIdAPI,
} from "services/ticket";
import { useSelector } from "react-redux";

export default function PaymentResult() {
  const userState = useSelector((state) => state.userReducer);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State quản lý luồng
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Loading cho nút bấm Modal
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [cashModal, setCashModal] = useState(true);

  const successParam = searchParams.get("status");
  const bookingId = location.state?.booking?._id;
  const paymentMethod = location.state?.method?.toLowerCase(); // Lấy từ state truyền sang

  useEffect(() => {
    const verifyPayment = async () => {
      // Nếu là Cash, không cần verify ngay, chờ Modal xác nhận
      if (paymentMethod === "cash") {
        setLoading(false);
        return;
      }

      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetchTicketByIdAPI(bookingId);
        const currentStatus = res.data?.content?.paymentStatus;

        if (currentStatus === "Completed") {
          setStatus("success");
        } else if (
          currentStatus === "Failed" ||
          currentStatus === "Cancelled"
        ) {
          setStatus("error");
        }
      } catch (error) {
        console.error("Verify Error:", error);
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [bookingId, paymentMethod]);

  // Hàm xử lý cập nhật trạng thái vé (Dùng chung cho OK/Cancel)
  const handleCancelTicket = async () => {
    setIsProcessing(true);
    try {
      await fetchCancelTicketAPI(
        userState.userInfor?.user_inf?.role,
        location.state?.booking,
      );
      setCashModal(false);
      setStatus("error");
    } catch (error) {
      console.error("Update Status Failed:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleCompletedTicket = async () => {
    setCashModal(false);
    setStatus("success");
    message.success("Xác nhận thanh toán thành công!");    
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" tip="Đang xác thực giao dịch..." />
      </div>
    );

  return (
    <>
      {/* Modal xác nhận riêng cho phương thức Tiền mặt */}
      {paymentMethod === "cash" && (
        <Modal
          title="Xác nhận đơn hàng"
          open={cashModal}
          closable={false} // Tránh khách đóng modal bằng dấu X
          maskClosable={false} // Tránh kích ra ngoài làm mất modal
          confirmLoading={isProcessing}
          onOk={() => handleCompletedTicket()}
          onCancel={() => handleCancelTicket()}
          okText="Xác nhận"
          cancelText="Hủy đặt vé"
          cancelButtonProps={{ danger: true, disabled: isProcessing }}
        >
          {userState.userInfor?.user_inf?.role === "customer" ? (
            <div style={{ padding: "10px 0" }}>
              <p>
                Bạn đã chọn thanh toán bằng <b>tiền mặt</b> tại rạp.
              </p>
              <p>Vui lòng xác nhận để giữ chỗ. Bạn cần đến nhận vé đúng giờ!</p>
            </div>
          ) : (
            <p>Xác nhận nhân viên đã nhận tiền mặt từ khách hàng?</p>
          )}
        </Modal>
      )}

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

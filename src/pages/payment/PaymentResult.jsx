import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Button, Result, Modal } from "antd";
import { fetchCheckPayment, updateTicketAPI } from "services/ticket";
import { useSelector } from "react-redux";

export default function PaymentResult() {
  const userState = useSelector((state) => state.userReducer);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success' hoặc 'error'
  const [cashModal, setCashModal] = useState(true);
  const [searchParams] = useSearchParams();

  const success = searchParams.get("status") || null;

  const bookingId = location.state?.booking?._id;

  useEffect(() => {
    const verifyPayment = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetchCheckPayment(bookingId);
        const currentStatus = res.data?.content?.status;

        if (currentStatus === "Paid") {
          setStatus("success");
        } else if (currentStatus === "Failed") {
          setStatus("error");
        }
      } catch (error) {
        console.error("Verify Error:", error);
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [bookingId]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" tip="Đang xác thực..." />
      </div>
    );

  return (
    <>
      {/* Logic hiển thị Checkout / Cash Modal */}
      {location.state?.method?.toLowerCase() !== "cash" ? (
        <></>
      ) : (
        <Modal
          title="Xác nhận thanh toán"
          open={cashModal}
          // SỬA: Chuyển trực tiếp thành async function
          onOk={async () => {
            try {
              await updateTicketAPI(bookingId, {
                ...location.state?.booking,
                paymentStatus: "Completed",
              });
              // Chỉ đóng modal và báo success sau khi API chạy xong
              setCashModal(false);
              setStatus("success");
            } catch (error) {
              console.error("Update Ticket Failed:", error);
              // Có thể thêm thông báo lỗi ở đây
            }
          }}
          onCancel={async () => {
            try {
              await updateTicketAPI(bookingId, {
                ...location.state?.booking,
                paymentStatus: "Cancelled",
              });
              setCashModal(false);
              setStatus("error");
            } catch (error) {
              console.error("Cancel Ticket Failed:", error);
            }
          }}
          okText="YES"
          cancelText="NO"
        >
          {userState.userInfor?.user_inf?.role === "customer" ? (
            <>
              <p>Bạn đã chọn thanh toán bằng tiền mặt tại rạp.</p>
              <p>Vui lòng xác nhận bạn sẽ đến nhận vé đúng giờ!</p>
            </>
          ) : (
            <p>Xác nhận đã nhận tiền mặt?</p>
          )}
        </Modal>
      )}

      {/* Hiển thị kết quả cuối cùng */}
      <div className="payment-result-container" style={{ padding: "50px" }}>
        {(success === "success" || status === "success") && (
          <Result
            status="success"
            title="Thanh Toán Thành Công!"
            subTitle="Cảm ơn bạn đã sử dụng dịch vụ."
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
        )}

        {success !== "success" && status !== "success" && (
          <Result
            status="error"
            title="Thanh Toán Thất Bại"
            subTitle="Giao dịch đã bị hủy hoặc có lỗi xảy ra."
            extra={[
              <Button type="primary" key="retry" onClick={() => navigate("/")}>
                Quay lại trang chủ
              </Button>,
            ]}
          />
        )}
      </div>
    </>
  );
}

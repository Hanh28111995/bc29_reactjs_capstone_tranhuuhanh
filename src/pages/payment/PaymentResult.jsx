import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spin, Button, Result, Modal } from 'antd';
import Checkout from './Checkout';
import { fetchCheckPayment } from 'services/ticket';
import { fetchCancelBookingAPI } from 'services/customer';
import { useSelector } from 'react-redux';




export default function PaymentResult() {
    const userState = useSelector((state) => state.userReducer);
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null); // 'success' hoặc 'error'
    const [CashModal, setCashModal] = useState(true);

    // Lấy bookingId linh hoạt từ state hoặc URL
    const bookingId = location.state?.bookingId;

    useEffect(() => {
        const verifyPayment = async () => {
            if (!bookingId) {
                setLoading(false);
                return;
            }

            try {
                // Gọi API lấy trạng thái từ sendSuccess(res, "Trạng thái vé", { status: ticket.status })
                const res = await fetchCheckPayment(bookingId);
                const currentStatus = res.data.data.status;

                if (currentStatus === 'Paid') {
                    setStatus('success'); // Gán status sẽ làm Modal tự đóng
                } else if (currentStatus === 'Failed') {
                    setStatus('error');
                }
            } catch (error) {
                setStatus('error');
                console.error("Verify Error:", error);
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [location.search, bookingId]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" tip="Đang xác thực giao dịch..." /></div>;

    return (
        <>
            {(location.state?.method.toLowerCase() !== 'cash') ?
                (< Checkout
                    payUrl={location.state?.payUrl}
                    bookingId={bookingId}
                    open={!!location.state?.payUrl && !status && !loading}
                    onCancel={() => navigate('/')}
                />)
                : (<Modal
                    title="Xác nhận thanh toán"
                    open={CashModal}
                    onOk={() => setCashModal(false)}
                    onCancel={async () => { await fetchCancelBookingAPI(userState.userInfor?.user_inf.role, bookingId, userState.userInfor?.user_inf.id); navigate(-2) }}
                    okText="YES"
                    cancelText="NO"
                >
                    <p>Bạn đã chọn thanh toán bằng tiền mặt tại rạp.</p>
                    <p>Vui lòng xác nhận bạn sẽ đến nhận vé đúng giờ!</p>
                </Modal>
                )}

            <div className="payment-result-container" style={{ padding: '50px' }}>
                {status === 'success' && (
                    <Result
                        status="success"
                        title="Thanh Toán Thành Công!"
                        subTitle="Cảm ơn bạn đã sử dụng dịch vụ. Thông tin vé đã được gửi vào lịch sử đặt vé."
                        extra={[
                            <Button type="primary" key="home" onClick={() => navigate('/')}>Quay lại trang chủ</Button>,
                            <Button key="history" onClick={() => navigate('/user-management')}>Xem lịch sử đặt vé</Button>
                        ]}
                    />
                )}

                {status === 'error' && (
                    <Result
                        status="error"
                        title="Thanh Toán Thất Bại"
                        subTitle="Có lỗi xảy ra hoặc giao dịch đã bị hủy. Vui lòng kiểm tra lại."
                        extra={[
                            <Button type="primary" key="retry" onClick={() => navigate('/')}>Quay lại trang chủ</Button>
                        ]}
                    />
                )}
            </div>
        </>
    );
}
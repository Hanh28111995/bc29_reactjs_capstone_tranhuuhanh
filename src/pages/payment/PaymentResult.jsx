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
    const [cashModal, setCashModal] = useState(true);

    const bookingId = location.state?.bookingId;

    useEffect(() => {
        const verifyPayment = async () => {
            if (!bookingId) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetchCheckPayment(bookingId);
                const currentStatus = res.data?.content?.status;

                if (currentStatus === 'Paid') {
                    setStatus('success');
                } else if (currentStatus === 'Failed') {
                    setStatus('error');
                }
                // Nếu là 'Pending', status vẫn là null để Modal Checkout có thể mở
            } catch (error) {
                console.error("Verify Error:", error);
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [bookingId]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" tip="Đang xác thực..." /></div>;

    return (
        <>
            {/* Logic hiển thị Checkout / Cash Modal */}
            {location.state?.method?.toLowerCase() !== 'cash' ? (
                <Checkout
                    payUrl={location.state?.payUrl}
                    bookingId={bookingId}
                    setStatus={setStatus} // Truyền hàm để con báo cáo trạng thái cho cha
                    // MODAL CHỈ MỞ KHI: Có URL và status vẫn đang là null (chưa Paid/Failed)
                    open={!!location.state?.payUrl && status === null}
                    onCancel={() => navigate('/')}
                />
            ) : (
                <Modal
                    title="Xác nhận thanh toán"
                    open={cashModal}
                    onOk={() => { setCashModal(false); setStatus('success'); }}
                    onCancel={async () => {
                        await fetchCancelBookingAPI(userState.userInfor?.user_inf.role, bookingId, userState.userInfor?.user_inf.id);
                        navigate(-2);
                    }}
                    okText="YES"
                    cancelText="NO"
                >
                    <p>Bạn đã chọn thanh toán bằng tiền mặt tại rạp.</p>
                    <p>Vui lòng xác nhận bạn sẽ đến nhận vé đúng giờ!</p>
                </Modal>
            )}

            {/* Hiển thị kết quả cuối cùng */}
            <div className="payment-result-container" style={{ padding: '50px' }}>
                {status === 'success' && (
                    <Result
                        status="success"
                        title="Thanh Toán Thành Công!"
                        subTitle="Cảm ơn bạn đã sử dụng dịch vụ."
                        extra={[
                            <Button type="primary" key="home" onClick={() => navigate('/')}>Quay lại trang chủ</Button>,
                            <Button key="history" onClick={() => navigate('/user-management')}>Lịch sử đặt vé</Button>
                        ]}
                    />
                )}

                {status === 'error' && (
                    <Result
                        status="error"
                        title="Thanh Toán Thất Bại"
                        subTitle="Giao dịch đã bị hủy hoặc có lỗi xảy ra."
                        extra={[
                            <Button type="primary" key="retry" onClick={() => navigate('/')}>Quay lại trang chủ</Button>
                        ]}
                    />
                )}
            </div>
        </>
    );
}
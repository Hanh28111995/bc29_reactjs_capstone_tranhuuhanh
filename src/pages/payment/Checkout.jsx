import React, { useEffect } from 'react';
import { Modal } from 'antd';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { fetchCheckPayment } from 'services/ticket';

export default function Checkout(props) {
    // Thêm setStatus từ props để cập nhật ngược lại cho PaymentResult
    const { payUrl, open, onCancel, bookingId, setStatus } = props;
    const navigate = useNavigate();

    useEffect(() => {
        let pollingInterval;

        if (open && bookingId) {
            pollingInterval = setInterval(async () => {
                try {
                    const response = await fetchCheckPayment(bookingId);

                    // Sửa lỗi truy cập: response.data.content.status (theo log của bạn)
                    const currentStatus = response.data?.content?.status;

                    // Nếu trạng thái đã thay đổi (thành công hoặc thất bại)
                    if (currentStatus === 'Paid' || currentStatus === 'Failed') {
                        clearInterval(pollingInterval);

                        // Cập nhật trạng thái cho cha để trigger việc đóng Modal và hiện Result
                        const finalStatus = currentStatus === 'Paid' ? 'success' : 'error';
                        setStatus(finalStatus);

                        // Điều hướng an toàn
                        navigate('/payment-result', {
                            state: {
                                ...window.history.state?.usr,
                                status: finalStatus,
                                bookingId
                            },
                            replace: true
                        });
                    }
                } catch (error) {
                    console.error("Lỗi Polling:", error);
                }
            }, 3000);
        }

        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [open, bookingId, navigate, setStatus]);

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
            centered
            maskClosable={false}
        >
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <h3 style={{ marginBottom: '20px' }}>Quét mã QR để thanh toán</h3>
                <div style={{ background: '#fff', padding: '20px', display: 'inline-block', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                    <QRCodeCanvas value={payUrl} size={256} />
                </div>
                <p style={{ marginTop: '20px' }}>Hệ thống sẽ tự động cập nhật khi bạn hoàn tất giao dịch.</p>
                <a href={payUrl} target="_blank" rel="noopener noreferrer">Thanh toán trực tiếp qua ví</a>
            </div>
        </Modal>
    );
}
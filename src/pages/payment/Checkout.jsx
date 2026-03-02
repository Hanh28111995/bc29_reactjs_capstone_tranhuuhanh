import { useEffect } from 'react';
import { Modal } from 'antd';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios'; // Đảm bảo đã install axios
import { useNavigate } from 'react-router-dom';
import { fetchCheckPayment } from 'services/ticket';

export default function Checkout(props) {
    // Lấy thêm props để quản lý việc đóng mở và định danh vé
    const { payUrl, open, onCancel, bookingId } = props;
    const navigate = useNavigate();

    useEffect(() => {
        let pollingInterval;

        // Chỉ bắt đầu Polling khi Modal đang mở và có bookingId
        if (open && bookingId) {
            pollingInterval = setInterval(async () => {
                try {
                    // Gọi API kiểm tra trạng thái vé từ Backend của bạn
                    const response = await fetchCheckPayment(bookingId);
                    const { status } = response.data?.content.status;

                    if (status === 'Paid' || status === 'Failed') {
                        // 1. Dừng Polling ngay lập tức
                        clearInterval(pollingInterval);

                        // 2. Gọi hàm onCancel từ props để đóng Modal Antd
                        onCancel();

                        // 3. Điều hướng sang trang kết quả kèm trạng thái
                        navigate('/payment-result', {
                            state: {
                                status: status === 'Paid' ? 'success' : 'failed',
                                bookingId
                            }
                        });
                    }
                } catch (error) {
                    console.error("Lỗi kiểm tra trạng thái đơn hàng:", error);
                }
            }, 3000); // 3 giây kiểm tra một lần
        }

        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [open, bookingId, navigate, onCancel]);

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnClose // Đảm bảo reset lại state khi đóng
            centered
        >
            <div className="checkout-container" style={{ textAlign: 'center', padding: '40px' }}>
                <h3 style={{ marginBottom: '20px' }}>Thanh toán đơn hàng</h3>

                <div style={{ background: '#fff', padding: '20px', display: 'inline-block', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {/* Sử dụng payUrl để tạo mã QR */}
                    <QRCodeCanvas value={payUrl} size={256} />
                </div>

                <p style={{ marginTop: '20px' }}>Quét mã QR bằng ứng dụng Ngân hàng hoặc Ví điện tử</p>

                <div style={{ marginTop: '20px' }}>
                    <span>Hoặc </span>
                    <a href={payUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'underline' }}>
                        Thanh toán trực tiếp qua cổng thanh toán
                    </a>
                </div>
            </div>
        </Modal>
    );
}
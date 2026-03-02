import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Radio, Divider, Typography, Space, Modal, notification } from 'antd';
import { CreditCardOutlined, WalletOutlined, DollarOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { fetchTicketBookingAPI } from 'services/customer';
import "./index.scss"; // Import file scss mới
import axios from 'axios';
import { BASE_URL } from 'constants/common';
import { fetchCreateMomoPayment } from 'services/ticket';

const { Title, Text } = Typography;
const { confirm } = Modal;

export default function Payment() {
    const userState = useSelector((state) => state.userReducer);
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingData, movieInfor, theater, time } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState(null);

    if (!bookingData) {
        return <div className="error-state">Không có dữ liệu đơn hàng</div>;
    }

    const handleFinishPayment = () => {
        if (!paymentMethod) {
            return notification.warning({ message: "Vui lòng chọn phương thức thanh toán!" });
        }
        confirm({
            title: 'Xác nhận đặt vé?',
            icon: <ExclamationCircleOutlined />,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk() {
                processBooking();
            },
        });

    };
    const processBooking = async () => {
        try {
            const result = await fetchTicketBookingAPI({
                user_id: userState.userInfor?.user_inf?.id,
                movie_id: movieInfor?._id,
                showtime_id: params.id,
                timeOfBooking: moment().format('YYYY-MM-DD HH:mm:ss'),
                bookedSeat: bookingData.map(seat => ({
                    seatNumber: seat.seatNumber,
                    seatType: seat.seatType,
                    price: seat.seatType.price,
                    isBooked: true,
                })),
                paymentMethod: paymentMethod,
                paymentStatus: 'Pending',
            });
            console.log(result)
            const keyword = result?.paymentMethod.toLowerCase();

            if (keyword === "momo") {
                // Đảm bảo truyền đúng 'result' (có chứa _id) vào hàm này
                const response = await fetchCreateMomoPayment(result);

                // Lưu ý: Thường response của axios sẽ là response.data
                // Nếu helper 'request' của bạn đã trả về .data rồi thì giữ nguyên
                const payUrl = response?.data.payUrl || response?.payUrl;

                if (payUrl) {
                    notification.success({ message: "Đang chuyển hướng đến MoMo..." });

                    // Thay vì chuyển hướng sang trang trung gian, bạn có thể 
                    // mở trực tiếp trang thanh toán MoMo:
                    // window.location.href = payUrl;

                    setTimeout(() => navigate('/payment-result', {
                        state: {
                            payUrl: payUrl,
                            bookingId: result._id,
                        }
                    }), 2000);
                } else {
                    notification.error({ message: "Không lấy được link thanh toán MoMo." });
                }
            }
        } catch (error) {
            console.error("Booking Error:", error);
            notification.error({ message: "Đặt vé thất bại. Vui lòng thử lại." });
        }
    };
    return (
        <div className="payment-page">
            <Button
                className="btn-back"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
            >
                Quay lại
            </Button>

            <div className="payment-container">
                {/* PHẦN CHỌN PHƯƠNG THỨC */}
                <Card className="payment-methods" title="Chọn phương thức thanh toán">
                    <Radio.Group
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        value={paymentMethod}
                        className="method-group"
                    >
                        <Space direction="vertical">
                            <Radio.Button value="card" className="payment-radio-btn">
                                <CreditCardOutlined /> Thẻ ATM / Internet Banking
                            </Radio.Button>
                            <Radio.Button value="momo" className="payment-radio-btn">
                                <WalletOutlined /> Ví MoMo
                            </Radio.Button>
                            <Radio.Button value="cash" className="payment-radio-btn">
                                <DollarOutlined /> Thanh toán tại quầy
                            </Radio.Button>
                        </Space>
                    </Radio.Group>
                </Card>

                {/* PHẦN THÔNG TIN ĐƠN HÀNG */}
                <Card className="order-info" title="Thông tin đơn hàng">
                    <Title level={4} className="order-title">{movieInfor?.title}</Title>
                    <p><b>Rạp:</b> {theater?.branch}</p>
                    <p><b>Phòng:</b> {theater?.name}</p>
                    <p><b>Thời gian:</b> {time}</p>
                    <Divider />
                    <p><b>Ghế:</b> {bookingData?.map(el => el.seatNumber).join(", ")}</p>
                    <p><b>Số lượng:</b> {bookingData.length} ghế</p>
                    <Divider />
                    <div className="total-section">
                        <Text strong className="total-label">Tổng cộng:</Text>
                        <Title level={5} className="total-amount">
                            {bookingData.reduce((total, el) => total + el.seatType.price, 0).toLocaleString()} VNĐ
                        </Title>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        block
                        className="btn-confirm"
                        onClick={handleFinishPayment}
                    >
                        XÁC NHẬN THANH TOÁN
                    </Button>
                </Card>
            </div>
        </div>
    );
}
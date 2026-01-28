import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Radio, Divider, Typography, Space, Modal, notification } from 'antd';
import { CreditCardOutlined, WalletOutlined, DollarOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { fetchTicketBookingAPI } from 'services/customer';
import "./index.scss"; // Import file scss mới

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

        if (paymentMethod === 'cash') {
            confirm({
                title: 'Xác nhận đặt vé?',
                icon: <ExclamationCircleOutlined />,
                content: 'Bạn sẽ thanh toán tiền mặt trực tiếp tại quầy vé trước suất chiếu 30 phút.',
                okText: 'Xác nhận',
                cancelText: 'Hủy',
                onOk() {
                    processBooking();
                },
            });
        } else {
            processBooking();
        }
    };

    const processBooking = async () => {
        try {
            await fetchTicketBookingAPI({
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

            notification.success({ message: "Đặt vé thành công! Vui lòng kiểm tra email." });
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
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
                            <Radio.Button disabled value="card" className="payment-radio-btn">
                                <CreditCardOutlined /> Thẻ ATM / Internet Banking (Bảo trì)
                            </Radio.Button>
                            <Radio.Button disabled value="momo" className="payment-radio-btn">
                                <WalletOutlined /> Ví MoMo (Bảo trì)
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
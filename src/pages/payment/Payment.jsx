import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Radio, Divider, Typography, Space, Modal, notification } from 'antd';
import { CreditCardOutlined, WalletOutlined, DollarOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { fetchTicketBookingAPI } from 'services/customer';
import { fetchCreateMomoPayment, fetchCreateCashPayment } from 'services/ticket';
import "./index.scss"; // Import file scss mới
import { fetchCreateVnpayPayment } from 'services/ticket';
import { fetchNotificationAPI, formatNotificationsForStore } from 'services/notificationAndHistory';
import { setNotificationsAction } from 'store/actions/user.action';

const { Title, Text } = Typography;
const { confirm } = Modal;

export default function Payment() {
    const userState = useSelector((state) => state.userReducer);
    const dispatch = useDispatch();
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingData, movieInfor, theater, time, customerInfo, mode } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState(null);

    if (!bookingData) {
        return <div className="error-state">Không có dữ liệu đơn hàng</div>;
    }

    const refreshNotificationsToStore = async () => {
        const role = userState.userInfor?.user_inf?.role;
        if (!role) return;
        const notiRes = await fetchNotificationAPI(role);
        const formatted = formatNotificationsForStore(notiRes.data?.content);
        dispatch(setNotificationsAction(formatted));
    };

    // Chế độ ĐẶT VÉ — tạo vé Pending, không qua cổng thanh toán
    const handleReserve = async () => {
        confirm({
            title: 'Xác nhận đặt vé?',
            content: 'Vé sẽ được giữ chỗ, bạn thanh toán tại quầy khi đến rạp.',
            icon: <ExclamationCircleOutlined />,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    await fetchTicketBookingAPI(userState.userInfor?.user_inf.role, {
                        user_id: customerInfo?.id || userState.userInfor?.user_inf?.id,
                        id_movie: movieInfor?._id,
                        id_theater: theater?._id,
                        startTime: time,
                        showtime_id: params.id,
                        timeOfBooking: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                        seatName: bookingData.map(seat => ({
                            seatNumber: seat.seatNumber,
                            seatType: seat.seatType,
                            price: seat.price,
                            isBooked: true,
                        })),
                        paymentMethod: 'cash',
                        paymentStatus: 'Pending',
                    });
                    await refreshNotificationsToStore();
                    navigate("/")
                    // const ticket = result?.data?.content;
                    // await fetchCreateCashPayment(ticket);
                    // navigate('/payment-result', {
                    //     state: { payUrl: null, bookingId: ticket._id, method: 'cash' }
                    // });
                } catch (error) {
                    if (error?.response?.status === 409) {
                        return notification.error({ message: "Ghế đã được đặt", description: "Vui lòng chọn ghế khác." });
                    }
                    notification.error({ message: "Đặt vé thất bại" });
                }
            },
        });
    };

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
            const result = await fetchTicketBookingAPI(userState.userInfor?.user_inf.role, {
                user_id: userState.userInfor?.user_inf?.id,
                id_movie: movieInfor?._id,
                id_theater: theater?._id,
                startTime: time,
                showtime_id: params.id,
                timeOfBooking: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                seatName: bookingData.map(seat => ({
                    seatNumber: seat.seatNumber,
                    seatType: seat.seatType,
                    price: seat.price,
                    isBooked: true,
                })),
                paymentMethod: paymentMethod,
                paymentStatus: 'Pending',
            });

            await refreshNotificationsToStore();

            if (result?.data?.success) {
                notification.success({
                    message: 'Thành công',
                    description: 'Đặt vé thành công!',
                });
            } else {
                const errorMsg = result?.data?.message;
                notification.error({
                    message: 'Đặt vé thất bại',
                    description: Array.isArray(errorMsg) ? errorMsg.join(" | ") : errorMsg || 'Lỗi không xác định từ hệ thống',
                });
            }

            const ticket = result?.data.content;
            const keyword = ticket.paymentMethod.toLowerCase();
            if (keyword === "cash") {
                await fetchCreateCashPayment(ticket)
                setTimeout(() => navigate('/payment-result', {
                    state: {
                        payUrl: null,
                        bookingId: ticket._id,
                        method: ticket.paymentMethod,                        
                    }
                }), 2000);
            }

            if (keyword === "momo") {
                const getCode = await fetchCreateMomoPayment(ticket);
                const payUrl = getCode?.data?.content?.paymentUrl;
                notification.success({ message: "Đang chuyển hướng đến MoMo..." });
                setTimeout(() => window.open(payUrl, '_blank'), 2000);
            }

            if (keyword === "internet banking") {
                const getCode = await fetchCreateVnpayPayment(ticket);
                const payUrl = getCode?.data?.content?.paymentUrl;
                notification.success({ message: "Đang chuyển hướng đến VNpay..." });
                setTimeout(() => window.open(payUrl, '_blank'), 2000);
            }
        } catch (error) {
            console.error("Qúa trình bị gián đoạn.", error);
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
                {/* PHẦN CHỌN PHƯƠNG THỨC — ẩn khi mode=reserve */}
                {mode !== 'reserve' && (
                    <Card className="payment-methods" title="Chọn phương thức thanh toán">
                        <Radio.Group
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            value={paymentMethod}
                            className="method-group"
                        >
                            <Space direction="vertical">
                                <Radio.Button value="internet banking" className="payment-radio-btn">
                                    <CreditCardOutlined /> Internet Banking - VNpay
                                </Radio.Button>
                                <Radio.Button value="momo" className="payment-radio-btn">
                                    <WalletOutlined /> Ví MoMo
                                </Radio.Button>
                                <Radio.Button value="cash" className="payment-radio-btn" disabled={userState.userInfor?.user_inf.role === 'customer' ? true : false}>
                                    <DollarOutlined /> Thanh toán tại quầy
                                </Radio.Button>
                            </Space>
                        </Radio.Group>
                    </Card>
                )}

                {/* PHẦN THÔNG TIN ĐƠN HÀNG */}
                <Card className="order-info" title="Thông tin đơn hàng">
                    <Title level={4} className="order-title">{movieInfor?.title}</Title>
                    <p><b>Rạp:</b> {theater?.branch}</p>
                    <p><b>Phòng:</b> {theater?.name}</p>
                    <p><b>Thời gian:</b> {dayjs(time?.replace('Z', '')).format('DD/MM/YYYY HH:mm')}</p>
                    <Divider />
                    <p><b>Ghế:</b> {bookingData?.map(el => el.seatNumber).join(", ")}</p>
                    <p><b>Số lượng:</b> {bookingData.length} ghế</p>
                    <Divider />
                    <div className="total-section">
                        <Text strong className="total-label">Tổng cộng:</Text>
                        <Title level={5} className="total-amount">
                            {bookingData.reduce((total, el) => total + (el.price || 0), 0).toLocaleString()} VNĐ
                        </Title>
                    </div>
                    {mode === 'reserve' ? (
                        <Button
                            type="default"
                            size="large"
                            block
                            className="btn-confirm"
                            onClick={handleReserve}
                        >
                            XÁC NHẬN ĐẶT VÉ
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            size="large"
                            block
                            className="btn-confirm"
                            onClick={handleFinishPayment}
                        >
                            XÁC NHẬN THANH TOÁN
                        </Button>
                    )}
                </Card>
            </div>
        </div>
    );
}

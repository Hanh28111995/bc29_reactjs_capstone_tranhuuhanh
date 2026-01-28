import React, { useState } from 'react';
import { Modal, Form, Input, Select, Tag, Space, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getAllSeatTypesApi } from 'services/seatType';
import { useAsync } from 'hooks/useAsync';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';



export default function SeatsRendering({ data, mode, onAction, selectedSeats }) {
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [form] = Form.useForm();
    const userState = useSelector((state) => state.userReducer);
    const location = useLocation();
    const isTheaterPage = location.pathname.includes("theater");
    const isShowtimePage = location.pathname.includes("showtime");
    const isBookingPage = location.pathname.includes("booking");

    const { state: seatList = [] } = useAsync({
        service: getAllSeatTypesApi,
        dependencies: [userState.userInfor],
        codintion: !!userState.userInfor?.user_inf?.id,

    });

    // Tạo danh sách options chuẩn cho Select
    const seatTypeOptions = seatList.map(seat => ({
        label: seat.name,
        value: seat._id
    }));

    const rows = data?.reduce((acc, seat) => {
        const rowName = seat.seatNumber.charAt(0);
        if (!acc[rowName]) acc[rowName] = [];
        acc[rowName].push(seat);
        return acc;
    }, {});

    Object.keys(rows).forEach(rowName => {
        rows[rowName].sort((a, b) => {
            const numA = parseInt(a.seatNumber.substring(1));
            const numB = parseInt(b.seatNumber.substring(1));
            return numA - numB;
        });
    });

    const handleChairClick = (seat) => {

        setSelectedSeat(seat);
        form.setFieldsValue({
            seatNumber: seat.seatNumber,
            seatTypeId: seat.seatType?._id || seat.seatType, // Ưu tiên lấy ID
            isBooked: seat.isBooked
        });
        if (mode === 'admin') {
            setIsAdminModalOpen(true);
        }
        if (isBookingPage) {
            if (seat.isBooked) return;
            setIsCustomerModalOpen(true);
            console.log('Clicked seat:', seat);
        }
    };

    const handleAdminOk = () => {
        const values = form.getFieldsValue();
        // Gửi toàn bộ thông tin thay đổi về cho cha xử lý
        onAction?.('admin', {
            ...selectedSeat,
            seatTypeId: values.seatTypeId,
            isBooked: values.isBooked
        });
        setIsAdminModalOpen(false);
    };

    return (
        <div className='seatRender' style={{ padding: '40px 20px', background: '#fff', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
            {/* Màn hình */}
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <div style={{ width: '80%', height: '4px', background: '#333', margin: '0 auto 10px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />                
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                overflowX: 'auto',
                paddingBottom: '20px',                
            }}>
                {Object.keys(rows).sort().map(rowName => (
                    <div key={rowName} style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%'
                    }}>
                        <div style={{ color: '#8c8c8c', width: '30px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>
                            {rowName}
                        </div>

                        {rows[rowName].map((seat) => {
                            // 1. Kiểm tra xem ghế này có nằm trong danh sách ĐANG CHỌN không
                            const isSelected = selectedSeats?.some(s => s.seatNumber === seat.seatNumber);

                            // 2. Logic xác định màu sắc (Thứ tự ưu tiên: Đang chọn > Đã đặt > Màu theo loại ghế)
                            let seatColor = seat.seatType?.color || '#333';
                            if (seat.isBooked) {
                                seatColor = '#8c8c8c'; // Màu xám đậm cho ghế đã đặt
                            }
                            if (isSelected) {
                                seatColor = 'gray'; // Màu xám cho ghế đang chọn theo yêu cầu của bạn
                            }

                            return (
                                <div
                                    className="seat-container"
                                    id={seat.seatNumber}
                                    key={seat._id || seat.seatNumber}
                                    style={{
                                        width: '40px',
                                        aspectRatio: '1/1',
                                        transform: 'scaleY(-1)',
                                        cursor: seat.isBooked && mode === 'customer' ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease' // Thêm hiệu ứng mượt khi đổi màu
                                    }}
                                    onClick={() => handleChairClick(seat)}
                                >
                                    <svg
                                        viewBox="0 0 100 100"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        {/* Tựa lưng */}
                                        <rect x="10" y="5" width="80" height="25" rx="5" fill={seatColor} stroke="black" strokeWidth="2" />

                                        {/* Đệm ngồi */}
                                        <rect x="15" y="25" width="70" height="60" rx="5" fill={seatColor} stroke="black" strokeWidth="2" />

                                        {/* Tay vịn trái */}
                                        <rect x="5" y="30" width="15" height="50" rx="5" fill={seatColor} stroke="black" strokeWidth="2" />

                                        {/* Tay vịn phải */}
                                        <rect x="80" y="30" width="15" height="50" rx="5" fill={seatColor} stroke="black" strokeWidth="2" />

                                        <text
                                            x="50" y="60"
                                            fill={isSelected ? "white" : "black"} // Nếu chọn thì chữ trắng cho dễ nhìn
                                            fontSize="25"
                                            fontWeight="bold"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            style={{ transform: 'rotate(180deg) scaleX(-1)', WebkitTransformOrigin: 'center center' }}
                                        >
                                            {seat.seatNumber.substring(1)}
                                        </text>
                                    </svg>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend: Chú thích màu sắc (Nên thêm để khách hàng dễ hiểu) */}
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <Space><div style={{ width: 15, height: 15, background: '#d9d9d9', borderRadius: 2 }} /> <span style={{ fontSize: 12 }}>Đã đặt</span></Space>
                {seatList.map(type => (
                    <Space key={type._id}>
                        <div style={{ width: 15, height: 15, background: type.color || '#333', borderRadius: 2, border: 'black 1px solid' }} />
                        <span style={{ fontSize: 12 }}>{type.name}</span>
                    </Space>
                ))}
            </div>
            {/* MODAL ADMIN: ĐÃ SỬA LẠI LOGIC FORM */}
            {(!isBookingPage) ? (<Modal
                title={<Space><Tag color="gold">CẬP NHẬT GHẾ</Tag> <span>{selectedSeat?.seatNumber}</span></Space>}
                open={isAdminModalOpen}
                onOk={handleAdminOk}
                onCancel={() => setIsAdminModalOpen(false)}
                okText="Cập nhật"
                cancelText="Hủy"
                centered
            >
                {(isTheaterPage || isShowtimePage) &&
                    <Form form={form} layout="vertical">
                        <Form.Item name="seatNumber" label="Mã số ghế">
                            <Input disabled />
                        </Form.Item>
                        {isTheaterPage && (
                            <Form.Item
                                name="seatTypeId"
                                label="Loại ghế"
                                rules={[{ required: true, message: 'Vui lòng chọn loại ghế' }]}
                            >
                                <Select
                                    placeholder="Chọn loại ghế"
                                    options={seatTypeOptions}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        )}
                        {isShowtimePage && (
                            <Form.Item name="isBooked" label="Trạng thái">
                                <Select options={[
                                    { label: 'Trống', value: false },
                                    { label: 'Đã đặt', value: true },
                                ]} />
                            </Form.Item>
                        )}
                    </Form>
                }
            </Modal>)



                : (
                    <Modal
                        title={<Space><Tag color="green">ĐẶT VÉ</Tag> <span>Ghế {selectedSeat?.seatNumber}</span></Space>}
                        open={isCustomerModalOpen}
                        footer={null}
                        onCancel={() => setIsCustomerModalOpen(false)}
                        centered
                        width={300}
                    >
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <Form form={form} layout="vertical" hiden={true} style={{ display: 'none' }}>
                                <Form.Item name="seatNumber" label="Mã số ghế">
                                    <Input disabled />
                                </Form.Item>
                                <Form.Item
                                    name="seatTypeId"
                                    label="Loại ghế"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại ghế' }]}
                                >
                                    <Select
                                        placeholder="Chọn loại ghế"
                                        options={seatTypeOptions}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>


                                <Form.Item name="isBooked" label="Trạng thái">
                                    <Select options={[
                                        { label: 'Trống', value: false },
                                        { label: 'Đã đặt', value: true },
                                    ]} />
                                </Form.Item>
                            </Form>

                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Button
                                    type="primary"
                                    block
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => {
                                        onAction?.('select', selectedSeat);
                                        setIsCustomerModalOpen(false);
                                    }}
                                >
                                    Chọn ghế này
                                </Button>
                                <Button
                                    danger
                                    block
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => {
                                        onAction?.('deselect', selectedSeat);
                                        setIsCustomerModalOpen(false);
                                    }}
                                >
                                    Bỏ chọn ghế
                                </Button>
                            </Space>
                        </div>
                    </Modal>
                )
            }
        </div >
    );
}


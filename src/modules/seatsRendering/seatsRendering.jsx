import React, { useState, useEffect } from 'react';
import { Tooltip, Modal, Form, Input, Select, Tag, Space, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getAllSeatTypesApi } from 'services/seatType';
import { useAsync } from 'hooks/useAsync';

export default function SeatsRendering({ data, mode, onAction }) {
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [form] = Form.useForm();

    const { state: seatList = [] } = useAsync({
        service: getAllSeatTypesApi,
    });

    // Tạo danh sách options chuẩn cho Select
    const seatTypeOptions = seatList.map(seat => ({
        label: seat.name,
        value: seat._id
    }));

    const rows = data.reduce((acc, seat) => {
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
        if (mode === 'admin') {
            // Đổ dữ liệu vào Form
            form.setFieldsValue({
                seatNumber: seat.seatNumber,
                seatTypeId: seat.seatType?._id || seat.seatType, // Ưu tiên lấy ID
                isBooked: seat.isBooked
            });
            setIsAdminModalOpen(true);
        } else if (mode === 'customer') {
            if (seat.isBooked) return;
            setIsCustomerModalOpen(true);
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
        <div style={{ padding: '40px 20px', background: '#fff', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <div style={{ width: '60%', height: '8px', background: '#e8e8e8', margin: '0 auto 10px', borderRadius: '20px' }} />
                <span style={{ color: '#bfbfbf', fontSize: '12px', letterSpacing: '2px' }}>MÀN HÌNH</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto' }}>
                {Object.keys(rows).sort().map(rowName => (
                    <div key={rowName} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ color: '#8c8c8c', width: '20px', fontWeight: 'bold', fontSize: '14px' }}>{rowName}</div>
                        {rows[rowName].map((seat) => {
                            const backgroundColor = seat.isBooked ? '#d9d9d9' : (seat.seatType?.color || '#333');
                            return (
                                <Tooltip key={seat._id || seat.seatNumber} title={`Ghế ${seat.seatNumber}`}>
                                    <div
                                        onClick={() => handleChairClick(seat)}
                                        style={{
                                            width: '30px', height: '30px', backgroundColor, borderRadius: '6px',
                                            cursor: 'pointer', border: '1px solid #d9d9d9', transition: 'all 0.2s'
                                        }}
                                    />
                                </Tooltip>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* MODAL ADMIN: ĐÃ SỬA LẠI LOGIC FORM */}
            <Modal
                title={<Space><Tag color="gold">CẬP NHẬT GHẾ</Tag> <span>{selectedSeat?.seatNumber}</span></Space>}
                open={isAdminModalOpen}
                onOk={handleAdminOk}
                onCancel={() => setIsAdminModalOpen(false)}
                okText="Cập nhật"
                cancelText="Hủy"
                centered
            >
                <Form form={form} layout="vertical">
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
            </Modal>

            {/* MODAL CUSTOMER */}
            <Modal
                title={<Space><Tag color="green">ĐẶT VÉ</Tag> <span>Ghế {selectedSeat?.seatNumber}</span></Space>}
                open={isCustomerModalOpen}
                footer={null}
                onCancel={() => setIsCustomerModalOpen(false)}
                centered
                width={300}
            >
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <p>Bạn muốn thực hiện thao tác gì với ghế này?</p>
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
        </div>
    );
}
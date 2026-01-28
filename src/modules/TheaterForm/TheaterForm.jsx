import {
  Button, Form, Input, InputNumber,
  App, Select, Space, Card, Row, Col, Divider
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { fetchTheaterDetailAPI, addTheaterAPI, updateTheaterAPI } from "services/theater";
import { getAllBranches } from "services/branches";
import SeatsRendering from "modules/seatsRendering/seatsRendering";
import { useSelector } from "react-redux";
import { getAllSeatTypesApi } from "services/seatType";
import { SaveOutlined, ArrowLeftOutlined, WarningOutlined } from "@ant-design/icons";

export default function TheaterForm() {
  const userState = useSelector((state) => state.userReducer);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const { notification } = App.useApp();

  const [isChanged, setIsChanged] = useState(false);
  const [listGhe, setListGhe] = useState([]);
  const [isResettingSeats, setIsResettingSeats] = useState(false);

  // State để chốt giá trị gửi về Backend
  const [SeatRow, setSeatRow] = useState(null);
  const [SeatCol, setSeatCol] = useState(null);

  // State hiển thị số ghế tạm thời trên giao diện (Thay thế useWatch)
  const [tempTotal, setTempTotal] = useState({ rows: 10, cols: 10 });

  const { state: seatsDB = [] } = useAsync({
    service: getAllSeatTypesApi,
  });

  const { state: cinemas = [] } = useAsync({
    service: getAllBranches,
  });

  const { state: theaterDetail, loading } = useAsync({
    service: () => fetchTheaterDetailAPI(params.theaterId),
    dependencies: [params.theaterId],
    condition: !!params.theaterId,
  });

  // Theo dõi cinemaName để filter branch
  const selectedCinema = Form.useWatch('cinemaName', form);

  const branchOptions = useMemo(() => {
    if (!selectedCinema) return [];
    return cinemas
      .filter(item => item.cinemaName === selectedCinema)
      .map(item => ({
        label: item.branch,
        value: item.branch
      }));
  }, [selectedCinema, cinemas]);

  // Khởi tạo và đồng bộ dữ liệu Form
  useEffect(() => {
    if (params.theaterId && theaterDetail) {
      // Chế độ CHỈNH SỬA
      form.setFieldsValue(theaterDetail);
      setListGhe(theaterDetail.seats || []);
      setSeatRow(theaterDetail.totalSeat?.rows);
      setSeatCol(theaterDetail.totalSeat?.cols);
      setTempTotal({
        rows: theaterDetail.totalSeat?.rows || 0,
        cols: theaterDetail.totalSeat?.cols || 0
      });
    } else if (!params.theaterId) {
      // Chế độ THÊM MỚI
      form.resetFields();
      setListGhe([]);
      setSeatRow(0); 
      setSeatCol(0);
      setTempTotal({ rows: 0, cols: 0 });
    }
    setIsChanged(false);
  }, [theaterDetail, params.theaterId, form]);

  const handleCinemaChange = () => {
    form.setFieldValue('branch', undefined);
  };

  // Cập nhật hiển thị tổng số ghế khi đang nhập liệu
  const handleFormChange = (_, allValues) => {
    setIsChanged(true);
    setTempTotal({
      rows: allValues.totalSeat?.rows || 0,
      cols: allValues.totalSeat?.cols || 0
    });
  };

  const handleSeatUpdate = (type, payload) => {
    if (type === 'admin') {
      const { seatNumber, seatTypeId, isBooked } = payload;
      const newTypeInfo = seatsDB.find(t => t._id === seatTypeId);

      const updatedSeats = listGhe.map((seat) => {
        if (seat.seatNumber === seatNumber) {
          return {
            ...seat,
            isBooked: isBooked,
            seatType: newTypeInfo ? { ...newTypeInfo } : seat.seatType
          };
        }
        return seat;
      });

      setListGhe(updatedSeats);
      setIsChanged(true);
    }
  };

  // Hàm "Lưu" (nhỏ) để chốt sơ đồ hàng/cột
  const handleConfirmLayout = () => {
    const rows = form.getFieldValue(['totalSeat', 'rows']);
    const cols = form.getFieldValue(['totalSeat', 'cols']);

    if (!rows || !cols) {
      return notification.warning({ message: "Vui lòng nhập đầy đủ số hàng và cột" });
    }

    setSeatRow(rows);
    setSeatCol(cols);
    setIsResettingSeats(true);
    setIsChanged(true);

    notification.info({
      message: "Xác nhận thay đổi",
      description: "Quy mô ghế đã được chốt. Hệ thống sẽ khởi tạo lại danh sách ghế khi bạn lưu cấu hình chính."
    });
  };

  const handleSave = async (values) => {
    try {
      const payload = {
        ...values,
        totalSeat: {
          rows: SeatRow,
          cols: SeatCol,
        },
        // Nếu chốt quy mô mới, gửi mảng rỗng để Backend tạo ghế mới
        seats: isResettingSeats ? [] : listGhe,
      };

      if (params.theaterId) {
        await updateTheaterAPI(params.theaterId, payload);
        notification.success({ message: "Cập nhật thành công!" });
      } else {
        await addTheaterAPI(payload);
        notification.success({ message: "Thêm phòng chiếu mới thành công!" });
      }

      navigate("/admin/theater-management");
    } catch (error) {     
      console.log(error) 
      notification.error({
        message: "Lỗi hệ thống",
        description: error.message || "Không thể lưu dữ liệu phòng chiếu.",
      });
    }
  };

  return (
    <Card
      loading={loading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          <span>{params.theaterId ? "Cấu hình phòng chiếu" : "Tạo phòng chiếu mới"}</span>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onValuesChange={handleFormChange}
        initialValues={{ totalSeat: { rows: 0, cols: 0 } }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Tên phòng chiếu"
              name="name"
              rules={[{ required: true, message: 'Nhập tên phòng (Vd: Phòng 01)' }]}
            >
              <Input placeholder="Nhập tên phòng chiếu..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Thuộc cụm rạp quản lý"
              name="cinemaName"
              rules={[{ required: true, message: 'Vui lòng chọn cụm rạp' }]}
            >
              <Select
                placeholder="Chọn cụm rạp"
                showSearch
                optionFilterProp="label"
                onChange={handleCinemaChange}
                options={[...new Set(cinemas.map(item => item.cinemaName))].map(name => ({
                  label: name,
                  value: name
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Chi nhánh (Khu vực)"
          name="branch"
          rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
        >
          <Select
            placeholder={selectedCinema ? "Chọn chi nhánh" : "Vui lòng chọn cụm rạp trước"}
            disabled={!selectedCinema}
            showSearch
            optionFilterProp="label"
            options={branchOptions}
          />
        </Form.Item>

        <Card type="inner" title="Thiết lập sơ đồ cơ bản" style={{ marginBottom: 24 }}>
          <Row gutter={48} align="middle">
            <Col>
              <Form.Item label="Số hàng ngang" name={['totalSeat', 'rows']}>
                <InputNumber min={1} max={20} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="Số cột dọc" name={['totalSeat', 'cols']}>
                <InputNumber min={1} max={20} />
              </Form.Item>
            </Col>
            <Col style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <div style={{ fontSize: '16px', fontStyle: 'italic', marginRight: '16px' }}>
                Tổng {tempTotal.rows * tempTotal.cols} ghế
              </div>
              <Button type="primary" onClick={handleConfirmLayout}>
                <SaveOutlined /> Lưu quy mô
              </Button>
            </Col>
          </Row>
        </Card>

        <Form.Item label="Mô tả / Lưu ý" name="description">
          <Input.TextArea rows={2} placeholder="Thông tin thêm về phòng chiếu..." />
        </Form.Item>

        <Divider orientation="left">Sơ đồ ghế chi tiết</Divider>

        <div style={{
          background: '#f5f5f5', padding: '24px', borderRadius: '8px',
          marginBottom: '24px', minHeight: '200px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', overflow: 'auto'
        }}>
          {isResettingSeats ? (
            <div style={{ textAlign: 'center', color: '#faad14' }}>
              <WarningOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Ghế đang chờ khởi tạo</div>
              <p>Sơ đồ mới sẽ hiển thị sau khi bạn nhấn nút "LƯU CẤU HÌNH" phía dưới.</p>
            </div>
          ) : (
            <SeatsRendering
              data={listGhe}
              onAction={handleSeatUpdate}
              mode={userState.userInfor?.user_inf.role}
              selectedSeats={[]}
            />
          )}
        </div>

        <Button
          type="primary"
          htmlType="submit"
          disabled={!isChanged}
          size="large"
          icon={<SaveOutlined />}
          block
        >
          LƯU CẤU HÌNH PHÒNG CHIẾU
        </Button>
      </Form>
    </Card>
  );
}
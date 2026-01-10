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
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";

export default function TheaterForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const { notification } = App.useApp(); // Sử dụng App context của Antd 5

  const [isChanged, setIsChanged] = useState(false);
  const userState = useSelector((state) => state.userReducer);
  const [listGhe, setListGhe] = useState([]);

  const { state: seatsDB = [] } = useAsync({
    service: getAllSeatTypesApi,
  });

  const { state: cinemas = [] } = useAsync({
    service: getAllBranches,
  });

  // 3. Lấy chi tiết phòng chiếu (nếu là Edit)
  const { state: theaterDetail, loading } = useAsync({
    service: () => fetchTheaterDetailAPI(params.theaterId),
    dependencies: [params.theaterId],
    condition: !!params.theaterId,
  });

  

  // 1. Theo dõi giá trị cinemaName đang được chọn trong Form
  const selectedCinema = Form.useWatch('cinemaName', form);

  // 2. Tạo danh sách chi nhánh tương ứng với cụm rạp đã chọn
  const branchOptions = useMemo(() => {
    if (!selectedCinema) return [];

    // Lọc ra các item trong cinemas có cinemaName khớp với lựa chọn
    return cinemas
      .filter(item => item.cinemaName === selectedCinema)
      .map(item => ({
        label: item.branch, // Hiển thị tên chi nhánh (Vd: CGV VivoCity)
        value: item.branch  // Lưu giá trị chi nhánh
      }));
  }, [selectedCinema, cinemas]);

  // 3. (Tùy chọn) Xóa giá trị Chi nhánh nếu người dùng đổi Cụm rạp khác
  const handleCinemaChange = () => {
    form.setFieldValue('branch', undefined);
  };

  // Cập nhật thông tin ghế khi Admin thao tác trên sơ đồ
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

  // Đồng bộ dữ liệu API vào Form
  const initialData = useMemo(() => {
    console.log(theaterDetail);
    if (!theaterDetail) return null;
    return {
      ...theaterDetail,
      cinemaName: theaterDetail.cinemaName,
    };
  }, [theaterDetail]);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
      setListGhe(initialData.seats || []);
      setIsChanged(false);
    }
  }, [initialData, form]);

  const onValuesChange = () => {
    setIsChanged(true);
  };

  const handleSave = async (values) => {
    try {
      const payload = {
        ...values,
        totalSeat: {
          rows: values.totalSeat.rows,
          cols: values.totalSeat.cols,
        },
        seats: listGhe,
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
      notification.error({
        message: "Lỗi hệ thống",
        description: error.response?.data?.content || "Không thể lưu dữ liệu phòng chiếu.",
      });
    }
  };

  // Theo dõi số hàng/cột để tính tổng ghế real-time
  const watchRows = Form.useWatch(['totalSeat', 'rows'], form);
  const watchCols = Form.useWatch(['totalSeat', 'cols'], form);

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
        onValuesChange={onValuesChange}
        initialValues={{ totalSeat: { rows: 10, cols: 10 } }}
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
                onChange={handleCinemaChange} // Reset chi nhánh khi đổi cụm rạp
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
            disabled={!selectedCinema} // Khóa lại nếu chưa chọn cụm rạp
            showSearch
            optionFilterProp="label"
            options={branchOptions} // Sử dụng list đã lọc ở trên
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
            <Col>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1677ff' }}>
                Tổng quy mô: {(watchRows || 0) * (watchCols || 0)} ghế
              </div>
            </Col>
          </Row>
        </Card>

        <Form.Item label="Mô tả / Lưu ý" name="description">
          <Input.TextArea rows={2} placeholder="Thông tin thêm về phòng chiếu..." />
        </Form.Item>

        <Divider orientation="left">Sơ đồ ghế chi tiết (Click để đổi loại ghế)</Divider>

        <div style={{
          background: '#f5f5f5',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px',
          overflow: 'auto'
        }}>
          <SeatsRendering
            data={listGhe}
            onAction={handleSeatUpdate}
            mode={userState.userInfor?.user_inf.role}
          />
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
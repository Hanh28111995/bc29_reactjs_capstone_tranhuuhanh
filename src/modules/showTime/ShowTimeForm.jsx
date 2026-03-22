import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  App,
  Card,
  Row,
  Col,
  Space,
  Select,
} from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // 1. Import plugin UTC
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { fetchMovieListAPI } from "services/movie";
import { fetchTheaterListAPI } from "services/theater";
import { updateShowTime, addNewShowTime, getShowTimeDetail } from "services/showtime";
import SeatsRendering from "modules/seatsRendering/seatsRendering";
import { useSelector } from "react-redux";

// Kích hoạt plugin UTC cho dayjs
dayjs.extend(utc);

const DEFAULT_VALUES = {
  movie: undefined,
  theater: undefined,
  startTime: null,
};

export default function ShowtimeForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const { notification } = App.useApp();
  const userState = useSelector((state) => state.userReducer);
  const [isChanged, setIsChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [seats, setSeats] = useState([]);

  const { state: movies = [] } = useAsync({ service: fetchMovieListAPI });
  const { state: theaters = [] } = useAsync({ service: fetchTheaterListAPI });

  const { state: showtimeDetail, loading } = useAsync({
    service: () => getShowTimeDetail(params.id),
    dependencies: [params.id],
    condition: !!params.id && params.id !== "undefined",
  });

  // Xử lý dữ liệu khi đổ vào Form (Edit Mode)
  useEffect(() => {
    if (params.id && params.id !== "undefined" && showtimeDetail) {
      const cinemaName = showtimeDetail.theater?.branch || showtimeDetail.theater?.cinema?.name;

      const dataForForm = {
        ...showtimeDetail,
        cinemaName: cinemaName,
        movie: showtimeDetail.id_movie?._id || showtimeDetail.id_movie,
        theater: showtimeDetail.theater?._id || showtimeDetail.theater,
        // Parse bỏ qua timezone suffix để giữ nguyên con số giờ từ DB
        startTime: showtimeDetail.startTime ? dayjs(showtimeDetail.startTime.replace('Z', '').replace('+07:00', '')) : null,
      };

      form.setFieldsValue(dataForForm);
      setOriginalData(dataForForm);
      setSelectedCinema(cinemaName);
      setSeats(showtimeDetail.seats || []);
      setIsChanged(false);
    } else {
      form.setFieldsValue(DEFAULT_VALUES);
      setSelectedCinema(null);
      setSeats([]);
      setIsChanged(false);
    }
  }, [showtimeDetail, params.id, form]);

  const cinemaList = useMemo(() => {
    const cinemas = theaters.map(t => t.cinema?.name || t.branch);
    return [...new Set(cinemas)].filter(Boolean);
  }, [theaters]);

  const filteredTheaters = useMemo(() => {
    if (!selectedCinema) return [];
    return theaters.filter(t => (t.cinema?.name || t.branch) === selectedCinema);
  }, [theaters, selectedCinema]);

  const handleSeatAction = (type, updatedSeat) => {
    if (type !== 'admin') return;
    setSeats(prev =>
      prev.map(s =>
        s._id === updatedSeat._id
          ? { ...s, seatType: updatedSeat.seatTypeId, isBooked: updatedSeat.isBooked }
          : s
      )
    );
    setIsChanged(true);
  };

  const onValuesChange = (_, allValues) => {
    if (!params.id) {
      setIsChanged(true);
      return;
    }
    // So sánh sự thay đổi để bật/tắt nút Lưu
    const hasChanged = Object.keys(allValues).some(key => {
      if (key === 'startTime') {
        return !dayjs(allValues[key]).isSame(originalData?.startTime);
      }
      return allValues[key] !== originalData?.[key];
    });
    setIsChanged(hasChanged);
  };

  const handleSave = async (values) => {
    try {
      // Strip Z khi hiển thị (display as local), thêm Z khi gửi lên (store as UTC string)
      const utcStartTime = values.startTime 
        ? values.startTime.format("YYYY-MM-DDTHH:mm:ss.000") + "Z"
        : null;
      
      const payload = {
        id_movie: values.movie,
        theater: values.theater,
        startTime: utcStartTime,
        seats: seats,
      };

      if (params.id && params.id !== "undefined") {
        await updateShowTime({ id: params.id, ...payload });
        notification.success({ message: "Cập nhật suất chiếu thành công!" });
      } else {
        await addNewShowTime(payload);
        notification.success({ message: "Thêm suất chiếu mới thành công!" });
      }
      
      setIsChanged(false);
      navigate("/admin/showtimes"); // Chuyển hướng sau khi lưu thành công
    } catch (error) {
      notification.error({
        message: "Thao tác thất bại",
        description: error.response?.data?.message || "Lỗi hệ thống (500)",
      });
    }
  };

  return (
    <Card
      loading={loading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          <span>{params.id ? "Chỉnh sửa suất chiếu" : "Tạo suất chiếu mới"}</span>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onValuesChange={onValuesChange}
        initialValues={DEFAULT_VALUES}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Chọn Phim"
              name="movie"
              rules={[{ required: true, message: 'Vui lòng chọn phim' }]}
            >
              <Select
                showSearch
                placeholder="Tìm kiếm phim..."
                optionFilterProp="children"
                options={movies.map(m => ({ label: m.title, value: m._id }))}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Thời gian bắt đầu"
              name="startTime"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                showTime={{ format: 'HH:mm', defaultValue: dayjs('00:00', 'HH:mm') }}
                format="DD/MM/YYYY HH:mm"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Chọn Cụm Rạp"
              name="cinemaName"
              rules={[{ required: true, message: 'Vui lòng chọn cụm rạp' }]}
            >
              <Select
                placeholder="Chọn cụm rạp..."
                onChange={(value) => {
                  setSelectedCinema(value);
                  form.setFieldValue('theater', undefined);
                }}
                options={cinemaList.map(c => ({ label: c, value: c }))}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Chọn Phòng Chiếu"
              name="theater"
              rules={[{ required: true, message: 'Vui lòng chọn phòng chiếu' }]}
            >
              <Select
                placeholder={selectedCinema ? "Chọn phòng..." : "Vui lòng chọn cụm rạp trước"}
                disabled={!selectedCinema}
                options={filteredTheaters.map(t => ({ label: t.name, value: t._id }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <SeatsRendering
          data={seats}
          mode={userState.userInfor?.user_inf.role}
          onAction={handleSeatAction}
          selectedSeats={[]}
        />

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<SaveOutlined />}
            disabled={!isChanged}
            block
          >
            {params.id ? "CẬP NHẬT SUẤT CHIẾU" : "TẠO SUẤT CHIẾU"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
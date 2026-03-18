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
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { fetchMovieListAPI } from "services/movie";
import { fetchTheaterListAPI } from "services/theater";
import { updateShowTime, addNewShowTime, getShowTimeDetail } from "services/showtime";
import SeatsRendering from "modules/seatsRendering/seatsRendering";
import { useSelector } from "react-redux";

const DEFAULT_VALUES = {
  movie: undefined,
  theater: undefined,
  startTime: null,
  cinemaId: undefined,
};

export default function ShowtimeForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { id } = useParams();
  const { notification } = App.useApp();
  const userState = useSelector((state) => state.userReducer);
  
  const [isChanged, setIsChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);

  // 1. Lấy dữ liệu danh mục
  const { state: movies = [] } = useAsync({ service: fetchMovieListAPI });
  const { state: theaters = [] } = useAsync({ service: fetchTheaterListAPI });

  // 2. Lấy chi tiết khi Edit
  const { state: showtimeDetail, loading } = useAsync({
    service: () => getShowTimeDetail(id),
    dependencies: [id],
    condition: !!id && id !== "undefined",
  });

  // 3. Logic xử lý danh sách Cụm rạp (Unique Cinemas)
  const cinemaList = useMemo(() => {
    const uniqueCinemas = new Map();
    theaters.forEach(t => {
      const c = t.cinema;
      if (c?._id && !uniqueCinemas.has(c._id)) {
        uniqueCinemas.set(c._id, {
          _id: c._id,
          name: c.name || "Cụm rạp không tên"
        });
      }
    });
    return Array.from(uniqueCinemas.values());
  }, [theaters]);

  // 4. Lọc phòng chiếu theo Cụm rạp đã chọn
  const filteredTheaters = useMemo(() => {
    if (!selectedCinema) return [];
    return theaters.filter(t => (t.cinema?._id || t.cinema) === selectedCinema);
  }, [theaters, selectedCinema]);

  // 5. Đồng bộ dữ liệu lên Form
  useEffect(() => {
    if (id && id !== "undefined" && showtimeDetail) {
      const cinemaId = showtimeDetail.theater?.cinema?._id || showtimeDetail.theater?.cinema;
      
      const dataForForm = {
        movie: showtimeDetail.id_movie?._id || showtimeDetail.id_movie,
        cinemaId: cinemaId, 
        theater: showtimeDetail.theater?._id || showtimeDetail.theater,
        startTime: showtimeDetail.startTime ? dayjs(showtimeDetail.startTime) : null,
      };

      form.setFieldsValue(dataForForm);
      setOriginalData(dataForForm);
      setSelectedCinema(cinemaId);
      setIsChanged(false);
    } else {
      form.setFieldsValue(DEFAULT_VALUES);
      setSelectedCinema(null);
      setIsChanged(false);
    }
  }, [showtimeDetail, id, form]);

  // 6. Kiểm tra thay đổi để enable nút Lưu
  const onValuesChange = (_, allValues) => {
    if (!id) {
      setIsChanged(Object.values(allValues).some(v => v !== undefined && v !== null));
      return;
    }
    const hasChanged = Object.keys(allValues).some(key => {
      if (key === 'startTime') return !dayjs(allValues[key]).isSame(originalData?.[key]);
      return allValues[key] !== originalData?.[key];
    });
    setIsChanged(hasChanged);
  };

  // 7. Xử lý lưu dữ liệu
  const handleSave = async (values) => {
    try {
      const payload = {
        id_movie: values.movie,
        theater: values.theater,
        startTime: values.startTime ? values.startTime.toISOString() : null,
      };

      if (id && id !== "undefined") {
        await updateShowTime({ id, ...payload });
        notification.success({ message: "Cập nhật thành công!" });
      } else {
        await addNewShowTime(payload);
        notification.success({ message: "Thêm mới thành short thành công!" });
      }
      navigate("/admin/showtimes");
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.response?.data?.message || "Không thể lưu suất chiếu",
      });
    }
  };

  return (
    <Card
      loading={loading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          <span>{id ? "Chỉnh sửa suất chiếu" : "Tạo suất chiếu mới"}</span>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onValuesChange={onValuesChange}
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
                placeholder="Tìm phim..."
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
                showTime={{ format: 'HH:mm' }}
                format="DD/MM/YYYY HH:mm"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Cụm Rạp"
              name="cinemaId"
              rules={[{ required: true, message: 'Vui lòng chọn rạp' }]}
            >
              <Select
                placeholder="Chọn cụm rạp..."
                onChange={(val) => {
                  setSelectedCinema(val);
                  form.setFieldValue('theater', undefined);
                }}
                options={cinemaList.map(c => ({ label: c.name, value: c._id }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Phòng Chiếu"
              name="theater"
              rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}
            >
              <Select
                placeholder={selectedCinema ? "Chọn phòng..." : "Chọn rạp trước"}
                disabled={!selectedCinema || (id && showtimeDetail?.seats?.some(s => s.isBooked))}
                options={filteredTheaters.map(t => ({ label: t.name, value: t._id }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ margin: "20px 0", padding: "15px", background: "#f5f5f5", borderRadius: "8px" }}>
          <SeatsRendering
            data={showtimeDetail?.seats || []}
            mode={userState.userInfor?.user_inf.role}
            onAction
            selectedSeats={[]}
          />
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<SaveOutlined />}
            disabled={!isChanged}
            block
          >
            {id ? "CẬP NHẬT" : "TẠO MỚI"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
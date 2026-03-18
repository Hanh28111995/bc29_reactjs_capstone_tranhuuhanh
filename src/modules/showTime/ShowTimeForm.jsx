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
import { fetchCinemaListAPI } from "services/cinema"; // Gọi API lấy danh sách rạp
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
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);

  // --- 1. GỌI API DỮ LIỆU DANH MỤC ---
  const { state: movies = [] } = useAsync({ service: fetchMovieListAPI });
  const { state: theaters = [] } = useAsync({ service: fetchTheaterListAPI });
  const { state: cinemas = [] } = useAsync({ service: fetchCinemaListAPI });

  // --- 2. LOGIC UPDATE: LẤY CHI TIẾT SUẤT CHIẾU ---
  const { state: showtimeDetail, loading } = useAsync({
    service: () => getShowTimeDetail(id),
    dependencies: [id],
    condition: !!id && id !== "undefined",
  });

  // --- 3. LOGIC LỌC PHÒNG THEO RẠP ---
  const filteredTheaters = useMemo(() => {
    if (!selectedCinemaId) return [];
    return theaters.filter(t => {
      const cId = t.cinema?._id || t.cinema;
      return cId === selectedCinemaId;
    });
  }, [theaters, selectedCinemaId]);

  // --- 4. ĐỒNG BỘ DỮ LIỆU (QUAN TRỌNG CHO NHÁNH UPDATE) ---
  useEffect(() => {
    if (id && id !== "undefined" && showtimeDetail) {
      // Lấy ID cinema từ theater trong showtimeDetail
      const cinemaId = showtimeDetail.theater?.cinema?._id || showtimeDetail.theater?.cinema;
      
      const dataForForm = {
        movie: showtimeDetail.id_movie?._id || showtimeDetail.id_movie,
        cinemaId: cinemaId, 
        theater: showtimeDetail.theater?._id || showtimeDetail.theater,
        startTime: showtimeDetail.startTime ? dayjs(showtimeDetail.startTime) : null,
      };

      form.setFieldsValue(dataForForm);
      setOriginalData(dataForForm); // Lưu lại bản gốc để so sánh isChanged
      setSelectedCinemaId(cinemaId); // Kích hoạt filter để hiện đúng phòng chiếu cũ
      setIsChanged(false);
    } else {
      form.setFieldsValue(DEFAULT_VALUES);
      setSelectedCinemaId(null);
      setIsChanged(false);
    }
  }, [showtimeDetail, id, form]);

  // --- 5. KIỂM TRA THAY ĐỔI DỮ LIỆU ---
  const onValuesChange = (_, allValues) => {
    if (!id) {
      const hasInput = !!allValues.movie || !!allValues.theater || !!allValues.startTime;
      setIsChanged(hasInput);
      return;
    }

    // So sánh với originalData của nhánh Update
    const hasChanged = Object.keys(allValues).some(key => {
      const current = allValues[key];
      const original = originalData?.[key];
      if (key === 'startTime') return !dayjs(current).isSame(original);
      return current !== original;
    });
    setIsChanged(hasChanged);
  };

  // --- 6. LƯU DỮ LIỆU (CREATE & UPDATE) ---
  const handleSave = async (values) => {
    try {
      const payload = {
        id_movie: values.movie,
        theater: values.theater,
        startTime: values.startTime ? values.startTime.toISOString() : null,
      };

      if (id && id !== "undefined") {
        // Nhánh UPDATE
        await updateShowTime({ id, ...payload });
        notification.success({ message: "Cập nhật suất chiếu thành công!" });
      } else {
        // Nhánh CREATE
        await addNewShowTime(payload);
        notification.success({ message: "Thêm suất chiếu mới thành công!" });
      }
      navigate("/admin/showtimes");
    } catch (error) {
      notification.error({
        message: "Thao tác thất bại",
        description: error.response?.data?.message || "Vui lòng kiểm tra lại dữ liệu",
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
        initialValues={DEFAULT_VALUES}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Chọn Phim" name="movie" rules={[{ required: true, message: 'Vui lòng chọn phim' }]}>
              <Select
                showSearch
                placeholder="Tìm phim..."
                optionFilterProp="children"
                options={movies.map(m => ({ label: m.title, value: m._id }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Thời gian bắt đầu" name="startTime" rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
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
            <Form.Item label="Chọn Cụm Rạp" name="cinemaId" rules={[{ required: true, message: 'Vui lòng chọn cụm rạp' }]}>
              <Select
                placeholder="Chọn cụm rạp..."
                onChange={(val) => {
                  setSelectedCinemaId(val);
                  form.setFieldValue('theater', undefined);
                }}
                options={cinemas.map(c => ({ label: c.name, value: c._id }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Chọn Phòng Chiếu" name="theater" rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}>
              <Select
                placeholder={selectedCinemaId ? "Chọn phòng..." : "Vui lòng chọn cụm rạp trước"}
                // Disable nếu đã có người đặt vé (chỉ áp dụng khi update)
                disabled={!selectedCinemaId || (id && showtimeDetail?.seats?.some(s => s.isBooked))}
                options={filteredTheaters.map(t => ({ label: t.name, value: t._id }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginTop: 24 }}>
          <SeatsRendering
            data={showtimeDetail?.seats || []}
            mode={userState.userInfor?.user_inf.role}
            onAction
            selectedSeats={[]}
          />
        </div>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<SaveOutlined />}
            disabled={!isChanged}
            block
          >
            {id ? "CẬP NHẬT SUẤT CHIẾU" : "TẠO SUẤT CHIẾU"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
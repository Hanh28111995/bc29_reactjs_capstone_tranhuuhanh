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
import { updateShowTime } from "services/showtime";
import { addNewShowTime } from "services/showtime";
import { getShowTimeDetail } from "services/showtime";

// Import các service cần thiết


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

  const [isChanged, setIsChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);

  // 1. Lấy danh sách phim và phòng chiếu để hiển thị trong Select
  const { state: movies = [] } = useAsync({ service: fetchMovieListAPI });
  const { state: theaters = [] } = useAsync({ service: fetchTheaterListAPI });

  // 2. Lấy chi tiết suất chiếu nếu là chế độ Update
  const { state: showtimeDetail, loading } = useAsync({
    service: () => {      
      return getShowTimeDetail(params.id); // Thay bằng hàm lấy chi tiết
    },
    dependencies: [params.id],
    condition: !!params.id && params.id !== "undefined",
  });



  const cinemaList = useMemo(() => {
    const cinemas = theaters.map(t => t.cinema?.name || t.branch); // Tùy vào cấu trúc data của bạn
    return [...new Set(cinemas)].filter(Boolean);
  }, [theaters]);

  // Lọc danh sách phòng chiếu dựa trên cụm rạp đã chọn
  const filteredTheaters = useMemo(() => {
    if (!selectedCinema) return [];
    return theaters.filter(t => (t.cinema?.name || t.branch) === selectedCinema);
  }, [theaters, selectedCinema]);



  // 3. Đồng bộ dữ liệu lên Form
  useEffect(() => {
    // 1. Trường hợp CHỈNH SỬA (có params.id)
    if (params.id && params.id !== "undefined") {
      if (showtimeDetail) {
        // Lấy tên rạp từ theater để hiển thị Select Cụm rạp
        const cinemaName = showtimeDetail.theater?.branch || showtimeDetail.theater?.cinema?.name;

        const dataForForm = {
          ...showtimeDetail,
          cinemaName: cinemaName, // Thêm tên rạp vào form để Select Rạp hiển thị được
          movie: showtimeDetail.movie?._id || showtimeDetail.movie,
          theater: showtimeDetail.theater?._id || showtimeDetail.theater,
          startTime: showtimeDetail.startTime ? dayjs(showtimeDetail.startTime) : null,
        };

        form.setFieldsValue(dataForForm);
        setOriginalData(dataForForm);
        setSelectedCinema(cinemaName); // Cần cái này để lọc ra danh sách phòng thuộc rạp đó
        setIsChanged(false);
      }
    }
    // 2. Trường hợp THÊM MỚI
    else {
      form.setFieldsValue(DEFAULT_VALUES);
      setOriginalData(null);
      setSelectedCinema(null); // Reset rạp đã chọn
      setIsChanged(false);
    }
  }, [showtimeDetail, params.id, form]);

  // 4. Kiểm tra thay đổi
  const onValuesChange = (_, allValues) => {
    if (!params.id) {
      const hasInput = Object.keys(allValues).some(key => allValues[key] !== undefined);
      setIsChanged(hasInput);
      return;
    }

    const hasChanged = Object.keys(allValues).some(key => {
      const currentVal = allValues[key];
      const originalVal = originalData?.[key];

      if (key === 'startTime') {
        return !dayjs(currentVal).isSame(originalVal);
      }
      return currentVal !== originalVal;
    });

    setIsChanged(hasChanged);
  };

  const handleSave = async (values) => {
    try {
      const payload = {
        ...values,
        // Convert dayjs object sang ISO string cho MongoDB
        startTime: values.startTime ? values.startTime.toISOString() : null,
      };

      if (params.id) {
        // Chế độ UPDATE (gửi kèm ID trong body như bạn yêu cầu ở API)
        await updateShowTime({ id: params.id, ...payload });
        notification.success({ message: "Cập nhật suất chiếu thành công!" });
      } else {
        // Chế độ CREATE: Backend sẽ tự clone seats từ theater ID này
        await addNewShowTime(payload);
        notification.success({ message: "Thêm suất chiếu mới thành công!" });
      }

      navigate("/admin/showtimes");
    } catch (error) {
      notification.error({
        message: "Thao tác thất bại",
        description: error.response?.data?.message || "Vui lòng kiểm tra lại khung giờ chiếu",
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
            {/* CHỌN PHIM */}
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
            {/* CHỌN THỜI GIAN CHIẾU */}
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
            {/* SELECT 1: CỤM RẠP */}
            <Form.Item
              label="Chọn Cụm Rạp"
              name="cinemaName" // Trường này có thể không cần gửi về backend, chỉ dùng để lọc
              rules={[{ required: true, message: 'Vui lòng chọn cụm rạp' }]}
            >
              <Select
                placeholder="Chọn cụm rạp..."
                onChange={(value) => {
                  setSelectedCinema(value);
                  form.setFieldValue('theater', undefined); // Reset phòng chiếu khi đổi cụm rạp
                }}
                options={cinemaList.map(c => ({ label: c, value: c }))}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            {/* SELECT 2: PHÒNG CHIẾU (Bị phụ thuộc) */}
            <Form.Item
              label="Chọn Phòng Chiếu"
              name="theater"
              rules={[{ required: true, message: 'Vui lòng chọn phòng chiếu' }]}
            >
              <Select
                placeholder={selectedCinema ? "Chọn phòng..." : "Vui lòng chọn cụm rạp trước"}
                disabled={!selectedCinema || (!!params.id && originalData?.seats?.some(s => s.isBooked))}
                options={filteredTheaters.map(t => ({
                  label: t.name,
                  value: t._id
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>

          <div style={{ marginTop: 30 }}>
            {params.id ? (
              <p style={{ color: '#8c8c8c' }}>
                * Lưu ý: Khi thay đổi phòng chiếu, sơ đồ ghế sẽ được làm mới hoàn toàn.
              </p>
            ) : (
              <p style={{ color: '#8c8c8c' }}>
                * Sơ đồ ghế sẽ được tự động đồng bộ từ phòng chiếu đã chọn.
              </p>
            )}
          </div>
        </Row>

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
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
import SeatsRendering from "modules/seatsRendering/seatsRendering";
import { useSelector } from "react-redux";

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

  const { state: movies = [] } = useAsync({ service: fetchMovieListAPI });
  const { state: theaters = [] } = useAsync({ service: fetchTheaterListAPI });

  const { state: showtimeDetail, loading } = useAsync({
    service: () => {
      return getShowTimeDetail(params.id);
    },
    dependencies: [params.id],
    condition: !!params.id && params.id !== "undefined",
  });

  const cinemaList = useMemo(() => {
    const cinemas = theaters.map(t => t.cinema?.name || t.branch);
    return [...new Set(cinemas)].filter(Boolean);
  }, [theaters]);

  const filteredTheaters = useMemo(() => {
    if (!selectedCinema) return [];
    return theaters.filter(t => (t.cinema?.name || t.branch) === selectedCinema);
  }, [theaters, selectedCinema]);

  useEffect(() => {
    if (params.id && params.id !== "undefined") {
      if (showtimeDetail) {
        const cinemaName = showtimeDetail.theater?.branch || showtimeDetail.theater?.cinema?.name;

        const dataForForm = {
          ...showtimeDetail,
          cinemaName: cinemaName,
          movie: showtimeDetail.id_movie?._id || showtimeDetail.id_movie,
          theater: showtimeDetail.theater?._id || showtimeDetail.theater,
          startTime: showtimeDetail.startTime ? dayjs(showtimeDetail.startTime) : null,
        };

        form.setFieldsValue(dataForForm);
        setOriginalData(dataForForm);
        setSelectedCinema(cinemaName);
        setIsChanged(false);
      }
    } else {
      form.setFieldsValue(DEFAULT_VALUES);
      setOriginalData(null);
      setSelectedCinema(null);
      setIsChanged(false);
    }
  }, [showtimeDetail, params.id, form]);

  const [seats, setSeats] = useState([]);

  useEffect(() => {
    if (showtimeDetail?.seats) setSeats(showtimeDetail.seats);
  }, [showtimeDetail]);

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
        id_movie: values.movie,
        startTime: values.startTime ? values.startTime.toISOString() : null,
        seats,
      };
      console.log(payload);
      if (params.id) {
        await updateShowTime({ id: params.id, ...payload });
        notification.success({ message: "Cập nhật suất chiếu thành công!" });
      } else {
        await addNewShowTime(payload);
        notification.success({ message: "Thêm suất chiếu mới thành công!" });
      }
    } catch (error) {
      notification.error({
        message: "Thao tác thất bại",
        description: error.response?.data?.message || "Thao tác thất bại",
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

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
import utc from "dayjs/plugin/utc";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync, useAsyncMutation, safeArray } from "hooks/useAsync";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { fetchMovieListAPI } from "services/movie";
import { fetchTheaterListAPI } from "services/theater";
import { getAllBranches } from "services/branches";
import {
  updateShowTime,
  addNewShowTime,
  getShowTimeDetail,
} from "services/showtime";
import SeatsRendering from "modules/seatsRendering/seatsRendering";
import { useSelector } from "react-redux";

dayjs.extend(utc);

const DEFAULT_VALUES = {
  movie: undefined,
  cinema: undefined,
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
  const [originalSeats, setOriginalSeats] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [seats, setSeats] = useState([]);

  const isEditMode = !!params.id && params.id !== "undefined";

  const { state: rawMovies } = useAsync({
    service: fetchMovieListAPI,
    queryKey: ["movies-list"],
  });

  const { state: rawTheaters } = useAsync({
    service: fetchTheaterListAPI,
    queryKey: ["theaters-list"],
  });

  const movies = safeArray(rawMovies?.movies);
  const theaters = safeArray(rawTheaters?.theaters);

  const { state: rawBranches } = useAsync({
    service: getAllBranches,
    queryKey: ["branches-list"],
  });

  const branches = useMemo(() => {
    if (!rawBranches?.cinemas) return [];
    if (Array.isArray(rawBranches?.cinemas)) return rawBranches?.cinemas;
    return (
      rawBranches?.cinemas?.branch ??
      Object.values(rawBranches?.branch || {}).find(Array.isArray) ??
      []
    );
  }, [rawBranches]);

  const { state: data, loading } = useAsync({
    service: () => getShowTimeDetail(params.id),
    queryKey: ["showtimes-detail", params.id], // Đã tách queryKey riêng biệt tránh xung đột cache
    dependencies: [params.id],
    condition: isEditMode,
  });

  // Đổ dữ liệu vào form khi ở Edit Mode
  useEffect(() => {
    if (!isEditMode || !data) return;

    const showtimeDetail =
      data?.showtimes ??
      data?.showtime ??
      (Array.isArray(data) ? data[0] : data);
    if (!showtimeDetail) return;

    const dataForForm = {
      movie: showtimeDetail.id_movie?._id || showtimeDetail.id_movie,
      theater: showtimeDetail.theater?._id || showtimeDetail.theater,
      cinema: showtimeDetail.cinema?._id || showtimeDetail.cinema,
      startTime: showtimeDetail.startTime
        ? dayjs(
            showtimeDetail.startTime.replace(/Z$/, "").replace(/\+07:00$/, ""),
          )
        : null,
    };

    form.setFieldsValue(dataForForm);
    setOriginalData(dataForForm);
    setSelectedCinema(showtimeDetail.cinema?._id || showtimeDetail.cinema);

    const showtimeSeats =
      showtimeDetail.seats?.filter((s) => s.color) ??
      showtimeDetail.seats ??
      [];
    setSeats(showtimeSeats);
    setOriginalSeats(showtimeSeats);
    setIsChanged(false);
  }, [data, isEditMode, form]);

  const cinemaList = useMemo(() => branches, [branches]);

  const filteredTheaters = useMemo(() => {
    if (!selectedCinema) return [];
    const selectedBranch = branches.find((b) => b._id === selectedCinema);
    if (!selectedBranch) return [];
    return theaters.filter((t) => t.branch === selectedBranch.branch);
  }, [theaters, branches, selectedCinema]);

  // Hàm kiểm tra tổng hợp xem Form hoặc Ghế có thay đổi so với ban đầu hay không
  const checkIsChanged = (currentFormValues, currentSeats) => {
    if (!isEditMode) {
      const hasInput = Object.keys(currentFormValues).some(
        (key) => currentFormValues[key] !== DEFAULT_VALUES[key],
      );
      return hasInput || currentSeats.length > 0;
    }

    const hasFormChanged = Object.keys(currentFormValues).some((key) => {
      if (key === "startTime") {
        if (!currentFormValues[key] && !originalData?.startTime) return false;
        if (!currentFormValues[key] || !originalData?.startTime) return true;
        return !dayjs(currentFormValues[key]).isSame(originalData?.startTime);
      }
      return currentFormValues[key] !== originalData?.[key];
    });

    const hasSeatsChanged =
      JSON.stringify(currentSeats) !== JSON.stringify(originalSeats);

    return hasFormChanged || hasSeatsChanged;
  };

  const handleSeatAction = (type, updatedSeat) => {
    if (type !== "admin") return;
    setSeats((prev) => {
      const newSeats = prev.map((s) =>
        s._id === updatedSeat._id
          ? {
              ...s,
              seatType: updatedSeat.seatTypeId,
              isBooked: updatedSeat.isBooked,
            }
          : s,
      );
      const currentValues = form.getFieldsValue();
      setIsChanged(checkIsChanged(currentValues, newSeats));
      return newSeats;
    });
  };

  const onValuesChange = (_, allValues) => {
    setIsChanged(checkIsChanged(allValues, seats));
  };

  const showtimeMutation = useAsyncMutation({
    service: (payload) =>
      isEditMode
        ? updateShowTime({ id: params.id, ...payload })
        : addNewShowTime(payload),
    invalidateQueries: [["showtimes-list"], ["showtimes-detail", params.id]],
  });

  const handleSave = async (values) => {
    try {
      const utcStartTime = values.startTime
        ? values.startTime.format("YYYY-MM-DDTHH:mm:ss.000") + "Z"
        : null;

      const payload = {
        id_movie: values.movie,
        cinema: values.cinema,
        theater: values.theater,
        startTime: utcStartTime,
        seats: seats,
      };

      await showtimeMutation.mutateAsync(payload);
      notification.success({
        message: isEditMode
          ? "Cập nhật suất chiếu thành công!"
          : "Thêm suất chiếu mới thành công!",
      });

      setIsChanged(false);
      navigate(-1);
    } catch (error) {
      notification.error({
        message: "Thao tác thất bại",
        description: error.response?.data?.message || "Lỗi hệ thống (500)",
      });
    }
  };

  return (
    <Card
      className="movie-form-card"
      loading={loading || showtimeMutation.isLoading}
      title={
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          />
          <span>
            {isEditMode ? "Chỉnh sửa suất chiếu" : "Tạo suất chiếu mới"}
          </span>
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
          <Col xs={24} md={12}>
            <Form.Item
              label="Chọn Phim"
              name="movie"
              rules={[{ required: true, message: "Vui lòng chọn phim" }]}
            >
              <Select
                showSearch
                placeholder="Tìm kiếm phim..."
                optionFilterProp="label"
                size="large"
                options={movies.map((m) => ({ label: m.title, value: m._id }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Thời gian bắt đầu"
              name="startTime"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                size="large"
                showTime={{
                  format: "HH:mm",
                  defaultValue: dayjs("00:00", "HH:mm"),
                }}
                format="DD/MM/YYYY HH:mm"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Chọn Rạp"
              name="cinema"
              rules={[{ required: true, message: "Vui lòng chọn rạp" }]}
            >
              <Select
                showSearch
                placeholder="Chọn rạp..."
                optionFilterProp="label"
                size="large"
                onChange={(value) => {
                  setSelectedCinema(value);
                  form.setFieldValue("theater", undefined);
                  const currentValues = form.getFieldsValue();
                  setIsChanged(checkIsChanged(currentValues, seats));
                }}
                options={cinemaList.map((b) => ({
                  label: `${b.cinemaName} - ${b.branch}`,
                  value: b._id,
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Chọn Phòng Chiếu"
              name="theater"
              rules={[{ required: true, message: "Vui lòng chọn phòng chiếu" }]}
            >
              <Select
                size="large"
                placeholder={
                  selectedCinema
                    ? "Chọn phòng..."
                    : "Vui lòng chọn cụm rạp trước"
                }
                disabled={!selectedCinema}
                options={filteredTheaters.map((t) => ({
                  label: t.name,
                  value: t._id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <SeatsRendering
          data={seats}
          mode={userState.userInfor?.user_inf?.role}
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
            className="submit-btn"
          >
            {isEditMode ? "CẬP NHẬT SUẤT CHIẾU" : "TẠO SUẤT CHIẾU"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

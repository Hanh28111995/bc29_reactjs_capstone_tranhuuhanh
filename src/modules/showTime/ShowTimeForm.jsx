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
import { useAsync } from "hooks/useAsync";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { fetchMovieListAPI } from "services/movie";
import { fetchTheaterListAPI } from "services/theater";
import { getAllBranches } from "services/branches";
import { updateShowTime, addNewShowTime, getShowTimeDetail } from "services/showtime";
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
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [seats, setSeats] = useState([]);

  const isEditMode = !!params.id && params.id !== "undefined";

  const { state: movies = [] } = useAsync({ service: fetchMovieListAPI });
  const { state: theaters = [] } = useAsync({ service: fetchTheaterListAPI });
  const { state: rawBranches } = useAsync({ service: getAllBranches });
  const branches = useMemo(() => {
    if (!rawBranches) return [];
    if (Array.isArray(rawBranches)) return rawBranches;
    return rawBranches?.branches ?? rawBranches?.branch ?? Object.values(rawBranches).find(Array.isArray) ?? [];
  }, [rawBranches]);

  const { state: data, loading } = useAsync({
    service: () => getShowTimeDetail(params.id),
    dependencies: [params.id],
    condition: isEditMode,
  });

  // Đổ dữ liệu vào form khi ở Edit Mode
  useEffect(() => {
    if (!isEditMode || !data) return;

    // API trả về content.showtimes — useAsync unwrap content thành object { showtimes: {...} }
    const showtimeDetail = data?.showtimes ?? data?.showtime ?? (Array.isArray(data) ? data[0] : data);
    if (!showtimeDetail) return;

    // cinema là object riêng biệt ở top-level, branch lấy từ cinema.branch hoặc theater.branch
    const cinemaName = showtimeDetail.cinema?.cinemaName || showtimeDetail.theater?.cinemaName || showtimeDetail.theater?.branch;

    const dataForForm = {
      movie: showtimeDetail.id_movie?._id || showtimeDetail.id_movie,
      theater: showtimeDetail.theater?._id || showtimeDetail.theater,
      cinema: showtimeDetail.cinema?._id || showtimeDetail.cinema,
      // Bỏ suffix timezone để giữ nguyên giờ hiển thị từ DB
      startTime: showtimeDetail.startTime
        ? dayjs(showtimeDetail.startTime.replace(/Z$/, "").replace(/\+07:00$/, ""))
        : null,
    };

    form.setFieldsValue(dataForForm);
    setOriginalData(dataForForm);
    setSelectedCinema(showtimeDetail.cinema?._id || showtimeDetail.cinema);
    setSeats(showtimeDetail.seats || []);
    setIsChanged(false);
  }, [data, isEditMode, form]);

  const cinemaList = useMemo(() => branches, [branches]);

  const filteredTheaters = useMemo(() => {
    if (!selectedCinema) return [];
    const selectedBranch = branches.find((b) => b._id === selectedCinema);
    if (!selectedBranch) return [];
    return theaters.filter(
      (t) => (t.cinemaName || t.cinema?.name || t.branch) === selectedBranch.branch
    );
  }, [theaters, branches, selectedCinema]);

  const handleSeatAction = (type, updatedSeat) => {
    if (type !== "admin") return;
    setSeats((prev) =>
      prev.map((s) =>
        s._id === updatedSeat._id
          ? { ...s, seatType: updatedSeat.seatTypeId, isBooked: updatedSeat.isBooked }
          : s
      )
    );
    setIsChanged(true);
  };

  const onValuesChange = (_, allValues) => {
    if (!isEditMode) {
      setIsChanged(true);
      return;
    }
    const hasChanged = Object.keys(allValues).some((key) => {
      if (key === "startTime") {
        return !dayjs(allValues[key]).isSame(originalData?.startTime);
      }
      return allValues[key] !== originalData?.[key];
    });
    setIsChanged(hasChanged);
  };

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

      if (isEditMode) {
        await updateShowTime({ id: params.id, ...payload });
        notification.success({ message: "Cập nhật suất chiếu thành công!" });
      } else {
        await addNewShowTime(payload);
        notification.success({ message: "Thêm suất chiếu mới thành công!" });
      }

      setIsChanged(false);
      navigate("/admin/showtimes");
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
          <span>{isEditMode ? "Chỉnh sửa suất chiếu" : "Tạo suất chiếu mới"}</span>
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
              rules={[{ required: true, message: "Vui lòng chọn phim" }]}
            >
              <Select
                showSearch
                placeholder="Tìm kiếm phim..."
                optionFilterProp="label"
                options={movies.map((m) => ({ label: m.title, value: m._id }))}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Thời gian bắt đầu"
              name="startTime"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                showTime={{ format: "HH:mm", defaultValue: dayjs("00:00", "HH:mm") }}
                format="DD/MM/YYYY HH:mm"
                disabledDate={(current) => current && current < dayjs().startOf("day")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Chọn Rạp"
              name="cinema"
              rules={[{ required: true, message: "Vui lòng chọn rạp" }]}
            >
              <Select
                showSearch
                placeholder="Chọn rạp..."
                optionFilterProp="label"
                onChange={(value) => {
                  setSelectedCinema(value);
                  form.setFieldValue("theater", undefined);
                }}
                options={cinemaList.map((b) => ({ label: `${b.cinemaName} - ${b.branch}`, value: b._id }))}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Chọn Phòng Chiếu"
              name="theater"
              rules={[{ required: true, message: "Vui lòng chọn phòng chiếu" }]}
            >
              <Select
                placeholder={selectedCinema ? "Chọn phòng..." : "Vui lòng chọn cụm rạp trước"}
                disabled={!selectedCinema}
                options={filteredTheaters.map((t) => ({ label: t.name, value: t._id }))}
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
          >
            {isEditMode ? "CẬP NHẬT SUẤT CHIẾU" : "TẠO SUẤT CHIẾU"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

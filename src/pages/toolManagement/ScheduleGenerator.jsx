import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Checkbox,
  Button,
  App,
  Typography,
  Divider,
  Switch,
  DatePicker,
  Radio,
  InputNumber,
  Space,
  Select,
} from "antd";
import {
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { fetchMovieListAPI } from "services/movie";
import { fetchTheaterListAPI } from "services/theater";
import {
  createScheduleAPI,
  getScheduleListAPI,
  updateScheduleAPI,
  generateScheduleAPI,
} from "services/scheduleGenerator";
import { useAsync, useAsyncMutation } from "hooks/useAsync";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TIME_SLOTS = ["09:00", "12:00", "15:00", "18:00", "21:00"];

const SCHEDULE_OPTIONS = [
  { label: "Hằng ngày (Daily)", value: 1 },
  { label: "Hằng tuần (Weekly)", value: 2 },
  { label: "Hằng tháng (Monthly)", value: 3 },
];

export default function ScheduleGenerator() {
  const { notification } = App.useApp();

  // State cấu hình đúng theo Schema mới
  const [selectedMovies, setSelectedMovies] = useState([
    { movie_id: null, startDate: null, endDate: null },
  ]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedTheaters, setSelectedTheaters] = useState([]);
  const [scheduleType, setScheduleType] = useState(1);
  const [generateDays, setGenerateDays] = useState(3);
  const [isActive, setIsActive] = useState(true);
  const [generating, setGenerating] = useState(false);

  const { state: rawMovies } = useAsync({
    service: fetchMovieListAPI,
    queryKey: ["movies_list", "active"],
  });

  const { state: rawTheaters } = useAsync({
    service: fetchTheaterListAPI,
    queryKey: ["theaters_list", "active"],
  });

  const { state: scheduleData } = useAsync({
    service: getScheduleListAPI,
    queryKey: ["scheduleData_list", "active"],
  });

  // Defensive: content có thể bọc { schedule } hoặc trả thẳng
  const schedule =
    scheduleData?.schedule ??
    scheduleData?.content?.schedule ??
    scheduleData?.content ??
    scheduleData ??
    null;
  const existingId = schedule?._id ?? null;

  const scheduleMutation = useAsyncMutation({
    service: async ({ payload, isUpdate }) => {
      return isUpdate ? updateScheduleAPI(payload) : createScheduleAPI(payload);
    },
    invalidateQueries: [["scheduleData_list", "active"]],
    onSuccess: () => {
      notification.success({ message: "Lưu cấu hình lịch chiếu thành công!" });
    },
    onError: () => {
      notification.error({ message: "Lỗi khi lưu cấu hình lịch chiếu" });
    },
  });

  // Load lại thông tin cấu hình từ DB lên Form
  useEffect(() => {
    if (!schedule) return;

    if (schedule.movies?.length) {
      setSelectedMovies(
        schedule.movies.map((item) => ({
          movie_id: item.movie_id?._id || item.movie_id,
          startDate: item.startDate ? dayjs(item.startDate) : null,
          endDate: item.endDate ? dayjs(item.endDate) : null,
        }))
      );
    }
    if (schedule.timeSlots?.length) setSelectedSlots(schedule.timeSlots);
    if (schedule.theaters?.length) {
      setSelectedTheaters(
        schedule.theaters.map((t) => (typeof t === "object" ? t._id : t))
      );
    }
    if (schedule.scheduleType) setScheduleType(schedule.scheduleType);
    if (schedule.generateDays) setGenerateDays(schedule.generateDays);
    if (schedule.isActive !== undefined) setIsActive(schedule.isActive);
  }, [schedule?._id]);

  const moviesList = useMemo(() => {
    const list = rawMovies?.movies || rawMovies || [];
    return Array.isArray(list) ? list : [];
  }, [rawMovies]);

  const theaters = useMemo(() => {
    const list = rawTheaters?.theaters || rawTheaters || [];
    return Array.isArray(list) ? list : [];
  }, [rawTheaters]);

  // Handlers cho việc Quản lý Danh sách Phim + Ngày chiếu
  const handleAddMovieRow = () => {
    setSelectedMovies((prev) => [
      ...prev,
      { movie_id: null, startDate: null, endDate: null },
    ]);
  };

  const handleRemoveMovieRow = (index) => {
    setSelectedMovies((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovieChange = (index, movie_id) => {
    setSelectedMovies((prev) => {
      const updated = [...prev];
      updated[index].movie_id = movie_id;
      return updated;
    });
  };

  const handleDateRangeChange = (index, dates) => {
    setSelectedMovies((prev) => {
      const updated = [...prev];
      updated[index].startDate = dates ? dates[0] : null;
      updated[index].endDate = dates ? dates[1] : null;
      return updated;
    });
  };

  // Validation và Submit
  const handleGenerate = async () => {
    if (selectedMovies.length === 0) {
      return notification.warning({ message: "Cần ít nhất 1 phim trong cấu hình" });
    }

    const hasInvalidMovie = selectedMovies.some(
      (m) => !m.movie_id || !m.startDate || !m.endDate
    );
    if (hasInvalidMovie) {
      return notification.warning({
        message: "Vui lòng chọn đầy đủ Phim và Cửa sổ chiếu (Ngày bắt đầu - kết thúc)",
      });
    }

    if (selectedSlots.length === 0) {
      return notification.warning({ message: "Vui lòng chọn ít nhất 1 khung giờ" });
    }

    if (selectedTheaters.length === 0) {
      return notification.warning({ message: "Vui lòng chọn ít nhất 1 rạp" });
    }

    // Format Payload tương thích với Schema Mongoose
    const payload = {
      movies: selectedMovies.map((m) => ({
        movie_id: m.movie_id,
        startDate: m.startDate.toISOString(),
        endDate: m.endDate.toISOString(),
      })),
      timeSlots: selectedSlots,
      theaters: selectedTheaters,
      scheduleType,
      generateDays,
      isActive,
    };

    try {
      await scheduleMutation.mutateAsync({
        payload,
        isUpdate: Boolean(existingId),
      });

      // Sau khi lưu config → gọi luôn generate suất chiếu
      setGenerating(true);
      try {
        const res = await generateScheduleAPI();
        const data = res?.data?.content || res?.data || {};
        notification.success({
          message: "Đã sinh suất chiếu",
          description: `${data.created ?? 0} suất mới, ${data.skipped ?? 0} suất bỏ qua (đã có)`,
        });
      } catch (err) {
        notification.warning({
          message: "Cấu hình đã lưu",
          description: "Generate suất chiếu lỗi — cron hằng ngày sẽ tự lấp sau.",
        });
      } finally {
        setGenerating(false);
      }
    } catch (err) {
      // scheduleMutation onError đã xử lý
    }
  };

  return (
    <Card
      title={
        <span>
          <CalendarOutlined style={{ marginRight: 8 }} />
          Schedule Config Generator
        </span>
      }
    >
      <Row gutter={[24, 24]}>
        {/* 1. Chọn Phim & Cửa sổ chiếu */}
        <Col span={24}>
          <Title level={5}>1. Phim & Cửa sổ chiếu (Movies & Windows)</Title>
          <Text type="secondary">
            Cấu hình danh sách phim kèm theo khoảng thời gian chiếu riêng biệt
          </Text>

          <div style={{ marginTop: 12 }}>
            {selectedMovies.map((item, index) => {
              const availableMovies = moviesList.filter(
                (m) =>
                  m._id === item.movie_id ||
                  !selectedMovies.some((sm) => sm.movie_id === m._id)
              );

              return (
                <Row
                  key={index}
                  gutter={12}
                  align="middle"
                  style={{ marginBottom: 12 }}
                >
                  <Col xs={24} sm={10}>
                    <Select
                      showSearch
                      placeholder="Chọn phim..."
                      value={item.movie_id}
                      onChange={(val) => handleMovieChange(index, val)}
                      style={{ width: "100%" }}
                      optionFilterProp="label"
                      options={availableMovies.map((m) => ({
                        value: m._id,
                        label: m.title,
                      }))}
                    />
                  </Col>
                  <Col xs={20} sm={12}>
                    <RangePicker
                      style={{ width: "100%" }}
                      value={
                        item.startDate && item.endDate
                          ? [item.startDate, item.endDate]
                          : null
                      }
                      onChange={(dates) => handleDateRangeChange(index, dates)}
                      format="DD/MM/YYYY"
                    />
                  </Col>
                  <Col xs={4} sm={2}>
                    {selectedMovies.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveMovieRow(index)}
                      />
                    )}
                  </Col>
                </Row>
              );
            })}

            <Button
              type="dashed"
              onClick={handleAddMovieRow}
              block
              icon={<PlusOutlined />}
              style={{ marginTop: 4 }}
            >
              Thêm phim
            </Button>
          </div>
        </Col>

        <Divider style={{ margin: 0 }} />

        {/* 2. Khung giờ chiếu */}
        <Col span={24}>
          <Title level={5}>2. Khung giờ chiếu (Time Slots)</Title>
          <Checkbox.Group
            options={TIME_SLOTS.map((t) => ({ label: t, value: t }))}
            value={selectedSlots}
            onChange={setSelectedSlots}
          />
        </Col>

        <Divider style={{ margin: 0 }} />

        {/* 3. Chọn Phòng/Rạp */}
        <Col span={24}>
          <Title level={5}>3. Rạp áp dụng (Theaters)</Title>
          <Row gutter={[8, 8]}>
            {theaters.map((t) => (
              <Col key={t._id} xs={12} sm={8} md={6}>
                <Checkbox
                  checked={selectedTheaters.includes(t._id)}
                  onChange={(e) =>
                    setSelectedTheaters((prev) =>
                      e.target.checked
                        ? [...prev, t._id]
                        : prev.filter((id) => id !== t._id)
                    )
                  }
                >
                  {t.name}
                  {t.branch && (
                    <span
                      style={{ color: "#aaa", fontSize: 11, marginLeft: 4 }}
                    >
                      ({t.branch})
                    </span>
                  )}
                </Checkbox>
              </Col>
            ))}
          </Row>
        </Col>

        <Divider style={{ margin: 0 }} />

        {/* 4. Chu kỳ sinh & Cấu hình Cron */}
        <Col span={24}>
          <Title level={5}>4. Lịch tự động & Lấp suất chiếu (Cron Settings)</Title>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Chu kỳ sinh (Schedule Type):
              </Text>
              <Radio.Group
                options={SCHEDULE_OPTIONS}
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              />
            </div>

            <div>
              <Text strong style={{ marginRight: 12 }}>
                Số ngày sinh trước (Generate Days):
              </Text>
              <InputNumber
                min={1}
                max={14}
                value={generateDays}
                onChange={(val) => setGenerateDays(val || 1)}
              />
              <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                (Tự động lấp các ngày từ 1 đến 14 ngày tới)
              </Text>
            </div>
          </Space>
        </Col>

        <Divider style={{ margin: 0 }} />

        {/* Action Button & Switch Active */}
        <Col span={24}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Switch checked={isActive} onChange={setIsActive} />
            <Text strong>Kích hoạt cấu hình (Is Active)</Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            loading={scheduleMutation.isLoading || generating}
            onClick={handleGenerate}
            block
          >
            {existingId ? "Lưu Cấu Hình & Sinh Suất Chiếu" : "Tạo Cấu Hình & Sinh Suất Chiếu"}
          </Button>
        </Col>
      </Row>
    </Card>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Row, Col, Checkbox, Button, App, Typography, Divider, Tag, Switch
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { fetchMovieListAPI } from "services/movie";
import { fetchTheaterListAPI } from "services/theater";
import { createScheduleAPI, getScheduleListAPI, updateScheduleAPI } from "services/scheduleGenerator";
import { useAsync } from "hooks/useAsync";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const TIME_SLOTS = ["09:00", "12:00", "15:00", "18:00", "21:00"];

const SCHEDULE_OPTIONS = [
  { label: "Daily", value: 1 },
  { label: "Weekly", value: 2 },
  { label: "Monthly", value: 3 },
];

export default function ScheduleGenerator() {
  const { notification } = App.useApp();

  const [selectedMovies, setSelectedMovies] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedTheaters, setSelectedTheaters] = useState([]);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const { state: rawMovies } = useAsync({ service: fetchMovieListAPI });
  const { state: rawTheaters } = useAsync({ service: fetchTheaterListAPI });
  const { state: scheduleData } = useAsync({ service: getScheduleListAPI });

  const schedule = scheduleData?.schedule ?? scheduleData ?? null;
  const existingId = schedule?._id ?? null;

  // Pre-populate form từ existing schedule
  useEffect(() => {
    if (!schedule) return;
    if (schedule.movie_ids?.length) setSelectedMovies(schedule.movie_ids);
    if (schedule.timeSlots?.length) setSelectedSlots(schedule.timeSlots);
    if (schedule.theaters?.length) setSelectedTheaters(schedule.theaters);
    if (schedule.scheduleTime) setScheduleTime(schedule.scheduleTime);
    if (schedule.isActive !== undefined) setIsActive(schedule.isActive);
  }, [schedule?._id]);

  const movies = useMemo(() => {
    const list = Array.isArray(rawMovies) ? rawMovies : [];
    return [...list]
      .filter((m) => m.releaseDate)
      .sort((a, b) => dayjs(b.releaseDate).diff(dayjs(a.releaseDate)))
      .slice(0, 5);
  }, [rawMovies]);

  const theaters = Array.isArray(rawTheaters) ? rawTheaters : [];

  const handleGenerate = async () => {
    if (selectedMovies.length === 0)
      return notification.warning({ message: "Vui lòng chọn ít nhất 1 phim" });
    if (selectedSlots.length === 0)
      return notification.warning({ message: "Vui lòng chọn ít nhất 1 khung giờ" });
    if (selectedTheaters.length === 0)
      return notification.warning({ message: "Vui lòng chọn ít nhất 1 rạp" });
    if (!scheduleTime)
      return notification.warning({ message: "Vui lòng chọn lịch lặp" });

    const payload = {
      movie_ids: selectedMovies,
      timeSlots: selectedSlots,
      theaters: selectedTheaters,
      scheduleTime,
      isActive,
    };

    setLoading(true);
    try {
      if (existingId) {
        await updateScheduleAPI(payload);
      } else {
        await createScheduleAPI(payload);
      }
      notification.success({ message: "Schedule generated successfully!" });
    } catch (err) {
      notification.error({ message: "Failed to generate schedule" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <span>
          <CalendarOutlined style={{ marginRight: 8 }} />
          Schedule Generator
        </span>
      }
    >
      <Row gutter={[24, 24]}>
        {/* 1. Chọn phim */}
        <Col span={24}>
          <Title level={5}>1. Select Movie</Title>
          <Text type="secondary">Select up to 5 movies</Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {movies.map((m) => {
              const isSelected = selectedMovies.includes(m._id);
              const maxReached = selectedMovies.length >= 5;
              return (
                <Tag
                  key={m._id}
                  color={isSelected ? "blue" : "default"}
                  style={{
                    cursor: isSelected || !maxReached ? "pointer" : "not-allowed",
                    opacity: !isSelected && maxReached ? 0.45 : 1,
                    padding: "4px 12px",
                    fontSize: 13,
                  }}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedMovies((prev) => prev.filter((id) => id !== m._id));
                    } else if (!maxReached) {
                      setSelectedMovies((prev) => [...prev, m._id]);
                    }
                  }}
                >
                  {isSelected && <span style={{ marginRight: 4 }}>✓</span>}
                  {m.title}
                  <span style={{ marginLeft: 6, color: "#aaa", fontSize: 11 }}>
                    {dayjs(m.releaseDate).format("DD/MM/YYYY")}
                  </span>
                </Tag>
              );
            })}
          </div>
          {selectedMovies.length > 0 && (
            <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
              {selectedMovies.length}/5 selected
            </Text>
          )}
        </Col>

        <Divider style={{ margin: 0 }} />

        {/* 2. Khung giờ */}
        <Col span={24}>
          <Title level={5}>2. Time Slots</Title>
          <Checkbox.Group
            options={TIME_SLOTS.map((t) => ({ label: t, value: t }))}
            value={selectedSlots}
            onChange={setSelectedSlots}
          />
        </Col>

        <Divider style={{ margin: 0 }} />

        {/* 3. Rạp */}
        <Col span={24}>
          <Title level={5}>3. Theaters</Title>
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
                    <span style={{ color: "#aaa", fontSize: 11, marginLeft: 4 }}>
                      ({t.branch})
                    </span>
                  )}
                </Checkbox>
              </Col>
            ))}
          </Row>
        </Col>

        <Divider style={{ margin: 0 }} />

        {/* 4. Schedule */}
        <Col span={24}>
          <Title level={5}>4. Schedule</Title>
          <Checkbox.Group
            value={scheduleTime ? [scheduleTime] : []}
            onChange={(vals) => setScheduleTime(vals[vals.length - 1] ?? null)}
          >
            <Row gutter={16}>
              {SCHEDULE_OPTIONS.map((opt) => (
                <Col key={opt.value}>
                  <Checkbox value={opt.value}>{opt.label}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Col>

        <Divider style={{ margin: 0 }} />

        {/* Submit */}
        <Col span={24}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Switch checked={isActive} onChange={setIsActive} />
            <span>Active</span>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<CalendarOutlined />}
            loading={loading}
            onClick={handleGenerate}
            block
          >
            Generate Schedule
          </Button>
        </Col>
      </Row>
    </Card>
  );
}

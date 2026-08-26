import {
  Button,
  Form,
  Input,
  InputNumber,
  App,
  Select,
  Space,
  Card,
  Row,
  Col,
  Divider,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync, useAsyncMutation, safeArray } from "hooks/useAsync";
import {
  fetchTheaterDetailAPI,
  addTheaterAPI,
  updateTheaterAPI,
} from "services/theater";
import { getAllBranches } from "services/branches";
import SeatsRendering from "modules/seatsRendering/seatsRendering";
import { useSelector } from "react-redux";
import { getAllSeatTypesApi } from "services/seatType";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  WarningOutlined,
} from "@ant-design/icons";

export default function TheaterForm() {
  const userState = useSelector((state) => state.userReducer);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const { notification } = App.useApp();

  const [isChanged, setIsChanged] = useState(false);
  const [listGhe, setListGhe] = useState([]);
  const [originalSeats, setOriginalSeats] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [isResettingSeats, setIsResettingSeats] = useState(false);

  // State để chốt giá trị gửi về Backend
  const [SeatRow, setSeatRow] = useState(null);
  const [SeatCol, setSeatCol] = useState(null);

  // State hiển thị số ghế tạm thời trên giao diện
  const [tempTotal, setTempTotal] = useState({ rows: 10, cols: 10 });

  const { state: rawSeatsDB } = useAsync({
    service: getAllSeatTypesApi,
    queryKey: ["seat-types-list"],
  });
  const seatsDB = safeArray(rawSeatsDB);

  const { state: rawCinemas } = useAsync({
    service: getAllBranches,
    queryKey: ["branches_list"],
  });

  const cinemas = useMemo(() => {
    if (!rawCinemas) return [];
    if (Array.isArray(rawCinemas)) return rawCinemas;
    return rawCinemas.cinemas;
  }, [rawCinemas]);

  const { state: theaterDetailRaw, loading } = useAsync({
    service: () => fetchTheaterDetailAPI(params.theaterId),
    queryKey: ["theater-detail", params.theaterId], // Đã thêm queryKey riêng biệt tránh xung đột cache
    dependencies: [params.theaterId],
    condition: !!params.theaterId,
  });

  const theaterDetail = theaterDetailRaw?.theater ?? theaterDetailRaw;

  const selectedCinema = Form.useWatch("cinemaName", form);

  const cinemaOptions = useMemo(() => {
    if (!Array.isArray(cinemas)) return [];
    const uniqueNames = [
      ...new Set(cinemas.map((item) => item?.cinemaName).filter(Boolean)),
    ];
    return uniqueNames.map((name) => ({
      label: name,
      value: name,
    }));
  }, [cinemas]);

  const branchOptions = useMemo(() => {
    if (!selectedCinema || !Array.isArray(cinemas)) return [];
    return cinemas
      .filter((item) => item?.cinemaName === selectedCinema)
      .map((item) => ({
        label: item?.branch,
        value: item?.branch,
      }));
  }, [selectedCinema, cinemas]);

  // Khởi tạo và đồng bộ dữ liệu Form
  useEffect(() => {
    if (params.theaterId && theaterDetail) {
      form.setFieldsValue(theaterDetail);
      setListGhe(theaterDetail.seats || []);
      setOriginalSeats(theaterDetail.seats || []);
      setOriginalData(theaterDetail);
      setSeatRow(theaterDetail.totalSeat?.rows);
      setSeatCol(theaterDetail.totalSeat?.cols);
      setTempTotal({
        rows: theaterDetail.totalSeat?.rows || 0,
        cols: theaterDetail.totalSeat?.cols || 0,
      });
      setIsResettingSeats(false);
    } else if (!params.theaterId) {
      form.resetFields();
      setListGhe([]);
      setOriginalSeats([]);
      setOriginalData({
        name: "",
        cinemaName: undefined,
        branch: undefined,
        description: "",
        totalSeat: { rows: 0, cols: 0 },
      });
      setSeatRow(0);
      setSeatCol(0);
      setTempTotal({ rows: 0, cols: 0 });
      setIsResettingSeats(false);
    }
    setIsChanged(false);
  }, [theaterDetail, params.theaterId, form]);

  const handleCinemaChange = () => {
    form.setFieldValue("branch", undefined);
  };

  // Hàm kiểm tra tổng hợp trạng thái thay đổi
  const checkIsChanged = (currentValues, currentSeats, isReset) => {
    if (isReset) return true;
    if (!params.theaterId) {
      const hasInput = Object.keys(currentValues).some(
        (key) => currentValues[key] !== undefined && currentValues[key] !== "",
      );
      return hasInput || currentSeats.length > 0;
    }

    const hasFormChanged = Object.keys(currentValues).some((key) => {
      if (key === "totalSeat") {
        return (
          currentValues.totalSeat?.rows !== originalData?.totalSeat?.rows ||
          currentValues.totalSeat?.cols !== originalData?.totalSeat?.cols
        );
      }
      return currentValues[key] !== originalData?.[key];
    });

    const hasSeatsChanged =
      JSON.stringify(currentSeats) !== JSON.stringify(originalSeats);

    return hasFormChanged || hasSeatsChanged;
  };

  const handleFormChange = (_, allValues) => {
    setTempTotal({
      rows: allValues.totalSeat?.rows || 0,
      cols: allValues.totalSeat?.cols || 0,
    });
    setIsChanged(checkIsChanged(allValues, listGhe, isResettingSeats));
  };

  const handleSeatUpdate = (type, payload) => {
    if (type === "admin") {
      const { seatNumber, seatTypeId, isBooked } = payload;
      const newTypeInfo = seatsDB.find((t) => t._id === seatTypeId);

      const updatedSeats = listGhe.map((seat) => {
        if (seat.seatNumber === seatNumber) {
          return {
            ...seat,
            isBooked: isBooked,
            seatType: newTypeInfo ? { ...newTypeInfo } : seat.seatType,
          };
        }
        return seat;
      });

      setListGhe(updatedSeats);
      const currentValues = form.getFieldsValue();
      setIsChanged(
        checkIsChanged(currentValues, updatedSeats, isResettingSeats),
      );
    }
  };

  const handleConfirmLayout = () => {
    const rows = form.getFieldValue(["totalSeat", "rows"]);
    const cols = form.getFieldValue(["totalSeat", "cols"]);

    if (!rows || !cols) {
      return notification.warning({
        message: "Vui lòng nhập đầy đủ số hàng và cột",
      });
    }

    setSeatRow(rows);
    setSeatCol(cols);
    setIsResettingSeats(true);

    const currentValues = form.getFieldsValue();
    setIsChanged(checkIsChanged(currentValues, listGhe, true));

    notification.info({
      message: "Xác nhận thay đổi",
      description:
        "Quy mô ghế đã được chốt. Hệ thống sẽ khởi tạo lại danh sách ghế khi bạn lưu cấu hình chính.",
    });
  };

  const theaterMutation = useAsyncMutation({
    service: (payload) =>
      params.theaterId
        ? updateTheaterAPI(params.theaterId, payload)
        : addTheaterAPI(payload),
    invalidateQueries: [["theaters-list"]],
  });

  const handleSave = async (values) => {
    try {
      const payload = {
        ...values,
        totalSeat: {
          rows: SeatRow,
          cols: SeatCol,
        },
        seats: isResettingSeats ? [] : listGhe,
      };

      await theaterMutation.mutateAsync(payload);
      notification.success({
        message: params.theaterId
          ? "Cập nhật thành công!"
          : "Thêm phòng chiếu mới thành công!",
      });
      navigate(-1);
    } catch (error) {
      notification.error({
        message: "Lỗi hệ thống",
        description:
          error.response?.data?.message ||
          error.message ||
          "Không thể lưu dữ liệu phòng chiếu.",
      });
    }
  };

  return (
    <Card
      className="movie-form-card"
      loading={loading || theaterMutation.isLoading}
      title={
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          />
          <span>
            {params.theaterId ? "Cấu hình phòng chiếu" : "Tạo phòng chiếu mới"}
          </span>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onValuesChange={handleFormChange}
        initialValues={{ totalSeat: { rows: 0, cols: 0 } }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tên phòng chiếu"
              name="name"
              rules={[
                { required: true, message: "Nhập tên phòng (Vd: Phòng 01)" },
              ]}
            >
              <Input placeholder="Nhập tên phòng chiếu..." size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Thuộc cụm rạp quản lý"
              name="cinemaName"
              rules={[{ required: true, message: "Vui lòng chọn cụm rạp" }]}
            >
              <Select
                placeholder="Chọn cụm rạp"
                showSearch
                size="large"
                optionFilterProp="label"
                onChange={handleCinemaChange}
                options={cinemaOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Chi nhánh (Khu vực)"
          name="branch"
          rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
        >
          <Select
            placeholder={
              selectedCinema ? "Chọn chi nhánh" : "Vui lòng chọn cụm rạp trước"
            }
            disabled={!selectedCinema}
            showSearch
            size="large"
            optionFilterProp="label"
            options={branchOptions}
          />
        </Form.Item>

        <Card
          type="inner"
          title="Thiết lập sơ đồ cơ bản"
          style={{ marginBottom: 24 }}
        >
          <Row gutter={48} align="middle">
            <Col xs={24} sm={8}>
              <Form.Item label="Số hàng ngang" name={["totalSeat", "rows"]}>
                <InputNumber
                  min={1}
                  max={20}
                  size="large"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Số cột dọc" name={["totalSeat", "cols"]}>
                <InputNumber
                  min={1}
                  max={20}
                  size="large"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={8}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontStyle: "italic",
                  marginRight: "16px",
                }}
              >
                Tổng {tempTotal.rows * tempTotal.cols} ghế
              </div>
              <Button type="primary" size="large" onClick={handleConfirmLayout}>
                <SaveOutlined /> Lưu quy mô
              </Button>
            </Col>
          </Row>
        </Card>

        <Form.Item label="Mô tả / Lưu ý" name="description">
          <Input.TextArea
            rows={2}
            placeholder="Thông tin thêm về phòng chiếu..."
          />
        </Form.Item>

        <Divider orientation="left">Sơ đồ ghế chi tiết</Divider>

        <div
          style={{
            background: "#f5f5f5",
            padding: "24px",
            borderRadius: "8px",
            marginBottom: "24px",
            minHeight: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "auto",
          }}
        >
          {isResettingSeats ? (
            <div style={{ textAlign: "center", color: "#faad14" }}>
              <WarningOutlined
                style={{ fontSize: "32px", marginBottom: "8px" }}
              />
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                Ghế đang chờ khởi tạo
              </div>
              <p>
                Sơ đồ mới sẽ hiển thị sau khi bạn nhấn nút "LƯU CẤU HÌNH" phía
                dưới.
              </p>
            </div>
          ) : (
            <SeatsRendering
              data={listGhe}
              onAction={handleSeatUpdate}
              mode={userState.userInfor?.user_inf?.role}
              selectedSeats={[]}
            />
          )}
        </div>

        <Form.Item style={{ marginTop: "24px" }}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!isChanged}
            size="large"
            icon={<SaveOutlined />}
            block
            className="submit-btn"
          >
            LƯU CẤU HÌNH PHÒNG CHIẾU
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

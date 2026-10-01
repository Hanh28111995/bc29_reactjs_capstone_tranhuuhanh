import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Switch,
  App,
  Card,
  Row,
  Col,
  Space,
  Input,
  InputNumber,
  DatePicker,
  Select,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync, useAsyncMutation } from "hooks/useAsync";
import dayjs from "dayjs";
import {
  fetchCreateCouponAPI,
  fetchUpdateCouponAPI,
  fetchAllCouponsAPI,
} from "services/coupon";

const DEFAULT_VALUES = {
  code: "",
  discountPercent: 0,
  maxDiscount: 0,
  maxUsage: 1,
  minSubtotal: 0,
  type: "admin",
  startDate: null,
  endDate: null,
  active: true,
};

export default function CouponForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const { notification } = App.useApp();
  const [isChanged, setIsChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Lấy chi tiết bằng cách lọc trong list (BE không có API detail riêng)
  const { data: couponList } = useAsync({
    service: () => fetchAllCouponsAPI(),
    condition: !!params.id,
    dependencies: [params.id],
    queryKey: ["coupons-list", "all"],
  });

  useEffect(() => {
    if (params.id && couponList) {
      const list = Array.isArray(couponList)
        ? couponList
        : couponList?.coupons ?? couponList?.data ?? [];
      const data = list.find((c) => c._id === params.id);
      if (data) {
        const normalized = {
          ...data,
          startDate: data.startDate ? dayjs(data.startDate) : null,
          endDate: data.endDate ? dayjs(data.endDate) : null,
        };
        form.setFieldsValue(normalized);
        setOriginalData(normalized);
        setIsChanged(false);
      }
    } else if (params.id === "create" || !params.id) {
      form.setFieldsValue(DEFAULT_VALUES);
      setOriginalData(null);
      setIsChanged(false);
    }
  }, [couponList, params.id, form]);

  const couponMutation = useAsyncMutation({
    service: (payload) =>
      params.id && params.id !== "create"
        ? fetchUpdateCouponAPI(params.id, payload)
        : fetchCreateCouponAPI(payload),
    invalidateQueries: [["coupons-list"]],
  });

  const handleSave = async (values) => {
    try {
      const payload = {
        ...values,
        code: values.code?.toUpperCase(),
        startDate: values.startDate ? values.startDate.format("YYYY-MM-DD") : null,
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
      };
      await couponMutation.mutateAsync(payload);
      notification.success({
        message: params.id && params.id !== "create" ? "Cập nhật mã giảm giá thành công!" : "Tạo mã giảm giá mới thành công!",
      });
      navigate(-1);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra!",
      });
    }
  };

  return (
    <Card
      className="movie-form-card"
      loading={couponMutation.isLoading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          <span>{params.id && params.id !== "create" ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}</span>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onValuesChange={(_, allValues) => {
          const hasChanged = Object.keys(allValues).some((key) => {
            const currentVal = allValues[key];
            const originalVal = originalData?.[key];
            if (key === "startDate" || key === "endDate") {
              if (!currentVal && !originalVal) return false;
              if (!currentVal || !originalVal) return true;
              return !dayjs(currentVal).isSame(dayjs(originalVal), "day");
            }
            return currentVal !== originalVal;
          });
          setIsChanged(hasChanged);
        }}
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={12}>
            <Form.Item label="Mã giảm giá" name="code" rules={[{ required: true, message: "Vui lòng nhập mã!" }]}>
              <Input placeholder="VD: GIAM20" size="large" />
            </Form.Item>

            <Form.Item label="Phần trăm giảm (%)" name="discountPercent" rules={[{ required: true, message: "Vui lòng nhập phần trăm!" }]}>
              <InputNumber min={1} max={100} style={{ width: "100%" }} size="large" />
            </Form.Item>

            <Form.Item label="Giảm tối đa (VNĐ)" name="maxDiscount" rules={[{ required: true, message: "Vui lòng nhập số tiền tối đa!" }]}>
              <InputNumber min={0} style={{ width: "100%" }} size="large" />
            </Form.Item>

            <Form.Item label="Loại mã" name="type">
              <Select
                size="large"
                options={[
                  { value: "admin", label: "Admin (mã chung)" },
                  { value: "redeem", label: "Redeem (mã đổi điểm)" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item label="Số lượt dùng tối đa" name="maxUsage">
              <InputNumber min={1} style={{ width: "100%" }} size="large" />
            </Form.Item>

            <Form.Item label="Giá trị tối thiểu của đơn (VNĐ)" name="minSubtotal">
              <InputNumber min={0} style={{ width: "100%" }} size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Bắt đầu" name="startDate">
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Kết thúc" name="endDate">
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Hoạt động" name="active" valuePropName="checked">
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: "24px" }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            disabled={!isChanged}
            block
            size="large"
            className="submit-btn"
          >
            {params.id && params.id !== "create" ? "CẬP NHẬT MÃ GIẢM GIÁ" : "TẠO MÃ GIẢM GIÁ MỚI"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
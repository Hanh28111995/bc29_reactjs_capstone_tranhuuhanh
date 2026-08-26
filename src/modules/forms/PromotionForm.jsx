import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Switch,
  Image,
  App,
  Card,
  Row,
  Col,
  Space,
  Input,
  DatePicker,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync, useAsyncMutation } from "hooks/useAsync";
import dayjs from "dayjs";
import {
  getPromotionDetailAPI,
  addPromotionAPI,
  updatePromotionAPI,
} from "services/promotion";
import "./index.scss";

const DEFAULT_VALUES = {
  title: "",
  content: "",
  startDate: null,
  endDate: null,
  highlight: false,
};

export default function PromotionForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const { notification } = App.useApp();

  const [img, setImg] = useState("");
  const [file, setFile] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const { state: promoDetail, loading } = useAsync({
    service: () =>
      params.promoId && params.promoId !== "create"
        ? getPromotionDetailAPI(params.promoId)
        : Promise.resolve(null),
    dependencies: [params.promoId],
    condition: !!params.promoId && params.promoId !== "create",
    queryKey: ["promotions-detail", params.promoId],
  });

  useEffect(() => {
    if (params.promoId && params.promoId !== "create") {
      const data = promoDetail?.data || promoDetail;
      if (data) {
        const normalized = {
          ...data,
          startDate: data.startDate ? dayjs(data.startDate) : null,
          endDate: data.endDate ? dayjs(data.endDate) : null,
          highlight: data.highlight ?? false,
        };
        form.setFieldsValue(normalized);
        setOriginalData(normalized);
        setImg(data.banner || data.url || "");
        setIsChanged(false);
      }
    } else {
      form.setFieldsValue(DEFAULT_VALUES);
      setOriginalData(null);
      setImg("");
      setFile(null);
      setIsChanged(false);
    }
  }, [promoDetail, params.promoId, form]);

  const onValuesChange = (_, allValues) => {
    if (!params.promoId || params.promoId === "create") {
      const hasInput = Object.keys(allValues).some(
        (key) => allValues[key] !== DEFAULT_VALUES[key],
      );
      setIsChanged(hasInput || !!file);
      return;
    }

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
    setIsChanged(hasChanged || !!file);
  };

  const promoMutation = useAsyncMutation({
    service: (formData) =>
      params.promoId && params.promoId !== "create"
        ? updatePromotionAPI(params.promoId, formData)
        : addPromotionAPI(formData),
    invalidateQueries: [["promotions-list"]],
  });

  const handleSave = async (values) => {
    try {
      const formData = new FormData();
      const payload = {
        ...values,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
        highlight: values.highlight ? true : false,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] !== null && payload[key] !== undefined) {
          formData.append(key, payload[key]);
        }
      });

      if (file) {
        formData.append("file", file, file.name);
      } else if (
        img &&
        !file &&
        params.promoId &&
        params.promoId !== "create"
      ) {
        formData.append("banner", img);
      }

      await promoMutation.mutateAsync(formData);
      notification.success({
        message:
          params.promoId && params.promoId !== "create"
            ? "Cập nhật khuyến mãi thành công!"
            : "Tạo khuyến mãi mới thành công!",
      });
      navigate(-1);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message ||
          error.response?.data?.content ||
          "Có lỗi xảy ra!",
      });
    }
  };

  const handleChangeImage = (event) => {
    const fileUploaded = event.target.files[0];
    if (!fileUploaded) return;
    const reader = new FileReader();
    reader.readAsDataURL(fileUploaded);
    reader.onload = (e) => {
      setImg(e.target.result);
      setFile(fileUploaded);
      setIsChanged(true);
    };
  };

  return (
    <Card
      className="movie-form-card"
      loading={loading || promoMutation.isLoading}
      title={
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          />
          <span>
            {params.promoId && params.promoId !== "create"
              ? "Chỉnh sửa khuyến mãi"
              : "Thêm khuyến mãi mới"}
          </span>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onValuesChange={onValuesChange}
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={16}>
            <Form.Item
              label="Tiêu đề"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input placeholder="Nhập tiêu đề chương trình" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Ngày bắt đầu" name="startDate">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Ngày kết thúc" name="endDate">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Nổi bật (Highlight)"
              name="highlight"
              valuePropName="checked"
            >
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>

            <Form.Item
              label="Nội dung chi tiết"
              name="content"
              rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
            >
              <Input.TextArea rows={6} placeholder="Nhập nội dung ưu đãi..." />
            </Form.Item>
          </Col>

          <Col xs={24} lg={8}>
            <Form.Item label="Banner">
              <div style={{ marginBottom: "0.625rem" }}>
                <input
                  type="file"
                  id="promo-img"
                  hidden
                  onChange={handleChangeImage}
                  accept="image/*"
                />
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => document.getElementById("promo-img").click()}
                  block
                  size="large"
                >
                  Chọn ảnh banner
                </Button>
              </div>
              <div className="image-preview-wrapper">
                <Image
                  src={img}
                  className="preview-img"
                  fallback="https://via.placeholder.com/400x200?text=No+Banner"
                />
              </div>
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
            {params.promoId && params.promoId !== "create"
              ? "CẬP NHẬT KHUYẾN MÃI"
              : "TẠO KHUYẾN MÃI MỚI"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

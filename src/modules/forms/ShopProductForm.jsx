import React, { useEffect, useState } from "react";
import {
  Button, Form, Input, InputNumber, Switch,
  Image, App, Card, Row, Col, Space, Divider, Table
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync, useAsyncMutation } from "hooks/useAsync";
import { addShopProductAPI, updateShopProductAPI } from "services/shopProduct";
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import "./index.scss";
import { getShopProductDetailAPI } from "services/shopProduct";

const DEFAULT_VALUES = {
  title: "",
  price: 0,
  description: "",
  content: "",
  stock: null,
  limitPerCustomer: 0,
  expiryDays: null,
  options: [],
  active: true,
};

export default function ShopProductForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const { notification } = App.useApp();

  const [img, setImg] = useState("");
  const [file, setFile] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const { state: productDetail, loading } = useAsync({
    service: () => (params.productId && params.productId !== "create" ? getShopProductDetailAPI(params.productId) : Promise.resolve(null)),
    dependencies: [params.productId],
    condition: !!params.productId && params.productId !== "create",
  });

  useEffect(() => {
    if (params.productId && params.productId !== "create") {
      if (productDetail) {
        form.setFieldsValue(productDetail);
        setOriginalData(productDetail);
        setImg(productDetail.banner);
        setIsChanged(false);
      }
    } else {
      form.setFieldsValue(DEFAULT_VALUES);
      setOriginalData(null);
      setImg("");
      setFile(null);
      setIsChanged(false);
    }
  }, [productDetail, params.productId, form]);

  const onValuesChange = (_, allValues) => {
    if (!params.productId || params.productId === "create") {
      const hasInput = Object.keys(allValues).some(key => JSON.stringify(allValues[key]) !== JSON.stringify(DEFAULT_VALUES[key]));
      setIsChanged(hasInput || !!file);
      return;
    }
    const hasChanged = Object.keys(allValues).some(key => {
      return JSON.stringify(allValues[key]) !== JSON.stringify(originalData?.[key]);
    });
    setIsChanged(hasChanged || !!file);
  };

  const productMutation = useAsyncMutation({
    service: (formData) =>
      params.productId && params.productId !== "create"
        ? updateShopProductAPI(formData)
        : addShopProductAPI(formData),
    invalidateQueries: [["shop-products"]],
  });

  const handleSave = async (values) => {
    try {
      const formData = new FormData();
      const payload = {
        ...values,
        options: values.options || [],
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] !== null && payload[key] !== undefined) {
          // Nếu là mảng hoặc object (như options), cần JSON.stringify khi gửi qua FormData
          if (key === 'options') {
            formData.append(key, JSON.stringify(payload[key]));
          } else {
            formData.append(key, payload[key]);
          }
        }
      });

      if (file) formData.append("banner", file, file.name);
      if (params.productId && params.productId !== "create") formData.append("id", params.productId);

      await productMutation.mutateAsync(formData);
      notification.success({ 
        message: params.productId && params.productId !== "create" ? "Cập nhật sản phẩm thành công!" : "Tạo sản phẩm mới thành công!" 
      });
      navigate("/admin/shop-management");
    } catch (error) {
      notification.error({ message: "Lỗi", description: error.response?.data?.content || error.message });
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
      className="shop-product-form-card"
      loading={loading || productMutation.isLoading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          <span>{params.productId && params.productId !== "create" ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</span>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSave} onValuesChange={onValuesChange}>
        <Row gutter={[24, 0]}>
          {/* Cột trái: Thông tin sản phẩm */}
          <Col xs={24} lg={16}>
            <Form.Item label="Tên sản phẩm" name="title" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}>
              <Input placeholder="Nhập tên sản phẩm" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Giá (VNĐ)" name="price" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
                  <InputNumber style={{ width: '100%' }} min={0} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Tồn kho (Stock)" name="stock">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="Để trống nếu vô hạn" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Giới hạn mua mỗi khách (Limit)" name="limitPerCustomer">
                  <InputNumber style={{ width: '100%' }} min={0} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Số ngày hết hạn (Expiry Days)" name="expiryDays">
                  <InputNumber style={{ width: '100%' }} min={0} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả ngắn" name="description">
              <Input.TextArea rows={2} placeholder="Mô tả ngắn gọn..." />
            </Form.Item>

            <Form.Item label="Nội dung chi tiết" name="content">
              <Input.TextArea rows={4} placeholder="Nội dung chi tiết sản phẩm..." />
            </Form.Item>

            <Divider orientation="left">Tùy chọn sản phẩm (Options)</Divider>
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'Nhập tên tùy chọn' }]}
                      >
                        <Input placeholder="Tên tùy chọn (VD: Size, Màu)" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'choices']}
                        getValueFromEvent={(e) => e.target.value.split(',').map(s => s.trim())}
                        getValueProps={(val) => ({ value: Array.isArray(val) ? val.join(', ') : val })}
                      >
                        <Input placeholder="Các lựa chọn (cách nhau bởi dấu phẩy)" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'required']} valuePropName="checked">
                        <Switch checkedChildren="Bắt buộc" unCheckedChildren="Tùy chọn" />
                      </Form.Item>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm tùy chọn mới
                  </Button>
                </>
              )}
            </Form.List>
          </Col>

          {/* Cột phải: Banner và Trạng thái */}
          <Col xs={24} lg={8}>
            <Form.Item label="Banner Sản Phẩm" required>
              <div style={{ marginBottom: '0.625rem' }}>
                <input type="file" id="shop-img" hidden onChange={handleChangeImage} accept="image/*" />
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => document.getElementById('shop-img').click()}
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
                  fallback="https://via.placeholder.com/400x300?text=No+Banner"
                />
              </div>
            </Form.Item>

            <Form.Item label="Trạng thái hoạt động" name="active" valuePropName="checked">
              <Switch checkedChildren="Đang bán" unCheckedChildren="Ngừng bán" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: '24px' }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            disabled={!isChanged}
            block
            size="large"
            className="submit-btn"
          >
            {params.productId && params.productId !== "create" ? "CẬP NHẬT SẢN PHẨM" : "TẠO SẢN PHẨM MỚI"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
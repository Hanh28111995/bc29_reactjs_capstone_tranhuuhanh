import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  notification,
  Space,
  Card,
  Typography,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { userDetailApi, updateUserApi, addUserApi } from "services/user";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function UserForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();

  // 1. Antd 5 Notification Hook
  const [api, contextHolder] = notification.useNotification();

  const [isChanged, setIsChanged] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [originalData, setOriginalData] = useState({});

  // Lấy dữ liệu chi tiết khi có ID trên URL (params.tk)
  const { state: userDetail, loading } = useAsync({
    service: () => (params.tk ? userDetailApi(params.tk) : Promise.resolve(null)),
    dependencies: [params.tk],
    condition: !!params.tk && params.tk !== "create",
  });

  // 2. Đồng bộ dữ liệu vào Form
  useEffect(() => {
    if (userDetail) {
      form.setFieldsValue(userDetail);
      setOriginalData(userDetail);
    }
  }, [userDetail, form]);

  // 3. Theo dõi thay đổi của form để enable nút Save
  const onValuesChange = (_, allValues) => {
    // So sánh dữ liệu hiện tại với dữ liệu gốc
    const hasChanged = Object.keys(allValues).some((key) => {
      if (key === "password" && isChangingPassword) return true;
      return String(allValues[key] || "") !== String(originalData[key] || "");
    });
    setIsChanged(hasChanged);
  };

  // 4. Xử lý lưu dữ liệu
  const handleSave = async (values) => {
    try {
      let payload = { ...values };

      if (userDetail?._id) {
        payload._id = userDetail._id;
        // Chỉ gửi password nếu người dùng đang trong chế độ đổi pass
        if (!isChangingPassword) {
          delete payload.password;
        }
        await updateUserApi(payload);
      } else {
        await addUserApi(payload);
      }

      api.success({
        message: "Thành công",
        description: "Thông tin người dùng đã được cập nhật!",
      });

      // Đợi một chút rồi điều hướng về danh sách
      setTimeout(() => navigate("/admin/user-management"), 1000);

    } catch (error) {
      const serverMessage = error.response?.data?.message || "Có lỗi xảy ra";

      if (error.response?.status === 400 || error.response?.status === 409) {
        api.error({
          message: "Lỗi dữ liệu",
          description: serverMessage,
        });

        // Hiển thị lỗi ngay tại field tương ứng nếu server trả về field name trong message
        const fieldName = serverMessage.toLowerCase().includes("email") ? "email" : "username";
        form.setFields([{ name: fieldName, errors: [serverMessage] }]);
      } else {
        api.error({
          message: "Lỗi hệ thống",
          description: "Không thể kết nối đến máy chủ, vui lòng thử lại sau.",
        });
      }
    }
  };

  return (
    <Card loading={loading}>
      {/* Cần thiết cho Antd 5 Notification */}
      {contextHolder}

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        <Title level={4} style={{ margin: 0 }}>
          {userDetail ? `Chỉnh sửa: ${userDetail.username}` : "Thêm người dùng mới"}
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onValuesChange={onValuesChange}
        initialValues={{ role: "customer" }}
      >
        <Form.Item
          label="Tài Khoản"
          name="username"
          rules={[{ required: true, message: "Tài khoản không được để trống" }]}
        >
          <Input placeholder="Nhập tên tài khoản" disabled={!!userDetail} />
        </Form.Item>

        {userDetail ? (
          <Form.Item label="Mật khẩu">
            {!isChangingPassword ? (
              <Button type="dashed" onClick={() => setIsChangingPassword(true)}>
                Đổi mật khẩu mới
              </Button>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="password"
                  noStyle
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
                >
                  <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>
                <Button size="small" onClick={() => {
                  setIsChangingPassword(false);
                  form.setFieldsValue({ password: undefined });
                  setIsChanged(false);
                }}>
                  Hủy đổi mật khẩu
                </Button>
              </Space>
            )}
          </Form.Item>
        ) : (
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
        )}

        <Form.Item
          label="Số điện thoại"
          name="userphone"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập số điện thoại'
            },
            {
              pattern: /^[0-9]+$/,
              message: 'Số điện thoại chỉ được chứa các ký tự số',
            },
            {
              min: 9,
              message: 'Số điện thoại phải có ít nhất 9 ký tự',
            },
            {
              max: 12,
              message: 'Số điện thoại không được vượt quá 12 ký tự',
            }
          ]}
        >
          <Input placeholder="Ví dụ: 090..." maxLength={12} />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: 'email', message: 'Email không đúng định dạng' }
          ]}
        >
          <Input placeholder="example@mail.com" />
        </Form.Item>

        <Form.Item label="Loại người dùng" name="role" rules={[{ required: true }]}>
          <Select placeholder="Chọn loại khách hàng">
            <Select.Option value="customer">Khách hàng</Select.Option>
            <Select.Option value="admin">Quản trị viên</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item style={{ marginTop: 32 }}>
          <Button
            htmlType="submit"
            type="primary"
            icon={<SaveOutlined />}
            disabled={!isChanged}
            size="large"
            block
          >
            LƯU THÔNG TIN
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
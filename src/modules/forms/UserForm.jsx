import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  App,
  Card,
  Space,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync, useAsyncMutation } from "hooks/useAsync";
import { fetchAddUserApi, fetchUpdateUserApi, fetchUserDetailApi } from "services/user";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import "./index.scss";

export default function UserForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const { notification } = App.useApp();

  const [isChanged, setIsChanged] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [originalData, setOriginalData] = useState({});

  // Lấy dữ liệu chi tiết khi có ID trên URL (params.tk)
  const { state: userDetailRaw, loading } = useAsync({
    service: () => (params.tk && params.tk !== "create" ? fetchUserDetailApi(params.tk) : Promise.resolve(null)),
    dependencies: [params.tk],
    condition: !!params.tk && params.tk !== "create",
  });

  // API trả về content: { users: {...} } hoặc object trực tiếp
  const userDetail = userDetailRaw?.users ?? userDetailRaw?.user ?? userDetailRaw;

  // Đồng bộ dữ liệu vào Form
  useEffect(() => {
    if (params.tk && params.tk !== "create") {
      if (userDetail) {
        form.setFieldsValue(userDetail);
        setOriginalData(userDetail);
        setIsChanged(false);
      }
    } else {
      form.setFieldsValue({ role: "customer" });
      setOriginalData({});
      setIsChanged(false);
      setIsChangingPassword(false);
    }
  }, [userDetail, params.tk, form]);

  // Theo dõi thay đổi của form để enable nút Save
  const onValuesChange = (_, allValues) => {
    // Sửa lại điều kiện kiểm tra Create vs Update cho chính xác tuyệt đối
    if (!params.tk || params.tk === "create") {
      const hasInput = Object.keys(allValues).some((key) => Boolean(allValues[key]));
      setIsChanged(hasInput);
      return;
    }

    const hasChanged = Object.keys(allValues).some((key) => {
      if (key === "password" && isChangingPassword) return true;
      return String(allValues[key] || "") !== String(originalData[key] || "");
    });
    setIsChanged(hasChanged);
  };

  const userMutation = useAsyncMutation({
    service: (payload) =>
      userDetail?._id ? fetchUpdateUserApi(payload) : fetchAddUserApi(payload),
    invalidateQueries: [["users-list"]],
  });

  // Xử lý lưu dữ liệu
  const handleSave = async (values) => {
    try {
      let payload = { ...values };

      if (userDetail?._id) {
        payload._id = userDetail._id;
        // Chỉ gửi password nếu người dùng đang trong chế độ đổi pass
        if (!isChangingPassword) {
          delete payload.password;
        }
      }

      await userMutation.mutateAsync(payload);

      notification.success({
        message: userDetail?._id ? "Cập nhật thành công!" : "Thêm người dùng mới thành công!",
      });

      navigate("/admin/user-management");
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.response?.data?.content || "Có lỗi xảy ra";

      if (error.response?.status === 400 || error.response?.status === 409) {
        notification.error({
          message: "Lỗi dữ liệu",
          description: serverMessage,
        });

        const fieldName = serverMessage.toLowerCase().includes("email") ? "email" : "username";
        form.setFields([{ name: fieldName, errors: [serverMessage] }]);
      } else {
        notification.error({
          message: "Lỗi hệ thống",
          description: "Không thể kết nối đến máy chủ, vui lòng thử lại sau.",
        });
      }
    }
  };

  return (
    <Card
      className="movie-form-card"
      loading={loading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          <span>
            {params.tk && params.tk !== "create"
              ? `Chỉnh sửa: ${userDetail?.username || ""}`
              : "Thêm người dùng mới"}
          </span>
        </Space>
      }
    >
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
          <Input placeholder="Nhập tên tài khoản" size="large" disabled={!!userDetail} />
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
                  <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
                </Form.Item>
                <Button
                  size="small"
                  onClick={() => {
                    setIsChangingPassword(false);
                    form.setFieldsValue({ password: undefined });
                    setIsChanged(false);
                  }}
                >
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
            <Input.Password placeholder="Nhập mật khẩu" size="large" />
          </Form.Item>
        )}

        <Form.Item
          label="Số điện thoại"
          name="userphone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^[0-9]+$/, message: 'Số điện thoại chỉ được chứa các ký tự số' },
            { min: 9, message: 'Số điện thoại phải có ít nhất 9 ký tự' },
            { max: 12, message: 'Số điện thoại không được vượt quá 12 ký tự' }
          ]}
        >
          <Input placeholder="Ví dụ: 090..." maxLength={12} size="large" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: 'email', message: 'Email không đúng định dạng' }
          ]}
        >
          <Input placeholder="example@mail.com" size="large" />
        </Form.Item>

        <Form.Item label="Loại người dùng" name="role" rules={[{ required: true }]}>
          <Select
            placeholder="Chọn loại khách hàng"
            size="large"
            options={[
              { value: "customer", label: "Khách hàng" },
              { value: "admin", label: "Quản trị viên" }
            ]}
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 32 }}>
          <Button
            htmlType="submit"
            type="primary"
            icon={<SaveOutlined />}
            loading={userMutation.isLoading}
            disabled={!isChanged}
            size="large"
            block
            className="submit-btn"
          >
            {params.tk && params.tk !== "create" ? "CẬP NHẬT NGƯỜI DÙNG" : "TẠO NGƯỜI DÙNG MỚI"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
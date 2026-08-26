import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Switch,
  AutoComplete,
  Image,
  App,
  Card,
  Row,
  Col,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync, useAsyncMutation } from "hooks/useAsync";
import {
  updateBannerAPI,
  addBannerAPI,
  getBannerDetailAPI,
} from "services/banner";
import { fetchMovieListAPI } from "services/general";
import "./index.scss";

const DEFAULT_VALUES = {
  movie_id: undefined,
  highlight: false,
};

export default function BannerForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const bannerId = params.bannerId || params.id;
  const { notification } = App.useApp();

  const [img, setImg] = useState("");
  const [file, setFile] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // 1. Gọi API lấy danh sách phim cho AutoComplete
  const { state: movieListState } = useAsync({
    service: fetchMovieListAPI,
    queryKey: ["movies-list"],
  });
  const movieList =
    movieListState?.data?.content ||
    movieListState?.content ||
    (Array.isArray(movieListState) ? movieListState : []);

  // 2. Gọi API lấy chi tiết banner khi update
  const { state: bannerDetail, loading } = useAsync({
    service: () =>
      bannerId && bannerId !== "create"
        ? getBannerDetailAPI(bannerId)
        : Promise.resolve(null),
    dependencies: [bannerId],
    condition: !!bannerId && bannerId !== "create",
    queryKey: ["banners-detail", bannerId],
  });

  useEffect(() => {
    if (bannerId && bannerId !== "create") {
      const bannerData = bannerDetail?.data?.content || bannerDetail;
      if (bannerData) {
        const normalized = {
          movie_id: bannerData.movie_id?.toString(),
          highlight: !!bannerData.highlight,
        };
        form.setFieldsValue(normalized);
        setOriginalData(normalized);
        setImg(bannerData.url || "");
        setIsChanged(false);
      }
    } else {
      form.setFieldsValue(DEFAULT_VALUES);
      setOriginalData(null);
      setImg("");
      setFile(null);
      setIsChanged(false);
    }
  }, [bannerDetail, bannerId, form]);

  const onValuesChange = (_, allValues) => {
    if (!bannerId || bannerId === "create") {
      const hasInput = Object.keys(allValues).some(
        (key) => allValues[key] !== DEFAULT_VALUES[key],
      );
      setIsChanged(hasInput || !!file);
      return;
    }
    const hasChanged = Object.keys(allValues).some((key) => {
      return allValues[key] !== originalData?.[key];
    });
    setIsChanged(hasChanged || !!file);
  };

  const bannerMutation = useAsyncMutation({
    service: (formData) =>
      bannerId && bannerId !== "create"
        ? updateBannerAPI(bannerId, formData)
        : addBannerAPI(formData),
    invalidateQueries: [
      ["banners-list"], 
      ["banners-detail", bannerId], 
    ],
  });

  const handleSave = async (values) => {
    try {
      const formData = new FormData();
      formData.append("movie_id", values.movie_id);
      formData.append("highlight", values.highlight ? "true" : "false");

      if (file) {
        formData.append("url", file, file.name);
      } else if (img && !file && bannerId && bannerId !== "create") {
        formData.append("url", img);
      }

      await bannerMutation.mutateAsync(formData);
      notification.success({
        message:
          bannerId && bannerId !== "create"
            ? "Cập nhật banner thành công!"
            : "Thêm banner mới thành công!",
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
      setIsChanged(true); // Đảm bảo kích hoạt trạng thái thay đổi khi upload ảnh mới
    };
  };

  const movieOptions = (movieList || []).map((movie) => ({
    value: `${movie._id || movie.id}`,
    label: `${movie.title}`,
  }));

  return (
    <Card
      className="movie-form-card"
      loading={loading || bannerMutation.isLoading}
      title={
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          />
          <span>
            {bannerId && bannerId !== "create"
              ? "Chỉnh sửa Banner"
              : "Thêm banner mới"}
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
              name="movie_id"
              label="Chọn Phim"
              rules={[{ required: true, message: "Vui lòng chọn phim!" }]}
            >
              <AutoComplete
                options={movieOptions}
                placeholder="Tìm kiếm và chọn phim..."
                size="large"
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              name="highlight"
              label="Banner Nổi Bật"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} lg={8}>
            <Form.Item label="Hình ảnh Banner">
              <div style={{ marginBottom: "0.625rem" }}>
                <input
                  type="file"
                  id="banner-img-file"
                  hidden
                  onChange={handleChangeImage}
                  accept="image/*"
                />
                <Button
                  icon={<UploadOutlined />}
                  onClick={() =>
                    document.getElementById("banner-img-file").click()
                  }
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
                  fallback="https://via.placeholder.com/400x200?text=No+Banner+Image"
                />
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            disabled={!isChanged}
            block
            className="submit-btn"
            size="large"
          >
            {bannerId && bannerId !== "create"
              ? "CẬP NHẬT BANNER"
              : "TẠO BANNER MỚI"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

import React, { useEffect, useState } from "react";
import { Form, Button, Switch, Upload, message, AutoComplete } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { updateBannerAPI, addBannerAPI, getBannerDetailAPI } from "services/banner";
import { fetchMovieListAPI } from "services/general";

export default function BannerForm({ onSuccess, loading }) {
  const [form] = Form.useForm();
  const params = useParams();
  const bannerId = params.bannerId || params.id; // Lấy id từ URL nếu có

  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [initialValues, setInitialValues] = useState(null);

  // 1. Gọi API lấy danh sách phim cho AutoComplete
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetchMovieListAPI();
        const moviesData = res.data?.content || [];
        setMovieList(Array.isArray(moviesData) ? moviesData : []);
      } catch (error) {
        message.error("Không thể tải danh sách phim");
        setMovieList([]);
      }
    };
    fetchMovies();
  }, []);

  // 2. Kiểm tra nếu có id trên URL thì gọi API lấy chi tiết banner để update
  useEffect(() => {
    const fetchBannerDetail = async () => {
      if (bannerId && bannerId !== "create") {
        try {
          const res = await getBannerDetailAPI(bannerId);
          const bannerData = res.data?.content || res.data;
          if (bannerData) {
            setInitialValues(bannerData);
            form.setFieldsValue({
              movie_id: bannerData.movie_id?.toString(),
              highlight: bannerData.highlight,
            });
            setPreviewImage(bannerData.url || "");
          }
        } catch (error) {
          message.error("Không thể tải chi tiết banner");
        }
      } else {
        form.resetFields();
        setInitialValues(null);
        setFileList([]);
        setPreviewImage("");
      }
    };
    fetchBannerDetail();
  }, [bannerId, form]);

  const movieOptions = (movieList || []).map((movie) => ({
    value: `${movie._id}`,
    label: `${movie.title}`,
  }));

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("movie_id", values.movie_id);
    formData.append("highlight", values.highlight ? "true" : "false");

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("url", fileList[0].originFileObj);
    } else if (previewImage) {
      formData.append("url", previewImage);
    }

    try {
      if (bannerId && bannerId !== "create") {
        await updateBannerAPI(bannerId, formData);
        message.success("Cập nhật banner thành công!");
      } else {
        await addBannerAPI(formData);
        message.success("Thêm banner thành công!");
      }
      onSuccess?.();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ highlight: false }}
    >
      <Form.Item
        name="movie_id"
        label="Mã Phim"
        rules={[{ required: true, message: "Vui lòng chọn phim!" }]}
      >
        <AutoComplete
          options={movieOptions}
          placeholder="Tìm kiếm phim..."
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

      <Form.Item label="Hình ảnh Banner">
        <Upload
          listType="picture"
          maxCount={1}
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList: newFileList }) => setFileList(newFileList)}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
        {previewImage && fileList.length === 0 && (
          <img
            src={previewImage}
            alt="preview"
            style={{ width: 100, marginTop: 10 }}
          />
        )}
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {bannerId && bannerId !== "create" ? "Cập nhật" : "Thêm mới"}
        </Button>
      </Form.Item>
    </Form>
  );
}
import React, { useEffect, useState } from "react";
import { Form, Button, Switch, Upload, message, AutoComplete } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { updateBannerAPI, addBannerAPI } from "services/banner"; // Đã thêm lại import
import { fetchMovieListAPI } from "services/general";

export default function BannerForm({ initialValues, onSuccess, loading }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [movieList, setMovieList] = useState([]);

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

  const movieOptions = (movieList || []).map((movie) => ({
    value: `${movie._id}`,
    label: `${movie.title}`,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        movie_id: initialValues.movie_id?.toString(),
        highlight: initialValues.highlight,
      });
      setPreviewImage(initialValues.url || "");
    } else {
      form.resetFields();
      setFileList([]);
      setPreviewImage("");
    }
  }, [initialValues, form]);

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
      if (initialValues && initialValues._id) {
        await updateBannerAPI(initialValues._id, formData);
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
          {initialValues ? "Cập nhật" : "Thêm mới"}
        </Button>
      </Form.Item>
    </Form>
  );
}

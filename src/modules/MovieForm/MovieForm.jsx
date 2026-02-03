import React, { useEffect, useState } from "react";
import {
  Button, DatePicker, Form, Input, InputNumber, Switch,
  Image, Select, App, Card, Row, Col, Space
} from "antd";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { fetchMovieDetailAPI, addMovieUploadImage, updateMovieUploadImage } from "services/movie";
import { GenreList } from "enums/common";
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import "./index.scss";

const DEFAULT_VALUES = {
  title: "", trailer: "", describe: "", releaseDate: null,
  duration: 120, director: "", genre: [], showing: true,
  coming: false, rating: 10,
};

export default function MovieForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const { notification } = App.useApp();

  const [img, setImg] = useState("");
  const [file, setFile] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const { state: movieDetail, loading } = useAsync({
    service: () => (params.movieId ? fetchMovieDetailAPI(params.movieId) : Promise.resolve(null)),
    dependencies: [params.movieId],
    condition: !!params.movieId && params.movieId !== "create",
  });

  useEffect(() => {
    if (params.movieId && params.movieId !== "create") {
      if (movieDetail) {
        const normalized = {
          ...movieDetail,
          releaseDate: movieDetail.releaseDate ? dayjs(movieDetail.releaseDate) : null,
          genre: movieDetail.genre
            ? movieDetail.genre.replace(/^,/, '').split(",").map(item => item.trim())
            : []
        };
        form.setFieldsValue(normalized);
        setOriginalData(normalized);
        setImg(movieDetail.banner);
        setIsChanged(false);
      }
    } else {
      form.setFieldsValue(DEFAULT_VALUES);
      setOriginalData(null);
      setImg("");
      setFile(null);
      setIsChanged(false);
    }
  }, [movieDetail, params.movieId, form]);

  const onValuesChange = (_, allValues) => {
    if (!params.movieId || params.movieId === "create") {
      const hasInput = Object.keys(allValues).some(key => allValues[key] !== DEFAULT_VALUES[key]);
      setIsChanged(hasInput || !!file);
      return;
    }
    const hasChanged = Object.keys(allValues).some(key => {
      const currentVal = allValues[key];
      const originalVal = originalData?.[key];
      if (key === 'releaseDate') return !dayjs(currentVal).isSame(originalVal, 'day');
      if (Array.isArray(currentVal)) return JSON.stringify(currentVal) !== JSON.stringify(originalVal);
      return currentVal !== originalVal;
    });
    setIsChanged(hasChanged || !!file);
  };

  const handleSave = async (values) => {
    try {
      const formData = new FormData();
      const payload = {
        ...values,
        releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : null,
        genre: Array.isArray(values.genre) ? values.genre.join(', ') : values.genre,
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] !== null && payload[key] !== undefined) {
          formData.append(key, payload[key]);
        }
      });

      if (file) formData.append("File", file, file.name);
      if (params.movieId && params.movieId !== "create") formData.append("id_movie", params.movieId);

      if (params.movieId && params.movieId !== "create") {
        await updateMovieUploadImage(formData);
        notification.success({ message: "Cập nhật thành công!" });
      } else {
        await addMovieUploadImage(formData);
        notification.success({ message: "Thêm phim mới thành công!" });
      }
      navigate("/admin/movie-management");
    } catch (error) {
      notification.error({ message: "Lỗi", description: error.response?.data?.content });
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
      loading={loading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          <span>{params.movieId && params.movieId !== "create" ? "Chỉnh sửa phim" : "Thêm phim mới"}</span>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSave} onValuesChange={onValuesChange}>
        <Row gutter={[24, 0]}>
          {/* Cột trái: Thông tin chính - 65% trên desktop, 100% trên mobile */}
          <Col xs={24} lg={16}>
            <Form.Item label="Tên Phim" name="title" rules={[{ required: true }]}>
              <Input placeholder="Nhập tên phim" size="large" />
            </Form.Item>

            <Form.Item label="Trailer URL" name="trailer" rules={[{ required: true }]}>
              <Input placeholder="https://youtube.com/..." size="large" />
            </Form.Item>

            <Form.Item label="Mô tả" name="describe" rules={[{ required: true }]}>
              <Input.TextArea rows={4} placeholder="Nội dung phim..." />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Ngày khởi chiếu" name="releaseDate" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Thời lượng (phút)" name="duration" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={1} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Đạo diễn" name="director" rules={[{ required: true }]}>
              <Input placeholder="Tên đạo diễn" size="large" />
            </Form.Item>

            <Form.Item label="Thể loại" name="genre" rules={[{ required: true }]}>
              <Select mode="multiple" options={GenreList} placeholder="Chọn thể loại" size="large" />
            </Form.Item>
          </Col>

          {/* Cột phải: Hình ảnh & Trạng thái - 35% trên desktop, 100% trên mobile */}
          <Col xs={24} lg={8}>
            <Form.Item label="Hình ảnh (Banner)">
              <div style={{ marginBottom: '0.625rem' }}>
                <input type="file" id="movie-img" hidden onChange={handleChangeImage} accept="image/*" />
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => document.getElementById('movie-img').click()}
                  block
                  size="large"
                >
                  Chọn ảnh phim
                </Button>
              </div>
              <div className="image-preview-wrapper">
                <Image
                  src={img}
                  className="preview-img"
                  fallback="https://via.placeholder.com/200x300?text=No+Image"
                />
              </div>
            </Form.Item>

            <Row className="switch-group" gutter={16}>
              <Col span={12}>
                <Form.Item label="Đang chiếu" name="showing" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Sắp chiếu" name="coming" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Đánh giá (1-10)" name="rating" rules={[{ required: true }]}>
              <InputNumber min={0} max={10} step={0.1} style={{ width: '100%' }} size="large" />
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
          >
            {params.movieId && params.movieId !== "create" ? "CẬP NHẬT PHIM" : "TẠO PHIM MỚI"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
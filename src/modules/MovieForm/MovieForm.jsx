import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Switch,
  Image,
  Select,
  App,
  Card,
  Row,
  Col,
  Space
} from "antd";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { fetchMovieDetailAPI, addMovieUploadImage, updateMovieUploadImage } from "services/movie";
import { GenreList } from "enums/common";
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";

// 1. Định nghĩa giá trị mặc định cho trường hợp Thêm mới
const DEFAULT_VALUES = {
  title: "",
  trailer: "",
  describe: "",
  releaseDate: null,
  duration: 120,
  director: "",
  genre: [],
  showing: true,
  coming: false,
  rating: 10,
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

  // Lấy chi tiết phim nếu có movieId trên URL
  const { state: movieDetail, loading } = useAsync({
    service: () => (params.movieId ? fetchMovieDetailAPI(params.movieId) : Promise.resolve(null)),
    dependencies: [params.movieId],
    condition: !!params.movieId && params.movieId !== "create",
  });

  // 2. Đồng bộ dữ liệu Form dựa trên việc có hay không có movieId
  useEffect(() => {
    if (params.movieId) {
      // CHẾ ĐỘ CẬP NHẬT
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
      // CHẾ ĐỘ THÊM MỚI
      form.setFieldsValue(DEFAULT_VALUES);
      setOriginalData(null);
      setImg("");
      setFile(null);
      setIsChanged(false);
    }
  }, [movieDetail, params.movieId, form]);

  // 3. Logic kiểm tra thay đổi để bật/tắt nút Save
  const onValuesChange = (_, allValues) => {
    if (!params.movieId) {
      // Thêm mới: Chỉ cần có nhập liệu bất kỳ là cho phép Save
      const hasInput = Object.keys(allValues).some(key => {
        const val = allValues[key];
        return val !== DEFAULT_VALUES[key];
      });
      setIsChanged(hasInput || !!file);
      return;
    }

    // Cập nhật: So sánh giá trị hiện tại với dữ liệu gốc ban đầu
    const hasChanged = Object.keys(allValues).some(key => {
      const currentVal = allValues[key];
      const originalVal = originalData?.[key];

      if (key === 'releaseDate') {
        return !dayjs(currentVal).isSame(originalVal, 'day');
      }
      if (Array.isArray(currentVal)) {
        return JSON.stringify(currentVal) !== JSON.stringify(originalVal);
      }
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

      // Append data vào FormData, bỏ qua các giá trị null/undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] !== null && payload[key] !== undefined) {
          formData.append(key, payload[key]);
        }
      });

      if (file) formData.append("File", file, file.name);
      if (params.movieId) formData.append("id_movie", params.movieId);

      if (params.movieId) {
        await updateMovieUploadImage(formData);
        notification.success({ message: "Cập nhật phim thành công!" });
      } else {
        await addMovieUploadImage(formData);
        notification.success({ message: "Thêm phim mới thành công!" });
      }

      navigate("/admin/movie-management");
    } catch (error) {
      notification.error({
        message: "Thao tác thất bại",
        description: error.response?.data?.content || "Vui lòng kiểm tra lại dữ liệu",
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
      loading={loading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          <span>{params.movieId ? "Chỉnh sửa phim" : "Thêm phim mới"}</span>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onValuesChange={onValuesChange}
        initialValues={DEFAULT_VALUES} // Set giá trị khởi tạo phòng khi render lần đầu
      >
        <Row gutter={24}>
          <Col span={16}>
            <Form.Item
              label="Tên Phim"
              name="title"
              rules={[{ required: true, message: 'Vui lòng nhập tên phim' }]}
            >
              <Input placeholder="Nhập tên phim" />
            </Form.Item>

            <Form.Item label="Trailer URL" name="trailer" rules={[{ required: true }]}>
              <Input placeholder="https://youtube.com/..." />
            </Form.Item>

            <Form.Item label="Mô tả" name="describe" rules={[{ required: true }]}>
              <Input.TextArea rows={4} placeholder="Nội dung phim..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Ngày khởi chiếu" name="releaseDate" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Thời lượng (phút)" name="duration" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={1} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Đạo diễn" name="director" rules={[{ required: true }]}>
              <Input placeholder="Nhập tên đạo diễn" />
            </Form.Item>

            <Form.Item label="Thể loại" name="genre" rules={[{ required: true }]}>
              <Select mode="multiple" options={GenreList} placeholder="Chọn thể loại" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Hình ảnh (Banner)">
              <div style={{ marginBottom: 10 }}>
                <input
                  type="file"
                  id="movie-img"
                  hidden
                  onChange={handleChangeImage}
                  accept="image/*"
                />
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => document.getElementById('movie-img').click()}
                  block
                >
                  Chọn ảnh phim
                </Button>
              </div>
              <div style={{ textAlign: 'center', border: '1px dashed #d9d9d9', padding: '10px', borderRadius: '8px' }}>
                <Image
                  src={img}
                  fallback="https://via.placeholder.com/200x300?text=No+Image"
                  style={{ maxHeight: 300, objectFit: 'contain' }}
                />
              </div>
            </Form.Item>

            <Row>
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
              <InputNumber min={0} max={10} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 20 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<SaveOutlined />}
            disabled={!isChanged}
            block
          >
            {params.movieId ? "CẬP NHẬT PHIM" : "TẠO PHIM MỚI"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
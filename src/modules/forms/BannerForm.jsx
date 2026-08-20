import React, { useEffect, useState, useRef, startTransition } from "react";
import {
  Button, Form, Switch, Image, App, Card, Row, Col, Space, AutoComplete, Spin
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync, useAsyncMutation } from "hooks/useAsync";
import { addBannerAPI, updateBannerAPI, getBannerDetailAPI } from "services/banner";
import { fetchSearchMovieAPI } from "services/movie";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import "./index.scss";

const DEFAULT_VALUES = {
  movie_id: "",
  highlight: false,
};

// Component tìm kiếm phim tối ưu, tránh xung đột render đồng bộ
const MovieIdSelect = ({ value, onChange }) => {
  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef(null);

  const handleSearch = (keyword) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (!keyword.trim()) {
      setOptions([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetchSearchMovieAPI({ title: keyword.trim(), page: 1, limit: 10 });
        const list = res?.data?.content?.movies || [];
        
        // Dùng startTransition để ngăn chặn lỗi React #426 khi cập nhật state từ sự kiện gõ phím
        startTransition(() => {
          setOptions(list.map(m => ({ value: m.id_movie || m._id, label: m.title })));
        });
      } catch (err) {
        console.error(err);
      } finally {
        startTransition(() => {
          setSearching(false);
        });
      }
    }, 400);
  };

  return (
    <AutoComplete
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      options={options}
      placeholder="Tìm phim theo tên..."
      size="large"
      style={{ width: "100%" }}
      notFoundContent={searching ? <Spin size="small" /> : null}
    />
  );
};

export default function BannerForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const { notification } = App.useApp();

  const [img, setImg] = useState("");
  const [file, setFile] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const isEdit = !!params.id && params.id !== "create";

  const { state: bannerDetail, loading } = useAsync({
    service: () => (isEdit ? getBannerDetailAPI(params.id) : Promise.resolve(null)),
    dependencies: [params.id],
    condition: isEdit,
  });

  useEffect(() => {
    if (isEdit && bannerDetail) {
      form.setFieldsValue(bannerDetail);
      setOriginalData(bannerDetail);
      setImg(bannerDetail.url);
      setIsChanged(false);
    } else {
      form.setFieldsValue(DEFAULT_VALUES);
      setOriginalData(null);
      setImg("");
      setFile(null);
      setIsChanged(false);
    }
  }, [bannerDetail, isEdit, form]);

  const onValuesChange = (_, allValues) => {
    startTransition(() => {
      if (!isEdit) {
        setIsChanged(Object.keys(allValues).some(k => allValues[k] !== DEFAULT_VALUES[k]) || !!file);
      } else {
        setIsChanged(Object.keys(allValues).some(k => allValues[k] !== originalData?.[k]) || !!file);
      }
    });
  };

  const bannerMutation = useAsyncMutation({
    service: (formData) => isEdit ? updateBannerAPI(params.id, formData) : addBannerAPI(formData),
    invalidateQueries: [["banners"]],
  });

  const handleSave = async (values) => {
    if (!isEdit && !file) {
      notification.warning({ message: "Thiếu ảnh", description: "Vui lòng chọn ảnh banner!" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("movie_id", values.movie_id);
      formData.append("highlight", values.highlight);
      if (file) formData.append("File", file, file.name);
      if (isEdit) formData.append("id", params.id);

      await bannerMutation.mutateAsync(formData);
      notification.success({ message: isEdit ? "Cập nhật thành công!" : "Thêm mới thành công!" });
      navigate("/admin/banner-management");
    } catch (error) {
      notification.error({ message: "Lỗi", description: error.response?.data?.content || "Có lỗi xảy ra" });
    }
  };

  const handleChangeImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImg(e.target.result);
      setFile(f);
      setIsChanged(true);
    };
    reader.readAsDataURL(f);
  };

  return (
    <Card 
      loading={loading || bannerMutation.isPending || bannerMutation.isLoading} 
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
          {isEdit ? "Chỉnh sửa Banner" : "Thêm Banner mới"}
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSave} onValuesChange={onValuesChange}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Form.Item label="Movie ID" name="movie_id" rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập Movie ID!' }]}>
              <MovieIdSelect />
            </Form.Item>
            <Form.Item label="Nổi bật (Highlight)" name="highlight" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} lg={8}>
            <Form.Item label="Hình ảnh Banner">
              <input type="file" id="banner-img" hidden onChange={handleChangeImage} accept="image/*" />
              <Button icon={<UploadOutlined />} onClick={() => document.getElementById('banner-img').click()} block size="large">Chọn ảnh</Button>
              <Image src={img} fallback="https://via.placeholder.com/300x150?text=No+Banner" style={{ marginTop: 10, borderRadius: 8, width: '100%', maxHeight: 180, objectFit: 'cover' }} />
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" htmlType="submit" disabled={!isChanged} block size="large">
          {isEdit ? "CẬP NHẬT BANNER" : "TẠO BANNER MỚI"}
        </Button>
      </Form>
    </Card>
  );
}
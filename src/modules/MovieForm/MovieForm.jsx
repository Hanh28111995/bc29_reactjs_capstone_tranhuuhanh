import {
  Button,
  Cascader,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  TreeSelect,
  Image,
  notification,
} from "antd";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { GROUP_ID } from "constants/common";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { fetchMovieDetailAPI } from "services/movie";
import { addMovieUploadImage } from "services/movie";
import { updateMovieUploadImage } from "services/movie";
export default function MovieForm() {
  const [componentSize, setComponentSize] = useState("default");
  const [img, setImg] = useState();
  const [file, setFile] = useState();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();

  const { state: movieDetail } = useAsync({
    service: () => fetchMovieDetailAPI(params.movieId),
    dependencies: [params.movieId],
    codintion: !!params.movieId,
  });

  useEffect(() => {
    if (movieDetail) {
      form.setFieldsValue({
        ...movieDetail,
        ngayKhoiChieu: moment(movieDetail.ngayKhoiChieu),
      });
      setImg(movieDetail.hinhAnh);
    }
  }, [movieDetail]);

  const onFormLayoutChange = (event) => {
    setComponentSize(event.target.value);
  };

  const handleSave = async (values) => {
    values.ngayKhoiChieu = values.ngayKhoiChieu.format("DD/MM/YYYY");
    values.maNhom = GROUP_ID;
    const formData = new FormData();
    for (const key in values) {
      formData.append(key, values[key]);
    }
    file && formData.append("File", file, file.name);
    params.movieId && formData.append("maPhim", params.movieId);

    if (params.movieId) {
      await updateMovieUploadImage(formData);
    } else {
      await addMovieUploadImage(formData);
    }
    // console.log(values);
    notification.success({
      description: "Successfully !",
    });
    navigate("/admin/movie-management");
  };

  const handleChangeImage = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      setImg(e.target.result);
      setFile(file);
    };
  };
  return (
    <Form
      form={form}
      labelCol={{
        span: 4,
      }}
      wrapperCol={{
        span: 14,
      }}
      layout="vertical"
      initialValues={{
        tenPhim: "",
        moTa: "",
        ngayKhoiChieu: "",
        sapChieu: true,
        dangChieu: true,
        hot: true,
        trailer: "",
        danhGia: "",
        // File: "",
      }}
      onFinish={handleSave}
      size={componentSize}
    >
      <Form.Item label="Form Size">
        <Radio.Group defaultValue={componentSize} onChange={onFormLayoutChange}>
          <Radio.Button value="small">Small</Radio.Button>
          <Radio.Button value="default">Default</Radio.Button>
          <Radio.Button value="large">Large</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Tên Phim" name="tenPhim">
        <Input />
      </Form.Item>
      <Form.Item label="Trailer" name="trailer">
        <Input />
      </Form.Item>
      <Form.Item label="Mô tả" name="moTa">
        <Input />
      </Form.Item>
      <Form.Item label="Ngày khởi chiếu" name="ngayKhoiChieu">
        <DatePicker />
      </Form.Item>
      <Form.Item label="Đang chiếu" valuePropName="checked" name="dangChieu">
        <Switch />
      </Form.Item>
      <Form.Item label="Sắp chiếu" valuePropName="checked" name="sapChieu">
        <Switch />
      </Form.Item>
      <Form.Item label="Hot" valuePropName="checked" name="hot">
        <Switch />
      </Form.Item>
      <Form.Item label="Số sao" name="danhGia">
        <InputNumber />
      </Form.Item>
      <Form.Item label="Hình ảnh">
        <Input type="file" onChange={handleChangeImage} />
      </Form.Item>
      <Image src={img} />
      <Form.Item className="mt-2">
        <Button htmlType="sumbit" type="prymary">
          SAVE
        </Button>
      </Form.Item>
    </Form>
  );
}

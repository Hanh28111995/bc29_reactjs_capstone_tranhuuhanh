import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Switch,
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
      console.log(movieDetail);
      form.setFieldsValue({
        ...movieDetail,
        ngayKhoiChieu: moment(movieDetail.ngayKhoiChieu),
      });
      setImg(movieDetail.hinhAnh);
    }
  }, [movieDetail]);


  const handleSave = async (values) => {
    values.ngayKhoiChieu = values.ngayKhoiChieu.format("DD/MM/YYYY");
    values.maNhom = GROUP_ID;
    const formData = new FormData();
    for (const key in values) {
      formData.append(key, values[key]);
    }
    file && formData.append("File", file, file.name);
    params.movieId && formData.append("maPhim", params.movieId);
    console.log(values);
    if (params.movieId) {
      await updateMovieUploadImage(formData);
    } else {
      await addMovieUploadImage(formData);
    }

    notification.success({
      description: "Successfully !",
    });
    navigate("/admin/movie-management");
  };

  const handleChangeImage = (event) => {
    const file = event.target.files[0];
    //  if(!file.name){
    //   setError({message:"Vui long chon hinh anh"})
    //  }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      setImg(e.target.result);
      setFile(file);
    };
    console.log(file.name)
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
      size={'default'}
    >
      <Form.Item label="T??n Phim" name="tenPhim" validateTrigger={['onBlur']}
        rules={[
          { required: true, message: ' Vui lo??ng nh????p t??n phim ' },
          { pattern: "^[a-zA-Z_???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????" + "????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????" + "????????????????????????????????????????????????????????????" + "0-9"+"\\s]+$", message: 'T??n phim kh??ng h????p l???? ' },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Trailer" name="trailer" validateTrigger={['onBlur']} rules={[{ required: true, message: ' Vui lo??ng nh????p url trailer ' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="M?? ta??" name="moTa" validateTrigger={['onBlur']} rules={[{ required: true, message: ' Vui lo??ng nh????p M?? ta?? ' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Nga??y kh????i chi????u" validateTrigger={['onBlur']} name="ngayKhoiChieu" rules={[{ required: true, message: ' Vui lo??ng nh????p Nga??y Kh????i Chi????u ' }]}>
        <DatePicker />
      </Form.Item>
      <Form.Item label="??ang chi????u" valuePropName="checked" name="dangChieu">
        <Switch />
      </Form.Item>
      <Form.Item label="S????p chi????u" valuePropName="checked" name="sapChieu">
        <Switch />
      </Form.Item>
      <Form.Item label="Hot" valuePropName="checked" name="hot">
        <Switch />
      </Form.Item>
      <Form.Item label="S???? sao" name="danhGia"
        validateTrigger={['onBlur']}
        rules={[
          { required: true, message: ' Vui lo??ng nh????p ??i????m ??a??nh gia?? ' },
          { type: 'number', },
        ]}>
        <InputNumber min={0} max={10}/>
      </Form.Item>
      <Form.Item label="Hi??nh a??nh">
        <Input type="file" onChange={handleChangeImage} />
        {/* <span style={}>Vui lo??ng cho??n Hi??nh a??nh</span> */}
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

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
      <Form.Item label="Tên Phim" name="tenPhim" validateTrigger={['onBlur']}
        rules={[
          { required: true, message: ' Vui lòng nhập tên phim ' },
          { pattern: '^[a-zA-Z_ÀÁÂÃÈÉÊẾÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶ" + "ẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểếệễỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỉịọỏốồổỗộớờởỡợ" + "ụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ" + "0-9"+"\\s]+$', message: 'Tên phim không hợp lệ ' },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Trailer" name="trailer" validateTrigger={['onBlur']} rules={[{ required: true, message: ' Vui lòng nhập url trailer ' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Mô tả" name="moTa" validateTrigger={['onBlur']} rules={[{ required: true, message: ' Vui lòng nhập Mô tả ' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Ngày khởi chiếu" validateTrigger={['onBlur']} name="ngayKhoiChieu" rules={[{ required: true, message: ' Vui lòng nhập Ngày Khởi Chiếu ' }]}>
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
      <Form.Item label="Số sao" name="danhGia"
        validateTrigger={['onBlur']}
        rules={[
          { required: true, message: ' Vui lòng nhập điểm Đánh giá ' },
          { type: 'number', },
        ]}>
        <InputNumber min={0} max={10}/>
      </Form.Item>
      <Form.Item label="Hình ảnh">
        <Input type="file" onChange={handleChangeImage} />
        {/* <span style={}>Vui lòng chọn Hình ảnh</span> */}
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

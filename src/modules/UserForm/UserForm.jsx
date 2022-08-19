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
import { userDetailApi } from "services/user";
import { updateUserApi } from "services/user";
import { addUserApi } from "services/user";
  export default function UserForm() {
    const [componentSize, setComponentSize] = useState("default");
    // const [img, setImg] = useState();
    // const [file, setFile] = useState();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const params = useParams();
  
    const { state: userDetail } = useAsync({
      service: () => userDetailApi(params.tk),
      dependencies: [params.tk],
      codintion: !!params.tk,
    });
  
    useEffect(() => {
      if (userDetail) {
        form.setFieldsValue({
          ...userDetail,
        });
        // setImg(movieDetail.hinhAnh);
      }
    }, [userDetail]);
  
    const onFormLayoutChange = (event) => {
      setComponentSize(event.target.value);
    };
  
    const handleSave = async (values) => {
    //   values.ngayKhoiChieu = values.ngayKhoiChieu.format("DD/MM/YYYY");
    //   values.maNhom = GROUP_ID;
      const formData = new FormData();
      for (const key in values) {
        formData.append(key, values[key]);
      }
      params.tk && formData.append("taiKhoan", params.tk);
  
      if (params.tk) {
        await updateUserApi(formData);
      }
       else {
        await addUserApi(formData);
      }
      // console.log(values);
      notification.success({
        description: "Successfully !",
      });
      navigate("/admin/user-management");
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
          taiKhoan: "",
          matKhau: "",
          hoTen: "",
          email:"",
          soDT:"",
          maLoaiNguoiDung:"",
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
        <Form.Item label="Tài Khoản" name="taiKhoan">
          <Input />
        </Form.Item>
        <Form.Item label="Mật khẩu" name="matKhau">
          <Input />
        </Form.Item>
        <Form.Item label="Họ tên" name="hoTen">
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input />
        </Form.Item>
        <Form.Item label="Số điện thoại" name="soDT">
          <Input />
        </Form.Item>
        <Form.Item label="Loại khách hàng" name="maLoaiNguoiDung">
        <Select>
          <Select.Option value="KhachHang">Khách hàng</Select.Option>
          <Select.Option value="QuanTri">Quản trị</Select.Option>
        </Select>
        </Form.Item>
        
        <Form.Item className="mt-2">
          <Button htmlType="sumbit" type="prymary">
            SAVE
          </Button>
        </Form.Item>
      </Form>
    );
  }
  
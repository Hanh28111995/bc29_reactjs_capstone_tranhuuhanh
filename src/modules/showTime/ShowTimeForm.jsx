import {
  Button,
  DatePicker,
  Form,
  Input,
  Radio,
  notification,
  Select
} from "antd";
import React, { useEffect, useState } from "react";
import { HOUR } from "constants/common";
import {  useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { HethongrapListApi } from "services/showtime";
import { HethongrapCumrapListApi } from "services/showtime";
import { taoLichChieuApi } from "services/showtime";
const { Option } = Select;

export default function ShowTimeForm() {
  const [componentSize, setComponentSize] = useState("default");
  // const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();

  // const { state: movieDetail } = useAsync({
  //   service: () => fetchMovieDetailAPI(params.movieId),
  //   dependencies: [params.movieId],
  //   codintion: !!params.movieId,
  // });
  const onFormLayoutChange = (event) => {
    setComponentSize(event.target.value);
  };
  const [option1, setOption1] = useState();
  const [option2, setOption2] = useState();
  const [option3, setOption3] = useState();
  const [moreOption, setmoreOption] = useState('');

  const { state: Hethongrap = [] } = useAsync({
    service: () => HethongrapListApi(),
    dependencies: [],
  })
  const { state: Cumrap = [] } = useAsync({
    service: () => HethongrapCumrapListApi(moreOption),
    dependencies: [moreOption],
    codintion : moreOption,
  })

  const HethongrapChild = [];
  const CumrapChild = [];
  const ThoigianChild = [];

  useEffect(() => {
    for (let i = 0; i < Hethongrap.length; i++) {
      HethongrapChild.push(<Option key={i + 1} value={Hethongrap[i].maHeThongRap}>{Hethongrap[i].tenHeThongRap}</Option>);
      setOption1(HethongrapChild);
    }
    for (let i = 0; i < HOUR.length; i++) {
      ThoigianChild.push(<Option key={i + 1} value={HOUR[i]}>{HOUR[i]}</Option>);
    }
    setOption3(ThoigianChild);
  }, [Hethongrap]);

  useEffect(() => {
    for (let i = 0; i < Cumrap.length; i++) {
      CumrapChild.push(<Option key={i + 1} value={Cumrap[i].maCumRap}>{Cumrap[i].tenCumRap}</Option>);
      setOption2(CumrapChild);
    }
  }, [Cumrap]);

  const handleSave = async (values) => {
    values.ngayChieu = values.ngayChieu.format("DD/MM/YYYY");
    const maPhim = params.movieId;
    const ngayChieuGioChieu = values.ngayChieu + " " + values.gioChieu;
    const maRap = values.cumRapChieu;
    const giaVe = values.giaVe;
    const data = { maPhim, ngayChieuGioChieu, maRap, giaVe };
    console.log(data);
    await taoLichChieuApi(data);
    notification.success({
      description: "Successfully !",
    });
  };

  const uploadAddress = (value) => {
    setmoreOption(value);
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
        maHeThongRap: undefined,
        cumRapChieu: undefined,
        giaVe: "",
        gioChieu: undefined,
        ngayChieu: "",
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
      <Form.Item label="Hệ thống rạp" name="maHeThongRap">
        <Select placeholder="Select Cinema" onChange={uploadAddress}>
          {option1}
        </Select>
      </Form.Item>
      <Form.Item label="Cụm rạp" name="cumRapChieu">
        <Select placeholder="Select Address" >
          {option2}
        </Select>
      </Form.Item>
      <Form.Item label="Ngày chiếu" name="ngayChieu">
        <DatePicker />
      </Form.Item>
      <Form.Item label="Giờ chiếu" name="gioChieu">
        <Select placeholder="Select Time" >
          {option3}
        </Select>
      </Form.Item>
      <Form.Item label="Giá vé" name="giaVe"  >
        <Input placeholder="VND" />
      </Form.Item>

      <Form.Item className="mt-2">
        <Button htmlType="sumbit" type="prymary">
          SAVE
        </Button>
      </Form.Item>
    </Form>
  );
}


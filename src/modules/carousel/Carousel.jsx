import { Row, Col } from 'antd';
import React, { useEffect } from "react";
import { Carousel as CarouselAntd } from "antd";
import "antd/dist/antd.css";
import { bannerMovieApi } from "services/movie";
import { useAsync } from "hooks/useAsync";
import {
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import "./index.scss";

const contentStyle = {
  objectFit: "fill",
  width: "100%",
  height: "500px",
};

const SampleNextArrow = props => {
  const { className, style, onClick } = props
  return (
    <div
      className={className}
      style={{
        ...style,
        color: 'black',
        fontSize: '15px',
        lineHeight: '1.5715',
        fontSize: '50px',
        right: '-10px' ,
        zIndex: '2' ,
      }}
      onClick={onClick}
    >
      <RightOutlined  />
    </div>
  )
}

const SamplePrevArrow = props => {
  const { className, style, onClick } = props
  return (
    <div
      className={className}
      style={{
        ...style,
        color: 'black',
        fontSize: '20px',
        lineHeight: '1.5715',
        fontSize: '50px',
        left: '-40px' ,
        zIndex: '2' ,
      }}
      onClick={onClick}
    >
      <LeftOutlined />
    </div>
  )
}

const settings = {
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />
}


export default function Carousel() {

  const { state: banner = [] } = useAsync({
    dependencies: [],
    service: () => bannerMovieApi(),
  })

  const bannerList =
    banner.map((item, index) => {
      return (
        <div key={index}>
          <img style={contentStyle} src={item.hinhAnh} alt="" />
        </div>)
    }
    );


  return (<>
    <div className="TitleCarousel" style={{ marginBottom: '0' }}>
      <p>PHIM HOT TẠI RẠP</p>
    </div>

    <Row justify="center" >
      <Col span={16}>
        <CarouselAntd arrows autoplay={true} autoplaySpeed={2500} {...settings}>
          {bannerList}
        </CarouselAntd>
      </Col>
    </Row>
    <div className="TitleCarousel">
    </div>
  </>
  );
}

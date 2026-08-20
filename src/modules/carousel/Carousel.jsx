import { Row, Col} from 'antd';
import React from "react";
import { Carousel as CarouselAntd } from "antd";
import { useAsync } from "hooks/useAsync";
import { getBannerListAPI } from 'services/banner';
import "./index.scss";
import { Navigate, useNavigate } from 'react-router-dom';

// import { LeftOutlined, RightOutlined } from "@ant-design/icons";
// Sửa lại Arrow: Sử dụng rem và xóa các thuộc tính trùng lặp
// const SampleNextArrow = (props) => {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={className}
//       style={{
//         ...style,
//         color: 'black',
//         fontSize: '5rem', // 50px
//         right: '-1rem',   // -10px
//         zIndex: '2',
//         display: 'block'
//       }}
//       onClick={onClick}
//     >
//       <RightOutlined />
//     </div>
//   );
// };

// const SamplePrevArrow = (props) => {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={className}
//       style={{
//         ...style,
//         color: 'black',
//         fontSize: '5rem', // 50px
//         left: '-4rem',    // -40px
//         zIndex: '2',
//         display: 'block'
//       }}
//       onClick={onClick}
//     >
//       <LeftOutlined />
//     </div>
//   );
// };

// const settings = {
//   nextArrow: <SampleNextArrow />,
//   prevArrow: <SamplePrevArrow />,  
// };

export default function Carousel() {
  const nav = useNavigate();
  const { state: rawBanner } = useAsync({
    dependencies: [],
    service: () => getBannerListAPI(),
  });
  const banner = Array.isArray(rawBanner) ? rawBanner : [];

  const bannerList = banner?.map((item, index) => (
    <div key={index} style={{ height: "60rem" }} onClick={() => {nav(`/movie/detail/${item.movie_id}`)}}>
      <div style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <img
          src={item.url}          
          width={939}
          height={528}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          fetchpriority={index === 0 ? "high" : "low"}
          style={{
            width: "auto",
            height: "100%",
            objectFit: "cover",
            objectPosition: "left center"
          }}
        />
      </div>
    </div>
  ));

  return (
    <div className='homeCarousel'>
      <div className="TitleCarousel">
        <p>PHIM HOT TẠI RẠP</p>
      </div>

      <Row justify="center" >
        <Col span={16} className="carousel-container">
            <CarouselAntd
              arrows
              autoplay={true}
              autoplaySpeed={2500}
              // {...settings}
              style={{ height: "60rem", overflow: "hidden" }}

            >
              {bannerList}
            </CarouselAntd>          
        </Col>
      </Row>
      <div className="TitleCarousel"></div>
    </div>
  );
}
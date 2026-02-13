import { Row, Col } from 'antd';
import React from "react";
import { Carousel as CarouselAntd } from "antd";
import { useAsync } from "hooks/useAsync";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./index.scss";
import { fetchMoviebannerAPI } from 'services/general';

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
  const { state: banner = [] } = useAsync({
    dependencies: [],
    service: () => fetchMoviebannerAPI(),
  });

  const bannerList = banner?.map((item, index) => (
  <div key={index} style={{ height: "60rem" }}> {/* THÊM CHIỀU CAO Ở ĐÂY */}
    <div style={{
      width: "100%",        
      height: "100%", // PHẢI CÓ 100%
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <img
        src={item}
        alt={`banner-${index}`}
        style={{
          width: "auto",
          height: "100%",
          objectFit: "cover", // Đổi sang cover để không bị hở khoảng trắng
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
          {/* Quan trọng: Chiều cao ở đây phải khớp với bannerList */}
          <CarouselAntd
            arrows
            autoplay= {false}
            autoplaySpeed={2500}
            {...settings}
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
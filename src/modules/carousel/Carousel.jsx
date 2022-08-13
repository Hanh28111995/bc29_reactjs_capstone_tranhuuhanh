import React from "react";
import { Carousel as CarouselAntd } from "antd";

const contentStyle = {
  objectFit: "fill",
  width: "100%",
  height: "550px",
};

export default function Carousel() {
  const onChange = (currentSlide) => {
    console.log(currentSlide);
  };
  return (
    <CarouselAntd dotPosition="right" afterChange={onChange}>
      <div>
        <img
          style={contentStyle}
          src="https://media.lottecinemavn.com/Media/WebAdmin/cc298251d26d482ba36209a9e177f63e.jpg"
          alt=""
        />
      </div>
      <div>
        <img
          style={contentStyle}
          src="https://media.lottecinemavn.com/Media/WebAdmin/f60ec299d02f46cfa5e857c93ac130ce.jpg"
          alt=""
        />
      </div>
      <div>
        <img
          style={contentStyle}
          src="https://media.lottecinemavn.com/Media/WebAdmin/30a90155555b40f1b746bf9b49ecb50b.jpg"
          alt=""
        />
      </div>
    </CarouselAntd>
  );
}

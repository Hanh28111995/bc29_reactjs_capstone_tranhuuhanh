import React from "react";
import { Carousel as CarouselAntd } from "antd";

const contentStyle = {
  objectFit: "fill",
  width: "100%",
  height: "500px",
};

export default function Carousel() {
  const onChange = (currentSlide) => {
    console.log(currentSlide);
  };
  return (
    <CarouselAntd  afterChange={onChange}>
     
    
    </CarouselAntd>
  );
}

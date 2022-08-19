import React, { useState } from "react";
import "./index.scss";
import { LoaiGhe } from "../../enums/common";

export default function Chair(props) {
  const [isSelected, setSelected] = useState(false);
  const populateClass = () => {
    let defaultClass = "ghe";
    if (props.item.loaiGhe === LoaiGhe.Vip) {
      defaultClass += " gheVip";
    }
    if (isSelected) {
      defaultClass += " dangDat";
    }
    if (props.item.daDat) {
      defaultClass += " daDat";
    }
    return defaultClass;
  };

  return (
    <button
      disabled={props.item.daDat}
      onClick={() => {
        setSelected(!isSelected);
        props.handleSelect(props.item);
      }}
      className={populateClass()}
    >
      {props.item.tenGhe}
    </button>
  );
}

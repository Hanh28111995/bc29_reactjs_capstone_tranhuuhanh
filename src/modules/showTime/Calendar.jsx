import React, { useState } from 'react';
import useCalendar from 'hooks/useCalendar';
import { formatDate1, formatDate2 } from 'utils/common';
import { Row, Col } from 'antd';
import { Carousel as CarouselAntd } from "antd";
import { isEqual } from 'constants/common';
import { setDate } from 'store/actions/user.action';
import { useDispatch } from 'react-redux';
import {
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import "./index.scss";

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
        right: '-50px' ,
        zIndex: '2' ,
      }}
      onClick={onClick}
    >
      <RightOutlined />
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
        fontSize: '15px',
        lineHeight: '1.5715',
        left: '-50px' ,
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

export default function Calendar() {
  const { selectedDate, todayFormatted, daysShort, render_array_today, today } = useCalendar();
  const dispatch = useDispatch();
  const [appState, changeState] = useState({
    activeObject: null,
    object: render_array_today,
  })

  const dateClickHandler = (date,index,idx) => {
    dispatch(setDate(date));
    changeState({...appState, activeObject: appState.object[index][idx] })
  }
const toggleActiveStyles = (index,idx) =>{
  if (appState.activeObject === null) {return 'inactive'}
  if(isEqual(appState.object[index][idx], appState.activeObject ))
  {
    return 'active'
  }
  else 
  {
    return 'inactive'
  }
}


  const Day_bar =
    daysShort.map(day => {
      return (<th key={day}>{day}</th>)
    });
  let today_idx = 0;
  for (let i = 0; i < render_array_today[0].length; i++) {
    if (render_array_today[0][i].date === todayFormatted) { today_idx = i }
  }
  for (let i = 0; i < render_array_today[0].length; i++) {
    if (i < today_idx) { render_array_today[0][i].classes = ' yesterday'}
  }

  const bannerList = Object.values(render_array_today).map((cols, index) => {
    return (
      <table key={index} className="table d-table text-center">
        <thead>
          <tr>
            {Day_bar}
          </tr>
        </thead>
        <tbody>
          <tr key={cols[0].date}>
            {cols.map((col, idx) => (
              (col.date === todayFormatted) ?
                (<td key={col.date} className={toggleActiveStyles(index,idx) +`${col.classes} today`} onClick={() => dateClickHandler(col.date,index,idx)}>{col.value}</td>)
                : (<td key={col.date} className={toggleActiveStyles(index,idx) + `${col.classes}`} onClick={() => dateClickHandler(col.date,index,idx)}>{col.value}</td>)
            )
            )}
          </tr>
        </tbody>
      </table>
    )
  })



  return (
    <>
      <span className="month" style={{ top: '-47px', left: 47 }}><em>{formatDate1(today)}</em><span>&nbsp;{formatDate2(today)}</span></span>
      <Row justify="center" style={{ marginBottom: '4rem' }} >
        <Col span={16}>
          <CarouselAntd arrows autoplay={false} {...settings} dots={false}>
            {bannerList}
          </CarouselAntd>
        </Col>
      </Row>


    </>
  );
}


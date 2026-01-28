import React, { useEffect, useState } from 'react';
import useCalendar from 'hooks/useCalendar';
import { formatDate1, formatDate2, formatDate4 } from 'utils/common';
import { Row, Col, Carousel as CarouselAntd } from 'antd';
import { isEqual } from 'constants/common';
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./index.scss";
import moment from 'moment';


// Giữ nguyên các component Arrow (SampleNextArrow, SamplePrevArrow)
const SampleNextArrow = props => {
  const { className, style, onClick } = props;
  return (
    <div className={className} style={{ ...style, color: 'black', fontSize: '15px', right: '-50px', zIndex: '2' }} onClick={onClick}>
      <RightOutlined />
    </div>
  );
};

const SamplePrevArrow = props => {
  const { className, style, onClick } = props;
  return (
    <div className={className} style={{ ...style, color: 'black', fontSize: '15px', left: '-50px', zIndex: '2' }} onClick={onClick}>
      <LeftOutlined />
    </div>
  );
};

const settings = {
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />
};

export default function Calendar({ onDateChange }) {
  const { todayFormatted, daysShort, render_array_today, today } = useCalendar();
  const [showDays, setShowDays] = useState(formatDate1(today));
  const [showMonth, setShowMonth] = useState(formatDate2(today));
  const [showYear, setShowYear] = useState(formatDate4(today));

  // State quản lý việc hiển thị Active trên UI
  const [appState, changeState] = useState({
    activeObject: null,
    object: render_array_today,
  });

  // Tự động chọn ngày hôm nay khi lần đầu load trang
  useEffect(() => {
    if (todayFormatted && onDateChange) {
      onDateChange(todayFormatted);

      // Tìm object tương ứng với ngày hôm nay để set class active
      const firstWeek = render_array_today[0];
      const todayObj = firstWeek?.find(item => item.date === todayFormatted);
      if (todayObj) {
        changeState(prev => ({ ...prev, activeObject: todayObj }));
      }
    }
  }, [todayFormatted]); // Chỉ chạy khi render_array_today hoặc todayFormatted sẵn sàng

  // THÊM DÒNG NÀY: Nếu chưa có mảng lịch thì không render gì cả để tránh lỗi truy cập mảng
  if (!render_array_today || render_array_today.length === 0) {
    return null;
  }

  const dateClickHandler = (date, index, idx) => {
    if (onDateChange) {
      onDateChange(date);
      setShowDays(date.split('-')[0]);
      setShowMonth(date.split('-')[1]);
      setShowYear(date.split('-')[2]);
    }
    // 2. Cập nhật UI active cục bộ
    changeState({ activeObject: render_array_today[index][idx], object: render_array_today });
  };

  const toggleActiveStyles = (index, idx) => {
    // 1. Kiểm tra an toàn: Nếu object hoặc mảng con không tồn tại thì thoát luôn
    if (!appState.object || !appState.object[index] || !appState.object[index][idx]) {
      return 'inactive ';
    }

    // 2. Nếu chưa có ngày nào được chọn làm active
    if (appState.activeObject === null) return 'inactive ';

    // 3. So sánh an toàn
    if (isEqual(appState.object[index][idx], appState.activeObject)) {
      return 'active ';
    }

    return 'inactive ';
  };

  const Day_bar = daysShort.map(day => <th key={day}>{day}</th>);

  // Xử lý logic class cho các ngày đã qua (yesterday)
  let today_idx = 0;
  if (render_array_today[0]) {
    for (let i = 0; i < render_array_today[0].length; i++) {
      if (render_array_today[0][i].date === todayFormatted) { today_idx = i; }
    }
    for (let i = 0; i < render_array_today[0].length; i++) {
      if (i < today_idx) { render_array_today[0][i].classes = ' yesterday'; }
    }
  }

  const bannerList = Object.values(render_array_today).map((cols, index) => {
    return (
      <table key={index} className="table d-table text-center">
        <thead>
          <tr>{Day_bar}</tr>
        </thead>
        <tbody>
          <tr key={cols[0]?.date}>
            {cols.map((col, idx) => (
              <td
                key={col.date}
                className={toggleActiveStyles(index, idx) + `${col.classes || ''} ${col.date === todayFormatted ? 'today' : ''}`}
                onClick={() => dateClickHandler(col.date, index, idx)}
              >
                {col.value}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  });

  return (
    <div className='Calendar'>
      <span className="month" style={{ top: '-47px', left: 47 }}>
        <em>{showDays}</em>
        <span style={{ textTransform: 'capitalize' }}>&nbsp; Tháng {showMonth} Năm {showYear} </span>
      </span>
      <Row justify="center" className='my-5'>
        <Col span={16}>
          <CarouselAntd arrows autoplay={false} {...settings} dots={false}>
            {bannerList}
          </CarouselAntd>
        </Col>
      </Row>
    </div>
  );
}
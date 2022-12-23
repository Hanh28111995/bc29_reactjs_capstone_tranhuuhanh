import React from 'react';
import ShowTime from 'modules/showTime/ShowTime';
import DetailCopy from 'modules/detail/Detail copy';
import Calendar from 'modules/showTime/Calendar';
import "./index.scss";

export default function MovieDetail() {
  return (
    <div className="detailPage py-3 container" style={{ flex: '1' }}>
      <DetailCopy />
      <Calendar />
      <ShowTime />
    </div>
  )
}

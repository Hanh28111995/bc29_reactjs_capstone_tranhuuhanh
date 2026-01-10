import React from 'react';
import ShowTime from 'modules/showTime/ShowTime';
import Calendar from 'modules/showTime/Calendar';
import "./index.scss";
import CinemaBooking from 'modules/detail/CinemaBooking';
import { fetchLocationListAPI } from 'services/general';
import { useAsync } from 'hooks/useAsync';

export default function MovieDetail() {
  const { state: data = [] } = useAsync({
    dependencies: [],
    service: () => fetchLocationListAPI(),
  });

  return (
    <div className="detailPage py-3 container" style={{ flex: '1' }}>
      <CinemaBooking dataSource={data} />
      <Calendar />
      <ShowTime />
    </div>
  )
}

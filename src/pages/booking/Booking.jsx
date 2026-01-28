import "./index.scss";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "hooks/useAsync";
import { fetchShowtimesCusAPI } from "services/customer";
import SeatsRendering from "modules/seatsRendering/seatsRendering";
import { useSelector } from "react-redux";
import { notification } from "antd/lib";
import moment from "moment";

export default function Booking() {
  const [danhSachGhe, setdanhSachGhe] = useState([]);
  const params = useParams();
  const navigate = useNavigate();
  const userState = useSelector((state) => state.userReducer);
  const [RowCol, setRowCol] = useState([]);

  const { state: data = [] } = useAsync({
    service: () => fetchShowtimesCusAPI(params.id),
    codintion: !!userState.userInfor?.user_inf?.id,
    dependencies: [params.id && userState.userInfor?.user_inf?.role]
  });

  useEffect(() => {
    if (data?.seats && data.seats.length > 0) {
      const seats = data.seats;
      let maxRowNumber = 0;
      let maxCol = 0;

      seats.forEach(seat => {
        const rowPart = seat.seatNumber.match(/[A-Z]+/)[0];
        const rowNum = rowPart.charCodeAt(0) - 64;
        const colPart = parseInt(seat.seatNumber.match(/\d+/)[0]);

        if (rowNum > maxRowNumber) maxRowNumber = rowNum;
        if (colPart > maxCol) maxCol = colPart;
      });
      setRowCol([maxRowNumber, maxCol]);
    }
  }, [data]);

  const handleSelect = (type, selectChair) => {
    setdanhSachGhe((prev) => {
      const idx = prev.findIndex((ele) => ele.seatNumber === selectChair.seatNumber);
      if (type === "deselect") return prev.filter((ele) => ele.seatNumber !== selectChair.seatNumber);
      if (type === "select") {
        if (idx !== -1) return prev;
        return [...prev, selectChair];
      }
      return prev;
    });
  };

  const handleSubmitTicket = async () => {
    if (danhSachGhe.length === 0) return notification.warning({ message: "Vui lòng chọn ghế!" });
    navigate(`/booking/payment/${params.id}`, {
      state: {
        bookingData: danhSachGhe,
        movieInfor: data?.id_movie,
        theater: data?.theater,
        time: moment(data?.startTime).format('DD/MM/YYYY HH:mm')
      }
    });
  };

  return (
    <div className="container-fluid bookingPage">
      <div className="booking-wrapper">
        {/* Sidebar Thông tin */}
        <div className="booking-sidebar">
          <div className="poster-container">
            <img className="movie-banner" src={data?.id_movie?.banner} alt={data?.id_movie?.title} />
          </div>

          <div className="info-item">
            <label>Tên phim:</label>
            <p className="highlight">{data?.id_movie?.title}</p>
          </div>

          <div className="info-item">
            <label>Tên rạp:</label>
            <p className="highlight">
              {data?.theater?.branch} <br />
              <span>Phòng {data?.theater?.name}</span>
            </p>
          </div>

          <div className="info-item">
            <label>Thời gian:</label>
            <p className="highlight">{moment(data?.startTime).format('DD/MM/YYYY HH:mm')}</p>
          </div>

          <div className="info-summary">
            <p className="selected-seats">
              Ghế đã chọn: <span>{danhSachGhe.map(el => el.seatNumber).join(", ") || "Chưa chọn"}</span>
            </p>
            <p className="total-price">
              Tổng tiền: <b>{danhSachGhe.reduce((total, el) => total + el.seatType.price, 0).toLocaleString()} VNĐ</b>
            </p>
          </div>

          <button className="btn-submit-booking" onClick={handleSubmitTicket}>
            ĐẶT VÉ
          </button>
        </div>

        {/* Khu vực chọn ghế */}
        <div className="booking-seats-area">
          <div className="screen-divider">Màn hình</div>
          <SeatsRendering
            data={data?.seats || []}
            mode={userState.userInfor?.user_inf.role}
            onAction={handleSelect}
            selectedSeats={danhSachGhe}
          />
        </div>
      </div>
    </div>
  );
}
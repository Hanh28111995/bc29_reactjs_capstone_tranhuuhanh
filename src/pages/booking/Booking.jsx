import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Chair from "modules/chair/Chair";
import { bookingTicketAPI, fetchRoomListAPI } from "services/booking";

export default function Booking() {
  const [danhSachGhe, setdanhSachGhe] = useState([]);
  const [roomList, setRoomList] = useState({});
  const params = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    fetchRoomList();
  }, []);

  const fetchRoomList = async () => {
    const result = await fetchRoomListAPI(params.maLichChieu);
    setRoomList(result.data.content);
    console.log(result);
  };

  const handleSelect = (selectChair) => {
    const data = [...danhSachGhe];
    const idx = data.findIndex((ele) => ele.tenGhe === selectChair.tenGhe);
    if (idx !== -1) {
      data.splice(idx, 1);
    } else {
      data.push(selectChair);
    }
    setdanhSachGhe(data);
  };

  const handleSubmitTicket = async() => {
    const danhsachVe = danhSachGhe.map((ele) => {
      return {
        maGhe: ele.maGhe,
        giaVe: ele.giaVe,
      };
    });
    const submitData = {
      maLichChieu: params.maLichChieu,
      danhsachVe,
    };
    await bookingTicketAPI(submitData);
    alert("ĐẶT VÉ THÀNH CÔNG.");
    navigate("/");
  };

  return roomList?.thongTinPhim ? (
    <div className="row w-75 mx-auto my-5">
      <div className="col-8">
        {roomList.danhSachGhe.map((ele, idx) => {
          return (
            <React.Fragment key={ele.tenGhe}>
              <Chair item={ele} handleSelect={handleSelect} />
              {(idx + 1) % 16 === 0 && <br />}
            </React.Fragment>
          );
        })}
      </div>
      <div className="col-4">
        <img
          className="img-fluid"
          src={roomList.thongTinPhim.hinhAnh}
          alt="image"
        />
        <h4>Tên phim: {roomList.thongTinPhim.tenPhim}</h4>
        <h5>Mô tả:{roomList.thongTinPhim.moTa}</h5>
        <p>
          Ghế:
          {danhSachGhe.map((ele) => (
            <span key={ele.tenGhe} className="badge badge-success">
              {ele.tenGhe}
            </span>
          ))}
        </p>
        <p>
          Tổng tiền:
          {danhSachGhe
            .reduce((previousValue, currentValue) => {
              previousValue += currentValue.giaVe;
              return previousValue;
            }, 0)
            .toLocaleString()}
        </p>
        <button className="btn btn-info" onClick={handleSubmitTicket}>
        ĐẶT VÉ
        </button>
      </div>
    </div>
  ) : (
    "Loading ..."
  );
}

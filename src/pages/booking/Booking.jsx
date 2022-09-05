import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Chair from "modules/chair/Chair";
import { bookingTicketAPI, fetchRoomListAPI } from "services/booking";
import "./index.scss";
import { useAsync } from "hooks/useAsync";

export default function Booking() {
  const [danhSachGhe, setdanhSachGhe] = useState([]);
  // const [roomList, setRoomList] = useState({});
  const params = useParams();
  const navigate = useNavigate();
  
  // useEffect(() => {
  //   fetchRoomList();
  // }, []);

  // const fetchRoomList = async () => {
  //   const result = await fetchRoomListAPI(params.maLichChieu);
  //   setRoomList(result.data.content);
  //   console.log(result);
  // };

  const { state: roomList = [] } = useAsync({
    dependencies: [],
    service: () => fetchRoomListAPI(params.maLichChieu),
  });

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

  const handleSubmitTicket = async () => {
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
    <div className="container-fluid">
      <div className="row w-100 mx-auto my-5">
        <div className="col-3 mb-4">
          <img
            className="img-fluid"
            src={roomList.thongTinPhim.hinhAnh}
            alt=""
          />
          <h2 className="my-3 " style={{ fontSize: "16px", fontWeight: "bold" }}>Tên phim: <br />{roomList.thongTinPhim.tenPhim}</h2>
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
        <div className="col-9 text-center my-auto mb-4">
          <div className="screen mx-auto ">
            <h2 className="wthree">Screen this way</h2>
          </div>
          <div className="d-screen">
            {roomList.danhSachGhe.map((ele, idx) => {
              return (
                <React.Fragment key={ele.tenGhe}>
                  {((idx + 1) === 1) && <span>&emsp;</span>}
                  <Chair item={ele} idx={idx + 1} handleSelect={handleSelect} />
                  {(idx + 1) % 16 === 0 && <br />}
                  {(((idx + 1) % 8) === 0) && <span>&emsp;</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  ) : (
    ""
  );
}



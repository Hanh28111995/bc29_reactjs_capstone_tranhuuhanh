import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMovieShowTimesAPI } from "services/cinema";
import { formatDate, formatDate1, formatDate2, formatDate3 } from "../../utils/common";
import { useAsync } from "hooks/useAsync";
import { useSelector } from "react-redux";
import useCalendar from "hooks/useCalendar";
import "./index.scss";

export default function ShowTime() {
  const params = useParams();
  const userState = useSelector((state) => state.userReducer);
  const { todayFormatted } = useCalendar();
  const { state: showTimes = [] } = useAsync({
    dependencies: [],
    service: () => fetchMovieShowTimesAPI(params.movieId),
  })
  let store_date = (userState.date || todayFormatted).replaceAll('-', '/');
  // console.log(store_date)

  useEffect(() => {
    if (showTimes.length !== 0) {
      console.log(showTimes)
    }

  }, [showTimes]);

  // const fetchMovieShowTimes = async () => {
  //   const result = await fetchMovieShowTimesAPI(params.movieId);
  //   setShowTimes(result.data.content);
  //   console.log("a",result)
  // };

  const renderTabs = () => {
    return showTimes?.heThongRapChieu?.map((ele, idx) => {
      return (
        <a
          key={ele.maHeThongRap}
          className={`nav-link text-capitalize ${idx === 0 && "active"}`}
          data-toggle="pill"
          href={`#${ele.maHeThongRap}`}
          role="tab"
          aria-selected="true"
        >
          {ele.tenHeThongRap}
        </a>
      );
    });
  };

  const renderContent = () => {
    return showTimes?.heThongRapChieu?.map((ele, idx) => {
      return (
        <div
          className={`tab-pane fade show ${idx === 0 && "active"}`}
          id={ele.maHeThongRap}
          key={ele.maHeThongRap}
          role="tabpanel"
        >
          {ele.cumRapChieu.map((ele) => {
            return (
              <div key={ele.maCumRap} className="row mb-5">
                <div className="col-2 pb-3">
                  <img className="img-fluid rounded" src={ele.hinhAnh} />
                </div>
                <div className="col-10 pl-0">
                  <h5>{ele.tenCumRap}</h5>
                  <span className="text-muted">{ele.diaChi}</span>
                </div>
                <div className="col-12">
                  <div className="row">
                    {ele.lichChieuPhim.map((ele) => {
                      // if (formatDate3(ele.ngayChieuGioChieu) === store_date) {
                      return (
                        <Link to={`/booking/${ele.maLichChieu}`} className="col-3 pb-2 box_select w-100" key={ele.maLichChieu} >
                            {formatDate(ele.ngayChieuGioChieu)}
                        </Link>
                      )
                      // };
                    })}
                  </div>
                </div>
              </div>
            );
          })
          }
        </div >
      );
    });
  };

  return (
    <div className="Showtime row my-3">
      <div className="col-3">
        <div
          className="nav flex-column nav-pills"
          id="v-pills-tab"
          role="tablist"
          aria-orientation="vertical"
        >
          {(showTimes.heThongRapChieu?.length) ? (renderTabs()) : (<h3>Lịch chiếu không tồn tại</h3>)}
        </div>
      </div>
      <div className="col-9">
        <div className="tab-content" id="v-pills-tabContent">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

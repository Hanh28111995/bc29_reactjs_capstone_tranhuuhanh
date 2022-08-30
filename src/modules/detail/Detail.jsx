import { useAsync } from "hooks/useAsync";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovieDetailAPI } from "services/movie";
import moment from "moment";
import "./index.scss";


export default function Detail() {
  const param = useParams();
  // const [movieDetail, setMovieDetail] = useState({});

  // useEffect(() => {
  //   fetchMovieDetail();
  // }, []);
  // const fetchMovieDetail = async () => {
  //   const result = await fetchMovieDetailAPI(param.movieId);
  //   setMovieDetail(result.data.content);
  // console.log("a",result)
  let Star = [];
  const [option1, setOption1] = useState();

  const { state: movieDetail = [] } = useAsync({
    dependencies: [],
    service: () => fetchMovieDetailAPI(param.movieId),
  })

  useEffect(() => {
    for (let i = 0; i < Math.ceil(movieDetail.danhGia / 2); i++) {
      Star.push(<i key={"y" + i} className="fa-regular fa-star"></i>);
    }
    for (let i = 0; i < (5 - Math.ceil(movieDetail.danhGia / 2)); i++) {
      Star.push(<i key={"n" + i} className="fa-solid fa-star"></i>);
    }
    setOption1(Star);
  }, [movieDetail])

  return (
    <div className="container w-80" >
      <div className="row mt-3 mx-auto w-75">
        <div className="col-12">

          <div className="row">
            <div className="col-4">
              <img
                className="w-100 mb-2"
                src={movieDetail.hinhAnh}
                style={{height:'300px'}}
              />
              <button className="btn-more-infor mx-0 my-0 w-100" style={{ height: '35px' }}>ĐẶT VÉ</button>
            </div>
            <div className="col-8">
              <h2 style={{ fontWeight: 'bold' }}>{movieDetail.tenPhim}</h2>
              <p><span> Đánh giá  : </span> {option1} </p>
              <p><span>Ngày phát hành :</span> {moment(movieDetail.ngayKhoiChieu).format('DD/MM/YYYY')}</p>
              <p><span>Nhà sản xuất :</span></p>
              <p><span>Thể loại : </span></p>
              <p><span>Đối tượng : </span></p>
              <div>
                {/* <button className="btn btn-info mr-2">TRAILER</button> */}
              </div>
            </div>
          </div>
          <div className="row mt-3 px-3">
            <p > <span>Tóm tắt :</span><br />
              {movieDetail.moTa}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

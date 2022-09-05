import { useAsync } from "hooks/useAsync";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMovieDetailAPI } from "services/movie";
import moment from "moment";
import "./index.scss";


export default function DetailCopy() {
  const param = useParams();
  const navigate = useNavigate();
  const { state: movieDetail = [] } = useAsync({
    dependencies: [],
    service: () => fetchMovieDetailAPI(param.movieId),
  })

  // useEffect(() => {
  //   let Star = [];
  //   if(movieDetail){

  //   for (let i = 0; i < Math.ceil(movieDetail.danhGia / 2); i++) {
  //     Star.push(<i key={"y" + i} className="fa-regular fa-star"></i>);
  //   }
  //   for (let i = 0; i < (5 - Math.ceil(movieDetail.danhGia / 2)); i++) {
  //     Star.push(<i key={"n" + i} className="fa-solid fa-star"></i>);
  //   }
  //   setOption1(Star);
  // }
  // }, [])

  const starcount = () => {
    let Star = [];
    if (movieDetail) {

      for (let i = 0; i < Math.ceil(movieDetail.danhGia / 2); i++) {
        Star.push(<i key={"y" + i} className="fa-regular fa-star"></i>);
      }
      for (let i = 0; i < (5 - Math.ceil(movieDetail.danhGia / 2)); i++) {
        Star.push(<i key={"n" + i} className="fa-solid fa-star"></i>);
      }
    }
    return Star;
  }

  return (
      <div className="row my-5 mx-auto ">
        <div className="col-12 px-0">
          <div className="row">
            <div className="col-3">
              <img
                className="w-100 mb-2"
                src={movieDetail.hinhAnh}
                style={{ height: '300px', objectFit: 'cover' }}
                alt=''
              />
            </div>
            <div className="col-9">
              <h2 style={{ fontWeight: 'bold' }}>{movieDetail.tenPhim}</h2>
              <p><span> Đánh giá  : </span> {starcount()} </p>
              <p><span>Ngày phát hành :</span> {moment(movieDetail.ngayKhoiChieu).format('DD/MM/YYYY')}</p>
              <p><span>Nhà sản xuất :</span></p>
              <p><span>Thể loại : </span></p>
              <p><span>Đối tượng : </span></p>
              <button className="btn-more-infor mx-0 my-0" style={{ height: '35px', width:'80px' }} onClick={() => navigate(`/movie/detail/${movieDetail.maPhim}`)}>
                CHI TIẾT
                </button>
            </div>
          </div>
        </div>
      </div>
  
  );
}

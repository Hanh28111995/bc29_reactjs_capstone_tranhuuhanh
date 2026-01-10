import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../../contexts/loading.context";
import { useAsync } from "../../hooks/useAsync";

import { Radio } from "antd";
import moment from "moment";
import { fetchMovieListAPI } from "services/general";

export default function MovieList() {
  const navigate = useNavigate();
  const [, setLoadingState] = useContext(LoadingContext);
  // const [MovieShowList, setMovieShowList] = useState([]);
  const [movieListType, setMovieListType] = useState("SHOWING");

  const { state: movieList = [], loading } = useAsync({
    dependencies: [],
    service: () => fetchMovieListAPI(),
  });

  useEffect(() => {
    setLoadingState({ isLoading: loading });
  }, [loading, setLoadingState]);

  const FilterMovie1 = () => {
    let PhimDangChieu = movieList.filter((ele) => {
      return (
        ele.showing === true
      );
    });
    return PhimDangChieu
  }
  const FilterMovie2 = () => {
    let PhimSapChieu = movieList.filter((ele) => {
      return (
        (ele.coming === true)
      );
    });
    return PhimSapChieu
  }

  const renderMovieList = () => {
    const MovieShowList = movieListType === "SHOWING" ? FilterMovie1() : FilterMovie2();
    return MovieShowList.map((ele) => {
      return (
        <div className="col-xl-3 col-md-4 col-sm-6 col-xs-12 align-items-center px-3" key={ele._id}>
          <div
            className="card movie-card"
            style={{ marginBottom: 20, height: 450 }}
          >
            <div className="overlay"></div>
            <div className="btn-cover">
              <button className="btn-more-infor"
                onClick={() => navigate(`/movie/detail/${ele._id}`)}
              >
                CHI TIẾT
              </button>
              <button className="btn-more-infor"
                onClick={() => navigate(`/movie/selectT/${ele._id}`)}
              >
                ĐẶT VÉ
              </button>
            </div>
            <img
              style={{ height: 350, objectFit: "cover" }}
              className="card-img-top"
              src={ele.banner}
              alt="movie"
            />
            <div 
  className="card-body d-flex flex-column justify-content-center align-items-center" 
  style={{ 
    height: "120px", // Tăng nhẹ chiều cao để thông thoáng
    backgroundColor: "#fdfaf0", // Màu kem nhã nhặn hơn
    padding: "10px",
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px"
  }}
>
  <h3 
    className="card-title" 
    style={{ 
      fontSize: "22px", 
      fontWeight: "bold", 
      color: "#333",
      marginBottom: "18px",
      display: "-webkit-box",
      WebkitLineClamp: 2, // Giới hạn 2 dòng nếu tên phim quá dài
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      lineHeight: "1.2"
    }}
  >
    {ele.tenPhim}
  </h3>
  
  <h4 
    className="card-title" 
    style={{ 
      fontSize: "16px", 
      color: "#666", 
      fontWeight: "400",
      margin: 0 
    }}
  >
    <span style={{ color: "#999" }}>Khởi chiếu:</span> {moment(ele.releaseDate).format('DD/MM/YYYY')}
  </h4>
</div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="container-fluid my-5">
      <div className="text-center my-5">
        <Radio.Group size="large" buttonStyle="solid" defaultValue="a" >
          <Radio.Button value="a" onClick={() => setMovieListType("SHOWING")} >Phim đang chiếu</Radio.Button>
          <Radio.Button value="b" onClick={() => setMovieListType("COMMING-SOON")}>Phim sắp chiếu</Radio.Button>
        </Radio.Group>
      </div>
      <div className="row mt-3 mx-auto w-75">
        {renderMovieList()}
      </div>
    </div>
  )
    ;
}

import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../../contexts/loading.context";
import { Radio, Spin } from "antd";
import dayjs from "dayjs";
import "./index.scss";

export default function MovieList(props) {
  const navigate = useNavigate();
  const rawMovieList = props.rawMovieList;
  const [, setLoadingState] = useContext(LoadingContext);
  const [movieListType, setMovieListType] = useState("SHOWING");

  const movieList = Array.isArray(rawMovieList) ? rawMovieList : [];
  


  const filteredMovies = movieList.filter((ele) =>
    movieListType === "SHOWING" ? ele.showing === true : ele.coming === true,
  );

  return (
    <div className="container-fluid my-5 movie-list-container">
      <div className="container-fluid movie-list-container px-0">
        {/* Phần Tab chuyển đổi Phim */}
        <div className="text-center filter-tabs">
          <Radio.Group
            size="large"
            buttonStyle="solid"
            value={movieListType === "SHOWING" ? "a" : "b"}
            className="custom-radio-group"
          >
            <Radio.Button value="a" onClick={() => setMovieListType("SHOWING")}>
              Phim đang chiếu
            </Radio.Button>
            <Radio.Button
              value="b"
              onClick={() => setMovieListType("COMMING-SOON")}
            >
              Phim sắp chiếu
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>

      {/* Thêm class movie-list-row để kiểm soát flex-nowrap */}
      <div className="row mt-3  w-lg-75 movie-list-row">
        {filteredMovies.map((ele) => (
          <div className="col-3" key={ele._id}>
            <div className="card movie-card">
              <div className="card-header-wrapper">
                <img
                  className="card-img-top"
                  src={ele.banner}
                  alt={ele.tenPhim}
                  width={300}
                  height={350}
                  loading="lazy"
                  decoding="async"
                />

                {/* Lớp này sẽ hiện khi Hover (PC) hoặc Active (Touch) */}
                <div className="overlay"></div>

                <div className="btn-cover">
                  <button
                    className="btn-more-infor"
                    onClick={() => navigate(`/movie/detail/${ele._id}`)}
                  >
                    CHI TIẾT
                  </button>
                  <button
                    className="btn-more-infor"
                    onClick={() => navigate(`/movie/selectT/${ele._id}`)}
                  >
                    ĐẶT VÉ
                  </button>
                </div>
              </div>

              <div className="card-body-custom">
                <h3 className="movie-title">{ele.tenPhim}</h3>
                <h4 className="movie-release">
                  <span>Khởi chiếu:</span>{" "}
                  {dayjs(ele.releaseDate).format("DD/MM/YYYY")}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

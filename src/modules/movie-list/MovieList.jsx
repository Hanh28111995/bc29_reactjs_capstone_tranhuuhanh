import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../../contexts/loading.context";
import { useAsync } from "../../hooks/useAsync";
import { Radio } from "antd";
import moment from "moment";
import { fetchMovieListAPI } from "services/general";
import "./index.scss";

export default function MovieList() {
  const navigate = useNavigate();
  const [, setLoadingState] = useContext(LoadingContext);
  const [movieListType, setMovieListType] = useState("SHOWING");

  const { state: movieList = [], loading } = useAsync({
    dependencies: [],
    service: () => fetchMovieListAPI(),
  });

  useEffect(() => {
    setLoadingState({ isLoading: loading });
  }, [loading, setLoadingState]);

  const filteredMovies = movieList.filter((ele) =>
    movieListType === "SHOWING" ? ele.showing === true : ele.coming === true
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
            <Radio.Button value="b" onClick={() => setMovieListType("COMMING-SOON")}>
              Phim sắp chiếu
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* Hàng chứa danh sách phim - Nơi áp dụng w-100 dưới 500px */}
        <div className="movie-list-row-wrapper">
          {/* Render danh sách phim của bạn ở đây */}
        </div>
      </div>

      {/* Thêm class movie-list-row để kiểm soát flex-nowrap */}
      <div className="row mt-3  w-lg-75 movie-list-row">
        {filteredMovies.map((ele) => (
          // Trong vòng lặp map
          <div className="col-3" key={ele._id}>
            <div className="card movie-card">
              <div className="card-header-wrapper">
                <img className="card-img-top" src={ele.banner} alt={ele.tenPhim} />

                {/* Lớp này sẽ hiện khi Hover (PC) hoặc Active (Touch) */}
                <div className="overlay"></div>

                <div className="btn-cover">
                  <button className="btn-more-infor" onClick={() => navigate(`/movie/detail/${ele._id}`)}>
                    CHI TIẾT
                  </button>
                  <button className="btn-more-infor" onClick={() => navigate(`/movie/selectT/${ele._id}`)}>
                    ĐẶT VÉ
                  </button>
                </div>
              </div>

              <div className="card-body-custom">
                <h3 className="movie-title">{ele.tenPhim}</h3>
                <h4 className="movie-release">
                  <span>Khởi chiếu:</span> {moment(ele.releaseDate).format('DD/MM/YYYY')}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useAsync } from "hooks/useAsync";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovieDetailAPI } from "services/movie";
import { formatDate } from "../../utils/common";

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

    const {state: movieDetail = []} = useAsync({
      dependencies: [],
      service:() => fetchMovieDetailAPI(param.movieId),
    })

  // };
  return (
    <div className="row">
      <div className="col-3">
        <img
          className="w-100"
          src={ movieDetail.hinhAnh}
        />
      </div>
      <div className="col-9">
        <h4>{movieDetail.tenPhim}</h4>
        <p>
        {movieDetail.moTa}
        </p>
        <p>{formatDate(movieDetail.ngayKhoiChieu)}</p>
        <div>
          <button className="btn btn-info mr-2">TRAILER</button>
        </div>
      </div>
    </div>
  );
}

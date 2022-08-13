import { Button } from "antd";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMovieListAPI } from "../../services/movie";

export default function MovieList() {
  const [movieList, setMovieList] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchMovieList();
  }, []);

  const fetchMovieList = async () => {
    const result = await fetchMovieListAPI();
    setMovieList(result.data.content);
    // console.log("a",result)
  };
  const renderMovieList = () => {
    return movieList.map((ele) => {
      return (
        <div className="col-3" key={ele.maPhim}>
          <div
            className="card movie-card"
            style={{ marginBottom: 20, height: 500 }}
          >
            <img
              style={{ height: 350, objectFit: "cover" }}
              className="card-img-top"
              src={ele.hinhAnh}
              alt="movie"
            />
            <div className="card-body">
              <h5 className="card-title">{ele.tenPhim}</h5>
              <Button
              loading={false}
              size='large' 
              type="danger" 
              onClick={() => navigate(`/movie/${ele.maPhim}`)}>
                XEM CHI TIẾT
              </Button>
            </div>
          </div>
        </div>
      );
    });
  };

  return <div className="row mt-3 mx-auto w-75">{renderMovieList()}</div>;
}

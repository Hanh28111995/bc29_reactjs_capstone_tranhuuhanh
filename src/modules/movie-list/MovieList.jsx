import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../../contexts/loading.context";
import { useAsync } from "../../hooks/useAsync";
import { fetchMovieListAPI } from "services/movie";
import { Radio, Button } from "antd";
import moment from "moment";

export default function MovieList() {
  const navigate = useNavigate();
  const [MovieShowList, setMovieShowList] = useState([]);

  const { state: movieList = [] } = useAsync({
    dependencies: [],
    service: () => fetchMovieListAPI(),
  });

  useEffect(()=>{
    let PhimDangChieu = movieList.filter((ele) => {
      return (
        ele.dangChieu === true
      );
    });
    setMovieShowList(PhimDangChieu);
    console.log(PhimDangChieu)
  },[movieList])

  const FilterMovie1 = () =>{

    let PhimDangChieu = movieList.filter((ele) => {
      return (
        ele.dangChieu === true
      );
    });
    setMovieShowList(PhimDangChieu);
  }
  const FilterMovie2 = () =>{
    let PhimSapChieu = movieList.filter((ele) => {
      return (
        (ele.sapChieu === true)
      );
    });
    setMovieShowList(PhimSapChieu);
  }
 
  const renderMovieList = () => {

    return MovieShowList.map((ele) => {
      return (
        <div className="col-xl-3 col-md-4 col-sm-6 col-xs-12 align-items-center px-3" key={ele.maPhim}>
          <div
            className="card movie-card"
            style={{ marginBottom: 20, height: 450 }}
          > 
          <div className="overlay"> 
            <button className="btn-more-infor" 
                onClick={() => navigate(`/movie/${ele.maPhim}`)}
              >
                CHI TIẾT
              </button>
              <button className="btn-more-infor" 
                onClick={() => navigate(`/movie/${ele.maPhim}`)}
              >
                ĐẶT VÉ
              </button>
          </div>
            <img
              style={{ height: 350, objectFit: "cover" }}
              className="card-img-top"
              src={ele.hinhAnh}
              alt="movie"
            />   
            <div className="card-body text-center" style={{height:"100px", backgroundColor:"#efebdb"}}>
              <h3 className="card-title" >{ele.tenPhim}</h3>
              <h4 className="card-title" >Ngày khởi chiếu | {moment(ele.ngayKhoiChieu).format('DD/MM/YYYY')}</h4>;
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="container-fluid">
      <div className="text-center my-5">
      <Radio.Group size="large" buttonStyle="solid" defaultValue="a" >
        <Radio.Button value="a" onClick={FilterMovie1} >Phim đang chiếu</Radio.Button>
        <Radio.Button value="b" onClick={FilterMovie2}>Phim sắp chiếu</Radio.Button>
      </Radio.Group>
      </div>
      <div className="row mt-3 mx-auto w-75">
        {renderMovieList()}
      </div>
    </div>
  )
    ;
}

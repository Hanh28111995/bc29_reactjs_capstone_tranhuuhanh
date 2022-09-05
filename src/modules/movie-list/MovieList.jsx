import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../../contexts/loading.context";
import { useAsync } from "../../hooks/useAsync";
import { fetchMovieListAPI } from "services/movie";
import { Radio, Button } from "antd";
import moment from "moment";

export default function MovieList() {
  const navigate = useNavigate();
  // const [MovieShowList, setMovieShowList] = useState([]);
  const [movieListType, setMovieListType] = useState("SHOWING");

  const { state: movieList = [] } = useAsync({
    dependencies: [],
    service: () => fetchMovieListAPI(),
  });

  useEffect(()=>{
    // let PhimDangChieu = movieList.filter((ele) => {
    //   return (
    //     ele.dangChieu === true
    //   );
    // });
    // cái useEffect này dùng để làm gì vậy anh?
    // lấy giá trị đầu cho state, lúc movieList mới cập nhập ấy
    // em thấy cái state MovieShowList bị dư rồi, mình có thể làm cách khác
    // mình sẽ lưu cái state để check xem nên show cái gì
    // em code ví dụ nha
    // setMovieShowList(PhimDangChieu);
    // console.log(PhimDangChieu)
    // cách ban đầu của anh cũng đúng á, mà cái khúc set đầu tiên phải cho cái dependency là mảng rỗng để nó chạy 1 lần duy nhất là lần đầu thôi.
    // chứ hồi nãy để [MovieList] nó vừa set state là 1 mảng mới xong => react renderr lại, xong rồi mình vào lại cái useEffect này
    // cái nó tạo ra mảng mới cái nó setState lại => render lặp vô tận á.
    // tối qua sửa lại để vượt qua cái lỗi này r, xong nó thành lỗi useAsync, ko GET đc data, mới đọc tin nhắn trên group, do trang API à ???
    // không GET được là nó báo status code 400 hay sao anh, chắc là do api.
    // mà em đang suy nghĩ là dù lấy được data từ request thì cái [] nó cũng không lấy lại đc data => vậy cái 
    //để anh dò xem còn chỗ nào bị lỗi tương tự ko
    // 400 not request
    
  },[])

  const FilterMovie1 = () =>{

    let PhimDangChieu = movieList.filter((ele) => {
      return (
        ele.dangChieu === true
      );
    });
    return PhimDangChieu
  }
  const FilterMovie2 = () =>{
    let PhimSapChieu = movieList.filter((ele) => {
      return (
        (ele.sapChieu === true)
      );
    });
    return PhimSapChieu
  }
 
  const renderMovieList = () => {
    const MovieShowList = movieListType === "SHOWING" ? FilterMovie1() : FilterMovie2();
    return MovieShowList.map((ele) => {
      return (
        <div className="col-xl-3 col-md-4 col-sm-6 col-xs-12 align-items-center px-3" key={ele.maPhim}>
          <div
            className="card movie-card"
            style={{ marginBottom: 20, height: 450 }}
          > 
          <div className="overlay"> 
            <button className="btn-more-infor" 
                onClick={() => navigate(`/movie/detail/${ele.maPhim}`)}
              >
                CHI TIẾT
              </button>
              <button className="btn-more-infor" 
                onClick={() => navigate(`/movie/selectT/${ele.maPhim}`)}
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

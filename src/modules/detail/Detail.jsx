import { useNavigate } from "react-router-dom";
import moment from "moment";
import "./index.scss";

export default function Detail(props) {
  const navigate = useNavigate();

  const starcount = () => {
    let Star = [];
    if (props.movie) {
      const ratingCount = Math.ceil(props.movie.rating / 2);
      for (let i = 0; i < ratingCount; i++) {
        Star.push(<i key={"y" + i} className="fa-solid fa-star"></i>); // Đã đổi sang solid cho sao có màu
      }
      for (let i = 0; i < (5 - ratingCount); i++) {
        Star.push(<i key={"n" + i} className="fa-regular fa-star"></i>);
      }
    }
    return Star;
  }

  // Tránh lỗi khi props.movie chưa kịp load
  if (!props.movie) return <div>Loading...</div>;

  return (
    <div className="container movie-detail-container">
      <div className="row mx-auto">
        <div className="col-12">
          <div className="row">
            {/* Cột trái: Ảnh và Nút */}
            <div className="col-6 col-md-5 col-lg-4 movie-poster-wrapper">
              <img
                className="movie-banner"
                src={props.movie.banner}
                alt={props.movie.title}
              />
              <button
                className="btn-booking"
                onClick={() => navigate(`/movie/selectT/${props.movie._id}`)}
              >
                ĐẶT VÉ
              </button>
            </div>

            {/* Cột phải: Thông tin */}
            <div className="col-6 col-md-7 col-lg-8 movie-info">
              <h2>{props.movie.title}</h2>
              <p><span>Đánh giá:</span> {starcount()}</p>
              <p><span>Ngày phát hành:</span> {moment(props.movie.releaseDate).format('DD/MM/YYYY')}</p>
              <p><span>Đạo diễn:</span> {props.movie.director}</p>
              <p><span>Thể loại:</span> {props.movie.genre}</p>
              <p><span>Đối tượng:</span> </p>
            </div>
          </div>

          {/* Dòng dưới: Tóm tắt */}
          <div className="row movie-summary">
            <p>
              <span>Tóm tắt:</span><br />
              <p>{props.movie.describe}</p>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
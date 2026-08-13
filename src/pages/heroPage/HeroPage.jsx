import React, { useContext } from "react";
import { Spin } from "antd";
import Slider from "react-slick";
import { LoadingContext } from "contexts/loading.context";
import SEO from "components/SEO";
import "./index.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function HeroPage() {
  const [loadingState] = useContext(LoadingContext);
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    variableWidth: true,
    arrows: true,
    swipeToSlide: true,    
  };
  return (
    <Spin spinning={loadingState.isLoading} size="large">
      <SEO
        title="Trang chủ"
        description="Chào mừng bạn đến với Movie Cybersoft - Hệ thống đặt vé xem phim trực tuyến."
        keywords="đặt vé xem phim, lịch chiếu phim, rạp chiếu phim, phim mới nhất"
      />      
      <section className="cinema-hero-section">
        <div className="cinema-hero-container">
          <Slider {...settings}>
            <div className="hero-banner">
              <div className="banner-slide">
                <a href="#">
                  <img
                    src="https://media.lottecinemavn.com/Media/WebAdmin/2c51c67cfda94d5b8a8cb4149942ea40.jpg"
                    alt="Amazing Day"
                  />
                </a>
              </div>
            </div>

            <div className="box-office">
              <div className="head">
                <h3>BOX OFFICE</h3>
              </div>

              <ol className="ranking-list">
                <li>
                  <span className="rank-num">1</span>
                  <span className="movie-name">NGƯỜI NHỆN: KHỞI ĐẦU MỚI</span>
                </li>
                <li>
                  <span className="rank-num">2</span>
                  <span className="movie-name">THƯ TÌNH GỬI NGOẠI</span>
                </li>
                <li>
                  <span className="rank-num">3</span>
                  <span className="movie-name">THÁM TỬ LỪNG DANH CONAN</span>
                </li>
                <li>
                  <span className="rank-num">3</span>
                  <span className="movie-name">THÁM TỬ LỪNG DANH CONAN</span>
                </li>
                <li>
                  <span className="rank-num">3</span>
                  <span className="movie-name">THÁM TỬ LỪNG DANH CONAN</span>
                </li>
                <li>
                  <span className="rank-num">3</span>
                  <span className="movie-name">THÁM TỬ LỪNG DANH CONAN</span>
                </li>
              </ol>
              <a href="#" className="btn-ticket">
                Mua vé ngay
              </a>
            </div>

            <div className="movie-trailer">
              <div className="trailer-card">
                <img
                  src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12181_105_100006.jpg"
                  alt="Trailer"
                />
                <button className="btn-play">▶ Play</button>
              </div>
            </div>
          </Slider>
        </div>
      </section>

      <section className="movie-slider-section">
        <div className="movie-track">
          <div className="movie-item">
            <img
              src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12301_105_100001.png"
              alt="Movie 1"
            />
          </div>
          <div className="movie-item">
            <img
              src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12301_105_100001.png"
              alt="Movie 2"
            />
          </div>
          <div className="movie-item">
            <img
              src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12181_105_100006.jpg"
              alt="Spider-Man"
            />
          </div>
          <div className="movie-item">
            <img
              src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202608/12295_105_100003.jpg"
              alt="Movie 4"
            />
          </div>
          <div className="movie-item">
            <img
              src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12203_105_100003.jpg"
              alt="Movie 5"
            />
          </div>
        </div>
        <button className="slider-arrow next-arrow">›</button>
      </section>

      <section>
        <div className="event-section">
          <h2 className="event-title">EVENT</h2>
          <div className="event-grid">
            <div className="event-item item-large">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/469f3c4df24e43ad8d60f10242f342ed.jpg"
                alt="Quyền lợi thành viên"
              />
            </div>

            <div className="event-item">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/2c51c67cfda94d5b8a8cb4149942ea40.jpg"
                alt="Thứ 2 ưu đãi"
              />
            </div>

            <div className="event-item">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/bbfa3888ce0c4f82a47cb95091231f44.jpg"
                alt="Spider-man merchandise"
              />
            </div>

            <div className="event-item">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/b5fe97ebdaab46299ce539027fff755c.jpg"
                alt="Family Day"
              />
            </div>

            <div className="event-item">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/caf7f074dcfe4e66bccb76e73fad261f.jpg"
                alt="HDBank Promo"
              />
            </div>

            <div className="event-item item-tall">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/7cbdf43f16504986bc9835d2ccafac70.jpg"
                alt="Nạp L-Corn"
              />
            </div>

            <div className="event-item item-wide">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/cc69977093904b2cadab729947f3b794.jpg"
                alt="Thuê rạp mua vé nhóm"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="announcement-section">
        <div className="social-bar">
          <a href="#" className="social-item youtube">
            <span className="icon">▶</span>
            <div className="text">
              <small>youtube.com</small>
              <strong>/LotteCinemaVietnam</strong>
            </div>
          </a>
          <a href="#" className="social-item facebook">
            <span className="icon">f</span>
            <div className="text">
              <small>fb.com</small>
              <strong>/lottecinema</strong>
            </div>
          </a>
          <a href="#" className="social-item tiktok">
            <span className="icon">🎵</span>
            <div className="text">
              <small>tiktok.com</small>
              <strong>/@lottecinema.official</strong>
            </div>
          </a>
          <div className="social-item verified">
            <span>✔ ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG</span>
          </div>
        </div>

        <div className="notice-bar">
          <div className="notice-content">
            <span className="notice-label">Thông báo</span>
            <div className="notice-ticker">
              <a href="#">Ly topper Spider-man (Merchandise) 🕸️🕷️</a>
            </div>
          </div>
          <div className="notice-actions">
            <a href="#" className="btn-more">
              MORE
            </a>
            <div className="arrow-group">
              <button className="arrow-btn up">▲</button>
              <button className="arrow-btn down">▼</button>
            </div>
          </div>
        </div>

        <div className="promo-banner">
          <img
            src="https://media.lottecinemavn.com/Media/WebAdmin/bbfa3888ce0c4f82a47cb95091231f44.jpg"
            alt="Spider-Man Merchandise"
          />
        </div>
      </section>

      <button className="nav-arrow prev">‹</button>
      <button className="nav-arrow next">›</button>
    </Spin>     
  );
}

import React, { useRef, useState } from "react";
import Slider from "react-slick";
import SEO from "components/SEO";
import "./index.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useAsync } from "hooks/useAsync";
import { useNavigate } from "react-router-dom";
import { fetchShowBannerAPI, fetchShowPromotionAPI } from "services/general";
import { Spin } from "antd";

export default function HeroPage() {
  const bannerSliderRef = useRef(null);
  const trailerSliderRef = useRef(null);
  const [isMoved, setIsMoved] = useState(false);
  // Dùng useRef để lưu vị trí tọa độ khi bắt đầu kéo/vuốt
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Khoảng cách tối thiểu (pixel) để tính là một cú vuốt hợp lệ
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEndX.current = 0; // Reset
    touchStartX.current = e.targetTouches
      ? e.targetTouches[0].clientX
      : e.clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches
      ? e.targetTouches[0].clientX
      : e.clientX;
  };

  const onTouchEnd = () => {
    if (!touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;

    // Vuốt sang trái (kéo sang trái) -> Chuyển sang trang/khối tiếp theo
    if (distance > minSwipeDistance) {
      setIsMoved(true);
    }

    // Vuốt sang phải (kéo sang phải) -> Trở về trang đầu
    if (distance < -minSwipeDistance) {
      setIsMoved(false);
    }
  };
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 3,
    arrows: true,
    swipe: true,
  };
  const settings_child = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipe: false,
  };

  const {
    state: rawBanner = [],
    loading: bannerLoading,
    isError: bannerIsError,
  } = useAsync({
    service: () => fetchShowBannerAPI(),
    queryKey: ["banners"],
  });

  // 2. Tách biệt các biến cho Promotion
  const {
    state: rawNewPromotion = [],
    loading: promoLoading,
    isError: promoIsError,
  } = useAsync({
    service: () => fetchShowPromotionAPI(),
    queryKey: ["promotions"],
  });

  const isLoading = bannerLoading || promoLoading;
  const isError = bannerIsError || promoIsError;

  // if (isLoading) {
  //   return (
  //     <div
  //       className="d-flex justify-content-center align-items-center"
  //       style={{ minHeight: "50vh" }}
  //     >
  //       <Spin size="large" />
  //     </div>
  //   );
  // }

  if (isError) {
    return (
      <div className="text-center mt-5">
        <p>Đã có lỗi khi tải dữ liệu trang chủ.</p>
      </div>
    );
  }

  const banner = Array.isArray(rawBanner)
    ? rawBanner.filter((item) => item.highlight === true)
    : [];

  const promotion = Array.isArray(rawNewPromotion)
    ? rawNewPromotion.filter((item) => item.highlight === true)
    : [];

  console.log("Banner sau khi lọc (highlight=true):", banner);
  console.log("Promotion sau khi lọc (highlight=true):", promotion);

  const newList = promotion?.map((item, index) => (
    <div key={item._id || index} className="banner-slide">
      <a href={`/promotion/${item._id}`}>
        <img src={item.banner} alt="News" />
      </a>
    </div>
  ));

  const bannerList = banner?.map((item, index) => (
    <div key={item._id || index} className="trailer-card">
      <a href={`/movie/detail/${item.movie_id}`}>
        <img src={item.url} alt="Trailer" />
      </a>
    </div>
  ));

  return (
    <>
      <SEO
        title="Trang chủ"
        description="Chào mừng bạn đến với Movie Cybersoft - Hệ thống đặt vé xem phim trực tuyến."
        keywords="đặt vé xem phim, lịch chiếu phim, rạp chiếu phim, phim mới nhất"
      />
      <section className="cinema-hero-section">
        {isMoved && (
          <button
            className="custom-arrow prev-btn"
            onClick={() => setIsMoved(false)}
          >
            <LeftOutlined />
          </button>
        )}
        <button
          className="custom-arrow prev-btn"
          onClick={() => bannerSliderRef.current?.slickPrev()}
          style={{ zIndex: 9 }}
        >
          <LeftOutlined />
        </button>
        <div
          className={`cinema-hero-container ${isMoved ? "moved" : ""}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onTouchStart}
          onMouseMove={onTouchMove}
          onMouseUp={onTouchEnd}
          style={{ touchAction: "pan-y", cursor: "grab" }}
        >
          <div className="hero-banner">
            <div className="child-slider-wrapper">
              <Slider ref={bannerSliderRef} {...settings_child}>
                {newList}
              </Slider>
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
            <div className="child-slider-wrapper">
              <Slider ref={trailerSliderRef} {...settings_child}>
                {bannerList}
              </Slider>
            </div>
          </div>
        </div>
        <button
          className="custom-arrow next-btn"
          onClick={() => trailerSliderRef.current?.slickNext()}
          style={{ zIndex: 9 }}
        >
          <RightOutlined />
        </button>
        {!isMoved && (
          <button
            className="custom-arrow next-btn"
            onClick={() => setIsMoved(true)}
          >
            <RightOutlined />
          </button>
        )}
      </section>

      <section className="movie-slider-section">
        <div className="movie-track">
          <Slider {...settings}>
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
            <div className="movie-item">
              <img
                src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12203_105_100003.jpg"
                alt="Movie 5"
              />
            </div>
            <div className="movie-item">
              <img
                src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12203_105_100003.jpg"
                alt="Movie 5"
              />
            </div>
          </Slider>
        </div>
      </section>

      <section className="event-announcement-section">
        <div className="event-section">
          <h2 className="event-title">EVENT</h2>
          <div className="event-grid">
            <div className="item-large">
              <div className="item-tall">
                <div className="event-item">
                  {promotion
                    ?.filter((item) => item._id === "6a894891772982422acdfa34")
                    .map((item) => (
                      <a key={item._id} href={`/promotion/${item._id}`}>
                        <img src={item.banner} alt="Quyền lợi thành viên" />
                      </a>
                    ))}
                </div>
              </div>
              <div className="item-nm">
                <div className="event-item ">
                  <img
                    src="https://media.lottecinemavn.com/Media/WebAdmin/b5fe97ebdaab46299ce539027fff755c.jpg"
                    alt="Family Day"
                  />
                </div>
              </div>
            </div>
            <div className="item-large">
              <div className="item-nm">
                <div className="event-item ">
                  <img
                    src="https://media.lottecinemavn.com/Media/Event/34b1a121f2cc4c5995a17e19e77b47d9.jpg"
                    alt="Thứ 2 ưu đãi"
                  />
                </div>
              </div>
              <div className="item-tall">
                <div className="event-item">
                  <img
                    src="https://media.lottecinemavn.com/Media/Event/2554633691be4e729fa8242bafe8b4f4.jpg"
                    alt="HDBank Promo"
                  />
                </div>
              </div>
            </div>

            <div className="item-x-large">
              <div className="item-nm">
                <div className="event-item ">
                  <img
                    src="https://media.lottecinemavn.com/Media/Event/d56d841488374e8fb5af9c0d72d24033.jpg"
                    alt="Thứ 2 ưu đãi"
                  />
                </div>
              </div>
              <div className="item-tall">
                <div className="event-item">
                  <img
                    src="https://media.lottecinemavn.com/Media/Event/e74980bb21b747259157c8138dcd086d.jpg"
                    alt="HDBank Promo"
                  />
                </div>
              </div>
            </div>
            <div className="item-wrap-large">
              <div className="event-item ">
                <img
                  src="https://media.lottecinemavn.com/Media/Event/f353e37e868a425ea171d41d9a9bab0b.png"
                  alt="Thue"
                  style={{ objectPosition: "left" }}
                />
              </div>
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
    </>
  );
}

import React, { useRef, useState } from "react";
import Slider from "react-slick";
import SEO from "components/SEO";
import "./index.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useAsync } from "hooks/useAsync";
import { fetchShowBannerAPI, fetchShowPromotionAPI } from "services/general";

export default function HeroPage() {
  const bannerSliderRef = useRef(null);
  const trailerSliderRef = useRef(null);
  const movieSliderRef = useRef(null);
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
  slidesToScroll: 1,
  arrows: false,
  swipe: true,

  responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
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
    queryKey: ["banners-list", "active"],
  });

  const {
    state: rawNewPromotion = [],
    loading: promoLoading,
    isError: promoIsError,
  } = useAsync({
    service: () => fetchShowPromotionAPI(),
    queryKey: ["promotions-list", "active"],
  });

  const isLoading = bannerLoading || promoLoading;
  const isError = bannerIsError || promoIsError;

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

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

  const movieItems = Array.isArray(rawBanner) ? rawBanner : [];
  const carouselItems = movieItems.length
    ? Array.from(
        { length: Math.max(6, movieItems.length) },
        (_, index) => movieItems[index % movieItems.length]
      )
    : [];

  const caroucelList = carouselItems.map((item, index) => (
    <div className="movie-item" key={`${item._id || "movie"}-${index}`}>
      <a href={`/movie/detail/${item.movie_id}`}>
        <img src={item.url} />
      </a>
    </div>
  ));

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
          <button
            type="button"
            className="slider-arrow prev-btn"
            onClick={() => movieSliderRef.current?.slickPrev()}
            aria-label="Phim trước"
          >
            <LeftOutlined />
          </button>
          <Slider ref={movieSliderRef} {...settings}>
            {caroucelList}
          </Slider>
          <button
            type="button"
            className="slider-arrow next-btn"
            onClick={() => movieSliderRef.current?.slickNext()}
            aria-label="Phim tiếp theo"
          >
            <RightOutlined />
          </button>
        </div>
      </section>

      <section className="event-announcement-section">
        <div className="event-section">
          <h2 className="event-title">EVENT</h2>
          <div className="event-grid">
            <div className="item-large">
              <div className="item-tall">
                <div className="event-item">
                  {rawNewPromotion
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
                  {rawNewPromotion
                    ?.filter((item) => item._id === "6a894ac39a7896668a7e4c99")
                    .map((item) => (
                      <a key={item._id} href={`/promotion/${item._id}`}>
                        <img src={item.banner} alt="FAMILY DAY THỨ 4 ƯU ĐÃI" />
                      </a>
                    ))}
                </div>
              </div>
            </div>
            <div className="item-large">
              <div className="item-nm">
                <div className="event-item ">
                  {rawNewPromotion
                    ?.filter((item) => item._id === "6a894bb09a7896668a7e4c9d")
                    .map((item) => (
                      <a key={item._id} href={`/promotion/${item._id}`}>
                        <img src={item.banner} alt="THỨ 2 ƯU ĐÃI" />
                      </a>
                    ))}
                </div>
              </div>
              <div className="item-tall">
                <div className="event-item">
                  {rawNewPromotion
                    ?.filter((item) => item._id === "6a86b033303e867b13f7b2c5")
                    .map((item) => (
                      <a key={item._id} href={`/promotion/${item._id}`}>
                        <img
                          src={item.banner}
                          alt="Mua 02 vé xem phim 2D với giá 95,000đ"
                        />
                      </a>
                    ))}
                </div>
              </div>
            </div>

            <div className="item-x-large">
              <div className="item-nm">
                <div className="event-item ">
                  {rawNewPromotion
                    ?.filter((item) => item._id === "6a86b25b303e867b13f7b2d2")
                    .map((item) => (
                      <a key={item._id} href={`/promotion/${item._id}`}>
                        <img src={item.banner} alt="Spider-man (Merchandise)" />
                      </a>
                    ))}
                </div>
              </div>
              <div className="item-tall">
                <div className="event-item">
                  {rawNewPromotion
                    ?.filter((item) => item._id === "6a8955fae2eabfe092cb4c74")
                    .map((item) => (
                      <a key={item._id} href={`/promotion/${item._id}`}>
                        <img
                          src={item.banner}
                          alt="Nạp L-Coin nhân đôi ưu đãi"
                        />
                      </a>
                    ))}
                </div>
              </div>
            </div>
            <div className="item-wrap-large">
              <div className="event-item ">
                {rawNewPromotion
                  ?.filter((item) => item._id === "6a895744e2eabfe092cb4c81")
                  .map((item) => (
                    <a key={item._id} href={`/promotion/${item._id}`}>
                      <img src={item.banner} alt="Thuê rạp"  
                      style={{
                        objectFit: "fill",
                        objectPosition: "left",
                      }}/>
                    </a>
                  ))}
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

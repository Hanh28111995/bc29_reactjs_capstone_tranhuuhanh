import React, { useContext } from "react";
import { Spin } from "antd";
import { LoadingContext } from "contexts/loading.context";
import SEO from "components/SEO";
import "./index.scss";

export default function heroPage() {
  const [loadingState] = useContext(LoadingContext);

  return (
    <Spin spinning={loadingState.isLoading} size="large">
      <SEO
        title="Trang chủ"
        description="Chào mừng bạn đến với Movie Cybersoft - Hệ thống đặt vé xem phim trực tuyến."
        keywords="đặt vé xem phim, lịch chiếu phim, rạp chiếu phim, phim mới nhất"
      />
      <section className="homePage">
        <div class="cinema-hero-section">
          <div class="hero-banner">
            <div class="banner-slide">
              <a href="#">
                <img
                  src="https://media.lottecinemavn.com/Media/WebAdmin/2c51c67cfda94d5b8a8cb4149942ea40.jpg"
                  alt="Amazing Day"
                />
              </a>
            </div>
          </div>

          <div class="box-office">
            <h3>BOX OFFICE</h3>
            <ol class="ranking-list">
              <li>
                <span class="rank-num">1</span>
                <span class="movie-name">NGƯỜI NHỆN: KHỞI ĐẦU MỚI</span>
              </li>
              <li>
                <span class="rank-num">2</span>
                <span class="movie-name">THƯ TÌNH GỬI NGOẠI</span>
              </li>
              <li>
                <span class="rank-num">3</span>
                <span class="movie-name">THÁM TỬ LỪNG DANH CONAN</span>
              </li>
            </ol>
            <a href="#" class="btn-ticket">
              Mua vé ngay
            </a>
          </div>

          <div class="movie-trailer">
            <div class="trailer-card">
              <img
                src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12181_105_100006.jpg"
                alt="Trailer"
              />
              <button class="btn-play">▶ Play</button>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div class="movie-slider-section">
          <div class="movie-track">
            <div class="movie-item">
              <img
                src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12301_105_100001.png"
                alt="Movie 1"
              />
            </div>
            <div class="movie-item">
              <img
                src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12301_105_100001.png"
                alt="Movie 2"
              />
            </div>
            <div class="movie-item">
              <img
                src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12181_105_100006.jpg"
                alt="Spider-Man"
              />
            </div>
            <div class="movie-item">
              <img
                src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202608/12295_105_100003.jpg"
                alt="Movie 4"
              />
            </div>
            <div class="movie-item">
              <img
                src="https://media.lottecinemavn.com/Media/MovieFile//MovieImg/202607/12203_105_100003.jpg"
                alt="Movie 5"
              />
            </div>
          </div>
          <button class="slider-arrow next-arrow">›</button>
        </div>
      </section>

      <section>
        <div class="event-section">
          <h2 class="event-title">EVENT</h2>
          <div class="event-grid">
            <div class="event-item item-large">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/469f3c4df24e43ad8d60f10242f342ed.jpg"
                alt="Quyền lợi thành viên"
              />
            </div>

            <div class="event-item">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/2c51c67cfda94d5b8a8cb4149942ea40.jpg"
                alt="Thứ 2 ưu đãi"
              />
            </div>

            <div class="event-item">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/bbfa3888ce0c4f82a47cb95091231f44.jpg"
                alt="Spider-man merchandise"
              />
            </div>

            <div class="event-item">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/b5fe97ebdaab46299ce539027fff755c.jpg"
                alt="Family Day"
              />
            </div>

            <div class="event-item">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/caf7f074dcfe4e66bccb76e73fad261f.jpg"
                alt="HDBank Promo"
              />
            </div>

            <div class="event-item item-tall">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/7cbdf43f16504986bc9835d2ccafac70.jpg"
                alt="Nạp L-Corn"
              />
            </div>

            <div class="event-item item-wide">
              <img
                src="https://media.lottecinemavn.com/Media/WebAdmin/cc69977093904b2cadab729947f3b794.jpg"
                alt="Thuê rạp mua vé nhóm"
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div class="announcement-section">
          <div class="social-bar">
            <a href="#" class="social-item youtube">
              <span class="icon">▶</span>
              <div class="text">
                <small>youtube.com</small>
                <strong>/LotteCinemaVietnam</strong>
              </div>
            </a>
            <a href="#" class="social-item facebook">
              <span class="icon">f</span>
              <div class="text">
                <small>fb.com</small>
                <strong>/lottecinema</strong>
              </div>
            </a>
            <a href="#" class="social-item tiktok">
              <span class="icon">🎵</span>
              <div class="text">
                <small>tiktok.com</small>
                <strong>/@lottecinema.official</strong>
              </div>
            </a>
            <div class="social-item verified">
              <span>✔ ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG</span>
            </div>
          </div>

          <div class="notice-bar">
            <div class="notice-content">
              <span class="notice-label">Thông báo</span>
              <div class="notice-ticker">
                <a href="#">Ly topper Spider-man (Merchandise) 🕸️🕷️</a>
              </div>
            </div>
            <div class="notice-actions">
              <a href="#" class="btn-more">
                MORE
              </a>
              <div class="arrow-group">
                <button class="arrow-btn up">▲</button>
                <button class="arrow-btn down">▼</button>
              </div>
            </div>
          </div>

          <div class="promo-banner">
            <img
              src="https://media.lottecinemavn.com/Media/WebAdmin/bbfa3888ce0c4f82a47cb95091231f44.jpg"
              alt="Spider-Man Merchandise"
            />
          </div>
        </div>
      </section>

      <button class="nav-arrow prev">‹</button>
      <button class="nav-arrow next">›</button>
    </Spin>
  );
}

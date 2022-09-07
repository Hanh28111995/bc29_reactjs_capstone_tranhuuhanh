import React from 'react';
import "./index.scss";

export default function Footer() {
  return (
    <div className="footer bg-light py-5 text-center">
      <div className="footer-content">
        <footer className="footer-bg">
          <div className="container"><div className="row">
            <div style={{ zIndex: 2 }} className="col-lg-3 col-md-3 col-sm-6 col-xs-6">
              <ul className="list-unstyled clear-margins">
                <li className="widget-container widget_nav_menu">
                  <h1 className="title-widget">Giới thiệu</h1>
                  <ul>
                    <li><a href="/ve-chung-toi"><i className="fa fa-angle-double-right" /> Về chúng tôi</a></li>
                    <li><a href="/thoa-thuan-su-dung"><i className="fa fa-angle-double-right" /> Thoả thuận sử dụng</a></li>
                    <li><a href="/quy-che-hoat-dong"><i className="fa fa-angle-double-right" /> Quy chế hoạt động</a> </li>
                    <li><a href="/chinh-sach-bao-mat"><i className="fa fa-angle-double-right" /> Chính sách bảo mật</a></li>
                  </ul>
                </li>
              </ul>
            </div>
            <div style={{ zIndex: 2 }} className="col-lg-3 col-md-3 col-sm-6 col-xs-6">
              <ul className="list-unstyled clear-margins">
                <li className="widget-container widget_nav_menu">
                  <h1 className="title-widget">Góc điện ảnh</h1>
                  <ul>
                    <li><a href="/dien-anh"><i className="fa fa-angle-double-right" /> Thể loại phim</a></li>
                    <li><a href="/binh-luan-phim"><i className="fa fa-angle-double-right" /> Bình luận phim</a></li>
                    <li><a href="/movie-blog"><i className="fa fa-angle-double-right" /> Blog điện ảnh</a></li>
                    <li><a href="/phim-hay"><i className="fa fa-angle-double-right" /> Phim hay tháng</a></li>
                  </ul>
                </li>
              </ul>
            </div>
            <div style={{ zIndex: 2 }} className="col-lg-3 col-md-3 col-sm-6 col-xs-6">
              <ul className="list-unstyled clear-margins">
                <li className="widget-container widget_nav_menu"><h1 className="title-widget">Hỗ trợ</h1>
                  <ul>
                    <li><a href="/gop-y"><i className="fa fa-angle-double-right" /> Góp ý</a></li>
                    <li><a href="/sale-and-service"><i className="fa fa-angle-double-right" /> Sale &amp; Services</a></li>
                    <li><a href="/rap-gia-ve"><i className="fa fa-angle-double-right" /> Rạp / giá vé</a></li>
                    <li><a href="/tuyen-dung"><i className="fa fa-angle-double-right" /> Tuyển dụng</a></li>
                  </ul>
                </li>
              </ul>
            </div>
            <div style={{ zIndex: 2 }} className="col-lg-3 col-md-3 col-sm-6 col-xs-6">
              <ul className="list-unstyled clear-margins">
                <li className="widget-container widget_recent_news"><h1 className="title-widget">Kết nối Galaxy cinema</h1>
                  <div className="social-icons">
                    <ul className="nomargin"><a href="https://facebook.com/galaxycine.vn" target="_blank"><i id="social" className="icon-facebook-app-logo social-fb" /></a>
                      <a href="https://www.youtube.com/user/galaxymovies" target="_blank"><i id="social" className="icon-youtube-logo social-youtube" /></a>{/*a(href='#{config.instagramUrl}' target="_blank")*/}{/*  i#social.icon-instagram-logo.social-inst*/}
                      <a href="https://www.instagram.com/galaxycinema/" target="_blank"><i id="social" className="icon-instagram-logo social-inst" /></a>
                    </ul>
                  </div>
                </li>
              </ul>
              <div className="store">
                <ul className="list-unstyled clear-margins">
                  <li className="widget-container widget_recent_news"><h1 className="title-widget">Download app</h1><div className="social-icons">
                    <ul className="nomargin">{/*a(href='#{config.iosAppUrl}' target="_blank")*/}
                      <a href="https://itunes.apple.com/vn/app/galaxy-cinema/id593312549?l=vi&mt=8" target="_blank"><i id="social" className="icon-apple-store social-store" /></a>{/*a(href='#{config.androidAppUrl}' target="_blank")*/}
                      <a href="https://play.google.com/store/apps/details?id=com.galaxy.cinema&hl=vi" target="_blank"><i id="social" className="icon-google-play social-store" /></a>
                    </ul>
                  </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          </div>
          
        </footer>
        <div className="footer-bottom footer-line">
          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <a href="/">
                  <img src='/BHD_Cinema.png' alt="BHD Cinema" className="loading" data-was-processed="true" />
                </a>
                <a href="/">
                  <img src="https://www.cgv.vn/skin/frontend/cgv/default/images/cgvlogo.png" alt="CGV Cinema" className="loading" data-was-processed="true" />
                </a>
                <a href="/">
                  <img src="https://cinestar.com.vn/pictures/cache/moi/9Logo/trang-100x100.png" alt="Cinestar Cinema" className="loading" data-was-processed="true" />
                </a>
                <a href="/">
                  <img src="https://www.galaxycine.vn/website/images/galaxy-logo.png" alt="Galaxy Cinema" className="loading" data-was-processed="true" />
                </a>
                <a href="/">
                  <img src="https://www.lottecinemavn.com/LCHS/Image/logo_footer.gif?v=17111301" alt="Lotte Cinema" className="loading" data-was-processed="true" />
                </a>
                <a href="/">
                  <img src="https://www.megagscinemas.vn/images/home/logo.png" alt="MegaGS Cinema" className="loading" data-was-processed="true" />
                </a>
                
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

import React from 'react';
import "./index.scss";

export default function Footer() {
 
  return (
    <footer className="footer pb-3 text-center">
      <div className="footer-content">
        {/* <footer className="footer-bg">
          <div className="container"><div className="row">
            <div style={{ zIndex: 2 }} className="col-lg-3 col-md-3 col-sm-6 col-xs-6">
              <ul className="m-0">
                <li className="widget-container widget_nav_menu">
                  <h3 className="title-widget">Giới thiệu</h3>
                  <ul>
                    <li><a href="/ve-chung-toi"> Về chúng tôi</a></li>
                    <li><a href="/thoa-thuan-su-dung"> Thoả thuận sử dụng</a></li>
                    <li><a href="/quy-che-hoat-dong"> Quy chế hoạt động</a> </li>
                    <li><a href="/chinh-sach-bao-mat"> Chính sách bảo mật</a></li>
                  </ul>
                </li>
              </ul>
            </div>
            <div style={{ zIndex: 2 }} className="col-lg-3 col-md-3 col-sm-6 col-xs-6">
              <ul className="list-unstyled clear-margins">
                <li className="widget-container widget_nav_menu">
                  <h3 className="title-widget">Góc điện ảnh</h3>
                  <ul>
                    <li><a href="/dien-anh"> Thể loại phim</a></li>
                    <li><a href="/binh-luan-phim"> Bình luận phim</a></li>
                    <li><a href="/movie-blog"> Blog điện ảnh</a></li>
                    <li><a href="/phim-hay"> Phim hay tháng</a></li>
                  </ul>
                </li>
              </ul>
            </div>
            <div style={{ zIndex: 2 }} className="col-lg-3 col-md-3 col-sm-6 col-xs-6">
              <ul className="list-unstyled clear-margins">
                <li className="widget-container widget_nav_menu">
                  <h3 className="title-widget">Hỗ trợ</h3>
                  <ul>
                    <li><a href="/gop-y"> Góp ý</a></li>
                    <li><a href="/sale-and-service"> Sale &amp; Services</a></li>
                    <li><a href="/rap-gia-ve"> Rạp / giá vé</a></li>
                    <li><a href="/tuyen-dung"> Tuyển dụng</a></li>
                  </ul>
                </li>
              </ul>
            </div>
            <div style={{ zIndex: 2 }} className="col-lg-3 col-md-3 col-sm-6 col-xs-6">
              <ul className="list-unstyled clear-margins">
                <li className="widget-container widget_recent_news"><h3 className="title-widget">Kết nối Galaxy cinema</h3>
                  <div className="social-icons">
                    <ul className="nomargin">
                      <a href="#" target="_blank"><i class="fa-brands fa-square-facebook"></i></a>
                      <a href="#" target="_blank"><i class="fa-brands fa-youtube"></i></a>
                      <a href="#" target="_blank"><i class="fa-brands fa-square-instagram"></i></a>
                    </ul>
                  </div>
                </li>
              </ul>
              <div className="store">
                <ul className="list-unstyled clear-margins">
                  <li className="widget-container widget_recent_news"><h4 className="title-widget">Download app</h4><div className="social-icons">
                    <ul className="nomargin">
                      <a href="#" target="_blank"><i class="fa-brands fa-apple"></i></a>
                      <a href="#" target="_blank"><i class="fa-brands fa-google-play"></i></a>
                    </ul>
                  </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          </div>

        </footer> */}
        <div className="footer-bottom">
          <div className="container-fluid">
            <div className="row col-12">

              <div className='col-12 col-lg-6'>
                <a href="/" className=''>
                  <img src='/BHD_Cinema.png' alt="BHD Cinema" className="img-fluid" style={{ width: '80px' }} />
                </a>
                <a href="/" className=''>
                  <img src="https://www.cgv.vn/skin/frontend/cgv/default/images/cgvlogo.png" alt="CGV Cinema" className="img-fluid" style={{ width: '50px' }} />
                </a>
                <a href="/" className=''>
                  <img src="https://cinestar.com.vn/pictures/cache/moi/9Logo/trang-100x100.png" alt="Cinestar Cinema" className="img-fluid" style={{ width: '90px' }} />
                </a>
              </div>
              <div className='col-12 col-lg-6'>
                <a href="/" className=''>
                  <img src="https://www.galaxycine.vn/website/images/galaxy-logo.png" alt="Galaxy Cinema" className="img-fluid" style={{ width: '150px' }} />
                </a>
                <a href="/" className=''>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Lotte_Logo_%282017%29.svg/1920px-Lotte_Logo_%282017%29.svg.png?20220405153618" alt="Lotte Cinema" className="img-fluid" style={{ width: '90px' }} />
                </a>
                <a href="/" className=''>
                  <img src="/MegaGS.png" alt="MegaGS Cinema" className="img-fluid" style={{ width: '50px' }} />
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}

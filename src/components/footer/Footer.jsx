import React from 'react';
import "./index.scss";
import { FacebookFilled, YoutubeFilled, TwitterOutlined, InstagramOutlined } from '@ant-design/icons';

export default function Footer() {

  return (
    <footer className="moveek-footer">
      <div className="footer-wrapper">
        <div className="footer-top">
          <div className="footer-col brand">
            <h2 className="logo">CYBERSOFT<span>MOVIE</span></h2>
            <p>Mạng xã hội điện ảnh, đặt vé và đánh giá phim hàng đầu Việt Nam.</p>
            <div className="social-icons">
              <FacebookFilled />
              <YoutubeFilled />
              <TwitterOutlined />
              <InstagramOutlined />
            </div>
          </div>          

          <div className="footer-col">
            <h4>Hệ Thống Rạp</h4>
            <ul>
              <li><a href="#">BHD Star Cineplex</a></li>
              <li><a href="#">CGV Cinemas</a></li>
              <li><a href="#">Lotte Cinema</a></li>
              <li><a href="#">Galaxy Cinema</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Chăm Sóc Khách Hàng</h4>
            <ul>
              <li><a href="#">Hotline: 1900 xxxx</a></li>
              <li><a href="#">Email: support@movie.vn</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
              <li><a href="#">Điều khoản sử dụng</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 CYBERSOFT MOVIE - Kết nối cộng đồng yêu điện ảnh.</p>
        </div>
      </div>
    </footer>
  );
};



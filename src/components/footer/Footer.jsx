import React from "react";
import "./index.scss";
import logoImage from "../../assets/images/logo_footer.gif";

export default function Footer() {
  return (
    <footer className="moveek-footer">
      <div className="footer_inner">
        {/* Logo */}
        <img src={logoImage} />
        {/* Các liên kết */}
        <ul className="footer_link">
          <li>
            <a href="/membership" title="Membership">
              Membership
            </a>
          </li>

          <li>
            <a href="/privacy-policy" title="Personal data processing policy">
              Personal data processing policy
            </a>
          </li>

          <li>
            <a href="/terms-of-use" title="Terms of Use">
              Terms of Use
            </a>
          </li>
        </ul>
        {/* Thông tin công ty */}
        <div class="company_info" bis_skin_checked="1">
          <p>CÔNG TY TNHH LOTTE CINEMA VIỆT NAM</p>
          <p>
            Giấy CNĐKDN: 0302575928, đăng ký lần đầu ngày 02/05/2008, đăng ký
            thay đổi lần thứ 10 ngày 30/03/2018, cấp bởi Sở KHĐT Thành phố Hồ
            Chí Minh
          </p>
          <p>
            Địa chỉ: Tầng 3, TTTM Lotte, số 469 đường Nguyễn Hữu Thọ, Phường Tân
            Hưng, TPHCM, Việt Nam
          </p>
          <p>Hotline: (028) 3775 2524</p>
        </div>
        {/* Copyright */}
        <p class="copy">COPYRIGHT © LOTTECINEMAVN.COM - ALL RIGHTS RESERVED.</p>        
      </div>
    </footer>
  );
}

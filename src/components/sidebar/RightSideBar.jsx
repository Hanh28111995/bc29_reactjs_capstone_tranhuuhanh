import React, { useState, useEffect } from "react";
import { Badge } from "antd";
import {
  TicketOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  CustomerServiceOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import "./index.scss";

export default function RightSidebar({ cartCount = 0 }) {
  const [isScrolling, setIsScrolling] = useState(false);

  // Lắng nghe sự kiện scroll và dùng debounce để xác định khi nào kết thúc scroll
  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      setIsScrolling(true);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false); // Kết thúc scroll -> di chuyển về 30% viewport
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Hàm cuộn lên đầu trang
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`right-floating-sidebar ${isScrolling ? "is-scrolling" : "at-rest"}`}
      id="quick"
    >
      <ul>
        {/* Đặt vé nhanh */}
        <li>
          <a href="#" onClick={(e) => e.preventDefault()} title="Đặt vé nhanh">
            <TicketOutlined className="sidebar-icon" />
            <span>Đặt vé nhanh</span>
          </a>
        </li>

        {/* Canteen */}
        <li className="canteen-cart-wrap" id="topCanteenCartLi">
          <a href="#" onClick={(e) => e.preventDefault()} title="Canteen">
            <Badge count={cartCount} offset={[6, 0]}>
              <ShopOutlined className="sidebar-icon" />
            </Badge>
            <span className="quick-cart-label">Canteen</span>
          </a>
        </li>

        {/* Nơi đặt vé */}
        <li>
          <a href="#" onClick={(e) => e.preventDefault()} title="Nơi đặt vé">
            <EnvironmentOutlined className="sidebar-icon" />
            <span>Nơi đặt vé</span>
          </a>
        </li>

        {/* Membership */}
        <li>
          <a href="#" onClick={(e) => e.preventDefault()} title="Membership">
            <TrophyOutlined className="sidebar-icon" />
            <span>Membership</span>
          </a>
        </li>

        {/* Trung tâm khách hàng */}
        <li>
          <a href="#" onClick={(e) => e.preventDefault()} title="Trung tâm khách hàng">
            <CustomerServiceOutlined className="sidebar-icon" />
            <span>Trung tâm KH</span>
          </a>
        </li>
      </ul>

      {/* Nút TOP */}
      <a href="#" className="btn_top" title="TOP" onClick={scrollToTop}>
        <span className="top-text">TOP</span>
        <ArrowUpOutlined className="top-icon" />
      </a>
    </div>
  );
}
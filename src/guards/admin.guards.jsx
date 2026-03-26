import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { notification } from 'antd';
import { MaLoaiNguoiDung } from "../enums/common";

export default function AdminGuards() {
  const userRole = useSelector((state) => state.userReducer.userInfor?.user_inf?.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== MaLoaiNguoiDung.QuanTri) {
      notification.warning({
        message: "Cảnh báo",
        description: "Bạn không có quyền truy cập vào trang Admin",
      });
      navigate("/login");
    }
  }, [userRole, navigate]);

  if (userRole !== MaLoaiNguoiDung.QuanTri) {
    return null;
  }

  return <Outlet />;
}
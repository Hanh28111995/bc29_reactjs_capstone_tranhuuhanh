import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import {notification} from 'antd';

export default function AdminGuards() {
  const userState = useSelector((state) => state.userReducer);
  const navigate = useNavigate();
  useEffect(() => {
    if (!userState.userInfor) {
      return navigate("/login");
    }
    if (
      userState.userInfor &&
      userState.userInfor.maLoaiNguoiDung !== "QuanTri"
    ) {
      notification.warning({
        message: "Khach hang ko the truy cap vao trang Admin",
      });
      return navigate("/");
    }
  }, []);
  return <Outlet />;
}

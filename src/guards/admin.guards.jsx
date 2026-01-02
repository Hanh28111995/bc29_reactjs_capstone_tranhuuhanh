import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import {notification} from 'antd';
import { MaLoaiNguoiDung } from "../enums/common";

export default function AdminGuards() {
  const userState = useSelector((state) => state.userReducer);
  const navigate = useNavigate();
  useEffect(() => {
    console.log('userState', userState);
    if (!userState.userInfor) {
      return navigate("/login");
    }
    if (
      userState.userInfor?.user_inf &&
      userState.userInfor?.user_inf.role !== MaLoaiNguoiDung.QuanTri
    ) 
    {
      notification.warning({
        message: "Khach hang ko the truy cap vao trang Admin",
      });
      return navigate("/");
    }
    
  }, []);
  return <Outlet />;
}

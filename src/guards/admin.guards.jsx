import React, { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { notification } from 'antd';
import { MaLoaiNguoiDung } from "../enums/common";
import { LoadingContext } from "contexts/loading.context";

export default function AdminGuards() {
  const [loadingState, setLoadingState] = useContext(LoadingContext);
  const userRole = useSelector((state) => state.userReducer.userInfor?.user_inf?.role);
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu không phải Admin
    if (userRole !== MaLoaiNguoiDung.QuanTri) {
      // 1. Tắt spinner ngay lập tức
      setLoadingState({ isLoading: false });

      // 2. Thông báo và điều hướng
      notification.warning({
        message: "Cảnh báo",
        description: "Bạn không có quyền truy cập vào trang Admin",
      });
      navigate("/login");
    }
  }, [userRole, navigate, setLoadingState]);

  if (userRole !== MaLoaiNguoiDung.QuanTri) {
    return null;
  }

  return <Outlet />;
}
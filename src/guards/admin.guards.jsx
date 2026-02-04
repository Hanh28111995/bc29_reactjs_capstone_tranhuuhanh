import React, { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { notification } from 'antd';
import { MaLoaiNguoiDung } from "../enums/common";
import { LoadingContext } from "contexts/loading.context";

export default function AdminGuards() {
  const [loadingState, setLoadingState] = useContext(LoadingContext);
  const { userInfor } = useSelector((state) => state.userReducer);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = userInfor?.user_inf?.role;

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
  }, [userInfor, navigate, setLoadingState]); // Thêm dependencies để tránh lỗi logic khi data thay đổi

  // Nếu chưa có thông tin hoặc không phải admin, không trả về Outlet để tránh lộ UI Admin
  if (userInfor?.user_inf?.role !== MaLoaiNguoiDung.QuanTri) {
    return null;
  }

  return <Outlet />;
}
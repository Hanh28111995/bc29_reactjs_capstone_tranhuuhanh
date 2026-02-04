import React, { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { notification } from 'antd';
import { MaLoaiNguoiDung } from "../enums/common";

export default function AdminGuards() {
  const [loadingState, setLoadingState] = useContext(LoadingContext);
  const { userInfor } = useSelector((state) => state.userReducer);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = userInfor.user_inf?.role;
    if (userRole !== MaLoaiNguoiDung.QuanTri) {
      notification.warning({
        message: "Cảnh báo",
        description: "Khách hàng không thể truy cập vào trang Admin",
      });
      setLoadingState({ isLoading: false });
      navigate("/login");
      return
    }
  }, []);


  return <Outlet />;
}
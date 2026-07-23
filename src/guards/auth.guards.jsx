import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { notification } from "antd";
import { useAuth } from "contexts/auth.context";

export default function AuthGuards() {
  const userRole = useSelector(
    (state) => state.userReducer.userInfor?.user_inf?.role
  );
  const { openLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userRole) {
      notification.warning({
        message: "Cảnh báo",
        description: "Bạn cần đăng nhập để tiếp tục đặt vé",
      });
      openLogin();
      navigate(-1);
    }
  }, [userRole]); // Chỉ chạy lại khi userRole thay đổi, không để hàm openLogin hay navigate làm trigger lặp

  if (!userRole) {
    return <></>;
  }

  return <Outlet />;
}
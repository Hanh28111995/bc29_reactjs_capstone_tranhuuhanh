import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from 'contexts/auth.context';
import { MaLoaiNguoiDung } from 'enums/common';

export default function CustomerAuthGuards() {
  const userState = useSelector((state) => state.userReducer);
  const { openLogin } = useAuth();
  const navigate = useNavigate();
  const role = userState.userInfor?.user_inf?.role;

  useEffect(() => {
    if (!userState.userInfor) {
      openLogin();
      return;
    }
    if (role !== MaLoaiNguoiDung.KhachHang) {
      navigate('/');
    }
  }, [userState.userInfor]);

  if (!userState.userInfor || role !== MaLoaiNguoiDung.KhachHang) return null;

  return <Outlet />;
}

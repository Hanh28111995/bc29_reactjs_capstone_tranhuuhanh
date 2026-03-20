import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from 'contexts/auth.context';
import { MaLoaiNguoiDung } from 'enums/common';

const ALLOWED_ROLES = [MaLoaiNguoiDung.NhanVien, MaLoaiNguoiDung.QuanTri];

export default function StaffAuthGuards() {
  const userState = useSelector((state) => state.userReducer);
  const { openLogin } = useAuth();
  const navigate = useNavigate();
  const role = userState.userInfor?.user_inf?.role;
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!userState.userInfor) {
      openLogin();
      setChecked(true);
      return;
    }
    if (!ALLOWED_ROLES.includes(role)) {
      navigate('/');
    }
    setChecked(true);
  }, [userState.userInfor]);

  if (!checked) return null;
  if (!userState.userInfor || !ALLOWED_ROLES.includes(role)) return null;

  return <Outlet />;
}

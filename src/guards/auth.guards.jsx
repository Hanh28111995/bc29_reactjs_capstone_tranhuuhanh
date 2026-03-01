import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from 'contexts/auth.context';

export default function AuthGuards() {
  const userState = useSelector((state) => state.userReducer);
  const { openLogin } = useAuth();

  useEffect(() => {
    if (!userState.userInfor) {
      openLogin()
    }
  }, []);
  return (
    <Outlet />
  )
}

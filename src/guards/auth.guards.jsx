import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from 'contexts/auth.context';

export default function AuthGuards() {
  const userState = useSelector((state) => state.userReducer);
  const { openLogin } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!userState.userInfor) {
      openLogin();
    }
    setChecked(true);
  }, [userState.userInfor]);

  if (!checked) return null;
  if (!userState.userInfor) return null;

  return <Outlet />;
}

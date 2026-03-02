import { useAuth } from "contexts/auth.context";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

export default function AuthGuards() {
  const userState = useSelector((state) => state.userReducer);
  const { openLogin } = useAuth();

  useEffect(() => {
    if (!userState.userInfor) {
      openLogin();
    }
  }, [userState.userInfor, openLogin]);

  if (!userState.userInfor) {
    return null;
  }

  return <Outlet />;
}
import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { USER_INFO_KEY } from "../../constants/common";
import { setNotificationsAction, setUserInfoAction } from "../../store/actions/user.action";
import { logoutAPI } from "services/user";
import Header from "./Header";

export default function HeaderContainer() {
  const userInfor = useSelector((state) => state.userReducer.userInfor);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleToggleLanguage = useCallback(() => {
    const nextLng = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(nextLng);
    localStorage.setItem("lang", nextLng);
  }, [i18n]);

  const handleLogout = useCallback(async () => {
    localStorage.removeItem(USER_INFO_KEY);
    dispatch(setNotificationsAction([]));
    dispatch(setUserInfoAction(null));
    navigate("/");

    logoutAPI().catch((error) => {
      console.error("Lỗi logout server:", error);
    });
  }, [dispatch, navigate]);

  return (
    <Header
      userInfor={userInfor}
      currentLang={i18n.language}
      onToggleLang={handleToggleLanguage}
      onLogout={handleLogout}
      t={t}
    />
  );
}
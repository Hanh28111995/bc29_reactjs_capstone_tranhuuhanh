import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { USER_INFO_KEY } from "../../constants/common";
import { loginAPI, loginGoogleAPI } from "services/user";
import { setNotificationsAction, setUserInfoAction } from "../../store/actions/user.action";
import { notification } from "antd";
import { useAuth } from "contexts/auth.context";
import { useAsyncMutation } from "hooks/useAsync";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "configs/firebase.config";
import SEO from "components/SEO";
import { fetchNotificationAPI, formatNotificationsForStore } from "services/notificationAndHistory";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const { closeLogin } = useAuth(); 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [state, setState] = useState({
    username: "hanhtran",
    password: "123456",
  });

  const loginMutation = useAsyncMutation({
    service: async (payload) => loginAPI(payload),
    raw: true,
    onError: (err) => {
      const errorMsg = err.response?.data?.message || t("auth.loginFailed");
      notification.error({ description: errorMsg });
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setState({
      ...state,
      [name]: value,
    })
  }

  const handleLoginSuccess = async (userData) => {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
    dispatch(setUserInfoAction(userData));
    try {
      const role = userData?.user_inf?.role;
      if (role) {
        const res = await fetchNotificationAPI(role);
        const formatted = formatNotificationsForStore(res.data?.content);
        dispatch(setNotificationsAction(formatted));
      } else {
        dispatch(setNotificationsAction([]));
      }
    } catch {
      dispatch(setNotificationsAction([]));
    } finally {
      closeLogin();
      if (pathname === "/login") {
        navigate("/");
      }
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await loginMutation.mutateAsync(state);
      const userData = result.data.content;
      notification.success({ description: t("auth.loginSuccess") });
      await handleLoginSuccess(userData);
    } catch (err) {
      // lỗi hiển thị đã xử lý trong loginMutation.onError
      if (!err?.response) {
        const errorMsg = err?.message || t("auth.loginFailed");
        notification.error({ description: errorMsg });
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log("Bắt đầu đăng nhập Google...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Firebase Login thành công, lấy token...");
      
      const idToken = await result.user.getIdToken();
      console.log("Token ID:", idToken);
      
      console.log("Gửi token về backend...");
      const response = await loginGoogleAPI(idToken);
      const userData = response.data.content;
      
      notification.success({ description: t("auth.googleLoginSuccess") });
      await handleLoginSuccess(userData);
    } catch (error) {
      console.error("Chi tiết lỗi Google Login:", error);
      
      let errorMsg = t("auth.googleLoginFailed");
      
      if (error.code === "auth/popup-closed-by-user") {
        errorMsg = t("auth.popupClosed");
      } else if (error.code === "auth/popup-blocked") {
        errorMsg = t("auth.popupBlocked");
      } else if (error.response) {
        // Lỗi từ phía Backend
        errorMsg = `Backend Error (${error.response.status}): ${error.response.data?.message || t("auth.tokenAuthFailed")}`;
      } else {
        errorMsg = error.message;
      }
      
      notification.error({ description: errorMsg });
    }
  };

  return (
    <div className="mx-auto my-5 d-flex flex-column col-10 col-md-4">
      <SEO 
        title={t("auth.login")}
        description={t("auth.loginToContinue")}
      />
      <form onSubmit={handleSubmit} style={{ caretColor: 'black' }} >
        <div className="form-group">
          <label>{t("auth.account")}</label>
          <input
            defaultValue={state.username}
            name="username"
            onChange={handleChange}
            type="text"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>{t("auth.password")}</label>
          <input
            defaultValue={state.password}
            name="password"
            onChange={handleChange}
            type="password"
            className="form-control"
          />
        </div>
        <button className="btn btn-success w-100" disabled={loginMutation.isLoading}>
          {loginMutation.isLoading ? t("auth.loggingIn") : t("auth.login").toUpperCase()}
        </button>
      </form>
      
      <div className="text-center my-3">--- {t("common.or")} ---</div>
      
      <button 
        type="button" 
        className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
        onClick={handleGoogleLogin}
      >
        <i className="fab fa-google mr-2"></i> {t("auth.googleLogin")}
      </button>
    </div>
  );
}

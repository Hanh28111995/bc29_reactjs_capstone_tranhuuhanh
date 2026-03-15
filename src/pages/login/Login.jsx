import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { USER_INFO_KEY } from "../../constants/common";
import { loginAPI, loginGoogleAPI } from "services/user";
import { setUserInfoAction } from "../../store/actions/user.action";
import { notification } from "antd";
import { useAuth } from "contexts/auth.context";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "configs/firebase.config";
import SEO from "components/SEO";

export default function Login() {
  const { closeLogin } = useAuth(); 
  const dispatch = useDispatch();
  const [state, setState] = useState({
    username: "hanhtran",
    password: "123456",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setState({
      ...state,
      [name]: value,
    })
  }

  const handleLoginSuccess = (userData) => {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
    dispatch(setUserInfoAction(userData));
    closeLogin(); 
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await loginAPI(state);
      const userData = result.data.content;
      notification.success({ description: "Đăng nhập thành công!" });
      handleLoginSuccess(userData);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Đăng nhập thất bại";
      notification.error({ description: errorMsg });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Lấy ID Token từ Firebase để gửi lên backend verify
      const idToken = await result.user.getIdToken();
      
      const response = await loginGoogleAPI(idToken);
      const userData = response.data.content;
      
      notification.success({ description: "Đăng nhập bằng Google thành công!" });
      handleLoginSuccess(userData);
    } catch (error) {
      console.error("Google Login Error:", error);
      notification.error({ description: "Đăng nhập bằng Google thất bại!" });
    }
  };

  return (
    <div className="mx-auto my-5">
      <SEO 
        title="Đăng nhập" 
        description="Đăng nhập để trải nghiệm đặt vé xem phim nhanh chóng và nhận nhiều ưu đãi."
      />
      <form onSubmit={handleSubmit} style={{ caretColor: 'black' }}>
        <div className="form-group">
          <label>Tài khoản</label>
          <input
            defaultValue={state.taiKhoan}
            name="username"
            onChange={handleChange}
            type="text"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            defaultValue={state.matKhau}
            name="password"
            onChange={handleChange}
            type="password"
            className="form-control"
          />
        </div>
        <button className="btn btn-success w-100">LOGIN</button>
      </form>
      
      <div className="text-center my-3">--- HOẶC ---</div>
      
      <button 
        type="button" 
        className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
        onClick={handleGoogleLogin}
      >
        <i className="fab fa-google mr-2"></i> Đăng nhập bằng Google
      </button>
    </div>
  );
}

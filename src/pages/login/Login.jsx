import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { USER_INFO_KEY } from "../../constants/common";
import { loginAPI } from "services/user";
import { setUserInfoAction } from "../../store/actions/user.action";
import { notification } from "antd";

export default function Login() {
  const navigate = useNavigate();
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
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await loginAPI(state);
      const userData = result.data.content;
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
      dispatch(setUserInfoAction(userData));
      notification.success({ description: "Đăng nhập thành công!" });
      navigate("/");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Đăng nhập thất bại";
      notification.error({ description: errorMsg });
    }
  };
  return (
    <form className="mx-auto my-5" onSubmit={handleSubmit} style={{ caretColor: 'black' }}>
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
  );
}

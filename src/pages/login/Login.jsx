import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate} from "react-router-dom";
import { USER_INFO_KEY } from "../../constants/common";
import { loginAPI } from "services/user";
import { setUserInfoAction } from "../../store/actions/user.action";
import { notification } from "antd";

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [state, setState] = useState({
        taiKhoan:"",
        matKhau:"",
    });

  const handleChange = (event) => {
    const {name, value} = event.target;
    setState ({
        ...state,
        [name]: value,
    })
  } 
  const handleSubmit = async (event) => {
    event.preventDefault();
    try{
    const result = await loginAPI(state);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(result.data.content));
    dispatch(setUserInfoAction(result.data.content));
    notification.success({
      description: ` Log in success`,
    })
    navigate("/");
    // window.location.reload()
    }
    catch (err) {
      notification.warning({
        description: `${err.response.data.content}`,
      });
     }
  } 
  return (
    <form className="w-25 mx-auto my-5" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Tài khoản</label>
        <input
          name="taiKhoan"
          onChange={handleChange}
          type="text"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Mật khẩu</label>
        <input
          name="matKhau"
          onChange={handleChange}
          type="text"
          className="form-control"
        />
      </div>
      <button className="btn btn-success w-100">LOGIN</button>
    </form>
  );
}

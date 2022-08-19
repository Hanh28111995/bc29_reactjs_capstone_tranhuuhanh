import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { registerApi } from 'services/user';

export default function Register() {
    const navigate = useNavigate();

    const [state, setState] = useState({
        taiKhoan: "",
        matKhau: "",
        email: "",
        soDT: "",
        hoTen: "",
        maLoaiNguoiDung:"KhachHang",
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setState({
            ...state,
            [name]: value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const result= await registerApi(state);
        console.log(result.data)

        // localStorage.setItem(USER_INFO_KEY, JSON.stringify(result.data.content));
        // dispatch(setUserInfoAction(result.data.content));
        navigate("/");
    };

    return (
        <form className='w-25 mx-auto my-5'
            onSubmit={handleSubmit}
        >
            <div className='form-group'>
                <label>Tài khoản</label>
                <input
                    name='taiKhoan'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                />
            </div>
            <div className='form-group'>
                <label>Mật khẩu</label>
                <input
                    name='matKhau'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                />
            </div>
            <div className='form-group'>
                <label>Họ tên</label>
                <input
                    name='hoTen'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                />
            </div>
            <div className='form-group'>
                <label>Email</label>
                <input
                    name='email'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                />
            </div>
            <div className='form-group'>
                <label>Số điện thoại</label>
                <input
                    name='soDT'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                />
            </div>

            <button className='btn btn-success w-100'>REGISTER</button>

        </form>
    )
}
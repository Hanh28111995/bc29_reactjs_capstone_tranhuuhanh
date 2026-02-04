import { notification } from 'antd'
import React, { useState } from 'react'
import { createRef } from 'react'
import { useNavigate } from "react-router-dom"
import { registerApi } from 'services/user'

const DEFAULT_VALUES = {
    username: "",
    password: "",
    email: "",
    userphone: "",
    role: "customer",
}
const DEFAULT_ERRORS = {
    username: "",
    password: "",
    email: "",
    userphone: "",
}
export default function Register() {
    const navigate = useNavigate();
    const [valid, setValid] = useState({ isValid: true })
    const [state, setState] = useState({
        values: DEFAULT_VALUES,
        errors: DEFAULT_ERRORS,
    });

    const handleChange = (event) => {
        const { name, title, minLength, maxLength, pattern, value, validity } = event.target;
        let message = '';

        // 1. Kiểm tra trống
        if (validity.valueMissing) {
            message = `Vui lòng nhập ${title}`;
        }
        // 2. Kiểm tra độ dài
        else if (validity.tooShort || validity.tooLong) {
            message = `${title} phải từ ${minLength} đến ${maxLength} kí tự.`;
        }
        // 3. Kiểm tra định dạng (Pattern)
        else if (pattern && !new RegExp(pattern).test(value)) {
            if (name === 'username') message = `${title} không chứa kí tự đặc biệt.`;
            else if (name === 'email') message = `${title} không hợp lệ.`;
            else if (name === 'userphone') message = `${title} gồm các số từ 0-9.`;
            else if (name === 'password') message = `${title} Ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt.`;
        }

        setState({
            values: { ...state.values, [name]: value },
            errors: { ...state.errors, [name]: message }
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Kiểm tra trực tiếp từ formRef hoặc event.target để lấy giá trị mới nhất
        const isFormValid = event.target.checkValidity();

        if (!isFormValid) {
            // Nếu FORM KHÔNG HỢP LỆ
            setValid({ isValid: false });
            notification.error({
                description: `Vui lòng nhập đầy đủ và chính xác thông tin`,
            });
            return; // Dừng lại không gọi API
        }

        // Nếu FORM HỢP LỆ
        setValid({ isValid: true });
        try {
            const result = await registerApi(state.values);

            notification.success({ description: `Register success` });
            navigate("/login");
        } catch (err) {
            notification.warning({
                description: `${err.response?.data?.message || "Đăng ký thất bại"}`,
            });
        }
    };

    const formRef = createRef();
    const { username, password, email, userphone } = state.values;
    return (
        <form ref={formRef} noValidate className='w-25 mx-auto my-5'
            onSubmit={handleSubmit} style={{ caretColor: 'black' }}
        >
            <div className='form-group'>
                <label>Tài khoản</label>
                <input
                    title='Username'
                    value={username}
                    required
                    name='username'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                    pattern='^[0-9A-Za-z]+$'
                />
                {state.errors.username && (
                    <span className='text-danger'>{state.errors.username}</span>
                )}
            </div>
            <div className='form-group'>
                <label>Mật khẩu</label>
                <input
                    title='Mật khẩu' // Nên để tiếng Việt để thông báo khớp với ngôn ngữ hiển thị
                    value={password}
                    required
                    name='password'
                    onChange={handleChange}
                    type='password' // Đổi thành password để ẩn ký tự
                    className='form-control'
                    // Regex bên dưới: Ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,12}"
                    minLength={6}
                    maxLength={12}
                />
                {state.errors.password && (
                    <span className='text-danger'>{state.errors.password}</span>
                )}
            </div>

            <div className='form-group'>
                <label>Email</label>
                <input
                    title='Email'
                    value={email}
                    required
                    name='email'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                />
                {state.errors.email && (
                    <span className='text-danger'>{state.errors.email}</span>
                )}
            </div>
            <div className='form-group'>
                <label>Phone Number</label>
                <input
                    title='Userphone'
                    value={userphone}
                    required
                    name='userphone'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                    pattern="^[0-9]+$"
                    minLength={8}
                    maxLength={10}
                />
                {state.errors.userphone && (
                    <span className='text-danger'>{state.errors.userphone}</span>
                )}
            </div>

            <button className='btn btn-success w-100'>REGISTER</button>

        </form>
    )
}
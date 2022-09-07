import { notification } from 'antd';
import React, { useState } from 'react';
import { createRef } from 'react';
import { useNavigate } from "react-router-dom";
import { registerApi } from 'services/user';

const DEFAULT_VALUES = {
    taiKhoan: "",
    matKhau: "",
    email: "",
    soDT: "",
    hoTen: "",
    maLoaiNguoiDung: "KhachHang",
}
const DEFAULT_ERRORS = {
    taiKhoan: "",
    matKhau: "",
    email: "",
    soDT: "",
    hoTen: "",
}
export default function Register() {
    const navigate = useNavigate();
    const [valid, setValid] = useState({ isValid: true })
    const [state, setState] = useState({
        values: DEFAULT_VALUES,
        errors: DEFAULT_ERRORS,
    });

    const handleChange = (event) => {
        const { name, title, minLength, maxLength, pattern, value, validity: { valueMissing, patternMismatch, tooLong, tooShort }, } = event.target;
        let message = '';

        if (pattern) {
            const regex = new RegExp(pattern);
            if (!regex.test(value)) {
                console.log(name);
                if (name === 'taiKhoan') {
                    message = `${title} không chứa kí tự đặc biệt.`;
                }
                if (name === 'hoTen') {
                    message = `${title} không chứa number và kí tự đặc biệt.`;
                }
                if (name === 'email') {
                    message = `${title} không hợp lệ.`;
                } 
                if (name === 'soDT') {
                    message = `${title} gồm các số từ 0-9.`;
                } 
            }
        }

        // if (patternMismatch) {
        //     message = `Vui lòng nhập ${title} `;
        // }

        if (tooShort || tooLong) {
            message = `${title} từ ${minLength} - ${maxLength} kí tự .`;
        }

        if (valueMissing) {
            message = `Vui lòng nhập ${title} `;
        }
        setState({
            values: {
                ...state.values,
                [name]: value,
            },
            errors: {
                ...state.errors,
                [name]: message,
            }
        });
        if (formRef.current?.checkValidity()) {
            setValid({
                isValid: false
            })
        }
    };



    const handleSubmit = async (event) => {
        event.preventDefault();
        if (event.target.checkValidity()) {
            setValid({
                isValid: true
            })
        }
        else{
            setValid({
                isValid: false
            })
        }
        console.log(valid.isValid)
        if (valid.isValid) {
            notification.error({
                description: ` Vui lòng nhập đầy đủ thông tin`,
            })
        }
        else {
            try {
                const result = await registerApi(state.values);
                console.log(result.data)

                notification.success({
                    description: ` Register success`,
                })
                navigate("/");
            }
            catch (err) {
                notification.warning({
                    description: `${err.response.data.content}`,
                });
            }
        }
    }

    const formRef = createRef();
    const { taiKhoan, matKhau, hoTen, email, soDT } = state.values;
    return (
        <form ref={formRef} noValidate className='w-25 mx-auto my-5'
            onSubmit={handleSubmit}
        >
            <div className='form-group'>
                <label>Tài khoản</label>
                <input
                    title='Tài khoản'
                    value={taiKhoan}
                    required
                    name='taiKhoan'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                    pattern='^[0-9A-Za-z]+$'
                />
                {state.errors.taiKhoan && (
                    <span className='text-danger'>{state.errors.taiKhoan}</span>
                )}
            </div>
            <div className='form-group'>
                <label>Mật khẩu</label>
                <input
                    title='Mật khẩu'
                    value={matKhau}
                    required
                    name='matKhau'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                    pattern='/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{0,}$/'
                    minLength={6}
                    maxLength={12}
                />
                {state.errors.matKhau && (
                    <span className='text-danger'>{state.errors.matKhau}</span>
                )}
            </div>
            <div className='form-group'>
                <label>Họ tên</label>
                <input
                    title='Họ tên'
                    value={hoTen}
                    required
                    name='hoTen'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                    pattern= "^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\W|_]+$"
                />
                {state.errors.hoTen && (
                    <span className='text-danger'>{state.errors.hoTen}</span>
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
                <label>Số điện thoại</label>
                <input
                    title='Số ĐT'
                    value={soDT}
                    required
                    name='soDT'
                    onChange={handleChange}
                    type='text'
                    className='form-control'
                    pattern="^[0-9]+$"
                    minLength={8}
                    maxLength={10}
                />
                {state.errors.soDT && (
                    <span className='text-danger'>{state.errors.soDT}</span>
                )}
            </div>

            <button className='btn btn-success w-100'>REGISTER</button>

        </form>
    )
}
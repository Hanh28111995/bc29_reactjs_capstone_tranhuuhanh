import { notification } from 'antd'
import React, { useRef, useState } from 'react'
import { createRef } from 'react'
import { useNavigate } from "react-router-dom"
import { registerApi } from 'services/user'
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [valid, setValid] = useState({ isValid: true })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const submittingRef = useRef(false)
    const [state, setState] = useState({
        values: DEFAULT_VALUES,
        errors: DEFAULT_ERRORS,
    });

    const handleChange = (event) => {
        const { name, minLength, maxLength, pattern, value, validity } = event.target;
        const field = t(`auth.${name === "username" ? "account" : name === "userphone" ? "phone" : name}`);
        let message = '';

        if (validity.valueMissing) {
            message = t("auth.requiredField", { field });
        } else if (validity.tooShort || validity.tooLong) {
            message = t("auth.fieldLength", { field, min: minLength, max: maxLength });
        } else if (pattern && !new RegExp(pattern).test(value)) {
            const errorKey = {
                username: "usernameInvalid",
                email: "emailInvalid",
                userphone: "phoneInvalid",
                password: "passwordInvalid",
            }[name];
            if (errorKey) message = t(`auth.${errorKey}`, { field });
        }

        setState({
            values: { ...state.values, [name]: value },
            errors: { ...state.errors, [name]: message }
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submittingRef.current) return;

        // Kiểm tra trực tiếp từ formRef hoặc event.target để lấy giá trị mới nhất
        const isFormValid = event.target.checkValidity();

        if (!isFormValid) {
            // Nếu FORM KHÔNG HỢP LỆ
            setValid({ isValid: false });
            notification.error({
                description: t("auth.invalidForm"),
            });
            return; // Dừng lại không gọi API
        }

        // Nếu FORM HỢP LỆ
        setValid({ isValid: true });
        submittingRef.current = true;
        setIsSubmitting(true);
        try {
            await registerApi(state.values);
            notification.success({ description: t("auth.registerSuccess") });
            navigate("/login");
        } catch (err) {
            notification.warning({
                description: `${err.response?.data?.message || t("auth.registerFailed")}`,
            });
        } finally {
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const formRef = createRef();
    const { username, password, email, userphone } = state.values;
    return (
        <form ref={formRef} noValidate className='w-25 mx-auto my-5'
            onSubmit={handleSubmit} style={{ caretColor: 'black' }}
        >
            <div className='form-group'>
                <label>{t("auth.account")}</label>
                <input
                    title={t("auth.account")}
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
                <label>{t("auth.password")}</label>
                <input
                    title={t("auth.password")}
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
                <label>{t("auth.email")}</label>
                <input
                    title={t("auth.email")}
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
                <label>{t("auth.phone")}</label>
                <input
                    title={t("auth.phone")}
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

            <button className='btn btn-success w-100' disabled={isSubmitting}>
                {isSubmitting ? t("auth.registering") : t("auth.register").toUpperCase()}
            </button>

        </form>
    )
}
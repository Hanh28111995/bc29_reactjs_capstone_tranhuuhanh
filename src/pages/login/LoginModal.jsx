import { useAuth } from 'contexts/auth.context';
import React from 'react';
import { Modal } from 'antd';
import Login from './Login';

export default function LoginModal() {
    const { isLoginModalOpen, closeLogin } = useAuth();

    return (
        <Modal
            open={isLoginModalOpen}
            onCancel={closeLogin}
            footer={null}
            centered
            width={450} // Độ rộng vừa phải cho form Login
            bodyStyle={{ padding: 0 }} // Xóa padding mặc định của Antd để tự custom
            destroyOnClose
            closeIcon={<span className="text-gray-400 hover:text-red-500 transition-colors">✕</span>}
        >
            <div className="overflow-hidden rounded-lg">
                {/* Header trang trí nhẹ */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
                    <h2 className="text-2xl font-bold text-white">Chào mừng trở lại</h2>
                    <p className="text-blue-100 mt-1">Vui lòng đăng nhập để tiếp tục</p>
                </div>

                {/* Phần chứa Form Login */}
                <div className="p-8 bg-white">
                    <Login />
                </div>
            </div>
        </Modal>
    );
}
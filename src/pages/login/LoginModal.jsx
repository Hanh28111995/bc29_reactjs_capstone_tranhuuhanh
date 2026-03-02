import { useAuth } from 'contexts/auth.context';
import React from 'react'
import Login from './Login';
import { Modal } from 'antd';

export default function LoginModal() {
    const { isLoginModalOpen, closeLogin } = useAuth();

    if (!isLoginModalOpen) return null;
    return (
        <Modal
            open={isLoginModalOpen} // Sử dụng prop 'open' thay vì 'return null' bên ngoài
            onCancel={closeLogin}   // Gọi hàm đóng modal khi nhấn X hoặc nhấn ra ngoài
            footer={null}           // Ẩn các nút OK/Cancel mặc định của Antd
            centered                // Căn giữa màn hình            
        >
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white p-6 rounded-lg relative">
                    <button onClick={closeLogin} className="absolute right-2 top-2">X</button>
                    <Login />
                </div>
            </div>
        </Modal>
    )
}

import { useAuth } from 'contexts/auth.context';
import React from 'react'
import Login from './Login';

export default function LoginModal() {
    const { isLoginModalOpen, closeLogin } = useAuth();

    if (!isLoginModalOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg relative">
                <button onClick={closeLogin} className="absolute right-2 top-2">X</button>
                <Login />
            </div>
        </div>

    )
}

import axios from 'axios';
import { BASE_URL, TOKEN_CYBERSOFT, USER_INFO_KEY } from '../constants/common';

let userInfor = localStorage.getItem(USER_INFO_KEY);
if (userInfor) {
    userInfor = JSON.parse(userInfor);
}
console.log('debugger', userInfor);
export const request = axios.create({
    headers:
    {
        // TokenCybersoft: TOKEN_CYBERSOFT,
        Authorization: userInfor?.user_token,
    },
    baseURL: BASE_URL,
})

request.interceptors.request.use((config) => {
    let userInfor = localStorage.getItem(USER_INFO_KEY);
    if (userInfor) {
        userInfor = JSON.parse(userInfor);
    }
    if (userInfor) {
        config.headers.Authorization = `Bearer ${userInfor.user_token}`;
    }
    return config;
})

request.interceptors.response.use((response) => {
    return response;
})
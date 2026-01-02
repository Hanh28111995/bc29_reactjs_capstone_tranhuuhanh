import axios from 'axios';
import { BASE_URL, TOKEN_CYBERSOFT, USER_INFO_KEY } from '../constants/common';

let userInfor = localStorage.getItem(USER_INFO_KEY);
if (userInfor) {
    userInfor = JSON.parse(userInfor);
}
// console.log('debugger');
export const request = axios.create({
    headers:
    {
        // TokenCybersoft: TOKEN_CYBERSOFT,
        Authorization: userInfor?.accessToken,
    },
    baseURL: BASE_URL,
})

request.interceptors.request.use((config) => {
    let userInfor = localStorage.getItem(USER_INFO_KEY);
    if (userInfor) {
        userInfor = JSON.parse(userInfor);
    }
    if (userInfor) {
        config.headers.Authorization = `Bearer ${userInfor.accessToken}`;
    }
    return config;
})

request.interceptors.response.use((response) => {
    return response;
})
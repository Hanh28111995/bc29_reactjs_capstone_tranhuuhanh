import {SET_USER_INFO ,SET_DATE } from "../types/user.type";
 const setUserInfoAction = (data) => {
    return {
        type: SET_USER_INFO,
        payload: data,
    }
 };
 const setDate = (date) => {
    return {
        type: SET_DATE,
        payload: date,
    }
 };

 export {setUserInfoAction, setDate}
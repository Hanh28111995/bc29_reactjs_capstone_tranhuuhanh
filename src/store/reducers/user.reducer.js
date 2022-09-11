import { USER_INFO_KEY } from "../../constants/common";
import { SET_USER_INFO,  SET_DATE } from "../types/user.type";

let userInfor = localStorage.getItem(USER_INFO_KEY);
if (userInfor) {
  userInfor = JSON.parse(userInfor);
}
const DEFAULT_STATE = {
  userInfor,
  date: '',
};
export const userReducer = (state = DEFAULT_STATE, { type, payload }) => {
  switch (type) {
    case SET_USER_INFO: {
      state.userInfor = payload;
      return { ...state };
    }
    case SET_DATE: {
      state.date = payload;
      return { ...state };
    }
    default:
      return state;
  }
};

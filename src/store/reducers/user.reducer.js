import { USER_INFO_KEY } from "../../constants/common";
import { SET_USER_INFO } from "../types/user.type";

let userInfor = localStorage.getItem(USER_INFO_KEY);
if(userInfor)
{
    userInfor = JSON.parse(userInfor);
}
else
{
  userInfor = undefined;
}
const DEFAULT_STATE = {
  userInfor,
};
export const userReducer = (state = DEFAULT_STATE, { type, payload }) => {
  switch (type) {
    case SET_USER_INFO: {
      state.userInfor = payload;
      return { ...state };
    }
    default:
      return state;
  }
};

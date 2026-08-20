import { USER_INFO_KEY } from "../../constants/common";
import {
  SET_USER_INFO,
  SET_DATE,
  SET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "../types/user.type";

let userInfor = localStorage.getItem(USER_INFO_KEY);
if (userInfor) {
  userInfor = JSON.parse(userInfor);
}
const DEFAULT_STATE = {
  userInfor,
  date: '',
  notifications: [],
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
    case SET_NOTIFICATIONS: {
      state.notifications = Array.isArray(payload) ? payload : [];
      return { ...state };
    }
    case MARK_NOTIFICATION_READ: {
      state.notifications = state.notifications.map((n) =>
        n?._id === payload ? { ...n, status: true } : n
      );
      return { ...state };
    }
    case MARK_ALL_NOTIFICATIONS_READ: {
      state.notifications = state.notifications.map((n) => ({ ...n, status: true }));
      return { ...state };
    }
    default:
      return state;
  }
};

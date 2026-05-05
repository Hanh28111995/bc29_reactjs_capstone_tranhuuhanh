import {
  SET_USER_INFO,
  SET_DATE,
  SET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "../types/user.type";

const setUserInfoAction = (data) => {
  return {
    type: SET_USER_INFO,
    payload: data,
  };
};

const setDate = (date) => {
  return {
    type: SET_DATE,
    payload: date,
  };
};

const setNotificationsAction = (notifications) => {
  return {
    type: SET_NOTIFICATIONS,
    payload: notifications,
  };
};

const markNotificationReadAction = (id) => {
  return {
    type: MARK_NOTIFICATION_READ,
    payload: id,
  };
};

const markAllNotificationsReadAction = () => {
  return {
    type: MARK_ALL_NOTIFICATIONS_READ,
  };
};

export {
  setUserInfoAction,
  setDate,
  setNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
};

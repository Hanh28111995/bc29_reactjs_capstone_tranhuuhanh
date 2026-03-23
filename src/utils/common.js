import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export const formatDate = (date, format = "D MMMM YYYY HH:mm") => {
  return dayjs(date).format(format);
};
export const formatDate1 = (date, format = "D") => {
  return dayjs(date).format(format);
};
export const formatDate2 = (date, format = "M") => {
  return dayjs(date).format(format);
};
export const formatDate4 = (date, format = "YYYY") => {
  return dayjs(date).format(format);
};
export const formatDate3 = (date, format = "DD/MM/YYYY") => {
  return dayjs(date).format(format);
};

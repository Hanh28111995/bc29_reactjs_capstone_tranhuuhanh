import moment from "moment";

export const formatDate =(date, format = 'LLL') => {
    return moment(date).format(format);
}
export const formatDate1 =(date, format = 'D') => {
    return moment(date).format(format);
}
export const formatDate2 =(date, format = 'YYYY MMMM') => {
    return moment(date).format(format);
}
export const formatDate3 =(date, format = 'l') => {
    return moment(date).format(format);
}
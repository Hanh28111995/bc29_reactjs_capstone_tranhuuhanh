import { GROUP_ID } from "constants/common";
import { request } from "../configs/axios";

const getAllSeatTypesApi = () => {

  return request({
    url: `/admin/seatType/allSeatTypes`,
    method: 'GET',
  })
};

const updateSeatTypeApi = (data) => {
  return request({
    url: '/admin/seatType/update',
    method: 'PUT',
    data,
  });
}

const deleteOneSeatTypeApi = (seatTypeId) => {
  return request({
    url: `/admin/seatType/delete/${seatTypeId}`,
    method: 'DELETE',
  });
}
const addOneSeatTypeApi = (data) => {
  return request({
    url: '/admin/seatType/add',
    method: 'POST',
    data,
  });
}
export { getAllSeatTypesApi, updateSeatTypeApi, deleteOneSeatTypeApi, addOneSeatTypeApi }
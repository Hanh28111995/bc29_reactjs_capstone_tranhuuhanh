import { request } from "../configs/axios";

/**
 * GET /admin/tools/schedule-generator
 * Lấy danh sách schedule đã tạo
 */
export const getScheduleListAPI = () => {
  return request({
    url: "/admin/tools/schedule-generator",
    method: "GET",
  });
};

/**
 * POST /admin/tools/schedule-generator
 * @param {Object} data
 * @param {string[]} data.movie_ids
 * @param {string[]} data.timeSlots  - e.g. ["09:00", "12:00"]
 * @param {string[]} data.theaters   - theater _id list
 * @param {number}   data.scheduleTime - 1=Daily, 2=Weekly, 3=Monthly
 */
export const createScheduleAPI = (data) => {
  return request({
    url: "/admin/tools/schedule-generator",
    method: "POST",
    data,
  });
};

/**
 * PUT /admin/tools/schedule-generator/:id
 * @param {string} id - schedule _id
 * @param {Object} data - same shape as createScheduleAPI
 */
export const updateScheduleAPI = (id, data) => {
  return request({
    url: `/admin/tools/schedule-generator/${id}`,
    method: "PUT",
    data,
  });
};

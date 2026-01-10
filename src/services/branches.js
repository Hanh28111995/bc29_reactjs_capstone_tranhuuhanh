import { request } from "../configs/axios";

const getAllBranches = () => {
  return request({
    url: '/admin/branch/all',
    method: 'GET',
  })
};

const updateBranhesApi = (data) => {
  return request({
    url: '/admin/branch/update',
    method: 'PUT',
    data,
  });
}

const deleteOneBranchApi = (id) => {
  return request({
    url: `/admin/branch/${id}/delete`,
    method: 'DELETE',
  });
}

const addOneBranchApi = (data) => {
  return request({
    url: '/admin/branch/add',
    method: 'POST',
    data,
  });
}
export { getAllBranches, updateBranhesApi, deleteOneBranchApi, addOneBranchApi }
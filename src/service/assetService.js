import api from './api';

export const getAssets = async (params = {}) => {
  const { data } = await api.get('assets', { params });
  return data;
};
export const PostAssets = async (data) => (await api.post('assets', data)).data;
export const getAssetsById = async (id) => (await api.get(`assets/${id}`)).data;
export const UpdateAssets = async (id, data) => (await api.put(`assets/${id}`, data)).data;
export const deleteAssets = async (id) => (await api.delete(`assets/${id}`)).data;

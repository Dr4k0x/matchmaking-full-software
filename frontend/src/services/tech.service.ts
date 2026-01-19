import api from '../api/api';
import type { Technology } from '../types';

const techService = {
  getAll: async () => {
    const response = await api.get<{ data: Technology[] }>('/tecnologia');
    return response.data.data;
  },
  getOne: async (id: number) => {
    const response = await api.get<Technology>(`/tecnologia/${id}`);
    return response.data;
  },
  create: async (data: Omit<Technology, 'idTecnologia'>) => {
    const response = await api.post<Technology>('/tecnologia', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Technology>) => {
    const response = await api.patch<Technology>(`/tecnologia/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/tecnologia/${id}`);
  },
};

export default techService;

import api from '../api/api';
import type { Employee } from '../types';

const cartaService = {
  getAll: async () => {
    const response = await api.get<Employee[]>('/carta');
    return response.data;
  },
  getOne: async (id: number) => {
    const response = await api.get<Employee>(`/carta/${id}`);
    return response.data;
  },
  create: async (data: Omit<Employee, 'idCarta'>) => {
    const response = await api.post<Employee>('/carta', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Employee>) => {
    const response = await api.patch<Employee>(`/carta/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/carta/${id}`);
  },
};

export default cartaService;

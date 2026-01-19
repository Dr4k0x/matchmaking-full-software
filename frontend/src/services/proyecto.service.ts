import api from '../api/api';
import type { Project } from '../types';

const proyectoService = {
  getAll: async () => {
    const response = await api.get<Project[]>('/proyecto');
    return response.data;
  },
  getOne: async (id: number) => {
    const response = await api.get<Project>(`/proyecto/${id}`);
    return response.data;
  },
  create: async (data: Omit<Project, 'idProyecto'>) => {
    const response = await api.post<Project>('/proyecto', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Project>) => {
    const response = await api.patch<Project>(`/proyecto/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/proyecto/${id}`);
  },
};

export default proyectoService;

import api from '../api/api';
import type { Match } from '../types';

export interface CreateMatchmakingDto {
  idProyecto: number;
  cartasIds: number[];
}



const matchmakingService = {
  create: async (dto: CreateMatchmakingDto) => {
    const response = await api.post('/matchmaking', dto);
    return response.data;
  },
  preview: async (dto: CreateMatchmakingDto) => {
    const response = await api.post<{ porcentaje: number }>('/matchmaking/preview', dto);
    return response.data;
  },
  findAll: async () => {
    const response = await api.get<Match[]>('/matchmaking');
    return response.data;
  },
  findOne: async (id: number) => {
    const response = await api.get<Match>(`/matchmaking/${id}`);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/matchmaking/${id}`);
  },
};

export default matchmakingService;

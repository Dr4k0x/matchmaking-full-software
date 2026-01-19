import api from '../api/api';
import type { Match } from '../types';

export interface CreateMatchmakingDto {
  idProyecto: number;
  cartasIds: number[];
}

export interface MatchmakingRandomDto {
  idProyecto: number;
  maxCards?: number;
  attempts?: number;
  threshold?: number;
  seed?: string;
}

const matchmakingService = {
  create: async (dto: CreateMatchmakingDto) => {
    const response = await api.post('/matchmaking', dto);
    return response.data;
  },
  createRandom: async (dto: MatchmakingRandomDto) => {
    const response = await api.post('/matchmaking/random', dto);
    return response.data;
  },
  findAll: async () => {
    const response = await api.get<Match[]>('/matchmaking');
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/matchmaking/${id}`);
  },
};

export default matchmakingService;

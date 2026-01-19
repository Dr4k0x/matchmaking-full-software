import api from '../api/api';

export interface UsuarioProfile {
    idUsuario: number;
    nombre: string;
    email: string;
    // Add other non-sensitive fields as needed
}

export interface UpdateNombrePayload {
    nombre: string;
}

const usuariosService = {
    // Get user profile by ID
    getById: async (id: number): Promise<UsuarioProfile> => {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    // Update user name (and other fields supported by backend DTO)
    update: async (id: number, data: Partial<UsuarioProfile>) => {
        const response = await api.patch(`/usuarios/${id}`, data);
        return response.data;
    }
};

export default usuariosService;

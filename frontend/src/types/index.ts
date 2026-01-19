export interface Technology {
  idTecnologia: number;
  nombre: string;
  tipo: string;
}

export interface NivelCarta {
  idTecnologia: number;
  nivelDominado: number;
  // idCarta is implied or optional depending on context
}

export interface Employee {
  idCarta: number;
  nombreApellido: string;
  cedulaIdentidad: string;
  tipoCarta: string;
  poderSocial: number;
  sabiduria: number;
  velocidad: number;
  nivelesCarta: NivelCarta[];
}

export interface NivelProyecto {
  idTecnologia: number;
  nivelRequerido: number;
}

export interface Project {
  idProyecto: number;
  nombre: string;
  descripcion: string;
  fechaCreacion: string;
  fechaFinalizacion: string;
  estado: 'P' | 'F' | 'E'; // P: En Proceso, F: Finalizado, E: En Espera
  nivelColaborativo: number;
  nivelOrganizativo: number;
  nivelVelocidadDesarrollo: number;
  nivelesProyecto: NivelProyecto[];
}

export interface Match {
  id: number; // This might be idMatchmaking from backend? Or just internal ID. Backend entity has idMatchmaking.
  idMatchmaking?: number;
  idProyecto: number;
  cartasIds: number[];
  score: number;
  metadata?: any;
}

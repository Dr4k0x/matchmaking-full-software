export interface Technology {
  idTecnologia: number;
  nombre: string;
  tipo: string;
}

export interface NivelCarta {
  idTecnologia: number;
  nivelDominado: number;
  tecnologia?: Technology;
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
  tecnologia?: Technology;
}

export interface Project {
  idProyecto: number;
  nombre: string;
  descripcion: string;
  fechaCreacion: string;
  fechaFinalizacion: string;
  estado: 'P' | 'F' | 'E';
  nivelColaborativo: number;
  nivelOrganizativo: number;
  nivelVelocidadDesarrollo: number;
  nivelesProyecto: NivelProyecto[];
}

export interface Match {
  idMatchmaking: number;
  idProyecto: number;
  proyecto: Project;
  resultadoPorcentaje: number;
  cartas?: Employee[];
}

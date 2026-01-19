CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    passkey VARCHAR(255) NOT NULL
);

CREATE TABLE proyectos (
    id_proyecto SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_creacion DATE,
    fecha_finalizacion DATE,
    estado VARCHAR(50),
    nivel_colaborativo INTEGER,
    nivel_organizativo INTEGER,
    nivel_velocidad_desarrollo INTEGER,

    CONSTRAINT fk_proyecto_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE cartas (
    id_carta SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_matchmaking INTEGER,
    nombre_apellido VARCHAR(100) NOT NULL,
    cedula_identidad VARCHAR(20) UNIQUE NOT NULL,
    tipo_carta VARCHAR(50),
    poder_social INTEGER,
    sabiduria INTEGER,
    velocidad INTEGER,
	
    CONSTRAINT fk_carta_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,
		
    CONSTRAINT fk_carta_matchmaking
        FOREIGN KEY (id_matchmaking)
        REFERENCES matchmaking(id_matchmaking)
        ON DELETE SET NULL
);

CREATE TABLE tecnologias (
    id_tecnologia SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    nombre VARCHAR(100),
    tipo VARCHAR(50),

    CONSTRAINT fk_tecnologia_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE matchmaking (
    id_matchmaking SERIAL PRIMARY KEY,
    id_proyecto INTEGER UNIQUE NOT NULL,
    resultado_porcentaje NUMERIC(5,2),

    CONSTRAINT fk_matchmaking_proyecto
        FOREIGN KEY (id_proyecto)
        REFERENCES proyectos(id_proyecto)
        ON DELETE CASCADE
);

CREATE TABLE nivel_proyecto (
    id_nivel_proyecto SERIAL PRIMARY KEY,
    id_proyecto INTEGER NOT NULL,
    id_tecnologia INTEGER NOT NULL,
    nivel_requerido INTEGER,

    CONSTRAINT fk_nivel_proyecto_proyecto
        FOREIGN KEY (id_proyecto)
        REFERENCES proyectos(id_proyecto)
        ON DELETE CASCADE,

    CONSTRAINT fk_nivel_proyecto_tecnologia
        FOREIGN KEY (id_tecnologia)
        REFERENCES tecnologias(id_tecnologia)
        ON DELETE CASCADE
);

CREATE TABLE nivel_carta (
    id_nivel_carta SERIAL PRIMARY KEY,
    id_carta INTEGER NOT NULL,
    id_tecnologia INTEGER NOT NULL,
    nivel_dominado INTEGER,

    CONSTRAINT fk_nivel_carta_carta
        FOREIGN KEY (id_carta)
        REFERENCES cartas(id_carta)
        ON DELETE CASCADE,

    CONSTRAINT fk_nivel_carta_tecnologia
        FOREIGN KEY (id_tecnologia)
        REFERENCES tecnologias(id_tecnologia)
        ON DELETE CASCADE
);


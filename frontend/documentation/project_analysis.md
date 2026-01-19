# Análisis del Proyecto Matchmaking Frontend

## Visión General
Este proyecto es una aplicación web Single Page Application (SPA) construida utilizando **React 19** y **TypeScript**, empaquetada y servida con **Vite**.

## Arquitectura
La arquitectura es típica de una aplicación moderna de React con Vite:
- **Cliente**: Todo el código se ejecuta en el navegador del cliente.
- **Build Tool**: Vite se encarga del desarrollo local (HMR) y del empaquetado para producción.
- **Lenguaje**: TypeScript se utiliza para tipado estático, mejorando la seguridad y mantenibilidad del código.

## Estructura de Carpetas

### Raíz
- **`src/`**: Contiene todo el código fuente de la aplicación.
- **`public/`**: Archivos estáticos que se sirven tal cual (sin procesar por Vite), como `favicon.ico` o `robots.txt`.
- **`index.html`**: Punto de entrada HTML de la aplicación. Vite inyecta el script principal aquí.
- **`vite.config.ts`**: Configuración de Vite.
- **`tsconfig.json`**: Configuración de TypeScript.

### `src/`
- **`main.tsx`**: Punto de entrada de JavaScript/TypeScript. Se encarga de montar la aplicación React en el DOM (generalmente en el elemento con id `root`).
- **`app/`**: Contiene la lógica principal de la aplicación.
    - **`App.tsx`**: Componente raíz de la aplicación. Aquí se suelen definir las rutas y el layout principal.
    - **`App.css`**: Estilos globales o específicos del componente App.
- **`assets/`**: Recursos estáticos importados desde el código (imágenes, fuentes, etc.).

## Tecnologías Clave
- **React**: ^19.2.0
- **TypeScript**: ~5.9.3
- **Vite**: ^7.2.4
- **ESLint**: Para linting y calidad de código.

## Recomendaciones para Peticiones Futuras
Para realizar peticiones efectivas, puedes referenciar esta estructura. Por ejemplo:
- "Crea un nuevo componente en `src/components`..."
- "Modifica la configuración de rutas en `src/app/App.tsx`..."
- "Agrega una función de utilidad en `src/utils`..."

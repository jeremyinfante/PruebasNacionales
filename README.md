# 🎯 Pruebas Nacionales - Simulador Interactivo

Aplicación web interactiva de autoentrenamiento para Pruebas Nacionales, con interfaz **Premium Dashboard**, diseño **Bento Grid** y soporte para **Modo Claro/Oscuro** y **Persistencia Local**.

## 📋 Características

✅ **Parser Dinámico de Markdown**: Lee archivos `.md` en tiempo real, con soporte para saltos de línea de Windows e inline styles (`**negrita**`, `*cursiva*`, `` código ``).
✅ **Interfaz Bento Grid Premium**: Totalmente optimizada para móviles, tablets y escritorio.
✅ **Modo Claro y Oscuro**: Paleta de colores basada en HSL que cambia dinámicamente según tus preferencias con un solo clic.
✅ **Persistencia con LocalStorage**: Tu progreso y respuestas de cada cuadernillo se guardan automáticamente para evitar pérdidas en recargas de página accidentales.
✅ **Barra de Progreso Dinámica**: Visualización en tiempo real del porcentaje del examen completado.
✅ **Modal de Zoom para Imágenes**: Haz clic en cualquier imagen o diagrama de pregunta para ampliarlo y analizarlo a detalle.
✅ **Evaluación Interactiva**: Feedback detallado con colores (verde, rojo, naranja) mostrando las opciones correctas, las seleccionadas y las falladas.
✅ **Compartir Resultados**: Copia un reporte formateado de tus estadísticas con un solo clic.

## 🚀 Cómo Usar

### Opción 1: Abrir directamente en el navegador
Simplemente abre el archivo `index.html` en tu navegador:
- Haz doble clic en `index.html` en tu explorador de archivos.

### Opción 2: Usar un servidor local (Recomendado)
```bash
# Abre una terminal en la carpeta del proyecto
python -m http.server 8000

# Luego abre en tu navegador:
http://localhost:8000
```

## 📂 Estructura del Proyecto

```
PruebasNacionales/
├── index.html                          # ⭐ Esqueleto principal (HTML5)
├── README.md                           # Este archivo
├── QUICKSTART.md                       # Guía de inicio rápido
├── assets/                             # Recursos estáticos
│   ├── css/
│   │   └── styles.css                  # Hoja de estilos premium (HSL, Bento Grid, Responsive)
│   └── js/
│       ├── parser.js                   # Parser nativo de Markdown extendido
│       └── app.js                      # Controlador de estados, LocalStorage y zoom
└── markdown/                           # Cuestionarios en Markdown
    ├── matematicas/
    │   ├── c1-matematicas-2024.md     # Cuadernillo de Matemáticas 1
    │   ├── c2-matematicas-2024.md     # Cuadernillo de Matemáticas 2
    │   └── img/                       # Diagramas de Matemáticas
    └── ciencias-sociales/
        ├── c1-ciencias-sociales-2024.md # Cuadernillo de Ciencias Sociales 1
        ├── c2-ciencias-sociales-2024.md # Cuadernillo de Ciencias Sociales 2
        └── img/                       # Diagramas e Imágenes de Ciencias Sociales
```

## 📝 Formato del Archivo Markdown

El parser espera este formato estructurado:

```markdown
# Título del Cuadernillo

## Pregunta 1

Enunciado de la pregunta con **texto resaltado** si es necesario.

![descripción](img/imagen.png)

a) Opción A
b) Opción B (correcta)
c) Opción C
d) Opción D
```

### Reglas Importantes:
- `## Pregunta X` marca el inicio de cada pregunta.
- Las imágenes usan el formato de markdown tradicional `![alt](ruta/imagen.png)`. Las rutas son relativas al archivo de markdown correspondiente (el sistema las resuelve dinámicamente al renderizar).
- Las opciones deben empezar estrictamente por `a)`, `b)`, `c)`, `d)`.
- Añadir `(correcta)` al final de la opción correspondiente. El parser la ocultará automáticamente al renderizar y la guardará en memoria de forma segura.

## 🛠 Modificación de Marca

Para personalizar los créditos en los archivos modulares:

**En `index.html`:**
- Edita el footer de la página y el sidebar footer para poner tu marca.

**En `assets/js/app.js` (Función `copyScore`):**
- Edita el texto de la plantilla para cambiar el nombre de la firma al compartir el resultado.

## ✨ Mejoras Futuras
- [ ] Exportar resultados a PDF
- [ ] Análisis de desempeño agrupado por temas
- [ ] Cronómetro / Limitador de tiempo opcional
- [ ] Base de datos centralizada

## 📄 Licencia & Créditos

Desarrollado por **Elite Dev** - Soluciones Web Premium

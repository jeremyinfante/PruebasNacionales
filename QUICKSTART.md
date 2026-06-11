# 🚀 GUÍA RÁPIDA - Pruebas Nacionales Simulador

## ¿Cómo abrir la aplicación?

### Opción A: Abrir directamente (más rápido para desarrollo)
```
1. Ve a la carpeta: C:\Users\XENJI\Desktop\PruebasNacionales\
2. Haz doble clic en → index.html
3. Se abrirá automáticamente en tu navegador predeterminado.
```

### Opción B: Con servidor local (Recomendado para evitar bloqueos CORS)
```bash
# Abre una terminal en la carpeta del proyecto:
python -m http.server 8000

# Abre en tu navegador favorito:
http://localhost:8000
```

---

## 🎯 Flujo de Funcionamiento de la Aplicación

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INICIALIZAR Y CARGAR TEMA                                │
│    └─ Carga el tema guardado en LocalStorage (defecto: dark)│
│    └─ Carga el cuadernillo por defecto (Matemáticas C2)     │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. LEER Y PARSEAR MARKDOWN                                  │
│    └─ Fetch dinámico del archivo .md                        │
│    └─ Parser lee lineas, formatea negritas/cursivas         │
│    └─ Extrae imágenes e identifica la opción (correcta)     │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. RENDERIZAR E INTEGRAR PROGRESO                           │
│    └─ Recupera respuestas anteriores de LocalStorage        │
│    └─ Calcula la ruta absoluta de imágenes usando basePath  │
│    └─ Renderiza en formato Bento Grid responsivo            │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. INTERACTUAR Y RESPONDER                                  │
│    └─ Clic en opciones para seleccionar (se guarda en local)│
│    └─ Clic en imágenes para abrir el Modal de Zoom          │
│    └─ Barra de progreso superior se actualiza en vivo       │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. FINALIZAR Y EVALUAR                                      │
│    └─ Advierte si hay preguntas sin responder               │
│    └─ Bloquea las opciones y resalta aciertos en VERDE      │
│    └─ Muestra fallos en ROJO y guía de respuesta en NARANJA │
│    └─ Despliega el score e interactúa con el botón copiar   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Estructura de Archivos (Actualizada)

```
PruebasNacionales/
├── index.html              ← ⭐ Esqueleto HTML
├── README.md               ← Documentación y características principales
├── QUICKSTART.md           ← Este archivo
├── assets/                 ← Archivos estáticos modulares
│   ├── css/
│   │   └── styles.css      ← Sistema de diseño, temas claro/oscuro y Bento Grid
│   └── js/
│       ├── parser.js       ← Analizador sintáctico de archivos Markdown
│       └── app.js          ← Controlador del estado de la app y LocalStorage
└── markdown/               ← Contenidos didácticos
    ├── matematicas/
    │   ├── c1-matematicas-2024.md
    │   ├── c2-matematicas-2024.md
    │   └── img/            ← Carpeta de imágenes de Matemáticas
    └── ciencias-sociales/
        ├── c1-ciencias-sociales-2024.md
        ├── c2-ciencias-sociales-2024.md
        └── img/            ← Carpeta de imágenes de Ciencias Sociales
```

---

## 🧠 ¿Cómo Funciona la Resolución Dinámica de Imágenes?

En los archivos markdown, las imágenes se referencian de forma relativa a la ubicación de dicho archivo:
`![p1](img/pregunta-1-c2.png)`

Cuando el simulador carga el cuadernillo desde la ruta `markdown/matematicas/c2-matematicas-2024.md`:
1. El script `app.js` calcula el directorio base del archivo: `markdown/matematicas/`.
2. Al encontrar una imagen, concatena el directorio base con la ruta de la imagen: `markdown/matematicas/` + `img/pregunta-1-c2.png`.
3. El elemento `<img>` final en el HTML cargará con éxito `markdown/matematicas/img/pregunta-1-c2.png` sin importar desde qué nivel del proyecto se ejecute `index.html`.

---

## 🎨 Interfaz Responsive: Bento Grid

### Escritorio (Pantallas medianas y grandes)
Presenta un panel lateral fijo para la selección de cuadernillos y un Grid adaptativo de hasta 2 columnas para que el usuario pueda visualizar dos preguntas de forma simultánea, optimizando la lectura.

### Móviles (Pantallas pequeñas)
El sidebar se colapsa en un menú hamburguesa lateral deslizable para maximizar el espacio de visualización de las preguntas. Las tarjetas de preguntas ocupan el 100% de la pantalla con botones de opción grandes y espaciados para facilitar el uso táctil.

---

## 🔧 Personalizaciones del Simulador

### Cambiar el Cuadernillo por Defecto
Abre `assets/js/app.js` y modifica el objeto inicial `appState` (línea ~2):
```javascript
const appState = {
    currentFile: 'markdown/matematicas/c2-matematicas-2024.md', // Cambia esta ruta
    currentLabel: 'Cuadernillo 2',                              // Cambia este texto
    ...
```

### Agregar un Nuevo Cuadernillo
1. Crea tu archivo de preguntas en Markdown (ej. `markdown/ciencias-naturales/c1-naturales-2024.md`) respetando el formato.
2. Agrega las imágenes necesarias a una subcarpeta `img/` dentro de la carpeta del subject.
3. Abre `index.html` e incorpora el nuevo botón al sidebar siguiendo el formato existente:
```html
<button class="sidebar-item" data-file="markdown/ciencias-naturales/c1-naturales-2024.md" data-label="Ciencias Naturales - Cuadernillo 1">
    <span class="sidebar-item-icon">📄</span>
    <span>Naturales - Cuadernillo 1</span>
</button>
```

---

## 🐛 Resolución de Problemas

| Problema | Causa Posible | Solución |
| :--- | :--- | :--- |
| **No se cargan las imágenes** | La subcarpeta no se llama `img/` o la ruta en el `.md` no es correcta. | Asegura que la subcarpeta en el subject se llame `img` y que esté escrita en minúsculas en el markdown. |
| **No cargan los cuadernillos (pantalla vacía)** | Bloqueo CORS de políticas del navegador al intentar leer localmente. | Levanta un servidor local ejecutando `python -m http.server 8000` en la terminal. |
| **La pregunta 42 de Sociales no tiene imagen** | El archivo original no contenía el tag. | Asegura que `c2-ciencias-sociales-2024.md` contenga `![pregunta 42](img/pregunta-42-c2.png)`. |
| **El progreso de respuestas se borró** | Se borró el historial o el LocalStorage del navegador. | Es normal si navegas en modo incógnito. En navegación estándar, tus datos persistirán de forma segura. |

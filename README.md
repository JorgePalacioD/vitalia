# Vitalia - Actividad de Construcción Aplicada

Proyecto de la asignatura **Ingeniería Web** (CUN) para diseñar y construir el wireframe, el mockup y un prototipo navegable de una página de recomendaciones saludables.

## Contenido

| Archivo | Descripción |
| --- | --- |
| `index.html` | Portal de entregables con acceso a todas las evidencias. |
| `prototipo.html` | Prototipo navegable construido con HTML, CSS y JavaScript. |
| `wireframe.html` | Wireframe de baja fidelidad y mapa de navegación. |
| `mockup.html` | Galería de mockups y sistema de diseño. |
| `informe/informe.html` | Fuente del informe académico. |
| `informe/Informe_ACA_Vitalia.pdf` | Informe final en PDF (46 páginas). |
| `assets/css/estilos.css` | Sistema de diseño y estilos responsivos. |
| `assets/js/datos.js` | Categorías, recomendaciones, hábitos e iconografía. |
| `assets/js/app.js` | Router, vistas, estado, autenticación y CRUD. |
| `assets/capturas/` | Capturas del prototipo, wireframes y sistema de diseño. |
| `herramientas/` | Scripts de captura y verificación con Chrome DevTools Protocol. |

## Cómo abrir el proyecto

No requiere instalación ni servidor. Abra `index.html` en Chrome, Edge o Firefox.

- Portal: `index.html`
- Prototipo directo: `prototipo.html#/inicio`
- Informe: `informe/Informe_ACA_Vitalia.pdf`

Para una experiencia equivalente a la publicación final, también puede servir la carpeta localmente:

```powershell
python -m http.server 8000
```

Luego abra `http://localhost:8000`.

## Cuentas de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Usuario | `demo@vitalia.co` | `demo123` |
| Administrador | `admin@vitalia.co` | `admin123` |

Los datos se guardan en `localStorage`. Para reiniciar el estado, borre los datos del sitio desde las herramientas del navegador.

## Flujos principales

1. **Buscar y consultar:** inicio, búsqueda o categoría, filtros, detalle y favoritos.
2. **Registro y perfil:** creación de cuenta, perfil de salud y recomendaciones personalizadas.
3. **Favoritos:** guardar desde una tarjeta o el detalle, contador y eliminación.
4. **Hábitos:** marcar días, calcular racha y actualizar el progreso semanal.
5. **Administración:** crear, editar y eliminar recomendaciones desde el rol admin.

## Regenerar capturas y verificación

Requisitos: Node.js 22 o superior y Google Chrome instalado en `C:\Program Files\Google\Chrome\Application\chrome.exe`.

```powershell
node herramientas/capturar.js
node herramientas/capturar_elementos.js
```

El primer script genera las capturas generales y `herramientas/verificacion.json`; el segundo genera las figuras individuales del wireframe y el sistema de diseño.

## Regenerar el informe PDF

El informe se imprime desde `informe/informe.html` con Chrome en modo headless:

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --no-sandbox --no-pdf-header-footer --virtual-time-budget=8000 --print-to-pdf="C:\Users\jorgepalacio\Documents\Ingenieria_sistemas\ingenieria_web\proyecto_vitalia\informe\Informe_ACA_Vitalia.pdf" "file:///C:/Users/jorgepalacio/Documents/Ingenieria_sistemas/ingenieria_web/proyecto_vitalia/informe/informe.html"
```

El PDF resultante conserva Arial 12 pt, interlineado 1.5 y márgenes de 2.54 cm.

## Antes de entregar

1. Reemplace en `informe/informe.html` los placeholders `[Integrante 1]`, `[Integrante 2]`, `[Integrante 3]` y `[Nombre del docente]`.
2. La URL publicada ya está registrada en el informe y en este README.
3. Vuelva a generar el PDF después de cualquier cambio.
4. Verifique que `index.html`, `mockup.html` y `prototipo.html` abran el PDF en `informe/Informe_ACA_Vitalia.pdf`.

## Publicación

El proyecto está publicado en GitHub Pages:

- Portal: https://jorgepalaciod.github.io/vitalia/
- Prototipo: https://jorgepalaciod.github.io/vitalia/prototipo.html#/inicio
- Wireframe: https://jorgepalaciod.github.io/vitalia/wireframe.html
- Mockup: https://jorgepalaciod.github.io/vitalia/mockup.html
- Informe: https://jorgepalaciod.github.io/vitalia/informe/Informe_ACA_Vitalia.pdf

Repositorio: https://github.com/JorgePalacioD/vitalia

Para actualizar el sitio basta con hacer `git push` a la rama `main`; GitHub Pages reconstruye automáticamente. El prototipo no depende de un backend; solo utiliza `localStorage` para conservar el estado en el navegador.

## Limitaciones del prototipo

- No existe servidor ni base de datos: la persistencia es local al navegador.
- Las contraseñas de demostración se almacenan sin hash; en producción se requiere autenticación del lado del servidor.
- Las fuentes Poppins e Inter se cargan desde Google Fonts; sin conexión se usa la fuente de respaldo del sistema.
- El informe documenta estas limitaciones y las mejoras previstas en el cierre del proyecto.

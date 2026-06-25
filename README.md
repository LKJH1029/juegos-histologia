# juegos-histologia

Sitio web estatico para publicar juegos interactivos de histologia en GitHub Pages.

## Archivos principales

- `index.html`: listado de juegos disponibles.
- `game.html`: carga un juego especifico con `?juego=nombre-del-juego`.
- `src/styles.css`: estilos generales.
- `src/game.js`: logica de arrastrar y soltar.
- `data/juegos.json`: listado general de juegos.
- `data/tubulo-seminifero.json`: juego de ejemplo.
- `assets/images/`: imagenes usadas por los juegos.
- `calibrador.html`: herramienta para obtener coordenadas porcentuales sobre una imagen.

## Como agregar un juego

1. Guarda la imagen en `assets/images/`.
2. Copia `data/tubulo-seminifero.json` y cambia el nombre del archivo, por ejemplo `data/epitelio-simple.json`.
3. Edita el JSON:
   - `titulo`
   - `instrucciones`
   - `imagen`
   - `etiquetas`
   - `zonas`
4. Agrega el juego a `data/juegos.json` con el mismo `id` del archivo JSON.
5. Abre el juego con `game.html?juego=epitelio-simple`.

Las coordenadas de cada zona usan porcentajes:

```json
{
  "id": "zona-1",
  "left": 50,
  "top": 40,
  "ancho": 18,
  "alto": 10,
  "respuesta": "etiqueta-1"
}
```

`left` y `top` indican el centro de la zona. `ancho` y `alto` tambien son porcentajes respecto a la imagen.

## Etiquetas repetidas

Si una estructura aparece mas de una vez, crea etiquetas con `id` distintos y el mismo `texto`.

```json
{
  "id": "espermatogonia-1",
  "texto": "Espermatogonia"
}
```

## Calibrador

Abre `calibrador.html`, escribe o selecciona una ruta de imagen dentro de `assets/images`, y haz clic sobre la imagen. La pagina mostrara `left` y `top` en porcentaje para copiar al JSON del juego.

La cuadricula opcional ayuda a ajustar visualmente las coordenadas.

## Publicacion en GitHub Pages

Este proyecto no requiere backend, Node ni dependencias externas. Para publicarlo:

1. Sube el repositorio a GitHub.
2. En la configuracion del repositorio, activa GitHub Pages.
3. Selecciona la rama y carpeta raiz del proyecto.

GitHub Pages servira los archivos estaticos y los juegos cargaran sus datos desde la carpeta `data/`.

## Previsualizacion local

Para probarlo como lo servira GitHub Pages, abre el proyecto mediante un servidor estatico simple. Si tienes Python instalado:

```powershell
python -m http.server 8000
```

Luego visita `http://127.0.0.1:8000/`.

Abrir `index.html` directamente desde el explorador de archivos puede impedir que el navegador cargue los JSON por restricciones de seguridad locales.

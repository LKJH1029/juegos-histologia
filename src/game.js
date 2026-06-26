const params = new URLSearchParams(window.location.search);
const gameId = params.get("juego") || "tubulo-seminifero";

const titleEl = document.querySelector("#game-title");
const instructionsEl = document.querySelector("#game-instructions");
const imageEl = document.querySelector("#game-image");
const labelsListEl = document.querySelector("#labels-list");
const zonesEl = document.querySelector("#drop-zones");
const progressEl = document.querySelector("#progress-text");
const feedbackEl = document.querySelector("#feedback-text");
const resetButton = document.querySelector("#reset-button");

let gameData = null;
let completedZones = new Set();
let feedbackTimer = null;
let selectedLabelId = null;

async function init() {
  try {
    const response = await fetch(`data/${gameId}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`No existe data/${gameId}.json`);
    gameData = await response.json();
    renderGame();
  } catch (error) {
    titleEl.textContent = "Juego no disponible";
    instructionsEl.innerHTML = `No se pudo cargar <code>data/${escapeHtml(gameId)}.json</code>.`;
    labelsListEl.innerHTML = "";
    zonesEl.innerHTML = "";
    setFeedback("Revisa el parametro ?juego= y el archivo JSON correspondiente.", "error", false);
  }
}

function renderGame() {
  document.title = `${gameData.titulo} | Juegos de histologia`;
  titleEl.textContent = gameData.titulo;
  instructionsEl.textContent = gameData.instrucciones;
  imageEl.src = gameData.imagen;
  imageEl.alt = gameData.titulo;
  completedZones = new Set();
  selectedLabelId = null;

  renderLabels();
  renderZones();
  updateProgress();
  setFeedback("Arrastra una etiqueta a la zona correcta.", "", false);
}

function renderLabels() {
  labelsListEl.innerHTML = "";
  gameData.etiquetas.forEach((label) => {
    const button = document.createElement("button");
    button.className = "label-chip";
    button.type = "button";
    button.draggable = true;
    button.dataset.labelId = label.id;
    button.textContent = label.texto;
    button.addEventListener("click", () => {
      if (button.disabled) return;
      selectedLabelId = label.id;
      labelsListEl.querySelectorAll(".label-chip").forEach((item) => {
        item.classList.toggle("selected", item.dataset.labelId === selectedLabelId);
      });
      setFeedback("Etiqueta seleccionada. Ahora toca una zona de la imagen.", "", false);
    });
    button.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", label.id);
      event.dataTransfer.effectAllowed = "move";
    });
    labelsListEl.append(button);
  });
}

function renderZones() {
  zonesEl.innerHTML = "";
  gameData.zonas.forEach((zone) => {
    const zoneEl = document.createElement("div");
    zoneEl.className = "drop-zone";
    if (zone.compacto) {
      zoneEl.classList.add("compact");
    }
    zoneEl.dataset.zoneId = zone.id;
    zoneEl.dataset.match = getZoneMatch(zone);
    zoneEl.style.left = `${zone.left}%`;
    zoneEl.style.top = `${zone.top}%`;
    zoneEl.style.width = `${getZoneDimension(zone, "ancho", "width")}%`;
    zoneEl.style.height = `${getZoneDimension(zone, "alto", "height")}%`;
    zoneEl.textContent = "?";
    zoneEl.setAttribute("aria-label", "Zona de caida");

    zoneEl.addEventListener("dragover", (event) => {
      if (completedZones.has(zone.id)) return;
      event.preventDefault();
      zoneEl.classList.add("over");
    });

    zoneEl.addEventListener("dragleave", () => {
      zoneEl.classList.remove("over");
    });

    zoneEl.addEventListener("drop", (event) => {
      event.preventDefault();
      zoneEl.classList.remove("over");
      const labelId = event.dataTransfer.getData("text/plain");
      handleDrop(labelId, zone, zoneEl);
    });

    zoneEl.addEventListener("click", () => {
      if (!selectedLabelId || completedZones.has(zone.id)) return;
      handleDrop(selectedLabelId, zone, zoneEl);
    });

    zonesEl.append(zoneEl);
  });
}

function handleDrop(labelId, zone, zoneEl) {
  if (completedZones.has(zone.id)) return;

  const label = getLabel(labelId);
  if (label && getLabelMatch(label) === getZoneMatch(zone)) {
    completedZones.add(zone.id);
    zoneEl.classList.add("correct");
    zoneEl.classList.toggle("compact", Boolean(zone.compacto || label.compacto));
    zoneEl.textContent = getLabelText(labelId);

    const labelButton = labelsListEl.querySelector(`[data-label-id="${cssEscape(labelId)}"]`);
    if (labelButton) {
      labelButton.classList.add("used");
      labelButton.classList.remove("selected");
      labelButton.draggable = false;
      labelButton.disabled = true;
    }

    selectedLabelId = null;

    updateProgress();

    if (completedZones.size === gameData.zonas.length) {
      setFeedback("Completaste el juego.", "success", false);
    } else {
      setFeedback("Correcto.", "success", true);
    }
    return;
  }

  setFeedback("Intenta otra zona.", "error", true);
}

function updateProgress() {
  const total = gameData?.zonas?.length || 0;
  progressEl.textContent = `${completedZones.size}/${total} completadas`;
}

function setFeedback(message, type, temporary) {
  window.clearTimeout(feedbackTimer);
  feedbackEl.textContent = message;
  feedbackEl.className = type;

  if (temporary) {
    feedbackTimer = window.setTimeout(() => {
      feedbackEl.textContent = "Sigue arrastrando etiquetas.";
      feedbackEl.className = "";
    }, 1400);
  }
}

function getLabelText(labelId) {
  return getLabel(labelId)?.texto || labelId;
}

function getLabel(labelId) {
  return gameData.etiquetas.find((label) => label.id === labelId);
}

function getLabelMatch(label) {
  return label.match || label.id;
}

function getZoneMatch(zone) {
  return zone.match || zone.respuesta;
}

function getZoneDimension(zone, primaryKey, fallbackKey) {
  return zone[primaryKey] ?? zone[fallbackKey];
}

function resetGame() {
  if (!gameData) return;
  renderGame();
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return String(value).replace(/"/g, '\\"');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

resetButton.addEventListener("click", resetGame);
init();

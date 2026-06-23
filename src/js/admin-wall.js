import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import JSZip from "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm";

const ADMIN_SESSION_KEY = "voyagewall_admin";
const SUPABASE_URL = "https://xitflvwtobrqmvdkeyjz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_XbTe1Nsvr_iIaEfhEI_B1g_g8wCmd5m";
const MEMORY_TABLE = "memories";
const FALLBACK_MEMORY_IMAGE = "../assets/mockups/voyage-wall-hero.png";
const MESSAGE_LIMIT = 120;
const PAGE_SIZE = 1000;
const MEMORY_SELECT_FIELDS = "id, photo_url, original_image_url, optimized_image_url, image_url, message, name, anonymous, created_at";
const MEMORY_SELECT_FIELDS_WITHOUT_IMAGE_URL = "id, photo_url, original_image_url, optimized_image_url, message, name, anonymous, created_at";
const LEGACY_MEMORY_SELECT_FIELDS = "id, photo_url, message, name, anonymous, created_at";

const adminGrid = document.querySelector("#admin-memory-grid");
const selectedCount = document.querySelector("#admin-selected-count");
const selectAllButton = document.querySelector("#admin-select-all");
const clearSelectionButton = document.querySelector("#admin-clear-selection");
const downloadSelectedButton = document.querySelector("#admin-download-selected");
const downloadAllButton = document.querySelector("#admin-download-all");
const downloadStatus = document.querySelector("#admin-download-status");
const signOutButton = document.querySelector("#admin-sign-out");
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let memories = [];
let totalMemories = 0;
let isPreparingDownload = false;
const selectedMemoryIds = new Set();

if (localStorage.getItem(ADMIN_SESSION_KEY) !== "true") {
  window.location.replace("/admin-login-client");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mapSupabaseMemory(row) {
  const displayImage = row.optimized_image_url || row.image_url || row.photo_url || FALLBACK_MEMORY_IMAGE;
  const downloadImage = row.original_image_url || row.optimized_image_url || row.image_url || row.photo_url || FALLBACK_MEMORY_IMAGE;

  return {
    id: String(row.id),
    image: displayImage,
    downloadImage,
    message: row.message || "",
    name: row.anonymous ? "A guest" : row.name || "A guest"
  };
}

function sanitizeDownloadPart(value) {
  return String(value || "guest")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "guest";
}

function getDownloadFilename(memory) {
  return `voyage-wall-${sanitizeDownloadPart(memory.name)}-${sanitizeDownloadPart(memory.id)}`;
}

function setDownloadStatus(message) {
  if (downloadStatus) {
    downloadStatus.textContent = message;
  }
}

function addDownloadExtension(filename) {
  return /\.[a-z0-9]{2,5}$/i.test(filename) ? filename : `${filename}.jpg`;
}

function openImageFallback(url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

function getGoogleDriveFileId(source) {
  if (!source) return "";
  const value = String(source).trim();
  if (value.startsWith("gdrive:")) return value.slice("gdrive:".length);
  if (/^[a-zA-Z0-9_-]{20,}$/.test(value)) return value;

  try {
    const url = new URL(value);
    const queryId = url.searchParams.get("id");
    if (queryId) return queryId;
    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    return fileMatch?.[1] || "";
  } catch {
    return "";
  }
}

function getDownloadSource(url) {
  const driveFileId = getGoogleDriveFileId(url);
  if (!driveFileId) return url;
  return `/api/google-drive-download?id=${encodeURIComponent(driveFileId)}`;
}

async function downloadImage(url, filename) {
  const downloadFilename = addDownloadExtension(filename);
  const downloadSource = getDownloadSource(url);

  try {
    const response = await fetch(downloadSource);
    if (!response.ok) {
      throw new Error(`Image request failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = downloadFilename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 0);
  } catch (error) {
    console.warn("[Voyage Wall] Could not force image download. Opening image instead.", error);
    openImageFallback(url);
  }
}

async function downloadMemory(memory) {
  if (!memory?.downloadImage) return;
  await downloadImage(memory.downloadImage, getDownloadFilename(memory));
}

async function fetchImageBlob(url) {
  const response = await fetch(getDownloadSource(url));
  if (!response.ok) {
    throw new Error(`Image request failed with status ${response.status}`);
  }

  return response.blob();
}

function downloadBlob(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}

async function downloadMemories(memoryItems) {
  if (memoryItems.length === 0) return;
  if (isPreparingDownload) return;

  isPreparingDownload = true;
  updateSelectionUi();

  try {
    if (memoryItems.length === 1) {
      setDownloadStatus("Preparing download...");
      await downloadMemory(memoryItems[0]);
      setDownloadStatus("Download ready");
      return;
    }

    setDownloadStatus("Preparing download...");
    const zip = new JSZip();
    const folder = zip.folder("Voyage Wall Memories");
    let zippedCount = 0;

    for (const memory of memoryItems) {
      try {
        const blob = await fetchImageBlob(memory.downloadImage);
        zippedCount += 1;
        folder.file(addDownloadExtension(getDownloadFilename(memory)), blob);
        setDownloadStatus(`Zipping ${zippedCount} / ${memoryItems.length}...`);
      } catch (error) {
        console.warn("[Voyage Wall] Could not add image to ZIP.", {
          memoryId: memory.id,
          image: memory.downloadImage,
          error
        });
      }
    }

    if (zippedCount === 0) {
      setDownloadStatus("Download failed");
      return;
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, "voyage-wall-memories.zip");
    setDownloadStatus("Download ready");
  } finally {
    isPreparingDownload = false;
    updateSelectionUi();
  }
}

function updateSelectionUi() {
  selectedCount.textContent = `Selected: ${selectedMemoryIds.size} / ${totalMemories || memories.length}`;

  adminGrid.querySelectorAll(".admin-memory-card").forEach((card) => {
    const isSelected = selectedMemoryIds.has(card.dataset.memoryId);
    card.classList.toggle("is-admin-selected", isSelected);
    const checkbox = card.querySelector(".memory-card__select-input");
    if (checkbox) checkbox.checked = isSelected;
  });

  const hasSelection = selectedMemoryIds.size > 0;
  const hasMemories = memories.length > 0;
  clearSelectionButton.disabled = isPreparingDownload || !hasSelection;
  downloadSelectedButton.disabled = isPreparingDownload || !hasSelection;
  selectAllButton.disabled = isPreparingDownload || !hasMemories;
  downloadAllButton.disabled = isPreparingDownload || !hasMemories;
}

function toggleSelect(memoryId) {
  if (selectedMemoryIds.has(memoryId)) {
    selectedMemoryIds.delete(memoryId);
  } else {
    selectedMemoryIds.add(memoryId);
  }

  updateSelectionUi();
}

function selectAll() {
  memories.forEach((memory) => selectedMemoryIds.add(memory.id));
  updateSelectionUi();
}

function clearSelection() {
  selectedMemoryIds.clear();
  updateSelectionUi();
}

async function downloadSelected() {
  const selectedMemories = memories.filter((memory) => selectedMemoryIds.has(memory.id));
  await downloadMemories(selectedMemories);
}

async function downloadAll() {
  await downloadMemories(memories);
}

function createMemoryCard(memory) {
  const card = document.createElement("article");
  card.className = "archive-memory-card admin-memory-card";
  card.dataset.memoryId = memory.id;
  const displayMessage = String(memory.message || "").slice(0, MESSAGE_LIMIT);

  card.innerHTML = `
    <label class="memory-card__select" aria-label="Select memory shared by ${escapeHtml(memory.name)}">
      <input class="memory-card__select-input" type="checkbox" value="${escapeHtml(memory.id)}">
      <span class="memory-card__select-box" aria-hidden="true"></span>
    </label>
    <div class="archive-memory-card__image-frame">
      <img class="archive-memory-card__image" src="${memory.image}" alt="Wedding memory shared by ${escapeHtml(memory.name)}" loading="lazy" decoding="async">
      <p class="archive-memory-card__message">
        <span class="archive-memory-card__message-text">${escapeHtml(displayMessage)}</span>
      </p>
    </div>
    <div class="archive-memory-card__body">
      <div class="archive-memory-card__attribution">
        <span class="archive-memory-card__label">FROM:</span>
        <span class="archive-memory-card__name">${escapeHtml(memory.name)}</span>
      </div>
    </div>
  `;

  card.querySelector(".memory-card__select").addEventListener("click", (event) => {
    event.stopPropagation();
  });
  card.querySelector(".memory-card__select").addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  card.querySelector(".memory-card__select-input").addEventListener("change", (event) => {
    event.stopPropagation();
    toggleSelect(memory.id);
  });
  card.querySelector("img").addEventListener("error", (event) => {
    event.currentTarget.src = FALLBACK_MEMORY_IMAGE;
  }, { once: true });

  return card;
}

function renderMemories() {
  adminGrid.innerHTML = "";

  if (memories.length === 0) {
    adminGrid.innerHTML = '<p class="wall-status">No memories have been shared yet.</p>';
    updateSelectionUi();
    return;
  }

  memories.forEach((memory) => {
    adminGrid.append(createMemoryCard(memory));
  });
  updateSelectionUi();
}

async function loadMemories() {
  adminGrid.innerHTML = '<p class="wall-status">Loading uploaded memories...</p>';

  try {
    let { data, error, count } = await supabase
      .from(MEMORY_TABLE)
      .select(MEMORY_SELECT_FIELDS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1);

    if (error) {
      ({ data, error, count } = await supabase
        .from(MEMORY_TABLE)
        .select(MEMORY_SELECT_FIELDS_WITHOUT_IMAGE_URL, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1));
    }

    if (error) {
      ({ data, error, count } = await supabase
        .from(MEMORY_TABLE)
        .select(LEGACY_MEMORY_SELECT_FIELDS, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1));
    }

    if (error) throw new Error(error.message || "Could not load memories.");

    totalMemories = count || 0;
    memories = (data || []).map(mapSupabaseMemory);
    renderMemories();
  } catch (error) {
    adminGrid.innerHTML = `
      <p class="wall-status wall-status--error">
        We could not load the uploaded memories yet. Please refresh and try again.
      </p>
    `;
    console.error("[Voyage Wall] Admin memory load failed.", error);
    updateSelectionUi();
  }
}

selectAllButton.addEventListener("click", (event) => {
  event.stopPropagation();
  selectAll();
});

clearSelectionButton.addEventListener("click", (event) => {
  event.stopPropagation();
  clearSelection();
});

downloadSelectedButton.addEventListener("click", (event) => {
  event.stopPropagation();
  downloadSelected();
});

downloadAllButton.addEventListener("click", (event) => {
  event.stopPropagation();
  downloadAll();
});

signOutButton.addEventListener("click", (event) => {
  event.stopPropagation();
  localStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.assign("/admin-login-client");
});

loadMemories();

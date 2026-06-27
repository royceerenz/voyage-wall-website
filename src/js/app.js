import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const form = document.querySelector("#memory-form");
const photoInput = document.querySelector("#photo-input");
const uploadCard = document.querySelector("#upload-card");
const previewCard = document.querySelector("#preview-card");
const previewImage = document.querySelector("#preview-image");
const previewName = document.querySelector("#preview-name");
const replacePhoto = document.querySelector("#replace-photo");
const messageInput = document.querySelector("#message-input");
const nameInput = document.querySelector("#name-input");
const nameField = document.querySelector("#name-field");
const anonymousInput = document.querySelector("#anonymous-input");
const messageCount = document.querySelector("#message-count");
const photoError = document.querySelector("#photo-error");
const messageError = document.querySelector("#message-error");
const nameError = document.querySelector("#name-error");
const submitMemory = document.querySelector("#submit-memory");
const successPanel = document.querySelector("#success-panel");
const shareAnother = document.querySelector("#share-another");
const memoryGallery = document.querySelector("#memory-gallery");
const memoryGrid = document.querySelector("#memory-grid");
const floatingShare = document.querySelector(".floating-share");
const sourceDialog = document.querySelector("#source-dialog");
const sourceDialogClose = document.querySelector("#source-dialog-close");
const takePhoto = document.querySelector("#take-photo");
const uploadGallery = document.querySelector("#upload-gallery");
const shareDialog = document.querySelector("#share-dialog");
const shareDialogClose = document.querySelector("#share-dialog-close");
const openShareButtons = document.querySelectorAll("[data-open-share]");
const viewWallAfterSubmit = document.querySelector("#view-wall-after-submit");
const revealSections = document.querySelectorAll("[data-scroll-reveal]");
const smoothScrollLinks = document.querySelectorAll("[data-smooth-scroll]");
const heroVideo = document.querySelector(".hero__video");
const heroMemoryCounter = document.querySelector("#hero-memory-counter");
const heroMemoryCounterText = document.querySelector(".hero-memory-counter__text");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const SUPABASE_URL = "https://xitflvwtobrqmvdkeyjz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_XbTe1Nsvr_iIaEfhEI_B1g_g8wCmd5m";
const MEMORY_TABLE = "memories";
const PHOTO_BUCKET = "memory-photos";
const FALLBACK_MEMORY_IMAGE = "./assets/mockups/voyage-wall-hero.png";
const MESSAGE_LIMIT = 120;
const HOMEPAGE_MEMORY_PREVIEW_LIMIT = 30;
const ADMIN_MEMORY_PREVIEW_LIMIT = 1000;
const ADMIN_SESSION_KEY = "voyagewall_admin";
const MEMORY_SELECT_FIELDS = "id, photo_url, original_image_url, optimized_image_url, image_url, message, name, anonymous, created_at";
const MEMORY_SELECT_FIELDS_WITHOUT_IMAGE_URL = "id, photo_url, original_image_url, optimized_image_url, message, name, anonymous, created_at";
const LEGACY_MEMORY_SELECT_FIELDS = "id, photo_url, message, name, anonymous, created_at";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const isAdminMode = false;

messageInput.maxLength = MESSAGE_LIMIT;

let selectedPhoto = null;
let selectedPhotoFile = null;
let selectedPhotoName = "";
let submissionsOpen = true;
let highlightedMemoryId = null;
const revealedMemoryIds = new Set();
let memoryRevealObserver = null;
let sourceSelectionPending = false;
let galleryAutoplayFrame = null;
let galleryResumeTimer = null;
let galleryAutoplayStartedAt = 0;
let floatingWallResizeTimer = null;
let floatingWallBreakpoint = null;
let floatingWallViewportWidth = window.innerWidth;
let floatingWallViewportHeight = window.innerHeight;
const selectedMemoryIds = new Set();
const floatingLayoutCache = new Map();
const FLOATING_WALL_LIMITS = {
  desktop: 24,
  tablet: 16,
  mobile: 10
};
const FLOATING_WALL_CARD_GAP = 22;
const FLOATING_WALL_SPEED = {
  min: 0.26,
  max: 0.52
};
const FLOATING_WALL_ROTATION = {
  desktop: 8,
  tablet: 8,
  mobile: 3
};

if (isAdminMode) {
  document.body.classList.add("is-admin-wall");
}

if (heroVideo) {
  const syncHeroVideoMotion = () => {
    if (reduceMotionQuery.matches) {
      heroVideo.pause();
    } else {
      heroVideo.play().catch(() => {});
    }
  };

  syncHeroVideoMotion();
  reduceMotionQuery.addEventListener?.("change", syncHeroVideoMotion);
}

function closeModalWithAnimation(modal) {
  if (!modal.open || modal.classList.contains("is-closing")) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    modal.close();
    syncBodyDialogState();
    return;
  }

  modal.classList.add("is-closing");
  window.setTimeout(() => {
    modal.classList.remove("is-closing");
    modal.close();
    syncBodyDialogState();
  }, 350);
}

let memories = [];
let totalMemoryCount = 0;

function updateHeroMemoryCounter() {
  const counterTarget = heroMemoryCounterText || heroMemoryCounter;
  if (!counterTarget) return;

  const count = totalMemoryCount;
  if (count === 0) {
    counterTarget.textContent = "Be the first to share a moment";
  } else if (count === 1) {
    counterTarget.textContent = "1 moment shared";
  } else {
    counterTarget.textContent = `${count} moments shared`;
  }
}

function mapSupabaseMemory(row) {
  const displayName = row.anonymous ? "A guest" : row.name || "A guest";
  const displayImage = row.optimized_image_url || row.photo_url || row.image_url || FALLBACK_MEMORY_IMAGE;
  const originalImage = row.original_image_url || row.optimized_image_url || row.image_url || row.photo_url || FALLBACK_MEMORY_IMAGE;

  return {
    id: String(row.id),
    image: displayImage,
    photo_url: row.photo_url,
    original_image_url: row.original_image_url,
    optimized_image_url: row.optimized_image_url,
    image_url: row.image_url,
    downloadImage: originalImage,
    message: row.message || "",
    name: displayName,
    anonymous: Boolean(row.anonymous),
    created_at: row.created_at
  };
}

function publicStorageUrl(path) {
  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function getAdminToolbar() {
  return document.querySelector("#admin-wall-toolbar");
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
  const guestName = sanitizeDownloadPart(memory.name);
  const memoryId = sanitizeDownloadPart(memory.id);
  return `voyage-wall-${guestName}-${memoryId}`;
}

function downloadMemory(memory) {
  if (!memory?.image) return;

  const link = document.createElement("a");
  link.href = memory.image;
  link.download = getDownloadFilename(memory);
  link.target = "_blank";
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

function updateAdminSelectionUi() {
  if (!isAdminMode) return;

  const selectedCount = selectedMemoryIds.size;
  const countLabel = document.querySelector("#admin-selected-count");
  if (countLabel) {
    countLabel.textContent = `Selected: ${selectedCount} / ${totalMemoryCount || memories.length}`;
  }

  document.querySelectorAll(".memory-card").forEach((card) => {
    const isSelected = selectedMemoryIds.has(card.dataset.memoryId);
    card.classList.toggle("is-admin-selected", isSelected);
    const checkbox = card.querySelector(".memory-card__select-input");
    if (checkbox) {
      checkbox.checked = isSelected;
    }
  });

  document.querySelector("#admin-download-selected")?.toggleAttribute("disabled", selectedCount === 0);
  document.querySelector("#admin-clear-selection")?.toggleAttribute("disabled", selectedCount === 0);
  document.querySelector("#admin-select-all")?.toggleAttribute("disabled", memories.length === 0);
  document.querySelector("#admin-download-all")?.toggleAttribute("disabled", memories.length === 0);
}

function toggleSelect(memoryId) {
  if (!memoryId) return;

  if (selectedMemoryIds.has(memoryId)) {
    selectedMemoryIds.delete(memoryId);
  } else {
    selectedMemoryIds.add(memoryId);
  }

  updateAdminSelectionUi();
}

function selectAll() {
  memories.forEach((memory) => selectedMemoryIds.add(memory.id));
  updateAdminSelectionUi();
}

function clearSelection() {
  selectedMemoryIds.clear();
  updateAdminSelectionUi();
}

function downloadSelected() {
  const selectedMemories = memories.filter((memory) => selectedMemoryIds.has(memory.id));
  selectedMemories.forEach(downloadMemory);
}

function downloadAll() {
  memories.forEach(downloadMemory);
}

function signOutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  window.top.location.assign("/admin-login-client");
}

function createAdminToolbar() {
  if (!isAdminMode || getAdminToolbar()) return;

  const wallHeader = document.querySelector(".wall-section__header");
  const toolbar = document.createElement("div");
  toolbar.className = "admin-wall-toolbar";
  toolbar.id = "admin-wall-toolbar";
  toolbar.innerHTML = `
    <span class="admin-wall-toolbar__badge">ADMIN MODE</span>
    <span class="admin-wall-toolbar__count" id="admin-selected-count">Selected: 0 / 0</span>
    <button class="button button--ghost" type="button" id="admin-select-all">Select All</button>
    <button class="button button--ghost" type="button" id="admin-clear-selection">Clear Selection</button>
    <button class="button button--secondary" type="button" id="admin-download-selected">Download Selected</button>
    <button class="button button--secondary" type="button" id="admin-download-all">Download All</button>
    <button class="button button--ghost" type="button" id="admin-toolbar-sign-out">Sign Out</button>
  `;

  toolbar.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  toolbar.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });

  wallHeader?.after(toolbar);

  document.querySelector("#admin-select-all")?.addEventListener("click", (event) => {
    event.stopPropagation();
    selectAll();
  });
  document.querySelector("#admin-clear-selection")?.addEventListener("click", (event) => {
    event.stopPropagation();
    clearSelection();
  });
  document.querySelector("#admin-download-selected")?.addEventListener("click", (event) => {
    event.stopPropagation();
    downloadSelected();
  });
  document.querySelector("#admin-download-all")?.addEventListener("click", (event) => {
    event.stopPropagation();
    downloadAll();
  });
  document.querySelector("#admin-toolbar-sign-out")?.addEventListener("click", (event) => {
    event.stopPropagation();
    signOutAdmin();
  });

  updateAdminSelectionUi();
}

function getFileExtension(file) {
  const nameExtension = file.name.split(".").pop();
  if (nameExtension && nameExtension !== file.name) return nameExtension.toLowerCase();
  return file.type.split("/").pop() || "jpg";
}

function createUniquePhotoPath(file, folder = "optimized", extension = getFileExtension(file)) {
  const uniqueId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${folder}/${uniqueId}.${extension}`;
}

function isSupportedPhotoFile(file) {
  const allowedExtensions = ["heic", "heif", "jpeg", "jpg", "png", "webp"];
  const extension = getFileExtension(file);
  return file.type.startsWith("image/") || allowedExtensions.includes(extension);
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Could not create optimized image."));
      }
    }, type, quality);
  });
}

async function supportsWebpOutput() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const blob = await canvasToBlob(canvas, "image/webp", 0.8).catch(() => null);
  return blob?.type === "image/webp";
}

async function createOptimizedImage(file) {
  const imageBitmap = await createImageBitmap(file);
  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / imageBitmap.width);
  const width = Math.max(1, Math.round(imageBitmap.width * scale));
  const height = Math.max(1, Math.round(imageBitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    throw new Error("Could not prepare optimized image.");
  }
  context.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close?.();

  const type = await supportsWebpOutput() ? "image/webp" : "image/jpeg";
  const extension = type === "image/webp" ? "webp" : "jpg";
  const qualitySteps = [0.8, 0.75, 0.7, 0.65];
  let optimizedBlob = null;

  for (const quality of qualitySteps) {
    optimizedBlob = await canvasToBlob(canvas, type, quality);
    if (optimizedBlob.size <= 900 * 1024) break;
  }

  return {
    blob: optimizedBlob,
    extension,
    type
  };
}

async function uploadToMemoryStorage(fileOrBlob, path, contentType) {
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, fileOrBlob, {
      cacheControl: "3600",
      contentType: contentType || fileOrBlob.type || "application/octet-stream",
      upsert: false
    });

  if (error) {
    console.error("[Voyage Wall] Supabase photo upload failed.", {
      bucket: PHOTO_BUCKET,
      path,
      error
    });
    throw new Error(`Storage upload failed: ${error.message || "Photo upload failed."}`);
  }

  return publicStorageUrl(data.path);
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const dataUrl = String(reader.result || "");
      resolve(dataUrl.split(",")[1] || "");
    });
    reader.addEventListener("error", () => {
      reject(new Error("Could not read original photo."));
    });
    reader.readAsDataURL(file);
  });
}

async function uploadOriginalToGoogleDrive(file) {
  const data = await readFileAsBase64(file);
  const response = await fetch("/api/google-drive-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      filename: file.name || `voyage-wall-original.${getFileExtension(file)}`,
      mimeType: file.type || "application/octet-stream",
      data
    })
  });

  if (!response.ok) {
    throw new Error("Google Drive original upload failed.");
  }

  const result = await response.json();
  if (!result?.original_image_url) {
    throw new Error("Google Drive original upload did not return a file reference.");
  }

  return result.original_image_url;
}

async function uploadPhotoVersions(file) {
  const originalImageUrl = await uploadOriginalToGoogleDrive(file);
  const optimizedImage = await createOptimizedImage(file);
  const optimizedPath = createUniquePhotoPath(file, "optimized", optimizedImage.extension);
  const optimizedImageUrl = await uploadToMemoryStorage(
    optimizedImage.blob,
    optimizedPath,
    optimizedImage.type
  );

  return {
    original_image_url: originalImageUrl,
    optimized_image_url: optimizedImageUrl
  };
}

async function insertMemory(memoryPayload) {
  const allowedInsertPayload = {
    photo_url: memoryPayload.optimized_image_url,
    image_url: memoryPayload.optimized_image_url,
    original_image_url: memoryPayload.original_image_url,
    optimized_image_url: memoryPayload.optimized_image_url,
    message: memoryPayload.message,
    name: memoryPayload.name,
    anonymous: memoryPayload.anonymous
  };

  let { data, error } = await supabase
    .from(MEMORY_TABLE)
    .insert(allowedInsertPayload)
    .select(MEMORY_SELECT_FIELDS)
    .single();

  if (error) {
    ({ data, error } = await supabase
      .from(MEMORY_TABLE)
      .insert({
        photo_url: memoryPayload.optimized_image_url,
        original_image_url: memoryPayload.original_image_url,
        optimized_image_url: memoryPayload.optimized_image_url,
        message: memoryPayload.message,
        name: memoryPayload.name,
        anonymous: memoryPayload.anonymous
      })
      .select(MEMORY_SELECT_FIELDS_WITHOUT_IMAGE_URL)
      .single());
  }

  if (error) {
    console.warn("[Voyage Wall] New image URL columns unavailable. Falling back to legacy memory insert.", error);
    ({ data, error } = await supabase
      .from(MEMORY_TABLE)
      .insert({
        photo_url: memoryPayload.optimized_image_url,
        message: memoryPayload.message,
        name: memoryPayload.name,
        anonymous: memoryPayload.anonymous
      })
      .select(LEGACY_MEMORY_SELECT_FIELDS)
      .single());
  }

  if (error) {
    console.error("[Voyage Wall] Supabase memory insert failed.", {
      table: MEMORY_TABLE,
      payload: allowedInsertPayload,
      error
    });
    throw new Error(`Insert failed: ${error.message || "Memory save failed."}`);
  }

  if (!data) {
    console.error("[Voyage Wall] Supabase insert returned no row.", {
      table: MEMORY_TABLE,
      payload: allowedInsertPayload
    });
    throw new Error("Insert failed: Supabase returned no inserted row.");
  }

  return mapSupabaseMemory(data);
}

async function loadMemories() {
  memoryGallery?.classList.add("memory-gallery--empty");
  memoryGrid.classList.remove("memory-grid--floating");
  memoryGrid.innerHTML = '<p class="wall-status">Loading shared memories...</p>';

  try {
    const memoryLimit = isAdminMode ? ADMIN_MEMORY_PREVIEW_LIMIT : HOMEPAGE_MEMORY_PREVIEW_LIMIT;
    let { data, error, count } = await supabase
      .from(MEMORY_TABLE)
      .select(MEMORY_SELECT_FIELDS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, memoryLimit - 1);

    if (error) {
      ({ data, error, count } = await supabase
        .from(MEMORY_TABLE)
        .select(MEMORY_SELECT_FIELDS_WITHOUT_IMAGE_URL, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(0, memoryLimit - 1));
    }

    if (error) {
      ({ data, error, count } = await supabase
        .from(MEMORY_TABLE)
        .select(LEGACY_MEMORY_SELECT_FIELDS, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(0, memoryLimit - 1));
    }

    if (error) {
      console.error("[Voyage Wall] Supabase memory load failed.", {
        table: MEMORY_TABLE,
        error
      });
      throw new Error(error.message || "Could not load memories.");
    }

    memories = (data || []).map(mapSupabaseMemory);
    totalMemoryCount = count || memories.length;
    renderMemories();
  } catch (error) {
    memoryGallery?.classList.add("memory-gallery--empty");
    memoryGrid.classList.remove("memory-grid--floating");
    memoryGrid.innerHTML = `
      <p class="wall-status wall-status--error">
        We could not load the Love Wall yet. Please refresh and try again.
      </p>
    `;
    console.error(error);
  }
}

function renderMemories() {
  updateHeroMemoryCounter();
  createAdminToolbar();
  stopGalleryAutoplay();
  selectedMemoryIds.forEach((memoryId) => {
    if (!memories.some((memory) => memory.id === memoryId)) {
      selectedMemoryIds.delete(memoryId);
    }
  });

  if (memories.length === 0) {
    memoryGallery?.classList.add("memory-gallery--empty");
    memoryGrid.classList.remove("memory-grid--floating");
    memoryGrid.innerHTML = "";
    memoryGrid.innerHTML = '<p class="wall-status">No memories have been shared yet.</p>';
    updateAdminSelectionUi();
    return;
  }

  memoryGallery?.classList.remove("memory-gallery--empty");
  memoryGrid.classList.add("memory-grid--floating");
  if (!getFloatingWallCanvas()) {
    memoryGrid.innerHTML = "";
    memoryGrid.append(createFloatingWallCanvas());
  }
  floatingWallBreakpoint = getFloatingWallMode();
  fillFloatingWall();
  observeMemoryCards();
  scheduleGalleryAutoplay(700);
  updateAdminSelectionUi();

  if (highlightedMemoryId) {
    window.setTimeout(() => {
      highlightedMemoryId = null;
      document.querySelectorAll(".memory-card.is-new").forEach((card) => {
        card.classList.remove("is-new");
      });
    }, 2000);
  }
}

function createMemoryCard(memory, index = 0, isClone = false) {
  const card = document.createElement("article");
  card.className = `memory-card${memory.id === highlightedMemoryId ? " is-new" : ""}`;
  card.dataset.memoryId = memory.id;
  card.tabIndex = -1;
  if (isClone) {
    card.dataset.clone = "true";
  }
  card.style.setProperty("--card-reveal-delay", `${Math.min(index * 70, 280)}ms`);
  if (revealedMemoryIds.has(memory.id)) {
    card.classList.add("is-visible");
  }
  const displayMessage = String(memory.message || "").slice(0, MESSAGE_LIMIT);
  card.innerHTML = `
    <div class="memory-card__image-frame">
      <img class="memory-card__image" src="${memory.image}" alt="Wedding memory shared by ${escapeHtml(memory.name)}" loading="lazy" decoding="async">
    </div>
    <div class="memory-card__body">
      <p class="memory-card__message">
        <span class="memory-card__message-text">${escapeHtml(displayMessage)}</span>
      </p>
      <div class="memory-card__attribution">
        <span class="memory-card__label">FROM:</span>
        <span class="memory-card__name">${escapeHtml(memory.name)}</span>
      </div>
    </div>
  `;
  if (isAdminMode) {
    const selectLabel = document.createElement("label");
    selectLabel.className = "memory-card__select";
    selectLabel.setAttribute("aria-label", `Select memory shared by ${memory.name}`);
    selectLabel.innerHTML = `
      <input class="memory-card__select-input" type="checkbox" value="${escapeHtml(memory.id)}">
      <span class="memory-card__select-box" aria-hidden="true"></span>
    `;
    selectLabel.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    selectLabel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    selectLabel.querySelector("input").addEventListener("change", (event) => {
      event.stopPropagation();
      toggleSelect(memory.id);
    });
    card.prepend(selectLabel);
  }
  card.querySelector("img").addEventListener("error", (event) => {
    event.currentTarget.src = FALLBACK_MEMORY_IMAGE;
  }, { once: true });
  return card;
}

function createFloatingWallCanvas() {
  const canvas = document.createElement("div");
  canvas.className = "floating-memory-wall";
  canvas.setAttribute("aria-label", "Floating shared memories");
  return canvas;
}

function getFloatingWallCanvas() {
  return memoryGrid.querySelector(".floating-memory-wall");
}

function getFloatingWallLimit() {
  if (window.matchMedia("(max-width: 559px)").matches) return FLOATING_WALL_LIMITS.mobile;
  if (window.matchMedia("(max-width: 920px)").matches) return FLOATING_WALL_LIMITS.tablet;
  return FLOATING_WALL_LIMITS.desktop;
}

function getFloatingWallMode() {
  if (window.matchMedia("(max-width: 559px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 920px)").matches) return "tablet";
  return "desktop";
}

function getFloatingWallSpacing() {
  const mode = getFloatingWallMode();
  if (mode === "mobile") {
    return {
      x: 14,
      y: 22
    };
  }
  if (mode === "tablet") {
    return {
      x: 30,
      y: 42
    };
  }
  return {
    x: 44,
    y: 48
  };
}

function getFloatingDisplayList(displayCount) {
  return Array.from({ length: displayCount }, (_, index) => ({
    memory: memories[index % memories.length],
    index,
    isClone: index >= memories.length
  }));
}

function fillFloatingWall() {
  const canvas = getFloatingWallCanvas();
  if (!canvas) return;

  const displayLimit = getFloatingWallLimit();
  const displayCount = Math.max(1, displayLimit);
  const displayList = getFloatingDisplayList(displayCount);
  const desiredLayoutKeys = new Set(displayList.map(({ memory, index, isClone }) => (
    getFloatingLayoutKey(memory, index, isClone)
  )));

  Array.from(canvas.querySelectorAll(".floating-memory-wall__item:not(.floating-memory-wall__item--probe)"))
    .forEach((item) => {
      if (!desiredLayoutKeys.has(item.dataset.layoutKey)) {
        item.remove();
      }
    });

  const missingItems = displayList.filter(({ memory, index, isClone }) => (
    !getFloatingItemByLayoutKey(canvas, getFloatingLayoutKey(memory, index, isClone))
  ));

  if (missingItems.length === 0) {
    displayList.forEach(({ memory, index, isClone }) => {
      const layoutKey = getFloatingLayoutKey(memory, index, isClone);
      const existingItem = getFloatingItemByLayoutKey(canvas, layoutKey);
      if (!existingItem) return;

      existingItem.dataset.floatIndex = String(index);
      existingItem.dataset.floatTotal = String(displayCount);
      syncFloatingItemLayout(existingItem);
    });
    return;
  }

  const probe = document.createElement("div");
  probe.className = "floating-memory-wall__item floating-memory-wall__item--probe";
  probe.append(createMemoryCard(memories[0], 0, true));
  canvas.append(probe);
  const { slots } = buildFloatingSlots(canvas, probe);
  probe.remove();

  const shuffledSlots = shuffleItems(slots);
  displayList.forEach(({ memory, index, isClone }) => {
    const layoutKey = getFloatingLayoutKey(memory, index, isClone);
    const existingItem = getFloatingItemByLayoutKey(canvas, layoutKey);
    if (existingItem) {
      existingItem.dataset.floatIndex = String(index);
      existingItem.dataset.floatTotal = String(displayCount);
      syncFloatingItemLayout(existingItem);
      return;
    }

    appendFloatingMemory(memory, {
      index,
      total: displayCount,
      slot: shuffledSlots[index % Math.max(1, shuffledSlots.length)],
      isClone,
      startBelow: index >= shuffledSlots.length
    });
  });
}

function getFloatingLayoutKey(memory, index = 0, isClone = false) {
  return isClone ? `${memory.id}-loop-${index}` : memory.id;
}

function getFloatingItemByLayoutKey(canvas, layoutKey) {
  return Array.from(canvas.querySelectorAll(".floating-memory-wall__item:not(.floating-memory-wall__item--probe)"))
    .find((item) => item.dataset.layoutKey === layoutKey);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function getFloatingItemBounds(item) {
  const card = item.querySelector(".memory-card");
  const cardRect = card?.getBoundingClientRect();
  const width = cardRect?.width || item.getBoundingClientRect().width || 302;
  const height = cardRect?.height || item.getBoundingClientRect().height || 410;
  return {
    width,
    height
  };
}

function getFloatingSafeArea(canvas, item) {
  const canvasRect = canvas.getBoundingClientRect();
  const { width: cardWidth, height: cardHeight } = getFloatingItemBounds(item);
  const mode = getFloatingWallMode();
  const sideMargin = mode === "mobile"
    ? Math.max(18, Math.min(28, canvasRect.width * 0.05))
    : Math.max(36, Math.min(64, canvasRect.width * 0.055));
  const topMargin = mode === "mobile" ? 320 : 158;
  const bottomMargin = mode === "mobile" ? 132 : 118;

  return {
    canvasRect,
    cardWidth,
    cardHeight,
    minX: sideMargin,
    maxX: Math.max(sideMargin, canvasRect.width - cardWidth - sideMargin),
    minY: topMargin,
    maxY: Math.max(topMargin, canvasRect.height - cardHeight - bottomMargin)
  };
}

function buildFloatingSlots(canvas, item) {
  const safeArea = getFloatingSafeArea(canvas, item);
  const spacing = getFloatingWallSpacing();
  const mode = getFloatingWallMode();
  const cellWidth = safeArea.cardWidth + spacing.x;
  const cellHeight = safeArea.cardHeight + spacing.y;
  const availableWidth = Math.max(0, safeArea.maxX - safeArea.minX);
  const availableHeight = Math.max(cellHeight, safeArea.maxY - safeArea.minY + safeArea.cardHeight);
  const possibleColumnCount = Math.max(1, Math.floor((availableWidth + spacing.x) / cellWidth) + 1);
  const columnCount = mode === "mobile"
    ? Math.min(2, possibleColumnCount)
    : Math.min(mode === "tablet" ? 3 : 5, possibleColumnCount);
  const rowCount = Math.max(1, Math.floor(availableHeight / cellHeight));
  const usableX = Math.max(0, safeArea.maxX - safeArea.minX);
  const usableY = Math.max(0, safeArea.maxY - safeArea.minY);
  const slots = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const columnRatio = columnCount === 1 ? 0.5 : column / (columnCount - 1);
      const rowRatio = rowCount === 1 ? 0.5 : row / (rowCount - 1);
      slots.push({
        column,
        row,
        x: safeArea.minX + usableX * columnRatio,
        y: safeArea.minY + usableY * rowRatio
      });
    }
  }

  return {
    slots: shuffleItems(slots),
    safeArea,
    spacing
  };
}

function rectsOverlap(firstRect, secondRect) {
  return !(
    firstRect.right < secondRect.left ||
    firstRect.left > secondRect.right ||
    firstRect.bottom < secondRect.top ||
    firstRect.top > secondRect.bottom
  );
}

function getPlacedFloatingRects(excludedItem) {
  const canvas = getFloatingWallCanvas();
  if (!canvas) return [];

  return Array.from(canvas.querySelectorAll(".floating-memory-wall__item"))
    .filter((item) => item !== excludedItem)
    .map((item) => {
      const x = Number(item.dataset.x);
      const y = Number(item.dataset.y);
      const { width, height } = getFloatingItemBounds(item);
      return {
        left: x,
        top: y,
        right: x + width,
        bottom: y + height
      };
    })
    .filter((rect) => Number.isFinite(rect.left) && Number.isFinite(rect.top));
}

function chooseFloatingPosition(item, options = {}) {
  const canvas = getFloatingWallCanvas();
  if (!canvas) return { x: 0, y: 0 };

  const { slots, safeArea, spacing } = buildFloatingSlots(canvas, item);
  const index = Number(item.dataset.floatIndex || 0);
  const mode = getFloatingWallMode();
  const orderedSlots = slots.length ? slots : [{ column: 0, row: 0, x: safeArea.minX, y: safeArea.minY }];
  const mobileHorizontalRange = Math.max(0, safeArea.maxX - safeArea.minX);
  const jitterX = mode === "mobile" ? mobileHorizontalRange * 0.5 : spacing.x * 0.52;
  const jitterY = mode === "mobile" ? spacing.y * 0.82 : spacing.y * 0.46;

  if (!options.startBelow && options.slot) {
    const x = getFloatingVisualX(item, options.slot.x, safeArea, spacing);
    const y = Math.max(
      safeArea.minY,
      Math.min(safeArea.maxY, options.slot.y + randomBetween(-jitterY, jitterY))
    );
    return {
      x,
      y,
      column: options.slot.column
    };
  }

  if (options.startBelow) {
    const visibleBottom = getFloatingVisibleBottom(canvas, safeArea);
    const columns = [...new Set(orderedSlots.map((slot) => slot.column))];
    const candidateColumns = shuffleItems(columns.length ? columns : [0])
      .map((column) => {
        const slot = shuffleItems(orderedSlots.filter((currentSlot) => currentSlot.column === column))[0] || orderedSlots[0];
        const columnItems = Array.from(canvas.querySelectorAll(".floating-memory-wall__item"))
          .filter((otherItem) => otherItem !== item && Number(otherItem.dataset.floatColumn) === slot.column);
        const columnBottom = columnItems.reduce((bottom, otherItem) => {
          const y = Number(otherItem.dataset.y);
          if (!Number.isFinite(y)) return bottom;
          const { height } = getFloatingItemBounds(otherItem);
          return Math.max(bottom, y + height);
        }, visibleBottom - spacing.y);
        return {
          slot,
          columnBottom
        };
      })
      .sort((firstColumn, secondColumn) => firstColumn.columnBottom - secondColumn.columnBottom);
    const { slot: candidateSlot, columnBottom } = candidateColumns[0];
    const x = getFloatingVisualX(item, candidateSlot.x, safeArea, spacing);
    const belowY = Math.max(
      visibleBottom + randomBetween(spacing.y * 0.25, spacing.y * 0.9),
      columnBottom + spacing.y + randomBetween(0, jitterY * 0.7)
    );
    return {
      x,
      y: belowY,
      column: candidateSlot.column
    };
  }

  for (let attempt = 0; attempt < orderedSlots.length; attempt += 1) {
    const slot = orderedSlots[(index + attempt) % orderedSlots.length];
    const x = getFloatingVisualX(item, slot.x, safeArea, spacing);
    const y = Math.max(safeArea.minY, Math.min(safeArea.maxY, slot.y + randomBetween(-jitterY, jitterY)));
    const candidateRect = {
      left: x,
      top: y,
      right: x + safeArea.cardWidth,
      bottom: y + safeArea.cardHeight
    };

    if (!getPlacedFloatingRects(item).some((rect) => rectsOverlap(candidateRect, rect))) {
      return {
        x,
        y,
        column: slot.column
      };
    }
  }

  const fallbackSlot = orderedSlots[index % orderedSlots.length];

  return {
    x: Math.max(safeArea.minX, Math.min(safeArea.maxX, fallbackSlot.x)),
    y: Math.max(safeArea.minY, Math.min(safeArea.maxY, fallbackSlot.y)),
    column: fallbackSlot.column
  };
}

function getFloatingVisualX(item, slotX, safeArea, spacing) {
  const mode = getFloatingWallMode();
  const minX = safeArea.minX;
  const maxX = safeArea.maxX;
  const usableX = Math.max(0, maxX - minX);
  const index = Number(item.dataset.floatIndex || 0);

  if (mode === "mobile" && usableX > 20) {
    const anchors = [0.08, 0.82, 0.45, 0.2, 0.68, 0.34, 0.92, 0.56];
    const anchor = anchors[index % anchors.length];
    const jitter = Math.min(usableX * 0.1, 14);
    return Math.max(minX, Math.min(maxX, minX + usableX * anchor + randomBetween(-jitter, jitter)));
  }

  const jitterX = spacing.x * 0.52;
  return Math.max(minX, Math.min(maxX, slotX + randomBetween(-jitterX, jitterX)));
}

function getFloatingVisibleBottom(canvas, safeArea) {
  const canvasRect = safeArea?.canvasRect || canvas.getBoundingClientRect();
  const viewportBottom = window.innerHeight - canvasRect.top;
  const visibleBottom = Math.max(0, Math.min(canvasRect.height, viewportBottom));
  return Math.max(visibleBottom, Math.min(canvasRect.height, window.innerHeight * 0.72));
}

function applyFloatingPlacement(item, options = {}) {
  const canvas = getFloatingWallCanvas();
  if (!canvas) return;

  const mode = getFloatingWallMode();
  const layoutKey = item.dataset.layoutKey || item.dataset.memoryId;
  const cachedLayout = floatingLayoutCache.get(layoutKey);
  if (cachedLayout && cachedLayout.sizeVariant === mode && !options.regenerate) {
    applyFloatingLayout(item, cachedLayout);
    return;
  }

  const { x, y, column } = chooseFloatingPosition(item, options);
  const rotationLimit = FLOATING_WALL_ROTATION[mode];
  const rotation = randomBetween(-rotationLimit, rotationLimit);
  const speed = randomBetween(FLOATING_WALL_SPEED.min, FLOATING_WALL_SPEED.max);
  const delay = Math.min(Number(item.dataset.floatIndex || 0) * 70, 280);
  const layout = {
    x,
    y,
    rotation,
    speed,
    delay,
    lane: column,
    sizeVariant: mode
  };
  floatingLayoutCache.set(layoutKey, layout);
  applyFloatingLayout(item, layout);
}

function applyCachedFloatingLayout(item) {
  const layoutKey = item.dataset.layoutKey || item.dataset.memoryId;
  const cachedLayout = floatingLayoutCache.get(layoutKey);
  if (cachedLayout) {
    applyFloatingLayout(item, cachedLayout);
  }
}

function syncFloatingItemLayout(item) {
  const layoutKey = item.dataset.layoutKey || item.dataset.memoryId;
  const cachedLayout = floatingLayoutCache.get(layoutKey);
  if (!cachedLayout) {
    applyFloatingPlacement(item);
    return;
  }

  if (cachedLayout.sizeVariant !== getFloatingWallMode()) {
    applyFloatingPlacement(item, { regenerate: true });
    return;
  }

  applyFloatingLayout(item, cachedLayout);
}

function applyFloatingLayout(item, layout) {
  item.dataset.x = String(layout.x);
  item.dataset.y = String(layout.y);
  item.dataset.floatColumn = String(layout.lane);
  item.dataset.rotation = String(layout.rotation);
  item.dataset.speed = String(layout.speed);
  item.style.transform = `translate3d(${layout.x}px, ${layout.y}px, 0) rotate(${layout.rotation}deg)`;
  item.querySelector(".memory-card")?.style.setProperty("--card-reveal-delay", `${layout.delay}ms`);
}

function updateFloatingLayoutCache(item, updates) {
  const layoutKey = item.dataset.layoutKey || item.dataset.memoryId;
  const cachedLayout = floatingLayoutCache.get(layoutKey);
  if (!cachedLayout) return;

  floatingLayoutCache.set(layoutKey, {
    ...cachedLayout,
    ...updates
  });
}

function appendFloatingMemory(memory, options = {}) {
  const canvas = getFloatingWallCanvas();
  if (!canvas) return null;

  const item = document.createElement("div");
  item.className = "floating-memory-wall__item";
  item.dataset.memoryId = memory.id;
  item.dataset.layoutKey = getFloatingLayoutKey(memory, options.index || 0, options.isClone);
  item.dataset.floatIndex = String(options.index || 0);
  item.dataset.floatTotal = String(options.total || getFloatingWallLimit());
  if (options.isClone) {
    item.dataset.clone = "true";
  }
  item.append(createMemoryCard(memory, options.index || 0, options.isClone));
  canvas.append(item);
  applyFloatingPlacement(item, {
    slot: options.slot,
    startBelow: options.startBelow,
    regenerate: options.regenerate
  });
  return item;
}

function addMemoryToWall(memory) {
  if (memories.some((existingMemory) => existingMemory.id === memory.id)) return;

  totalMemoryCount += 1;
  memories.unshift(memory);
  memories = memories.slice(0, HOMEPAGE_MEMORY_PREVIEW_LIMIT);
  highlightedMemoryId = memory.id;
  revealedMemoryIds.delete(memory.id);
  updateHeroMemoryCounter();

  const canvas = getFloatingWallCanvas();
  if (!canvas || memories.length === 1) {
    renderMemories();
    return;
  }

  const visibleLimit = getFloatingWallLimit();
  const visibleItems = canvas.querySelectorAll(".floating-memory-wall__item");
  if (visibleItems.length >= visibleLimit) {
    visibleItems[visibleItems.length - 1].remove();
  }
  const item = appendFloatingMemory(memory, {
    index: 0,
    total: visibleLimit,
    startBelow: true,
    regenerate: true
  });
  item?.querySelector(".memory-card")?.classList.add("is-visible");
  updateAdminSelectionUi();

  window.setTimeout(() => {
    highlightedMemoryId = null;
    document.querySelectorAll(".memory-card.is-new").forEach((card) => {
      card.classList.remove("is-new");
    });
  }, 2000);
}

function canAutoplayGallery() {
  return !reduceMotionQuery.matches && memoryGrid.querySelectorAll(".floating-memory-wall__item").length > 1;
}

function stopGalleryAutoplay() {
  if (galleryAutoplayFrame) {
    cancelAnimationFrame(galleryAutoplayFrame);
    galleryAutoplayFrame = null;
  }

  if (galleryResumeTimer) {
    window.clearTimeout(galleryResumeTimer);
    galleryResumeTimer = null;
  }

  memoryGrid.querySelector(".floating-memory-wall")?.classList.remove("is-floating");
}

function runGalleryAutoplay() {
  if (!canAutoplayGallery()) {
    galleryAutoplayFrame = null;
    return;
  }

  const canvas = getFloatingWallCanvas();
  if (!canvas) {
    galleryAutoplayFrame = null;
    return;
  }

  canvas.classList.add("is-floating");
  const elapsed = performance.now() - galleryAutoplayStartedAt;
  const speedRamp = Math.min(1, Math.max(0.24, elapsed / 1200));

  const movingItems = Array.from(canvas.querySelectorAll(".floating-memory-wall__item"));
  movingItems.forEach((item) => {
    let y = Number(item.dataset.y || 0);
    const x = Number(item.dataset.x || 0);
    const rotation = Number(item.dataset.rotation || 0);
    const speed = Number(item.dataset.speed || FLOATING_WALL_SPEED.min) * speedRamp;
    const cardHeight = item.querySelector(".memory-card")?.getBoundingClientRect().height || 410;
    y -= speed;

    if (y < -cardHeight - FLOATING_WALL_CARD_GAP) {
      applyFloatingPlacement(item, {
        startBelow: true,
        regenerate: true
      });
      return;
    }

    item.dataset.y = String(y);
    item.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
    updateFloatingLayoutCache(item, { y });
  });

  keepFloatingColumnsSeparated(canvas);

  galleryAutoplayFrame = requestAnimationFrame(runGalleryAutoplay);
}

function keepFloatingColumnsSeparated(canvas) {
  const spacing = getFloatingWallSpacing();
  const columns = new Map();
  Array.from(canvas.querySelectorAll(".floating-memory-wall__item")).forEach((item) => {
    const column = item.dataset.floatColumn || "0";
    const columnItems = columns.get(column) || [];
    columnItems.push(item);
    columns.set(column, columnItems);
  });

  columns.forEach((columnItems) => {
    columnItems
      .sort((firstItem, secondItem) => Number(firstItem.dataset.y || 0) - Number(secondItem.dataset.y || 0))
      .forEach((item, index, sortedItems) => {
        if (index === 0) return;

        const previousItem = sortedItems[index - 1];
        const previousY = Number(previousItem.dataset.y || 0);
        const previousHeight = getFloatingItemBounds(previousItem).height;
        const minimumY = previousY + previousHeight + spacing.y;
        const currentY = Number(item.dataset.y || 0);
        if (currentY >= minimumY) return;

        const x = Number(item.dataset.x || 0);
        const rotation = Number(item.dataset.rotation || 0);
        item.dataset.y = String(minimumY);
        item.style.transform = `translate3d(${x}px, ${minimumY}px, 0) rotate(${rotation}deg)`;
        updateFloatingLayoutCache(item, { y: minimumY });
      });
  });
}

function scheduleGalleryAutoplay(delay = 2400) {
  stopGalleryAutoplay();
  if (!canAutoplayGallery()) return;

  galleryResumeTimer = window.setTimeout(() => {
    galleryAutoplayStartedAt = performance.now();
    galleryAutoplayFrame = requestAnimationFrame(runGalleryAutoplay);
  }, delay);
}

function subscribeToRealtimeMemories() {
  supabase
    .channel("voyage-wall-memories")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: MEMORY_TABLE
      },
      (payload) => {
        addMemoryToWall(mapSupabaseMemory(payload.new));
      }
    )
    .subscribe((status, error) => {
      if (error) {
        console.error("[Voyage Wall] Supabase realtime subscription error.", error);
        return;
      }
    });
}

function observeMemoryCards() {
  const cards = memoryGrid.querySelectorAll(".memory-card:not(.is-visible)");

  if (reduceMotionQuery.matches || !("IntersectionObserver" in window)) {
    cards.forEach((card) => {
      card.classList.add("is-visible");
      revealedMemoryIds.add(card.dataset.memoryId);
    });
    return;
  }

  if (!memoryRevealObserver) {
    memoryRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const card = entry.target;
        card.classList.add("is-visible");
        revealedMemoryIds.add(card.dataset.memoryId);
        memoryRevealObserver.unobserve(card);
      });
    }, {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    });
  }

  cards.forEach((card) => memoryRevealObserver.observe(card));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setError(target, message) {
  target.textContent = message;
}

function setIdentityChoiceError(hasError) {
  nameField.classList.toggle("has-error", hasError);
  document.querySelector(".anonymous-toggle")?.classList.toggle("has-error", hasError);
}

function focusFormIssue(target) {
  target?.focus({ preventScroll: true });
  target?.scrollIntoView({
    behavior: reduceMotionQuery.matches ? "auto" : "smooth",
    block: "center"
  });
}

function scrollToWall() {
  document.querySelector("#wall").scrollIntoView({
    behavior: reduceMotionQuery.matches ? "auto" : "smooth"
  });
}

function scrollToMemory(memoryId) {
  const card = Array.from(memoryGrid.querySelectorAll(".memory-card"))
    .find((memoryCard) => memoryCard.dataset.memoryId === memoryId);
  if (!card) {
    scrollToWall();
    return;
  }

  card.scrollIntoView({
    behavior: reduceMotionQuery.matches ? "auto" : "smooth",
    block: "nearest",
    inline: "center"
  });
  card.focus({ preventScroll: true });
}

function syncBodyDialogState() {
  document.body.classList.toggle("is-dialog-open", sourceDialog.open || shareDialog.open);
}

function showShareForm() {
  successPanel.classList.add("is-hidden");
  form.classList.remove("is-hidden");
}

function openSourceDialog(event) {
  event?.preventDefault();

  if (!sourceDialog.open) {
    sourceDialog.classList.remove("is-closing");
    sourceDialog.showModal();
    syncBodyDialogState();
  }
}

function closeSourceDialog() {
  closeModalWithAnimation(sourceDialog);
}

function openShareDialog(event) {
  event?.preventDefault();
  photoInput.removeAttribute("capture");

  if (!shareDialog.open) {
    shareDialog.classList.remove("is-closing");
    showShareForm();
    shareDialog.showModal();
    syncBodyDialogState();
  }
}

function choosePhotoSource(useCamera) {
  sourceSelectionPending = true;
  photoInput.value = "";

  if (useCamera) {
    photoInput.setAttribute("capture", "environment");
  } else {
    photoInput.removeAttribute("capture");
  }

  photoInput.click();

  if (sourceDialog.open) {
    sourceDialog.close();
    syncBodyDialogState();
  }
}

function closeShareDialog() {
  closeModalWithAnimation(shareDialog);
}

function resetFormState() {
  form.reset();
  if (selectedPhoto) {
    URL.revokeObjectURL(selectedPhoto);
  }
  selectedPhoto = null;
  selectedPhotoFile = null;
  selectedPhotoName = "";
  previewImage.removeAttribute("src");
  previewCard.classList.add("is-hidden");
  uploadCard.classList.remove("is-hidden");
  messageCount.textContent = "0";
  setError(photoError, "");
  setError(messageError, "");
  setError(nameError, "");
  photoInput.removeAttribute("aria-invalid");
  messageInput.removeAttribute("aria-invalid");
  nameInput.removeAttribute("aria-invalid");
  setIdentityChoiceError(false);
  submitMemory.removeAttribute("aria-busy");
  syncAnonymousField();
}

function handlePhotoFile(file) {
  setError(photoError, "");
  photoInput.removeAttribute("aria-invalid");
  photoInput.removeAttribute("capture");

  if (!file) {
    sourceSelectionPending = false;
    return;
  }
  if (!isSupportedPhotoFile(file)) {
    setError(photoError, "Please choose a photo file.");
    if (sourceSelectionPending) {
      openShareDialog();
    }
    sourceSelectionPending = false;
    return;
  }

  if (selectedPhoto) {
    URL.revokeObjectURL(selectedPhoto);
  }
  selectedPhoto = URL.createObjectURL(file);
  selectedPhotoFile = file;
  selectedPhotoName = file.name;
  previewImage.src = selectedPhoto;
  previewName.textContent = selectedPhotoName;
  previewCard.classList.remove("is-hidden");
  uploadCard.classList.add("is-hidden");

  if (sourceSelectionPending) {
    sourceSelectionPending = false;
    openShareDialog();
  }
}

photoInput.addEventListener("change", () => {
  handlePhotoFile(photoInput.files?.[0]);
});

replacePhoto.addEventListener("click", () => {
  photoInput.click();
});

["dragenter", "dragover"].forEach((eventName) => {
  uploadCard.addEventListener(eventName, (event) => {
    event.preventDefault();
  });
});

uploadCard.addEventListener("drop", (event) => {
  event.preventDefault();
  handlePhotoFile(event.dataTransfer?.files?.[0]);
});

messageInput.addEventListener("input", () => {
  if (messageInput.value.length > MESSAGE_LIMIT) {
    messageInput.value = messageInput.value.slice(0, MESSAGE_LIMIT);
  }

  messageCount.textContent = String(messageInput.value.length);
  if (messageInput.value.trim()) {
    setError(messageError, "");
    messageInput.removeAttribute("aria-invalid");
  }
});

nameInput.addEventListener("input", () => {
  if (nameInput.value.trim()) {
    setError(nameError, "");
    nameInput.removeAttribute("aria-invalid");
    setIdentityChoiceError(false);
  }
});

function syncAnonymousField() {
  const isAnonymous = anonymousInput.checked;
  nameField.classList.toggle("is-hidden", isAnonymous);
  nameInput.disabled = isAnonymous;
  if (isAnonymous) {
    nameInput.value = "";
    setError(nameError, "");
    setIdentityChoiceError(false);
  }
}

anonymousInput.addEventListener("change", syncAnonymousField);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!submissionsOpen) {
    setError(photoError, "Sharing is currently closed for this event.");
    return;
  }

  const message = messageInput.value.trim();
  const name = nameInput.value.trim();
  const anonymous = anonymousInput.checked;
  let isValid = true;
  let firstInvalidTarget = null;

  if (!selectedPhotoFile) {
    setError(photoError, "Please add a photo before sharing.");
    photoInput.setAttribute("aria-invalid", "true");
    firstInvalidTarget ||= uploadCard;
    isValid = false;
  } else {
    setError(photoError, "");
    photoInput.removeAttribute("aria-invalid");
  }

  if (!message) {
    setError(messageError, "Please write a short message for the couple.");
    messageInput.setAttribute("aria-invalid", "true");
    firstInvalidTarget ||= messageInput;
    isValid = false;
  } else if (message.length > MESSAGE_LIMIT) {
    setError(messageError, `Please keep your message to ${MESSAGE_LIMIT} characters.`);
    messageInput.setAttribute("aria-invalid", "true");
    firstInvalidTarget ||= messageInput;
    isValid = false;
  } else {
    setError(messageError, "");
    messageInput.removeAttribute("aria-invalid");
  }

  if (!anonymous && !name) {
    setError(nameError, "Add your name, or choose Share anonymously to post as A guest.");
    setIdentityChoiceError(true);
    nameInput.setAttribute("aria-invalid", "true");
    firstInvalidTarget ||= nameInput;
    isValid = false;
  } else {
    setError(nameError, "");
    setIdentityChoiceError(false);
    nameInput.removeAttribute("aria-invalid");
  }

  if (!isValid) {
    focusFormIssue(firstInvalidTarget);
    return;
  }

  submitMemory.disabled = true;
  submitMemory.setAttribute("aria-busy", "true");
  submitMemory.textContent = "Adding this to the wall...";

  try {
    const photoVersions = await uploadPhotoVersions(selectedPhotoFile);
    const memory = await insertMemory({
      original_image_url: photoVersions.original_image_url,
      optimized_image_url: photoVersions.optimized_image_url,
      message,
      name: anonymous ? null : name,
      anonymous
    });

    addMemoryToWall(memory);
    resetFormState();
    form.classList.add("is-hidden");
    successPanel.classList.remove("is-hidden");
    window.setTimeout(() => {
      closeShareDialog();
      scrollToMemory(memory.id);
    }, reduceMotionQuery.matches ? 0 : 900);
  } catch (error) {
    setError(photoError, "This memory could not be shared yet. Please try again.");
    console.error("[Voyage Wall] Memory submit flow failed.", error);
  } finally {
    submitMemory.disabled = false;
    submitMemory.removeAttribute("aria-busy");
    submitMemory.textContent = "Share to the Love Wall";
  }
});

shareAnother.addEventListener("click", () => {
  showShareForm();
});

openShareButtons.forEach((button) => {
  button.addEventListener("click", openSourceDialog);
});

smoothScrollLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId?.startsWith("#")) return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotionQuery.matches ? "auto" : "smooth",
      block: "start"
    });
  });
});

shareDialogClose.addEventListener("click", closeShareDialog);

takePhoto.addEventListener("click", () => choosePhotoSource(true));
uploadGallery.addEventListener("click", () => choosePhotoSource(false));
sourceDialogClose.addEventListener("click", closeSourceDialog);

sourceDialog.addEventListener("click", (event) => {
  if (event.target === sourceDialog) {
    closeSourceDialog();
  }
});

sourceDialog.addEventListener("close", syncBodyDialogState);

sourceDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeSourceDialog();
});

shareDialog.addEventListener("click", (event) => {
  if (event.target === shareDialog) {
    closeShareDialog();
  }
});

shareDialog.addEventListener("close", syncBodyDialogState);

shareDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeShareDialog();
});

viewWallAfterSubmit.addEventListener("click", () => {
  closeShareDialog();
  scrollToWall();
});

syncAnonymousField();

window.addEventListener("scroll", () => {
  const showFloatingShare = window.scrollY > window.innerHeight * 0.78;
  floatingShare.classList.toggle("is-visible", showFloatingShare);
}, { passive: true });

window.addEventListener("resize", () => {
  if (floatingWallResizeTimer) {
    window.clearTimeout(floatingWallResizeTimer);
  }
  floatingWallResizeTimer = window.setTimeout(() => {
    const nextBreakpoint = getFloatingWallMode();
    const breakpointChanged = floatingWallBreakpoint && nextBreakpoint !== floatingWallBreakpoint;
    floatingWallViewportWidth = window.innerWidth;
    floatingWallViewportHeight = window.innerHeight;

    if (memories.length > 0 && getFloatingWallCanvas() && breakpointChanged) {
      floatingLayoutCache.clear();
      renderMemories();
    }
  }, 180);
}, { passive: true });

reduceMotionQuery.addEventListener?.("change", () => {
  if (memories.length > 0 && getFloatingWallCanvas()) {
    floatingLayoutCache.clear();
    renderMemories();
  }
});

if (reduceMotionQuery.matches) {
  revealSections.forEach((section) => section.classList.add("is-visible"));
} else if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealSections.forEach((section) => revealObserver.observe(section));
} else {
  revealSections.forEach((section) => section.classList.add("is-visible"));
}

loadMemories();
subscribeToRealtimeMemories();

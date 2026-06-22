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
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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
let galleryPointerStartX = 0;
let galleryPointerScrollLeft = 0;
let activeGalleryRow = null;
let isGalleryDragging = false;
let didGalleryDrag = false;
let galleryAutoplayStartedAt = 0;
const GALLERY_AUTOPLAY_SPEED = 0.45;
const GALLERY_RESUME_RAMP_MS = 900;

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

function updateHeroMemoryCounter() {
  const counterTarget = heroMemoryCounterText || heroMemoryCounter;
  if (!counterTarget) return;

  const count = memories.length;
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

  return {
    id: String(row.id),
    image: row.photo_url || FALLBACK_MEMORY_IMAGE,
    photo_url: row.photo_url,
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

function getFileExtension(file) {
  const nameExtension = file.name.split(".").pop();
  if (nameExtension && nameExtension !== file.name) return nameExtension.toLowerCase();
  return file.type.split("/").pop() || "jpg";
}

function createUniquePhotoPath(file) {
  const extension = getFileExtension(file);
  const uniqueId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `public/${uniqueId}.${extension}`;
}

function isSupportedPhotoFile(file) {
  const allowedExtensions = ["heic", "heif", "jpeg", "jpg", "png", "webp"];
  const extension = getFileExtension(file);
  return file.type.startsWith("image/") || allowedExtensions.includes(extension);
}

async function uploadPhoto(file) {
  const filePath = createUniquePhotoPath(file);

  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (error) {
    console.error("[Voyage Wall] Supabase photo upload failed.", {
      bucket: PHOTO_BUCKET,
      path: filePath,
      error
    });
    throw new Error(`Storage upload failed: ${error.message || "Photo upload failed."}`);
  }

  const photoUrl = publicStorageUrl(data.path);
  return photoUrl;
}

async function insertMemory(memoryPayload) {
  const allowedInsertPayload = {
    photo_url: memoryPayload.photo_url,
    message: memoryPayload.message,
    name: memoryPayload.name,
    anonymous: memoryPayload.anonymous
  };

  const { data, error } = await supabase
    .from(MEMORY_TABLE)
    .insert(allowedInsertPayload)
    .select("id, photo_url, message, name, anonymous, created_at")
    .single();

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
  memoryGrid.innerHTML = '<p class="wall-status">Loading shared memories...</p>';

  try {
    const { data, error } = await supabase
      .from(MEMORY_TABLE)
      .select("id, photo_url, message, name, anonymous, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Voyage Wall] Supabase memory load failed.", {
        table: MEMORY_TABLE,
        error
      });
      throw new Error(error.message || "Could not load memories.");
    }

    memories = (data || []).map(mapSupabaseMemory);
    renderMemories();
  } catch (error) {
    memoryGrid.innerHTML = `
      <p class="wall-status wall-status--error">
        We could not load the Love Wall yet. Please refresh and try again.
      </p>
    `;
    console.error(error);
  }
}

function renderMemories() {
  memoryGrid.innerHTML = "";
  updateHeroMemoryCounter();

  if (memories.length === 0) {
    memoryGrid.innerHTML = '<p class="wall-status">No memories have been shared yet.</p>';
    stopGalleryAutoplay();
    return;
  }

  const shouldDuplicateRows = memories.length > 4;
  const memoryRows = [
    {
      className: "memory-row memory-row--primary",
      direction: "1",
      memories: memories.filter((_, index) => index % 3 === 0)
    },
    {
      className: "memory-row memory-row--secondary",
      direction: "-1",
      memories: memories.filter((_, index) => index % 3 === 1)
    },
    {
      className: "memory-row memory-row--tertiary",
      direction: "1",
      memories: memories.filter((_, index) => index % 3 === 2)
    }
  ].filter((rowConfig) => rowConfig.memories.length > 0);

  const appendMemoryCard = (row, memory, index, isClone = false) => {
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
    card.innerHTML = `
      <img src="${memory.image}" alt="Wedding memory shared by ${escapeHtml(memory.name)}" loading="lazy" decoding="async">
      <div class="memory-card__body">
        <p>${escapeHtml(memory.message)}</p>
        <span class="memory-card__name">${escapeHtml(memory.name)}</span>
      </div>
    `;
    card.querySelector("img").addEventListener("error", (event) => {
      event.currentTarget.src = FALLBACK_MEMORY_IMAGE;
    }, { once: true });
    row.append(card);
  };

  const rows = memoryRows.map((rowConfig) => {
    const row = document.createElement("div");
    row.className = rowConfig.className;
    row.dataset.direction = rowConfig.direction;
    memoryGrid.append(row);
    rowConfig.memories.forEach((memory, index) => appendMemoryCard(row, memory, index));
    return { element: row, memories: rowConfig.memories };
  });

  if (shouldDuplicateRows) {
    [1, 2].forEach(() => {
      rows.forEach(({ element, memories: rowMemories }) => {
        rowMemories.forEach((memory, index) => appendMemoryCard(element, memory, index, true));
      });
    });
  }

  requestAnimationFrame(() => {
    rows.forEach(({ element }, index) => {
      const isReverseRow = element.dataset.direction === "-1";
      const loopWidth = getRowLoopWidth(element);
      element.scrollLeft = shouldDuplicateRows && isReverseRow ? loopWidth : 0;
      element.dataset.scrollPosition = String(element.scrollLeft);
    });
  });
  observeMemoryCards();
  scheduleGalleryAutoplay(700);

  if (highlightedMemoryId) {
    window.setTimeout(() => {
      highlightedMemoryId = null;
      document.querySelectorAll(".memory-card.is-new").forEach((card) => {
        card.classList.remove("is-new");
      });
    }, 2000);
  }
}

function addMemoryToWall(memory) {
  if (memories.some((existingMemory) => existingMemory.id === memory.id)) return;

  memories.unshift(memory);
  highlightedMemoryId = memory.id;
  revealedMemoryIds.delete(memory.id);
  renderMemories();
}

function canAutoplayGallery() {
  return !reduceMotionQuery.matches && memoryGrid.querySelectorAll('.memory-card:not([data-clone="true"])').length > 4;
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

  memoryGrid.querySelectorAll(".memory-row.is-autoplaying").forEach((row) => {
    row.classList.remove("is-autoplaying");
  });
}

function runGalleryAutoplay() {
  if (!canAutoplayGallery() || isGalleryDragging) {
    galleryAutoplayFrame = null;
    return;
  }

  const rows = Array.from(memoryGrid.querySelectorAll(".memory-row"));
  if (!rows.some((row) => row.scrollWidth - row.clientWidth > 24)) {
    galleryAutoplayFrame = null;
    return;
  }

  rows.forEach((row) => {
    const loopWidth = getRowLoopWidth(row);
    if (loopWidth <= row.clientWidth + 24) return;

    const direction = Number(row.dataset.direction || "1");
    let scrollPosition = Number(row.dataset.scrollPosition || row.scrollLeft);
    const elapsed = performance.now() - galleryAutoplayStartedAt;
    const speedRamp = Math.min(1, Math.max(0.18, elapsed / GALLERY_RESUME_RAMP_MS));
    const frameSpeed = GALLERY_AUTOPLAY_SPEED * speedRamp;
    row.classList.add("is-autoplaying");
    scrollPosition += frameSpeed * direction;

    if (direction > 0 && scrollPosition >= loopWidth) {
      scrollPosition -= loopWidth;
    } else if (direction < 0 && scrollPosition <= 0) {
      scrollPosition += loopWidth;
    }

    row.dataset.scrollPosition = String(scrollPosition);
    row.scrollLeft = scrollPosition;
  });

  galleryAutoplayFrame = requestAnimationFrame(runGalleryAutoplay);
}

function getRowLoopWidth(row) {
  const firstClone = row.querySelector('[data-clone="true"]');
  if (!firstClone || !row.firstElementChild) return 0;
  return firstClone.offsetLeft - row.firstElementChild.offsetLeft;
}

function scheduleGalleryAutoplay(delay = 2400) {
  stopGalleryAutoplay();
  if (!canAutoplayGallery()) return;

  galleryResumeTimer = window.setTimeout(() => {
    memoryGrid.querySelectorAll(".memory-row").forEach((row) => {
      row.dataset.scrollPosition = String(row.scrollLeft);
    });
    galleryAutoplayStartedAt = performance.now();
    galleryAutoplayFrame = requestAnimationFrame(runGalleryAutoplay);
  }, delay);
}

function pauseGalleryAutoplay(delay = 2400) {
  stopGalleryAutoplay();
  scheduleGalleryAutoplay(delay);
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

function beginGalleryDrag(event) {
  if (event.pointerType === "touch") {
    pauseGalleryAutoplay();
    return;
  }

  if (event.button !== undefined && event.button !== 0) return;
  const row = event.target.closest(".memory-row");
  if (!row) return;

  isGalleryDragging = true;
  didGalleryDrag = false;
  activeGalleryRow = row;
  galleryPointerStartX = event.clientX;
  galleryPointerScrollLeft = activeGalleryRow.scrollLeft;
  activeGalleryRow.dataset.scrollPosition = String(activeGalleryRow.scrollLeft);
  activeGalleryRow.classList.add("is-dragging");
  activeGalleryRow.setPointerCapture?.(event.pointerId);
  pauseGalleryAutoplay();
}

function moveGalleryDrag(event) {
  if (!isGalleryDragging || !activeGalleryRow) return;

  const deltaX = event.clientX - galleryPointerStartX;
  if (Math.abs(deltaX) > 5) {
    didGalleryDrag = true;
  }

  activeGalleryRow.scrollLeft = galleryPointerScrollLeft - deltaX;
  activeGalleryRow.dataset.scrollPosition = String(activeGalleryRow.scrollLeft);
}

function endGalleryDrag(event) {
  if (!isGalleryDragging) return;

  isGalleryDragging = false;
  activeGalleryRow?.classList.remove("is-dragging");
  activeGalleryRow?.releasePointerCapture?.(event.pointerId);
  activeGalleryRow = null;
  window.setTimeout(() => {
    didGalleryDrag = false;
  }, 0);
  scheduleGalleryAutoplay();
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
  submitMemory.removeAttribute("aria-busy");
  syncAnonymousField();
}

function handlePhotoFile(file) {
  setError(photoError, "");
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
  }
});

function syncAnonymousField() {
  const isAnonymous = anonymousInput.checked;
  nameField.classList.toggle("is-hidden", isAnonymous);
  nameInput.disabled = isAnonymous;
  if (isAnonymous) {
    nameInput.value = "";
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
  const name = nameInput.value.trim() || "A guest";
  let isValid = true;

  if (!selectedPhotoFile) {
    setError(photoError, "Please add a photo before sharing.");
    isValid = false;
  } else {
    setError(photoError, "");
  }

  if (!message) {
    setError(messageError, "Please write a short message for the couple.");
    isValid = false;
  } else if (message.length > MESSAGE_LIMIT) {
    setError(messageError, `Please keep your message to ${MESSAGE_LIMIT} characters.`);
    isValid = false;
  } else {
    setError(messageError, "");
  }

  if (!isValid) return;

  submitMemory.disabled = true;
  submitMemory.setAttribute("aria-busy", "true");
  submitMemory.textContent = "Adding this to the wall...";

  try {
    const anonymous = anonymousInput.checked || !nameInput.value.trim();
    const photoUrl = await uploadPhoto(selectedPhotoFile);
    const memory = await insertMemory({
      photo_url: photoUrl,
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

memoryGrid.addEventListener("pointerenter", () => pauseGalleryAutoplay());
memoryGrid.addEventListener("pointerleave", () => scheduleGalleryAutoplay(900));
memoryGrid.addEventListener("pointerdown", beginGalleryDrag);
memoryGrid.addEventListener("pointermove", moveGalleryDrag);
memoryGrid.addEventListener("pointerup", endGalleryDrag);
memoryGrid.addEventListener("pointercancel", endGalleryDrag);
memoryGrid.addEventListener("wheel", () => pauseGalleryAutoplay(), { passive: true });
memoryGrid.addEventListener("touchstart", () => pauseGalleryAutoplay(), { passive: true });
memoryGrid.addEventListener("click", () => pauseGalleryAutoplay());

window.addEventListener("scroll", () => {
  const showFloatingShare = window.scrollY > window.innerHeight * 0.78;
  floatingShare.classList.toggle("is-visible", showFloatingShare);
}, { passive: true });

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

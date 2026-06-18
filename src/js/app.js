const form = document.querySelector("#memory-form");
const photoInput = document.querySelector("#photo-input");
const uploadCard = document.querySelector("#upload-card");
const previewCard = document.querySelector("#preview-card");
const previewImage = document.querySelector("#preview-image");
const previewName = document.querySelector("#preview-name");
const replacePhoto = document.querySelector("#replace-photo");
const messageInput = document.querySelector("#message-input");
const nameInput = document.querySelector("#name-input");
const messageCount = document.querySelector("#message-count");
const photoError = document.querySelector("#photo-error");
const messageError = document.querySelector("#message-error");
const submitMemory = document.querySelector("#submit-memory");
const successPanel = document.querySelector("#success-panel");
const shareAnother = document.querySelector("#share-another");
const memoryGrid = document.querySelector("#memory-grid");
const loadMore = document.querySelector("#load-more");
const memoryToast = document.querySelector("#memory-toast");
const dialog = document.querySelector("#memory-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogMessage = document.querySelector("#dialog-message");
const dialogName = document.querySelector("#dialog-name");
const dialogClose = document.querySelector("#dialog-close");
const floatingShare = document.querySelector(".floating-share");
const shareDialog = document.querySelector("#share-dialog");
const shareDialogClose = document.querySelector("#share-dialog-close");
const openShareButtons = document.querySelectorAll("[data-open-share]");
const viewWallAfterSubmit = document.querySelector("#view-wall-after-submit");
const revealSections = document.querySelectorAll("[data-scroll-reveal]");
const heroVideo = document.querySelector(".hero__video");

const SUPABASE_URL = "https://xitflvwtobrqmvdkeyjz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_XbTe1Nsvr_iIaEfhEI_B1g_g8wCmd5m";
const MEMORY_TABLE = "memories";
const PHOTO_BUCKET = "memory-photos";

let selectedPhoto = null;
let selectedPhotoFile = null;
let selectedPhotoName = "";
let visibleCount = 6;
let submissionsOpen = true;
let pendingRealtimeMemory = null;
let highlightedMemoryId = null;
const revealedMemoryIds = new Set();
let memoryRevealObserver = null;

if (heroVideo) {
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncHeroVideoMotion = () => {
    if (motionQuery.matches) {
      heroVideo.pause();
    } else {
      heroVideo.play().catch(() => {});
    }
  };

  syncHeroVideoMotion();
  motionQuery.addEventListener?.("change", syncHeroVideoMotion);
}

function closeModalWithAnimation(modal) {
  if (!modal.open || modal.classList.contains("is-closing")) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    modal.close();
    return;
  }

  modal.classList.add("is-closing");
  window.setTimeout(() => {
    modal.classList.remove("is-closing");
    modal.close();
  }, 350);
}

let memories = [];

function supabaseHeaders(extraHeaders = {}) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    ...extraHeaders
  };
}

function mapSupabaseMemory(row) {
  const displayName = row.anonymous ? "A guest" : row.name || "A guest";

  return {
    id: String(row.id),
    image: row.photo_url,
    photo_url: row.photo_url,
    message: row.message || "",
    name: displayName,
    anonymous: Boolean(row.anonymous),
    created_at: row.created_at
  };
}

function publicStorageUrl(path) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${encodedPath}`;
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

async function uploadPhoto(file) {
  const filePath = createUniquePhotoPath(file);
  const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
  const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/${PHOTO_BUCKET}/${encodedPath}`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false"
    }),
    body: file
  });

  if (!uploadResponse.ok) {
    const details = await uploadResponse.text();
    throw new Error(details || "Photo upload failed.");
  }

  return publicStorageUrl(filePath);
}

async function insertMemory(memoryPayload) {
  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/${MEMORY_TABLE}`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation"
    }),
    body: JSON.stringify(memoryPayload)
  });

  if (!insertResponse.ok) {
    const details = await insertResponse.text();
    throw new Error(details || "Memory save failed.");
  }

  const insertedRows = await insertResponse.json();
  return mapSupabaseMemory(insertedRows[0]);
}

async function loadMemories() {
  memoryGrid.innerHTML = '<p class="wall-status">Loading shared memories...</p>';

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${MEMORY_TABLE}?select=*&order=created_at.desc`, {
      headers: supabaseHeaders()
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || "Could not load memories.");
    }

    const rows = await response.json();
    memories = rows.map(mapSupabaseMemory);
    visibleCount = 6;
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
  if (memories.length === 0) {
    memoryGrid.innerHTML = '<p class="wall-status">No memories have been shared yet.</p>';
    loadMore.classList.add("is-hidden");
    return;
  }

  memories.slice(0, visibleCount).forEach((memory) => {
    const card = document.createElement("article");
    card.className = `memory-card${memory.id === highlightedMemoryId ? " is-new" : ""}`;
    card.dataset.memoryId = memory.id;
    if (revealedMemoryIds.has(memory.id)) {
      card.classList.add("is-visible");
    }
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open memory from ${memory.name}`);
    card.innerHTML = `
      <img src="${memory.image}" alt="Wedding memory shared by ${escapeHtml(memory.name)}">
      <div class="memory-card__body">
        <p>${escapeHtml(memory.message)}</p>
        <span class="memory-card__name">${escapeHtml(memory.name)}</span>
      </div>
    `;
    card.addEventListener("click", () => openMemory(memory));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMemory(memory);
      }
    });
    memoryGrid.append(card);
  });

  observeMemoryCards();

  loadMore.classList.toggle("is-hidden", visibleCount >= memories.length);

  if (highlightedMemoryId) {
    window.setTimeout(() => {
      highlightedMemoryId = null;
      document.querySelectorAll(".memory-card.is-new").forEach((card) => {
        card.classList.remove("is-new");
      });
    }, 1500);
  }
}

function observeMemoryCards() {
  const cards = memoryGrid.querySelectorAll(".memory-card:not(.is-visible)");

  if (!("IntersectionObserver" in window)) {
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

function openMemory(memory) {
  dialogImage.src = memory.image;
  dialogImage.alt = `Wedding memory shared by ${memory.name}`;
  dialogMessage.textContent = memory.message;
  dialogName.textContent = `Shared by ${memory.name}`;
  dialog.classList.remove("is-closing");
  dialog.showModal();
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

function openShareDialog(event) {
  event?.preventDefault();
  if (!shareDialog.open) {
    shareDialog.classList.remove("is-closing");
    successPanel.classList.add("is-hidden");
    form.classList.remove("is-hidden");
    shareDialog.showModal();
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
}

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  setError(photoError, "");

  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setError(photoError, "Please choose a photo file.");
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
});

replacePhoto.addEventListener("click", () => {
  photoInput.click();
});

messageInput.addEventListener("input", () => {
  messageCount.textContent = String(messageInput.value.length);
  if (messageInput.value.trim()) {
    setError(messageError, "");
  }
});

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
  } else {
    setError(messageError, "");
  }

  if (!isValid) return;

  submitMemory.disabled = true;
  submitMemory.textContent = "Adding this to the wall...";

  try {
    const anonymous = !nameInput.value.trim();
    const photoUrl = await uploadPhoto(selectedPhotoFile);
    const memory = await insertMemory({
      photo_url: photoUrl,
      message,
      name: anonymous ? null : name,
      anonymous
    });

    memories.unshift(memory);
    highlightedMemoryId = memory.id;
    revealedMemoryIds.delete(memory.id);
    visibleCount = Math.max(visibleCount, 6);
    renderMemories();
    resetFormState();
    closeShareDialog();
    document.querySelector("#wall").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    setError(photoError, "This memory could not be shared yet. Please try again.");
    console.error(error);
  } finally {
    submitMemory.disabled = false;
    submitMemory.textContent = "Share to the Love Wall";
  }
});

shareAnother.addEventListener("click", () => {
  successPanel.classList.add("is-hidden");
  form.classList.remove("is-hidden");
});

openShareButtons.forEach((button) => {
  button.addEventListener("click", openShareDialog);
});

shareDialogClose.addEventListener("click", closeShareDialog);

shareDialog.addEventListener("click", (event) => {
  if (event.target === shareDialog) {
    closeShareDialog();
  }
});

viewWallAfterSubmit.addEventListener("click", () => {
  closeShareDialog();
  document.querySelector("#wall").scrollIntoView({ behavior: "smooth" });
});

loadMore.addEventListener("click", () => {
  loadMore.textContent = "Loading more moments...";
  window.setTimeout(() => {
    visibleCount += 3;
    renderMemories();
    loadMore.textContent = "Load more moments";
  }, 450);
});

memoryToast.addEventListener("click", () => {
  if (pendingRealtimeMemory) {
    memories.unshift(pendingRealtimeMemory);
    highlightedMemoryId = pendingRealtimeMemory.id;
    pendingRealtimeMemory = null;
    memoryToast.classList.remove("is-visible");
    window.setTimeout(() => memoryToast.classList.add("is-hidden"), 260);
    renderMemories();
    document.querySelector("#wall").scrollIntoView({ behavior: "smooth" });
  }
});

dialogClose.addEventListener("click", () => {
  closeModalWithAnimation(dialog);
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    closeModalWithAnimation(dialog);
  }
});

window.addEventListener("scroll", () => {
  const showFloatingShare = window.scrollY > window.innerHeight * 0.78;
  floatingShare.classList.toggle("is-visible", showFloatingShare);
}, { passive: true });

if ("IntersectionObserver" in window) {
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

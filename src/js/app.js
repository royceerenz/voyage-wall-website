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

let selectedPhoto = null;
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

const seedMemories = [
  {
    id: "m1",
    image: "./assets/mockups/voyage-wall-hero.png",
    message: "Watching you two walk toward forever was the softest, happiest moment.",
    name: "Mara"
  },
  {
    id: "m2",
    image: "./assets/mockups/memory-toast.png",
    message: "To laughter, calm seas, and a lifetime of choosing each other.",
    name: "Nico"
  },
  {
    id: "m3",
    image: "./assets/mockups/memory-dance.png",
    message: "The ceremony felt like a love letter everyone got to stand inside.",
    name: "Auntie Rose"
  },
  {
    id: "m4",
    image: "./assets/mockups/memory-rings.png",
    message: "May every new shore bring you closer, kinder, and more in love.",
    name: "Paolo"
  },
  {
    id: "m5",
    image: "./assets/mockups/voyage-wall-hero.png",
    message: "This day is glowing because you both are.",
    name: "Lea"
  },
  {
    id: "m6",
    image: "./assets/mockups/memory-toast.png",
    message: "From this dock to every horizon after it, we are cheering for you.",
    name: "The Santos Family"
  },
  {
    id: "m7",
    image: "./assets/mockups/memory-dance.png",
    message: "Best dance floor entrance, best smiles, best beginning.",
    name: "Jules"
  },
  {
    id: "m8",
    image: "./assets/mockups/memory-rings.png",
    message: "A beautiful day for a beautiful promise.",
    name: "A guest"
  }
];

let memories = [...seedMemories];

function renderMemories() {
  memoryGrid.innerHTML = "";
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
  selectedPhoto = null;
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

  selectedPhoto = URL.createObjectURL(file);
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

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!submissionsOpen) {
    setError(photoError, "Sharing is currently closed for this event.");
    return;
  }

  const message = messageInput.value.trim();
  const name = nameInput.value.trim() || "A guest";
  let isValid = true;

  if (!selectedPhoto) {
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

  window.setTimeout(() => {
    const memory = {
      id: `guest-${Date.now()}`,
      image: selectedPhoto,
      message,
      name
    };
    memories.unshift(memory);
    highlightedMemoryId = memory.id;
    visibleCount = Math.max(visibleCount, 6);
    renderMemories();
    form.classList.add("is-hidden");
    successPanel.classList.remove("is-hidden");
    submitMemory.disabled = false;
    submitMemory.textContent = "Share to the Love Wall";
    resetFormState();
  }, 850);
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

window.setTimeout(() => {
  pendingRealtimeMemory = {
    id: "realtime-1",
    image: "./assets/mockups/memory-toast.png",
    message: "A fresh little moment from cocktail hour just joined the voyage.",
    name: "Camille"
  };
  memoryToast.classList.remove("is-hidden");
  window.requestAnimationFrame(() => memoryToast.classList.add("is-visible"));
}, 7000);

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

renderMemories();

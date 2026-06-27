import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const archiveGrid = document.querySelector("#archive-grid");
const archiveCount = document.querySelector("#archive-count");
const archiveMemoryCounter = document.querySelector("#archive-memory-counter");
const loadMoreButton = document.querySelector("#load-more-memories");
const storyViewer = document.querySelector("#story-viewer");
const storyViewerClose = document.querySelector("#story-viewer-close");
const storyViewerPrevious = document.querySelector("#story-viewer-previous");
const storyViewerNext = document.querySelector("#story-viewer-next");
const storyViewerImage = document.querySelector("#story-viewer-image");
const storyViewerMessage = document.querySelector("#story-viewer-message");
const storyViewerName = document.querySelector("#story-viewer-name");

const SUPABASE_URL = "https://xitflvwtobrqmvdkeyjz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_XbTe1Nsvr_iIaEfhEI_B1g_g8wCmd5m";
const MEMORY_TABLE = "memories";
const FALLBACK_MEMORY_IMAGE = "./assets/mockups/voyage-wall-hero.png";
const PAGE_SIZE = 10;
const MESSAGE_LIMIT = 120;
const MEMORY_SELECT_FIELDS = "id, photo_url, original_image_url, optimized_image_url, image_url, message, name, anonymous, created_at";
const MEMORY_SELECT_FIELDS_WITHOUT_IMAGE_URL = "id, photo_url, original_image_url, optimized_image_url, message, name, anonymous, created_at";
const LEGACY_MEMORY_SELECT_FIELDS = "id, photo_url, message, name, anonymous, created_at";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let memories = [];
let totalMemories = 0;
let isLoading = false;
let activeStoryMemoryId = null;

storyViewerImage?.addEventListener("error", (event) => {
  event.currentTarget.src = FALLBACK_MEMORY_IMAGE;
});

function mapSupabaseMemory(row) {
  const displayName = row.anonymous ? "A guest" : row.name || "A guest";
  const displayImage = row.optimized_image_url || row.image_url || row.photo_url || FALLBACK_MEMORY_IMAGE;

  return {
    id: String(row.id),
    image: displayImage,
    photo_url: row.photo_url,
    original_image_url: row.original_image_url,
    optimized_image_url: row.optimized_image_url,
    image_url: row.image_url,
    message: row.message || "",
    name: displayName,
    anonymous: Boolean(row.anonymous),
    created_at: row.created_at
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createArchiveCard(memory) {
  const card = document.createElement("article");
  card.className = "archive-memory-card";
  card.dataset.memoryId = memory.id;
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `View memory shared by ${memory.name}`);
  const displayMessage = String(memory.message || "").slice(0, MESSAGE_LIMIT);
  card.innerHTML = `
    <div class="archive-memory-card__image-frame">
      <img class="archive-memory-card__image" src="${memory.image}" alt="Wedding memory shared by ${escapeHtml(memory.name)}" loading="lazy" decoding="async">
    </div>
    <div class="archive-memory-card__body">
      <p class="archive-memory-card__message">
        <span class="archive-memory-card__message-text">${escapeHtml(displayMessage)}</span>
      </p>
      <div class="archive-memory-card__attribution">
        <span class="archive-memory-card__label">FROM:</span>
        <span class="archive-memory-card__name">${escapeHtml(memory.name)}</span>
      </div>
    </div>
  `;
  card.querySelector("img").addEventListener("error", (event) => {
    event.currentTarget.src = FALLBACK_MEMORY_IMAGE;
  }, { once: true });
  return card;
}

function getActiveStoryIndex() {
  return memories.findIndex((memory) => memory.id === activeStoryMemoryId);
}

function syncStoryViewer(memory) {
  if (
    !memory ||
    !storyViewerImage ||
    !storyViewerMessage ||
    !storyViewerName ||
    !storyViewerPrevious ||
    !storyViewerNext
  ) return;

  storyViewerImage.src = memory.image;
  storyViewerImage.alt = `Wedding memory shared by ${memory.name}`;
  storyViewerMessage.textContent = memory.message;
  storyViewerName.textContent = memory.name;

  const activeIndex = getActiveStoryIndex();
  const hasMultipleMemories = memories.length > 1;
  storyViewerPrevious.disabled = !hasMultipleMemories || activeIndex <= 0;
  storyViewerNext.disabled = !hasMultipleMemories || activeIndex >= memories.length - 1;
}

function openStoryViewer(memoryId) {
  const memory = memories.find((item) => item.id === memoryId);
  if (!memory || !storyViewer) return;

  activeStoryMemoryId = memory.id;
  syncStoryViewer(memory);
  storyViewer.showModal();
  document.body.classList.add("is-dialog-open");
}

function closeStoryViewer() {
  if (!storyViewer?.open) return;

  storyViewer.close();
  document.body.classList.remove("is-dialog-open");
  activeStoryMemoryId = null;
}

function showAdjacentStory(direction) {
  const activeIndex = getActiveStoryIndex();
  if (activeIndex === -1) return;

  const nextMemory = memories[activeIndex + direction];
  if (!nextMemory) return;

  activeStoryMemoryId = nextMemory.id;
  syncStoryViewer(nextMemory);
}

function renderArchiveStatus(message, isError = false) {
  archiveGrid.innerHTML = `
    <p class="wall-status${isError ? " wall-status--error" : ""}">
      ${escapeHtml(message)}
    </p>
  `;
}

function syncArchiveMeta() {
  const shownCount = memories.length;
  const totalLabel = totalMemories === 1 ? "memory" : "memories";

  if (archiveMemoryCounter) {
    if (totalMemories === 0) {
      archiveMemoryCounter.textContent = "Be the first to share a moment";
    } else if (totalMemories === 1) {
      archiveMemoryCounter.textContent = "1 moment shared";
    } else {
      archiveMemoryCounter.textContent = `${totalMemories} moments shared`;
    }
  }

  if (totalMemories === 0) {
    if (archiveCount) {
      archiveCount.textContent = "No memories have been shared yet.";
    }
  } else {
    if (archiveCount) {
      archiveCount.textContent = `Showing ${shownCount} of ${totalMemories} ${totalLabel}.`;
    }
  }

  const hasMore = shownCount < totalMemories;
  loadMoreButton.hidden = !hasMore;
  loadMoreButton.disabled = isLoading || !hasMore;
}

function appendMemories(memoryItems) {
  if (memories.length === memoryItems.length && memoryItems.length <= PAGE_SIZE) {
    archiveGrid.innerHTML = "";
  }

  memoryItems.forEach((memory) => {
    archiveGrid.append(createArchiveCard(memory));
  });
}

async function loadMoreMemories() {
  if (isLoading) return;

  isLoading = true;
  loadMoreButton.disabled = true;
  loadMoreButton.textContent = "Loading...";

  try {
    const from = memories.length;
    const to = from + PAGE_SIZE - 1;
    let { data, error, count } = await supabase
      .from(MEMORY_TABLE)
      .select(MEMORY_SELECT_FIELDS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      ({ data, error, count } = await supabase
        .from(MEMORY_TABLE)
        .select(MEMORY_SELECT_FIELDS_WITHOUT_IMAGE_URL, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to));
    }

    if (error) {
      ({ data, error, count } = await supabase
        .from(MEMORY_TABLE)
        .select(LEGACY_MEMORY_SELECT_FIELDS, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to));
    }

    if (error) {
      console.error("[Voyage Wall] Archive memory load failed.", {
        table: MEMORY_TABLE,
        error
      });
      throw new Error(error.message || "Could not load memories.");
    }

    totalMemories = count || 0;
    const nextMemories = (data || []).map(mapSupabaseMemory);
    memories = memories.concat(nextMemories);

    if (memories.length === 0) {
      renderArchiveStatus("No memories have been shared yet.");
    } else {
      appendMemories(nextMemories);
    }
  } catch (error) {
    if (memories.length === 0) {
      renderArchiveStatus("We could not load the memory archive yet. Please refresh and try again.", true);
    }
    console.error(error);
  } finally {
    isLoading = false;
    loadMoreButton.textContent = "Load More";
    syncArchiveMeta();
  }
}

function addRealtimeMemory(memory) {
  if (memories.some((existingMemory) => existingMemory.id === memory.id)) return;

  totalMemories += 1;
  memories.unshift(memory);

  if (memories.length === 1) {
    archiveGrid.innerHTML = "";
  }

  archiveGrid.prepend(createArchiveCard(memory));
  if (storyViewer?.open) {
    syncStoryViewer(memories[getActiveStoryIndex()]);
  }
  syncArchiveMeta();
}

function subscribeToRealtimeMemories() {
  supabase
    .channel("voyage-wall-archive-memories")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: MEMORY_TABLE
      },
      (payload) => {
        addRealtimeMemory(mapSupabaseMemory(payload.new));
      }
    )
    .subscribe((status, error) => {
      if (error) {
        console.error("[Voyage Wall] Archive realtime subscription error.", error);
      }
    });
}

archiveGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".archive-memory-card");
  if (!card) return;
  openStoryViewer(card.dataset.memoryId);
});

archiveGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;

  const card = event.target.closest(".archive-memory-card");
  if (!card) return;

  event.preventDefault();
  openStoryViewer(card.dataset.memoryId);
});

storyViewerClose.addEventListener("click", closeStoryViewer);
storyViewerPrevious.addEventListener("click", () => showAdjacentStory(-1));
storyViewerNext.addEventListener("click", () => showAdjacentStory(1));

storyViewer.addEventListener("click", (event) => {
  if (event.target === storyViewer) {
    closeStoryViewer();
  }
});

storyViewer.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeStoryViewer();
});

storyViewer.addEventListener("close", () => {
  document.body.classList.remove("is-dialog-open");
  activeStoryMemoryId = null;
});

document.addEventListener("keydown", (event) => {
  if (!storyViewer?.open) return;

  if (event.key === "ArrowLeft") {
    showAdjacentStory(-1);
  } else if (event.key === "ArrowRight") {
    showAdjacentStory(1);
  }
});

loadMoreButton.addEventListener("click", loadMoreMemories);

loadMoreMemories();
subscribeToRealtimeMemories();

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const archiveGrid = document.querySelector("#archive-grid");
const archiveCount = document.querySelector("#archive-count");
const loadMoreButton = document.querySelector("#load-more-memories");

const SUPABASE_URL = "https://xitflvwtobrqmvdkeyjz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_XbTe1Nsvr_iIaEfhEI_B1g_g8wCmd5m";
const MEMORY_TABLE = "memories";
const FALLBACK_MEMORY_IMAGE = "./assets/mockups/voyage-wall-hero.png";
const PAGE_SIZE = 10;
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let memories = [];
let totalMemories = 0;
let isLoading = false;

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
  card.innerHTML = `
    <img src="${memory.image}" alt="Wedding memory shared by ${escapeHtml(memory.name)}" loading="lazy" decoding="async">
    <div class="archive-memory-card__body">
      <p>${escapeHtml(memory.message)}</p>
      <span>${escapeHtml(memory.name)}</span>
    </div>
  `;
  card.querySelector("img").addEventListener("error", (event) => {
    event.currentTarget.src = FALLBACK_MEMORY_IMAGE;
  }, { once: true });
  return card;
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

  if (totalMemories === 0) {
    archiveCount.textContent = "No memories have been shared yet.";
  } else {
    archiveCount.textContent = `Showing ${shownCount} of ${totalMemories} ${totalLabel}.`;
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
    const { data, error, count } = await supabase
      .from(MEMORY_TABLE)
      .select("id, photo_url, message, name, anonymous, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

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

loadMoreButton.addEventListener("click", loadMoreMemories);

loadMoreMemories();
subscribeToRealtimeMemories();

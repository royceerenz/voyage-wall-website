const totalCount = document.querySelector("#total-count");
const approvedCount = document.querySelector("#approved-count");
const hiddenCount = document.querySelector("#hidden-count");
const toggleSubmissions = document.querySelector("#toggle-submissions");
const copyLink = document.querySelector("#copy-link");
const adminStatus = document.querySelector("#admin-status");

let submissionsOpen = true;

const operatorStats = {
  approved: 8,
  hidden: 0
};

function renderOperatorStats() {
  totalCount.textContent = String(operatorStats.approved + operatorStats.hidden);
  approvedCount.textContent = String(operatorStats.approved);
  hiddenCount.textContent = String(operatorStats.hidden);
}

toggleSubmissions.addEventListener("click", () => {
  submissionsOpen = !submissionsOpen;
  toggleSubmissions.textContent = submissionsOpen ? "Close submissions" : "Open submissions";
  adminStatus.textContent = submissionsOpen
    ? "Submissions are open."
    : "Submissions are closed. Guests can still view the Love Wall.";
});

copyLink.addEventListener("click", async () => {
  const guestLink = new URL("./", window.location.href).href;
  try {
    await navigator.clipboard.writeText(guestLink);
    adminStatus.textContent = "Guest event link copied.";
  } catch {
    adminStatus.textContent = guestLink;
  }
});

renderOperatorStats();

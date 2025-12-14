import { getListings } from "./api/listings.js";
import { renderListingsGrid, showError, showLoading } from "./ui/listings.js";
import { updateNavigation } from "./utils/auth.js";

const container = document.getElementById("listings-container");
const paginationContainer = document.getElementById("pagination");
const searchInput = document.getElementById("search-input");
const tagInput = document.getElementById("tag-input");
const sortSelect = document.getElementById("sort-select");
let searchTimeout;
let currentPage = 1;
let totalPages = 1;

async function loadListings(
  search = "",
  tag = "",
  sortValue = "created-desc",
  page = 1
) {
  showLoading(container);
  currentPage = page;

  const [sortField, sortOrder] = sortValue.split("-");
  const activeOnly = sortField === "endsAt";

  try {
    const response = await getListings(
      20,
      page,
      sortField,
      sortOrder,
      search,
      tag,
      activeOnly
    );

    const listings = response.data || [];
    const meta = response.meta;

    totalPages = meta?.pageCount || 1;

    renderListingsGrid(listings, container);
    renderPagination(page, totalPages);
  } catch (error) {
    console.error("Error loading listings:", error);
    showError(error.message, container);
    paginationContainer.innerHTML = "";
  }
}

function renderPagination(current, total) {
  if (total <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let paginationHTML = "";

  // Previous button
  paginationHTML += `
    <li class="page-item ${current === 1 ? "disabled" : ""}">
      <button class="page-link" data-page="${current - 1}" ${
    current === 1 ? "disabled" : ""
  }>Previous</button>
    </li>
  `;

  // Page numbers - adjust for mobile screens
  const isMobile = window.innerWidth < 576;
  const maxVisiblePages = isMobile ? 3 : 5;
  let startPage = Math.max(1, current - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(total, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    paginationHTML += `
      <li class="page-item">
        <button class="page-link" data-page="1">1</button>
      </li>
    `;
    if (startPage > 2) {
      paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <li class="page-item ${i === current ? "active" : ""}">
        <button class="page-link" data-page="${i}">${i}</button>
      </li>
    `;
  }

  if (endPage < total) {
    if (endPage < total - 1) {
      paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    paginationHTML += `
      <li class="page-item">
        <button class="page-link" data-page="${total}">${total}</button>
      </li>
    `;
  }

  // Next button
  paginationHTML += `
    <li class="page-item ${current === total ? "disabled" : ""}">
      <button class="page-link" data-page="${current + 1}" ${
    current === total ? "disabled" : ""
  }>Next</button>
    </li>
  `;

  paginationContainer.innerHTML = paginationHTML;

  // Add click handlers
  paginationContainer
    .querySelectorAll("button[data-page]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const page = parseInt(button.dataset.page);
        loadListings(
          searchInput.value.trim(),
          tagInput.value.trim(),
          sortSelect.value,
          page
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
}

function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadListings(
      searchInput.value.trim(),
      tagInput.value.trim(),
      sortSelect.value,
      1
    );
  }, 500);
}

searchInput.addEventListener("input", handleSearch);
tagInput.addEventListener("input", handleSearch);
sortSelect.addEventListener("change", () => {
  loadListings(
    searchInput.value.trim(),
    tagInput.value.trim(),
    sortSelect.value,
    1
  );
});

function init() {
  updateNavigation();
  loadListings();
}

init();

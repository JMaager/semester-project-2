import { getListings } from "../api/listings.js";
import { renderListingsGrid, showError, showLoading } from "../ui/listings.js";
import { updateNavigation } from "../utils/auth.js";

const container = document.getElementById("listings-container");
const searchInput = document.getElementById("search-input");
let searchTimeout;

async function loadListings(search = "") {
  showLoading(container);

  try {
    const response = await getListings(50, 1, "created", "desc", search);
    renderListingsGrid(response.data, container);
  } catch (error) {
    showError(error.message, container);
  }
}

searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadListings(e.target.value.trim());
  }, 500);
});

function init() {
  updateNavigation();
  loadListings();
}

init();

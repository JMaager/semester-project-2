import { getListing, updateListing, deleteListing } from "../api/listings.js";
import { validateRequired, validateURL } from "../utils/validation.js";
import { updateNavigation, requireAuth } from "../utils/auth.js";
import { getUser } from "../utils/storage.js";

requireAuth();

let currentListingId = null;

const form = document.getElementById("edit-listing-form");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const tagsInput = document.getElementById("tags");
const mediaContainer = document.getElementById("media-container");
const addMediaBtn = document.getElementById("add-media");
const deleteBtn = document.getElementById("delete-listing-btn");
const formError = document.getElementById("form-error");
const loadingContainer = document.getElementById("loading-container");
const editFormContainer = document.getElementById("edit-form-container");
const errorContainer = document.getElementById("error-container");

async function loadListing() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get("id");

  if (!listingId) {
    showError("No listing ID provided.");
    return;
  }

  currentListingId = listingId;

  try {
    const response = await getListing(listingId);
    const listing = response.data;

    if (!listing) {
      showError("Listing not found.");
      return;
    }

    // Check if the current user is the seller
    const currentUser = getUser();
    if (
      !currentUser ||
      !listing.seller ||
      currentUser.name !== listing.seller.name
    ) {
      showError("You do not have permission to edit this listing.");
      return;
    }

    // Check if the listing has ended
    if (new Date(listing.endsAt) < new Date()) {
      showError("Cannot edit a listing that has already ended.");
      return;
    }

    populateForm(listing);
    loadingContainer.classList.add("d-none");
    editFormContainer.classList.remove("d-none");
  } catch (error) {
    console.error("Error loading listing:", error);
    showError(`Failed to load listing: ${error.message}`);
  }
}

function populateForm(listing) {
  titleInput.value = listing.title || "";
  descriptionInput.value = listing.description || "";
  tagsInput.value = listing.tags ? listing.tags.join(", ") : "";

  // Clear existing media inputs
  mediaContainer.innerHTML = "";

  // Add media inputs if there are existing media
  if (listing.media && listing.media.length > 0) {
    listing.media.forEach((mediaItem, index) => {
      addMediaInput(mediaItem.url, index === 0);
    });
  } else {
    addMediaInput("", true);
  }
}

function addMediaInput(url = "", isFirst = false) {
  const mediaGroup = document.createElement("div");
  mediaGroup.className = "input-group mb-2";
  mediaGroup.innerHTML = `
    <input type="url" class="form-control media-url" placeholder="Enter image URL" value="${url}">
    <button type="button" class="btn btn-outline-danger remove-media ${
      isFirst ? "d-none" : ""
    }">Remove</button>
  `;
  mediaContainer.appendChild(mediaGroup);

  mediaGroup.querySelector(".remove-media").addEventListener("click", () => {
    mediaGroup.remove();
  });
}

addMediaBtn.addEventListener("click", () => {
  addMediaInput("", false);
});

function showError(message) {
  loadingContainer.classList.add("d-none");
  editFormContainer.classList.add("d-none");
  errorContainer.textContent = message;
  errorContainer.classList.remove("d-none");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  formError.textContent = "";
  document
    .querySelectorAll(".form-error")
    .forEach((el) => (el.textContent = ""));

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const tagsValue = tagsInput.value.trim();

  const mediaUrls = Array.from(document.querySelectorAll(".media-url"))
    .map((input) => input.value.trim())
    .filter((url) => url.length > 0);

  let hasError = false;

  if (!validateRequired(title)) {
    document.getElementById("title-error").textContent = "Title is required";
    hasError = true;
  }

  if (!validateRequired(description)) {
    document.getElementById("description-error").textContent =
      "Description is required";
    hasError = true;
  }

  for (const url of mediaUrls) {
    if (!validateURL(url)) {
      document.getElementById("media-error").textContent =
        "All media URLs must be valid";
      hasError = true;
      break;
    }
  }

  if (hasError) return;

  const tags = tagsValue
    ? tagsValue
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    : [];

  const media = mediaUrls.map((url) => ({ url, alt: title }));

  const listingData = {
    title,
    description,
    tags,
    media: media.length > 0 ? media : undefined,
  };

  try {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Updating...";

    await updateListing(currentListingId, listingData);
    alert("Listing updated successfully!");
    window.location.href = `/src/pages/listing.html?id=${currentListingId}`;
  } catch (error) {
    formError.textContent = error.message;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = "Update";
  }
});

deleteBtn.addEventListener("click", async () => {
  const confirmDelete = confirm(
    "Are you sure you want to delete this listing? This action cannot be undone."
  );

  if (!confirmDelete) {
    return;
  }

  try {
    deleteBtn.disabled = true;
    deleteBtn.textContent = "Deleting...";

    await deleteListing(currentListingId);
    alert("Listing deleted successfully!");
    window.location.href = "/";
  } catch (error) {
    alert(`Failed to delete listing: ${error.message}`);
    deleteBtn.disabled = false;
    deleteBtn.textContent = "Delete";
  }
});

// Initialize
updateNavigation();
loadListing();

import { createListing } from "../api/listings.js";
import {
  validateRequired,
  validateDate,
  validateURL,
} from "../utils/validation.js";
import { updateNavigation, requireAuth } from "../utils/auth.js";

requireAuth();

const form = document.getElementById("create-listing-form");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const tagsInput = document.getElementById("tags");
const endsAtInput = document.getElementById("endsAt");
const mediaContainer = document.getElementById("media-container");
const formError = document.getElementById("form-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  formError.textContent = "";
  document
    .querySelectorAll(".form-error")
    .forEach((el) => (el.textContent = ""));

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const tagsValue = tagsInput.value.trim();
  const endsAt = endsAtInput.value;

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

  if (!endsAt) {
    document.getElementById("endsAt-error").textContent =
      "Auction end date is required";
    hasError = true;
  } else if (!validateDate(endsAt)) {
    document.getElementById("endsAt-error").textContent =
      "Auction end date must be in the future";
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
    endsAt: new Date(endsAt).toISOString(),
    media: media.length > 0 ? media : undefined,
  };

  try {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";

    await createListing(listingData);
    alert("Listing created successfully!");
    window.location.href = "/";
  } catch (error) {
    formError.textContent = error.message;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Listing";
  }
});

updateNavigation();

import { getProfile, updateProfile, getProfileBids } from "../api/profiles.js";
import { updateNavigation } from "../utils/auth.js";
import { getUser, isLoggedIn } from "../utils/storage.js";
import { renderListingCard } from "../ui/listings.js";

let currentProfileName = null;
let allListings = [];
let allBids = [];
let allWins = [];

async function loadProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const profileName = urlParams.get("name");

  if (!profileName) {
    // If no name in URL, redirect to current user's profile if logged in
    if (isLoggedIn()) {
      const currentUser = getUser();
      window.location.href = `/src/pages/profile.html?name=${currentUser.name}`;
      return;
    } else {
      showError("Please log in to view profiles.");
      return;
    }
  }

  currentProfileName = profileName;

  try {
    const response = await getProfile(profileName);
    const profile = response.data || response;
    renderProfile(profile);
  } catch (error) {
    showError(`Failed to load profile: ${error.message}`);
  }
}

async function renderProfile(profile) {
  const { name, email, bio, avatar, banner, credits, _count, listings, wins } =
    profile;

  // Store data for filtering and add seller info to listings
  allListings = (listings || []).map((listing) => ({
    ...listing,
    seller: listing.seller || { name, email, bio, avatar, banner },
  }));
  allWins = (wins || []).map((listing) => ({
    ...listing,
    seller: listing.seller || { name, email, bio, avatar, banner },
  }));

  // Update profile header
  document.getElementById("profile-name").textContent = name;
  document.getElementById("profile-bio").textContent =
    bio || "This is the bio of " + name;

  if (avatar?.url) {
    document.getElementById("profile-avatar").src = avatar.url;
  }

  if (banner?.url) {
    document.getElementById("profile-banner").src = banner.url;
  }

  // Show edit button only if viewing own profile
  const currentUser = getUser();
  if (currentUser && currentUser.name === name) {
    const editBtn = document.getElementById("edit-profile-btn");
    if (editBtn) {
      editBtn.classList.remove("d-none");
    }

    // Populate edit form
    document.getElementById("edit-bio").value = bio || "";
    document.getElementById("edit-avatar-url").value = avatar?.url || "";
    document.getElementById("edit-banner-url").value = banner?.url || "";
  }

  // Fetch and store bids
  try {
    const bidsData = await getProfileBids(name);
    allBids = bidsData.data || [];
  } catch (error) {
    allBids = [];
  }

  // Render initial tab (listings)
  renderListingsTab();

  // Show profile content
  document.getElementById("profile-loading").classList.add("d-none");
  document.getElementById("profile-content").classList.remove("d-none");
}

function renderListingsTab() {
  const listingsContainer = document.getElementById(
    "profile-listings-container"
  );
  if (allListings && allListings.length > 0) {
    listingsContainer.innerHTML = allListings
      .map((listing) => renderListingCard(listing))
      .join("");
    attachCardClickListeners();
    attachQuickBidListeners();
  } else {
    listingsContainer.innerHTML =
      '<div class="col-12"><p class="text-center">No listings found.</p></div>';
  }
}

function renderBidsTab() {
  const bidsContainer = document.getElementById("profile-bids-container");
  if (allBids && allBids.length > 0) {
    // Extract listing data from bids
    const listings = allBids
      .map((bid) => bid.listing)
      .filter((listing) => listing);
    bidsContainer.innerHTML = listings
      .map((listing) => renderListingCard(listing))
      .join("");
    attachCardClickListeners();
    attachQuickBidListeners();
  } else {
    bidsContainer.innerHTML =
      '<div class="col-12"><p class="text-center">No bids yet.</p></div>';
  }
}

function renderWinsTab() {
  const winsContainer = document.getElementById("profile-wins-container");
  if (allWins && allWins.length > 0) {
    winsContainer.innerHTML = allWins
      .map((listing) => renderListingCard(listing))
      .join("");
    attachCardClickListeners();
    attachQuickBidListeners();
  } else {
    winsContainer.innerHTML =
      '<div class="col-12"><p class="text-center">No wins yet.</p></div>';
  }
}

function showError(message) {
  document.getElementById("profile-loading").classList.add("d-none");
  const errorDiv = document.getElementById("profile-error");
  errorDiv.textContent = message;
  errorDiv.classList.remove("d-none");
}

async function handleEditProfile(event) {
  event.preventDefault();

  const bio = document.getElementById("edit-bio").value;
  const avatarUrl = document.getElementById("edit-avatar-url").value;
  const bannerUrl = document.getElementById("edit-banner-url").value;

  const profileData = {
    bio: bio || undefined,
    avatar: avatarUrl ? { url: avatarUrl, alt: "User avatar" } : undefined,
    banner: bannerUrl ? { url: bannerUrl, alt: "Profile banner" } : undefined,
  };

  // Remove undefined values
  Object.keys(profileData).forEach((key) => {
    if (profileData[key] === undefined) {
      delete profileData[key];
    }
  });

  try {
    await updateProfile(currentProfileName, profileData);

    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editProfileModal")
    );
    modal.hide();

    // Reload profile
    window.location.reload();
  } catch (error) {
    const errorDiv = document.getElementById("edit-profile-error");
    errorDiv.textContent = `Failed to update profile: ${error.message}`;
  }
}

// Re-use functions from listings.js (they need to be available after rendering listings on profile)
function attachCardClickListeners() {
  const listingCards = document.querySelectorAll(".listing-card");
  listingCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      const target = e.target;
      const isInteractiveElement =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest(".quick-bid-box");

      if (!isInteractiveElement) {
        const listingId = card.dataset.listingId;
        window.location.href = `/src/pages/listing.html?id=${listingId}`;
      }
    });
  });
}

function attachQuickBidListeners() {
  const bidButtons = document.querySelectorAll(".quick-bid-btn");
  bidButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const listingId = e.target.dataset.listingId;
      const minBid = parseInt(e.target.dataset.minBid);

      const inputElement = document.querySelector(
        `.quick-bid-input[data-listing-id="${listingId}"]`
      );
      const bidAmount = parseInt(inputElement.value);

      if (!bidAmount || isNaN(bidAmount)) {
        alert("Please enter a valid bid amount.");
        return;
      }

      if (bidAmount < minBid) {
        alert(`Your bid must be at least ${minBid} credits.`);
        return;
      }

      const currentUser = getUser();
      if (bidAmount > currentUser.credits) {
        alert(
          `You don't have enough credits. You have ${currentUser.credits} credits.`
        );
        return;
      }

      try {
        const { placeBid } = await import("../api/listings.js");
        await placeBid(listingId, bidAmount);
        alert("Bid placed successfully!");
        window.location.reload();
      } catch (error) {
        alert(`Failed to place bid: ${error.message}`);
      }
    });
  });
}

// Tab switching functionality
function setupTabSwitching() {
  const tabButtons = document.querySelectorAll(".profile-tab-btn");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      document.querySelectorAll(".profile-tab-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
      document.querySelectorAll(".profile-tab-content").forEach((content) => {
        content.classList.remove("active");
      });

      // Add active class to clicked button
      button.classList.add("active");

      // Show corresponding content
      const tabName = button.dataset.tab;
      const content = document.getElementById(`${tabName}-content`);
      content.classList.add("active");

      // Render the appropriate tab content
      if (
        tabName === "listings" &&
        !document.getElementById("profile-listings-container").innerHTML
      ) {
        renderListingsTab();
      } else if (
        tabName === "bids" &&
        !document.getElementById("profile-bids-container").innerHTML
      ) {
        renderBidsTab();
      } else if (
        tabName === "wins" &&
        !document.getElementById("profile-wins-container").innerHTML
      ) {
        renderWinsTab();
      }
    });
  });
}

// Search and filter functionality
let searchTimeout;

function setupSearchAndFilter() {
  const searchInput = document.getElementById("profile-search-input");
  const filterInput = document.getElementById("profile-filter-input");

  const applyFilters = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = searchInput.value.trim().toLowerCase();
      const filterTerm = filterInput.value.trim().toLowerCase();

      // Get the currently active tab
      const activeTab = document.querySelector(".profile-tab-btn.active");
      const tabName = activeTab ? activeTab.dataset.tab : "listings";

      let dataToFilter = [];
      if (tabName === "listings") dataToFilter = allListings;
      else if (tabName === "bids")
        dataToFilter = allBids.map((bid) => bid.listing).filter(Boolean);
      else if (tabName === "wins") dataToFilter = allWins;

      // Filter data
      let filtered = dataToFilter.filter((listing) => {
        const matchesSearch =
          !searchTerm ||
          listing.title?.toLowerCase().includes(searchTerm) ||
          listing.description?.toLowerCase().includes(searchTerm);

        const matchesTag =
          !filterTerm ||
          listing.tags?.some((tag) => tag.toLowerCase().includes(filterTerm));

        return matchesSearch && matchesTag;
      });

      // Render results
      const containerIds = {
        listings: "profile-listings-container",
        bids: "profile-bids-container",
        wins: "profile-wins-container",
      };

      const container = document.getElementById(containerIds[tabName]);
      container.innerHTML =
        filtered.length > 0
          ? filtered.map((listing) => renderListingCard(listing)).join("")
          : '<div class="col-12"><p class="text-center">No results found.</p></div>';

      if (filtered.length > 0) {
        attachCardClickListeners();
        attachQuickBidListeners();
      }
    }, 500);
  };

  searchInput.addEventListener("input", applyFilters);
  filterInput.addEventListener("input", applyFilters);
}

// Initialize
updateNavigation();
loadProfile();
setupTabSwitching();
setupSearchAndFilter();

// Event listener for save profile button
document
  .getElementById("save-profile-btn")
  .addEventListener("click", handleEditProfile);

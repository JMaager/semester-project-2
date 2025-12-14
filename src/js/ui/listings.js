import { formatTimeRemaining, formatEndDate } from "../utils/date.js";
import { getUser, isLoggedIn } from "../utils/storage.js";
import { placeBid } from "../api/listings.js";

export function renderListingCard(listing) {
  const { id, title, description, media, endsAt, _count, seller, bids, tags } =
    listing;
  const imageUrl =
    media?.[0]?.url || "https://via.placeholder.com/300x200?text=No+Image";
  const bidCount = _count?.bids || 0;
  const timeRemaining = formatTimeRemaining(endsAt);
  const endDate = formatEndDate(endsAt);

  // Get the highest bid amount and most recent bidder
  let currentBid = 0;
  let recentBidder = null;

  if (bids && bids.length > 0) {
    // Sort bids by amount descending to get the highest
    const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
    currentBid = sortedBids[0].amount;
    recentBidder = sortedBids[0].bidder?.name;
  }

  // Check if the current user is the seller
  const currentUser = getUser();
  const isOwner = currentUser && seller && currentUser.name === seller.name;

  return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card listing-card h-100" data-listing-id="${id}" style="cursor: pointer;">
                <div class="position-relative">
                    <img src="${imageUrl}" class="card-img-top listing-image" alt="${title}">
                    <span class="position-absolute top-0 start-0 m-2 px-2 py-1 text-white countdown-badge">
                        <div class="small">Ends: ${endDate}</div>
                        <div class="countdown-time">${timeRemaining}</div>
                    </span>
                    ${
                      isOwner
                        ? `
                    <a href="/src/pages/edit-listing.html?id=${id}" class="position-absolute top-0 end-0 m-2 btn btn-sm listing-edit-btn">
                        Edit
                    </a>
                    `
                        : ""
                    }
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="card-title mb-0">${title}</h5>
                        <div class="d-flex gap-2">
                            <span class="badge listing-bid-badge">${bidCount} bids</span>
                            <span class="badge listing-credits-badge">Credits: ${currentBid}</span>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <p class="listing-seller mb-0">By: <a href="/src/pages/profile.html?name=${
                          seller?.name
                        }" class="seller-link">${
    seller?.name || "Unknown"
  }</a></p>
                        ${
                          recentBidder
                            ? `<p class="listing-recent-bidder mb-0">Recent bidder: <a href="/src/pages/profile.html?name=${recentBidder}" class="seller-link">${recentBidder}</a></p>`
                            : ""
                        }
                    </div>
                    ${
                      tags && tags.length > 0
                        ? `
                    <div class="d-flex gap-2 mb-2 flex-wrap">
                        ${tags
                          .map(
                            (tag) =>
                              `<span class="badge listing-bid-badge">${tag}</span>`
                          )
                          .join("")}
                    </div>
                    `
                        : ""
                    }
                    <p class="card-text flex-grow-1">${
                      description?.substring(0, 100) || "No description"
                    }${description?.length > 100 ? "..." : ""}</p>
                    ${
                      isLoggedIn() && !isOwner
                        ? `
                    <div class="quick-bid-box mt-3">
                        <p class="quick-bid-text mb-2">Enter the amount you wish to bid, no less than: ${
                          currentBid + 1
                        }</p>
                        <input type="number" class="form-control quick-bid-input mb-2" placeholder="Bid amount..." min="${
                          currentBid + 1
                        }" data-listing-id="${id}">
                        <button class="btn listing-edit-btn quick-bid-btn" data-listing-id="${id}" data-min-bid="${
                            currentBid + 1
                          }">BID</button>
                    </div>
                    `
                        : ""
                    }
                    ${
                      !isLoggedIn()
                        ? `
                    <a href="/src/pages/listing.html?id=${id}" class="btn listing-edit-btn mt-3">View Details</a>
                    `
                        : ""
                    }
                </div>
            </div>
        </div>
    `;
}

export function renderListingsGrid(listings, container) {
  if (!listings || listings.length === 0) {
    container.innerHTML =
      '<div class="col-12"><p class="text-center">No listings found.</p></div>';
    return;
  }

  container.innerHTML = listings
    .map((listing) => renderListingCard(listing))
    .join("");

  // Add event listeners to all quick bid buttons
  attachQuickBidListeners();

  // Add event listeners to all listing cards for navigation
  attachCardClickListeners();
}

async function handleQuickBid(listingId, minBid) {
  const inputElement = document.querySelector(
    `.quick-bid-input[data-listing-id="${listingId}"]`
  );
  const bidAmount = parseInt(inputElement.value);

  // Validate bid amount
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
    await placeBid(listingId, bidAmount);
    alert("Bid placed successfully!");
    window.location.reload(); // Reload to show updated bid
  } catch (error) {
    alert(`Failed to place bid: ${error.message}`);
  }
}

function attachQuickBidListeners() {
  const bidButtons = document.querySelectorAll(".quick-bid-btn");
  bidButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const listingId = e.target.dataset.listingId;
      const minBid = parseInt(e.target.dataset.minBid);
      handleQuickBid(listingId, minBid);
    });
  });
}

function attachCardClickListeners() {
  const listingCards = document.querySelectorAll(".listing-card");
  listingCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't navigate if clicking on interactive elements
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

export function showError(message, container) {
  container.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        </div>
    `;
}

export function showLoading(container) {
  container.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
}

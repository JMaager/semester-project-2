import { getListing, placeBid } from "../api/listings.js";
import { updateNavigation } from "../utils/auth.js";
import {
  formatDate,
  formatEndDate,
  formatTimeRemaining,
} from "../utils/date.js";
import { isLoggedIn, getUser } from "../utils/storage.js";

const container = document.getElementById("listing-detail-container");

async function loadListing() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get("id");

  if (!listingId) {
    container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        No listing ID provided.
      </div>
    `;
    return;
  }

  try {
    const response = await getListing(listingId);
    const listing = response.data;

    if (!listing) {
      container.innerHTML = `
        <div class="alert alert-danger" role="alert">
          Listing not found.
        </div>
      `;
      return;
    }

    renderListingDetail(listing);
  } catch (error) {
    console.error("Error loading listing:", error);
    container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Failed to load listing: ${error.message}
      </div>
    `;
  }
}

async function handlePlaceBid(listingId, currentBid) {
  if (!isLoggedIn()) {
    alert("Please log in to place a bid.");
    window.location.href = "/src/pages/login.html";
    return;
  }

  const user = getUser();
  const bidInput = document.getElementById("bid-amount-input");
  const bidAmount = bidInput.value;

  if (!bidAmount) {
    alert("Please enter a bid amount.");
    return;
  }

  const amount = parseInt(bidAmount);

  if (isNaN(amount) || amount <= currentBid) {
    alert(`Bid must be a number higher than ${currentBid} credits.`);
    return;
  }

  if (amount > user.credits) {
    alert(`You don't have enough credits. Your balance: ${user.credits}`);
    return;
  }

  try {
    await placeBid(listingId, amount);
    alert("Bid placed successfully!");
    // Reload the listing to show the new bid
    loadListing();
  } catch (error) {
    console.error("Error placing bid:", error);
    alert(`Failed to place bid: ${error.message}`);
  }
}

function renderListingDetail(listing) {
  const {
    id,
    title,
    description,
    media,
    endsAt,
    created,
    seller,
    bids = [],
    _count,
  } = listing;

  const imageUrl =
    media?.[0]?.url || "https://via.placeholder.com/800x600?text=No+Image";
  const bidCount = _count?.bids || 0;
  const currentBid =
    bids.length > 0 ? Math.max(...bids.map((bid) => bid.amount)) : 0;

  // Check if auction has ended
  const hasEnded = new Date(endsAt) < new Date();

  // Check if current user is the seller
  const user = getUser();
  const isOwner = user && seller && user.name === seller.name;

  container.innerHTML = `
    <div class="card p-4 mb-4" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); max-width: 1200px; margin: 0 auto;">
    <div class="row mb-4 justify-content-center">
      <div class="col-lg-6">
        <img src="${imageUrl}" alt="${title}" class="img-fluid rounded" />
      </div>

      <div class="col-lg-6">
        <h1 class="listing-detail-title mb-4">${title}</h1>
        
        <p class="mb-4">${description || "No description provided."}</p>
        
        <div class="mb-4">
          <p class="mb-1">
            <span class="text-muted">By:</span> 
            <a href="/src/pages/profile.html?name=${
              seller?.name
            }" class="seller-link">${seller?.name || "Unknown"}</a>
          </p>
        </div>

        <div class="d-flex flex-wrap gap-2 mb-3 align-items-center">
          <span class="badge" style="background-color: #D9B847;">Bids: ${bidCount}</span>
          <span class="badge" style="background-color: #D9B847;">Credits: ${currentBid}</span>
          ${
            bids.length > 0
              ? `<span class="text-muted">Recent Bidder: ${
                  bids.sort(
                    (a, b) => new Date(b.created) - new Date(a.created)
                  )[0].bidder?.name || "Unknown"
                }</span>`
              : ""
          }
        </div>

        ${
          listing.tags && listing.tags.length > 0
            ? `<div class="d-flex flex-wrap gap-2 mb-3">
          ${listing.tags
            .map(
              (tag) =>
                `<span class="badge" style="background-color: #D9B847;">${tag}</span>`
            )
            .join("")}
        </div>`
            : ""
        }

        <div class="mb-3">
          ${
            hasEnded
              ? '<span class="badge bg-danger">Auction Ended</span>'
              : `<span class="badge countdown-badge d-inline-flex flex-column align-items-start" style="width: auto;">
                  <span style="color: white;">Ends: ${formatEndDate(
                    endsAt
                  )}</span>
                  <span class="countdown-time">${formatTimeRemaining(
                    endsAt
                  )}</span>
                </span>`
          }
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-center">
        <div class="p-3 rounded" style="max-width: 500px; width: 100%; background-color: #C5D0C7; border: 1px solid #C5D0C7; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <p class="mb-2">Enter the amount you wish to bid, no less than: ${
            currentBid + 1
          }</p>
          <div class="d-flex gap-2">
            <input 
              type="number" 
              class="form-control" 
              id="bid-amount-input" 
              placeholder="Bid amount"
              min="${currentBid + 1}"
              ${hasEnded || isOwner ? "disabled" : ""}
            />
            <button 
              class="btn" 
              style="background-color: #00372B; color: white;"
              id="place-bid-btn"
              ${hasEnded || isOwner ? "disabled" : ""}
            >
              BID
            </button>
          </div>
          ${
            isOwner
              ? '<small class="text-muted d-block mt-2">You cannot bid on your own listing</small>'
              : ""
          }
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <h2 class="text-center mb-4" style="font-family: 'Cinzel', serif;">Bid History</h2>
        ${
          bids.length > 0
            ? `
        <div class="table-responsive">
          <table class="table">
            <tbody>
              ${bids
                .sort((a, b) => b.amount - a.amount)
                .map(
                  (bid) => `
                <tr>
                  <td>
                    <a href="/src/pages/profile.html?name=${
                      bid.bidder?.name
                    }" class="seller-link">${bid.bidder?.name || "Unknown"}</a>
                  </td>
                  <td class="text-center text-muted">${formatDate(
                    bid.created
                  )}</td>
                  <td class="text-end">
                    <span class="badge" style="background-color: #00372B;">Credits: ${
                      bid.amount
                    }</span>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : `
        <div class="alert alert-info text-center">
          No bids yet. Be the first to bid!
        </div>
        `
        }
      </div>
    </div>
    </div>
  `;

  // Add event listener for place bid button
  const placeBidBtn = document.getElementById("place-bid-btn");
  if (placeBidBtn) {
    placeBidBtn.addEventListener("click", () => handlePlaceBid(id, currentBid));
  }
}

// Initialize
updateNavigation();
loadListing();

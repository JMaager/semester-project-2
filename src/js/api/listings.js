import { API_AUCTION_URL } from "./constants.js";
import { fetchAPI } from "./client.js";

export async function getListings(
  limit = 12,
  page = 1,
  sort = "created",
  sortOrder = "desc",
  search = "",
  tag = "",
  activeOnly = false
) {
  let url = `${API_AUCTION_URL}/listings?limit=${limit}&page=${page}&sort=${sort}&sortOrder=${sortOrder}&_seller=true&_bids=true`;

  if (search) {
    url += `&_tag=${encodeURIComponent(search)}`;
  }

  if (tag) {
    url += `&_tag=${encodeURIComponent(tag)}`;
  }

  if (activeOnly) {
    url += `&_active=true`;
  }

  return await fetchAPI(url);
}

export async function getListing(id) {
  const url = `${API_AUCTION_URL}/listings/${id}?_seller=true&_bids=true`;
  return await fetchAPI(url);
}

export async function createListing(listingData) {
  return await fetchAPI(`${API_AUCTION_URL}/listings`, {
    method: "POST",
    body: JSON.stringify(listingData),
  });
}

export async function updateListing(id, listingData) {
  return await fetchAPI(`${API_AUCTION_URL}/listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(listingData),
  });
}

export async function deleteListing(id) {
  return await fetchAPI(`${API_AUCTION_URL}/listings/${id}`, {
    method: "DELETE",
  });
}

export async function placeBid(listingId, amount) {
  return await fetchAPI(`${API_AUCTION_URL}/listings/${listingId}/bids`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

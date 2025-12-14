import { API_AUCTION_URL } from "./constants.js";
import { fetchAPI } from "./client.js";

export async function getProfile(name) {
  const url = `${API_AUCTION_URL}/profiles/${name}?_listings=true&_wins=true&_seller=true&_bids=true`;
  return await fetchAPI(url);
}

export async function updateProfile(name, profileData) {
  return await fetchAPI(`${API_AUCTION_URL}/profiles/${name}`, {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
}

export async function getProfileBids(name) {
  const url = `${API_AUCTION_URL}/profiles/${name}/bids?_listings=true`;
  return await fetchAPI(url);
}

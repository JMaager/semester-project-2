import { API_AUTH_URL } from "./constants.js";
import { fetchAPI } from "./client.js";
import { saveToken, saveUser, clearStorage } from "../utils/storage.js";

export async function register(name, email, password) {
  const data = await fetchAPI(`${API_AUTH_URL}/register`, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  return data;
}

export async function login(email, password) {
  const data = await fetchAPI(`${API_AUTH_URL}/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data.data?.accessToken) {
    saveToken(data.data.accessToken);
    saveUser(data.data);
  }

  return data;
}

export function logout() {
  clearStorage();
  window.location.href = "/";
}

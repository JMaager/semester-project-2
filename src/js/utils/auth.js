import { isLoggedIn, getUser, saveUser } from "./storage.js";
import { logout } from "../api/auth.js";
import { getProfile } from "../api/profiles.js";

export async function refreshUserData() {
  if (!isLoggedIn()) {
    return null;
  }

  const user = getUser();

  if (!user?.name) {
    return null;
  }

  try {
    const profileData = await getProfile(user.name);

    if (profileData.data) {
      const updatedUser = {
        ...user,
        credits: profileData.data.credits,
        avatar: profileData.data.avatar,
        banner: profileData.data.banner,
        bio: profileData.data.bio,
      };

      saveUser(updatedUser);
      return updatedUser;
    }
  } catch (error) {
    console.error("Failed to refresh user data:", error);
    return user;
  }

  return user;
}

export async function updateNavigation() {
  const isAuthenticated = isLoggedIn();

  // Fetch fresh user data on page load
  const user = isAuthenticated ? await refreshUserData() : null;

  const navLoginLink = document.getElementById("nav-login-link");
  const navAvatarDropdown = document.getElementById("nav-avatar-dropdown");
  const navCreateBtn = document.getElementById("nav-create-btn");
  const navCredits = document.getElementById("nav-credits");
  const navAvatar = document.getElementById("nav-avatar");

  if (isAuthenticated && user) {
    navLoginLink?.classList.add("d-none");
    navAvatarDropdown?.classList.remove("d-none");
    navCreateBtn?.classList.remove("d-none");
    navCredits?.classList.remove("d-none");

    const creditsElement = document.getElementById("user-credits");
    if (creditsElement) {
      creditsElement.textContent = user.credits || 0;
    }

    // Set user avatar
    if (navAvatar && user.avatar) {
      navAvatar.src = user.avatar.url || user.avatar;
    }

    // Set profile link with username
    const profileLink = document.getElementById("nav-profile-link");
    if (profileLink && user.name) {
      profileLink.href = `/src/pages/profile.html?name=${user.name}`;
    }
  } else {
    navLoginLink?.classList.remove("d-none");
    navAvatarDropdown?.classList.add("d-none");
    navCreateBtn?.classList.add("d-none");
    navCredits?.classList.add("d-none");
  }

  const logoutBtn = document.getElementById("logout-btn-dropdown");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "/src/pages/login.html";
  }
}

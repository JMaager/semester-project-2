import { login } from "../api/auth.js";
import { validateEmail, validateRequired } from "../utils/validation.js";
import { isLoggedIn } from "../utils/storage.js";

if (isLoggedIn()) {
  window.location.href = "/";
}

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const formError = document.getElementById("form-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  emailError.textContent = "";
  passwordError.textContent = "";
  formError.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  let hasError = false;

  if (!validateRequired(email)) {
    emailError.textContent = "Email is required";
    hasError = true;
  } else if (!validateEmail(email)) {
    emailError.textContent = "Must use a @stud.noroff.no email";
    hasError = true;
  }

  if (!validateRequired(password)) {
    passwordError.textContent = "Password is required";
    hasError = true;
  }

  if (hasError) return;

  try {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    await login(email, password);
    window.location.href = "/";
  } catch (error) {
    formError.textContent = error.message;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = "Login";
  }
});

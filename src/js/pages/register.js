import { register } from "../api/auth.js";
import {
  validateEmail,
  validatePassword,
  validateRequired,
} from "../utils/validation.js";
import { isLoggedIn } from "../utils/storage.js";

if (isLoggedIn()) {
  window.location.href = "/";
}

const form = document.getElementById("register-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameError = document.getElementById("name-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const formError = document.getElementById("form-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  nameError.textContent = "";
  emailError.textContent = "";
  passwordError.textContent = "";
  formError.textContent = "";

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  let hasError = false;

  if (!validateRequired(name)) {
    nameError.textContent = "Username is required";
    hasError = true;
  }

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
  } else if (!validatePassword(password)) {
    passwordError.textContent = "Password must be at least 8 characters";
    hasError = true;
  }

  if (hasError) return;

  try {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

    await register(name, email, password);
    alert("Registration successful! Please login.");
    window.location.href = "/src/pages/login.html";
  } catch (error) {
    formError.textContent = error.message;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }
});

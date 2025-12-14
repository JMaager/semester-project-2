export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@stud\.noroff\.no$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  return password.length >= 8;
}

export function validateRequired(value) {
  return value && value.trim().length > 0;
}

export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}

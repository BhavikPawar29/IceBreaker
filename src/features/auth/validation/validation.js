function validatePassword(password) {
  if (password.length < 8 || password.length > 64) {
    return "Use 8-64 characters for your password.";
  }

  if (/\s/.test(password)) {
    return "Password cannot include spaces.";
  }

  if (!/^[\x21-\x7E]+$/.test(password)) {
    return "Use letters, numbers, and common symbols only.";
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Use at least one letter and one number.";
  }

  return "";
}

function validatePrivateName(name) {
  const normalizedName = name.replace(/\s+/g, " ").trim();

  if (!normalizedName) {
    return "Add your name so admins can review responsibly.";
  }

  if (normalizedName.length < 2 || normalizedName.length > 40) {
    return "Use a name between 2 and 40 characters.";
  }

  if (!/^[a-zA-Z0-9 .'-]+$/.test(normalizedName)) {
    return "Use letters, numbers, spaces, dots, apostrophes, or hyphens.";
  }

  return "";
}

export { validatePassword, validatePrivateName };

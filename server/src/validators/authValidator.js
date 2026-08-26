const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

const validatePhone = (phone) => {
  if (!phone) return true; // Optional during registration
  // Support standard Indian 10-digit format (e.g. 9876543210 or +919876543210) or standard international
  const phoneRegex = /^(\+91[\-\s]?)?[6789]\d{9}$|^(\+\d{1,3}[- ]?)?\d{10}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

const validateRegisterInput = (data) => {
  const errors = {};
  const { name, email, phone, password, confirmPassword } = data;

  if (!name || name.trim().length < 2) {
    errors.name = 'Full name is required (minimum 2 characters)';
  }

  if (!email || !validateEmail(email)) {
    errors.email = 'A valid email address is required';
  }

  if (phone && !validatePhone(phone)) {
    errors.phone = 'Please enter a valid 10-digit mobile number';
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateLoginInput = (data) => {
  const errors = {};
  const { email, password } = data;

  if (!email || !validateEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateEmail,
  validatePhone,
  validateRegisterInput,
  validateLoginInput,
};

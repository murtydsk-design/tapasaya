/**
 * Server-side Request Validators for Authentication.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(data = {}) {
  const { name, email, password } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return {
      isValid: false,
      message: 'Name is required and must be at least 2 characters long.'
    };
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return {
      isValid: false,
      message: 'A valid email address is required.'
    };
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return {
      isValid: false,
      message: 'Password is required and must be at least 6 characters long.'
    };
  }

  return {
    isValid: true,
    normalizedData: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    }
  };
}

function validateLogin(data = {}) {
  const { email, password } = data;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return {
      isValid: false,
      message: 'A valid email address is required.'
    };
  }

  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    return {
      isValid: false,
      message: 'Password is required.'
    };
  }

  return {
    isValid: true,
    normalizedData: {
      email: email.trim().toLowerCase(),
      password
    }
  };
}

module.exports = {
  validateRegister,
  validateLogin
};

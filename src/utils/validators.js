/**
 * Individual validation functions
 */

export function validateEmail(email) {
  const result = {
    isValid: false,
    errors: [],
    sanitized: null
  };

  if (!email || typeof email !== 'string') {
    result.errors.push('Email is required');
    return result;
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    result.errors.push('Invalid email format');
  } else if (sanitized.length > 254) {
    result.errors.push('Email address is too long');
  } else {
    result.isValid = true;
    result.sanitized = sanitized;
  }

  return result;
}

export function validatePhoneNumber(phone, countryCode = 'US') {
  const result = {
    isValid: false,
    errors: [],
    sanitized: null,
    formatted: null
  };

  if (!phone || typeof phone !== 'string') {
    result.errors.push('Phone number is required');
    return result;
  }

  let sanitized = phone.replace(/[^\d+]/g, '');

  if (countryCode === 'US') {
    if (sanitized.startsWith('+1')) {
      sanitized = sanitized.substring(2);
    } else if (sanitized.startsWith('1') && sanitized.length === 11) {
      sanitized = sanitized.substring(1);
    }

    if (sanitized.length !== 10) {
      result.errors.push('US phone number must be 10 digits');
    } else {
      result.isValid = true;
      result.sanitized = sanitized;
      result.formatted = `(${sanitized.substring(0, 3)}) ${sanitized.substring(3, 6)}-${sanitized.substring(6)}`;
    }
  } else {
    if (sanitized.length < 7 || sanitized.length > 15) {
      result.errors.push('Phone number must be between 7 and 15 digits');
    } else {
      result.isValid = true;
      result.sanitized = sanitized;
      result.formatted = sanitized;
    }
  }

  return result;
}

export function validateCurrencyAmount(amount, options = {}) {
  const result = {
    isValid: false,
    errors: [],
    sanitized: null,
    formatted: null
  };

  const {
    minAmount = 0.01,
    maxAmount = 1000000,
    currency = 'USD',
    allowZero = false
  } = options;

  if (amount === null || amount === undefined) {
    result.errors.push('Amount is required');
    return result;
  }

  let numericAmount;

  if (typeof amount === 'string') {
    const cleanAmount = amount.replace(/[$,\s]/g, '');
    numericAmount = parseFloat(cleanAmount);
  } else if (typeof amount === 'number') {
    numericAmount = amount;
  } else {
    result.errors.push('Amount must be a number or string');
    return result;
  }

  if (isNaN(numericAmount) || !isFinite(numericAmount)) {
    result.errors.push('Invalid amount format');
    return result;
  }

  numericAmount = Math.round(numericAmount * 100) / 100;

  if ((!allowZero && numericAmount <= 0) || (allowZero && numericAmount < 0)) {
    result.errors.push('Amount must be a positive number');
  } else if (numericAmount < minAmount) {
    result.errors.push(`Amount must be at least ${minAmount}`);
  } else if (numericAmount > maxAmount) {
    result.errors.push(`Amount cannot exceed ${maxAmount}`);
  } else {
    result.isValid = true;
    result.sanitized = numericAmount;
    result.formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(numericAmount);
  }

  return result;
}
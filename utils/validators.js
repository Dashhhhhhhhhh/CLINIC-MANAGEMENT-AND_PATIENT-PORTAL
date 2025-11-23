function validateEmail(email) {
  const isValidEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);

  if (!isValidEmail) {
    return { valid: false, error: "Invalid email format." };
  }
  return { valid: true };
}

function validatePassword(password) {
  const trimmed = typeof password === "string" ? password.trim() : "";

  if (trimmed === "") {
    return { valid: false, error: "Password is required." };
  }

  const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  if (!strongPasswordRegex.test(trimmed)) {
    return {
      valid: false,
      error: "Password must be at least 8 characters and include an uppercase letter, a number, and a special character."
    };
  }

  return { valid: true };
}

function validateUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    return { valid: false, error: "Invalid UUID format." };
  }
  return { valid: true };
}

function validateRequiredFields(obj, requiredFields) {
  const missing = [];

  for (const field of requiredFields) {
    const value = obj[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return { valid: false, missing };
  }
  return { valid: true };
}

function validatePhoneNumber(number) {

        const intlNum = /^\+639\d{9}$/;

        if (!number) {
            return { valid: false, error: "Phone number is required." };
        }


        if(number) {
            if (number.startsWith('09')) {
                number = number.replace(/^09/, '+639');
        }

        if(!intlNum.test(number)) {
            return { valid: false, error: "Invalid mobile number." };
        }
    }
}



function validateDate(input) {
  if (input === undefined || input === null) return null;

  const cleaned = typeof input === "string" ? input.trim() : input;

  const parsed = new Date (cleaned);

  if (isNaN(parsed.getTime())) return null;
  
  return parsed;
}

module.exports = { validateDate };
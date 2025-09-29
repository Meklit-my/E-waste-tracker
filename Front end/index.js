const form = document.getElementById("form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("btn");
const signUpMessage = document.querySelector(".SignUpMessage");

const errorMessages = {
  name: {
    required: "Full name is required",
    invalid: "Please enter your full name (first and last name)",
    minLength: "Name must be at least 2 characters long",
  },
  email: {
    required: "Email address is required",
    invalid: "Please enter a valid email address",
  },
  password: {
    required: "Password is required",
    minLength: "Password must be at least 8 characters long",
    strength: "Password must include uppercase, lowercase, and numbers",
  },
};

const validateName = (name) => {
  if (!name.trim())
    return { isValid: false, message: errorMessages.name.required };
  if (name.trim().length < 2)
    return { isValid: false, message: errorMessages.name.minLength };
  if (!name.trim().includes(" "))
    return { isValid: false, message: errorMessages.name.invalid };
  return { isValid: true, message: "" };
};

const validateEmail = (email) => {
  if (!email.trim())
    return { isValid: false, message: errorMessages.email.required };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: errorMessages.email.invalid };
  }
  return { isValid: true, message: "" };
};

const validatePassword = (password) => {
  if (!password)
    return { isValid: false, message: errorMessages.password.required };
  if (password.length < 8)
    return { isValid: false, message: errorMessages.password.minLength };

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return { isValid: false, message: errorMessages.password.strength };
  }
  return { isValid: true, message: "" };
};

const showError = (input, message) => {
  const inputGroup = input.parentElement;

  const existingError = inputGroup.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  input.classList.add("error");

  const errorElement = document.createElement("div");
  errorElement.className = "error-message";
  errorElement.textContent = message;
  errorElement.style.cssText = `
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 5px;
        text-align: left;
        width: 100%;
    `;

  inputGroup.appendChild(errorElement);
};

const removeError = (input) => {
  const inputGroup = input.parentElement;
  const existingError = inputGroup.querySelector(".error-message");

  if (existingError) {
    existingError.remove();
  }

  input.classList.remove("error");
};

const showSuccessMessage = (message) => {
  signUpMessage.innerHTML = "";
  signUpMessage.style.cssText = `
        color: #2E8B57;
        font-size: 1rem;
        font-weight: 500;
        text-align: center;
        margin: 15px 0;
        padding: 10px;
        background-color: #f0f9f4;
        border: 1px solid #2E8B57;
        border-radius: 8px;
        transition: all 0.3s ease;
    `;
  signUpMessage.textContent = message;
};

const setLoadingState = (isLoading) => {
  if (isLoading) {
    submitBtn.innerHTML =
      '<div class="loading-spinner"></div> Creating Account...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";
    submitBtn.style.cursor = "not-allowed";
  } else {
    submitBtn.innerHTML = "Get Started";
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
  }
};

nameInput.addEventListener("blur", () => {
  const validation = validateName(nameInput.value);
  if (!validation.isValid) {
    showError(nameInput, validation.message);
  } else {
    removeError(nameInput);
  }
});

emailInput.addEventListener("blur", () => {
  const validation = validateEmail(emailInput.value);
  if (!validation.isValid) {
    showError(emailInput, validation.message);
  } else {
    removeError(emailInput);
  }
});

passwordInput.addEventListener("blur", () => {
  const validation = validatePassword(passwordInput.value);
  if (!validation.isValid) {
    showError(passwordInput, validation.message);
  } else {
    removeError(passwordInput);
  }
});

[nameInput, emailInput, passwordInput].forEach((input) => {
  input.addEventListener("focus", () => {
    removeError(input);
  });
});
passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  const strengthIndicator =
    document.getElementById("password-strength") ||
    createPasswordStrengthIndicator();

  if (password.length === 0) {
    strengthIndicator.textContent = "";
    return;
  }

  let strength = 0;
  let feedback = "";

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  switch (strength) {
    case 0:
    case 1:
      feedback = "Very Weak";
      strengthIndicator.style.color = "#e74c3c";
      break;
    case 2:
      feedback = "Weak";
      strengthIndicator.style.color = "#e67e22";
      break;
    case 3:
      feedback = "Good";
      strengthIndicator.style.color = "#f39c12";
      break;
    case 4:
      feedback = "Strong";
      strengthIndicator.style.color = "#2E8B57";
      break;
    case 5:
      feedback = "Very Strong";
      strengthIndicator.style.color = "#27ae60";
      break;
  }

  strengthIndicator.textContent = `Password strength: ${feedback}`;
});

function createPasswordStrengthIndicator() {
  const strengthIndicator = document.createElement("div");
  strengthIndicator.id = "password-strength";
  strengthIndicator.style.cssText = `
        font-size: 0.8rem;
        margin-top: 5px;
        text-align: left;
        width: 100%;
        height: 15px;
    `;
  passwordInput.parentElement.appendChild(strengthIndicator);
  return strengthIndicator;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameValidation = validateName(nameInput.value);
  const emailValidation = validateEmail(emailInput.value);
  const passwordValidation = validatePassword(passwordInput.value);

  let hasErrors = false;

  if (!nameValidation.isValid) {
    showError(nameInput, nameValidation.message);
    hasErrors = true;
  }

  if (!emailValidation.isValid) {
    showError(emailInput, emailValidation.message);
    hasErrors = true;
  }

  if (!passwordValidation.isValid) {
    showError(passwordInput, passwordValidation.message);
    hasErrors = true;
  }

  if (hasErrors) {
    form.style.animation = "shake 0.5s ease-in-out";
    setTimeout(() => {
      form.style.animation = "";
    }, 500);
    return;
  }

  setLoadingState(true);

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    showSuccessMessage(
      "🎉 Account created successfully! Redirecting to sign in..."
    );

    const userData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("currentUser", JSON.stringify(userData));

    setTimeout(() => {
      window.location.href = "signin.html";
    }, 2000);
  } catch (error) {
    showSuccessMessage("❌ Registration failed. Please try again.");
    console.error("Registration error:", error);
  } finally {
    setLoadingState(false);
  }
});

const style = document.createElement("style");
style.textContent = `
    .error {
        border-color: #e74c3c !important;
        background-color: #fdf2f2 !important;
    }
    
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .input-group {
        position: relative;
    }
    
    .error-message {
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 5px;
        text-align: left;
        width: 100%;
    }
`;
document.head.appendChild(style);

window.addEventListener("load", () => {
  form.reset();
  signUpMessage.innerHTML = "";
  signUpMessage.style.cssText = "";
});

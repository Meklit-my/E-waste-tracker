const form = document.getElementById("signin");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("btn");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const signinMessage = document.querySelector(".signinMessage");

const errorMessages = {
  email: {
    required: "Email address is required",
    invalid: "Please enter a valid email address",
    notFound: "No account found with this email address",
  },
  password: {
    required: "Password is required",
    incorrect: "Incorrect password",
    minLength: "Password must be at least 8 characters long",
  },
};

window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("from") === "signup") {
    showSuccessMessage("Account created successfully! Please sign in.");
  }

  emailInput.focus();
});

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

const showMessage = (message, type = "error") => {
  signinMessage.innerHTML = "";
  signinMessage.className = `signinMessage ${type}`;
  signinMessage.style.cssText = `
        color: ${type === "success" ? "#2E8B57" : "#e74c3c"};
        font-size: 0.95rem;
        font-weight: 500;
        text-align: center;
        margin: 15px 0;
        padding: 12px;
        background-color: ${type === "success" ? "#f0f9f4" : "#fdf2f2"};
        border: 1px solid ${type === "success" ? "#2E8B57" : "#e74c3c"};
        border-radius: 8px;
        transition: all 0.3s ease;
    `;
  signinMessage.textContent = message;
};

const showSuccessMessage = (message) => {
  showMessage(message, "success");
};

const setLoadingState = (isLoading) => {
  if (isLoading) {
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Signing In...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";
    submitBtn.style.cursor = "not-allowed";
  } else {
    submitBtn.innerHTML = "Sign In";
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
  }
};

const simulateUserDatabase = {
  "demo@warka.com": {
    password: "Demo123!",
    name: "Demo User",
    email: "demo@warka.com",
    createdAt: new Date().toISOString(),
  },
};

const authenticateUser = async (email, password) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (email === "demo@warka.com" && password === "Demo123!") {
    return {
      success: true,
      user: simulateUserDatabase[email],
      message: "Sign in successful!",
    };
  }

  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (user.email === email) {
      return {
        success: true,
        user: user,
        message: "Sign in successful!",
      };
    }
  }

  return {
    success: false,
    message: "Invalid email or password",
  };
};

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
[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("focus", () => {
    removeError(input);
    if (signinMessage.textContent) {
      signinMessage.innerHTML = "";
      signinMessage.style.cssText = "";
    }
  });
});

passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSignIn();
  }
});

forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  if (email && validateEmail(email).isValid) {
    showMessage(
      `Password reset instructions have been sent to ${email}`,
      "success"
    );
  } else {
    showMessage(
      "Please enter your email address first to reset your password."
    );
    emailInput.focus();
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSignIn();
});

const handleSignIn = async () => {
  const emailValidation = validateEmail(emailInput.value);
  const passwordValidation = validatePassword(passwordInput.value);

  let hasErrors = false;

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
    const authResult = await authenticateUser(
      emailInput.value.trim(),
      passwordInput.value
    );

    if (authResult.success) {
      showSuccessMessage("✅ " + authResult.message);

      // Store user session
      localStorage.setItem("currentUser", JSON.stringify(authResult.user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("lastLogin", new Date().toISOString());

      setTimeout(() => {
        window.location.href = "waste-form.html";
      }, 1500);
    } else {
      showMessage("❌ " + authResult.message);
      passwordInput.value = "";
      passwordInput.focus();
    }
  } catch (error) {
    showMessage("❌ Sign in failed. Please try again.");
    console.error("Authentication error:", error);
  } finally {
    setLoadingState(false);
  }
};

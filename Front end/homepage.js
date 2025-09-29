const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const usersCount = document.getElementById("usersCount");
const wasteTracked = document.getElementById("wasteTracked");
const co2Reduced = document.getElementById("co2Reduced");

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializeScrollEffects();
  initializeCounters();
  initializeSmoothScrolling();
});

function initializeNavigation() {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 100) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)";
      navbar.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)";
      navbar.style.boxShadow = "none";
    }
  });
}

function initializeScrollEffects() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll(
    ".feature-card, .step, .benefits-text, .benefits-visual"
  );
  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
}

function initializeCounters() {
  const counters = [
    { element: usersCount, target: 1250, suffix: "+" },
    { element: wasteTracked, target: 47800, suffix: "+" },
    { element: co2Reduced, target: 135, suffix: "+" },
  ];

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counters.forEach((counter) => {
            animateCounter(counter.element, counter.target, counter.suffix);
          });
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counterObserver.observe(document.querySelector(".hero-stats"));
}

function animateCounter(element, target, suffix = "") {
  let current = 0;
  const increment = target / 100;
  const duration = 2000;
  const stepTime = Math.abs(Math.floor(duration / (target / increment)));

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target + suffix;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current) + suffix;
    }
  }, stepTime);
}

function initializeSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.querySelector(".navbar").offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll("img");

  images.forEach((img) => {
    img.style.opacity = "0";
    img.style.transition = "opacity 0.5s ease";

    img.addEventListener("load", () => {
      img.style.opacity = "1";
    });

    setTimeout(() => {
      img.style.opacity = "1";
    }, 1000);
  });
});

function addInteractiveEffects() {
  const buttons = document.querySelectorAll(".btn-primary, .btn-secondary");
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)";
    });

    button.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  const featureCards = document.querySelectorAll(".feature-card");
  featureCards.forEach((card) => {
    card.addEventListener("click", function () {
      this.style.transform = "translateY(-5px) scale(1.02)";
      setTimeout(() => {
        this.style.transform = "translateY(-10px) scale(1)";
      }, 150);
    });
  });
}

addInteractiveEffects();

function handleNewsletterSubscription(email) {
  console.log("Newsletter subscription for:", email);

  showNotification("Thank you for subscribing to our newsletter!", "success");
}

function showNotification(message, type = "info") {
  const existingNotification = document.querySelector(".global-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `global-notification notification-${type}`;
  notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === "success"
            ? "#2E8B57"
            : type === "warning"
            ? "#f39c12"
            : "#e74c3c"
        };
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;

  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

  closeBtn.addEventListener("click", () => {
    notification.remove();
  });

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);

  document.body.appendChild(notification);
}

const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeNavigation,
    initializeScrollEffects,
    initializeCounters,
    initializeSmoothScrolling,
    handleNewsletterSubscription,
    showNotification,
  };
}

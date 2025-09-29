// DOM Elements
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const welcomeUser = document.getElementById("welcomeUser");
const signoutBtn = document.getElementById("signoutBtn");
const timeRange = document.getElementById("timeRange");
const totalItems = document.getElementById("totalItems");
const categoriesCount = document.getElementById("categoriesCount");
const co2Saved = document.getElementById("co2Saved");
const topCategory = document.getElementById("topCategory");
const totalTrend = document.getElementById("totalTrend");
const categoriesTrend = document.getElementById("categoriesTrend");
const co2Trend = document.getElementById("co2Trend");
const topCategoryTrend = document.getElementById("topCategoryTrend");
const exportCSV = document.getElementById("exportCSV");
const exportPDF = document.getElementById("exportPDF");
const positiveInsight = document.getElementById("positiveInsight");
const warningInsight = document.getElementById("warningInsight");
const tipInsight = document.getElementById("tipInsight");

// Chart instances
let trendChart, categoryChart, weeklyChart, monthlyChart, impactChart;
let currentTrendType = "line";

// Constants
const WASTE_ENTRIES_KEY = "warka_waste_entries";
const CURRENT_USER_KEY = "currentUser";

// CO2 savings factors (kg CO2 per item saved from landfill)
const CO2_FACTORS = {
  plastic: 0.05,
  paper: 0.02,
  glass: 0.03,
  metal: 0.08,
  ewaste: 0.15,
  organic: 0.01,
  other: 0.04,
};

// Category colors for charts
const CATEGORY_COLORS = {
  plastic: "#3498db",
  paper: "#9b59b6",
  glass: "#2ecc71",
  metal: "#e67e22",
  ewaste: "#e74c3c",
  organic: "#f1c40f",
  other: "#95a5a6",
};

// Initialize the analytics page
document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication();
  initializeNavigation();
  initializeEventListeners();
  loadAnalyticsData();
});

// Check if user is authenticated
function checkAuthentication() {
  const currentUser = localStorage.getItem(CURRENT_USER_KEY);
  if (!currentUser) {
    window.location.href = "signin.html";
    return;
  }

  // Display welcome message
  try {
    const user = JSON.parse(currentUser);
    welcomeUser.textContent = `Welcome, ${user.name || "User"}!`;
  } catch (error) {
    console.error("Error parsing user data:", error);
    welcomeUser.textContent = "Welcome!";
  }
}

// Initialize navigation
function initializeNavigation() {
  // Hamburger menu toggle
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close mobile menu when clicking on a link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

  // Sign out functionality
  signoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("lastLogin");
      window.location.href = "signin.html";
    }
  });
}

// Initialize event listeners
function initializeEventListeners() {
  // Time range filter
  timeRange.addEventListener("change", loadAnalyticsData);

  // Chart type toggle
  document.querySelectorAll(".chart-action-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const chartType = this.getAttribute("data-chart");
      document
        .querySelectorAll(".chart-action-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentTrendType = chartType;
      updateTrendChart();
    });
  });

  // Export buttons
  exportCSV.addEventListener("click", exportDataAsCSV);
  exportPDF.addEventListener("click", exportDataAsPDF);
}

// Load and process analytics data
function loadAnalyticsData() {
  const entries = getWasteEntries();
  const timeRangeValue = timeRange.value;
  const filteredEntries = filterEntriesByTimeRange(entries, timeRangeValue);

  updateSummaryStats(filteredEntries, entries);
  updateCharts(filteredEntries);
  updateInsights(filteredEntries);
}

// Get waste entries from localStorage
function getWasteEntries() {
  const entries = localStorage.getItem(WASTE_ENTRIES_KEY);
  return entries ? JSON.parse(entries) : [];
}

// Filter entries by time range
function filterEntriesByTimeRange(entries, timeRange) {
  if (timeRange === "all") return entries;

  const days = parseInt(timeRange);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= cutoffDate;
  });
}

// Update summary statistics
function updateSummaryStats(currentEntries, allEntries) {
  // Total items
  const total = currentEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  totalItems.textContent = total.toLocaleString();

  // Categories count
  const uniqueCategories = new Set(
    currentEntries.map((entry) => entry.category)
  );
  categoriesCount.textContent = uniqueCategories.size;

  // CO2 saved
  const co2 = currentEntries.reduce((sum, entry) => {
    return sum + entry.quantity * (CO2_FACTORS[entry.category] || 0.04);
  }, 0);
  co2Saved.textContent = co2.toFixed(1);

  // Top category
  const categoryCounts = currentEntries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.quantity;
    return acc;
  }, {});

  const topCat = Object.keys(categoryCounts).reduce(
    (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
    "none"
  );

  topCategory.textContent =
    topCat === "none" ? "-" : topCat.charAt(0).toUpperCase() + topCat.slice(1);

  // Calculate trends (simplified - in real app, compare with previous period)
  updateTrendElements(total, uniqueCategories.size, co2, topCat);
}

// Update trend elements
function updateTrendElements(total, categories, co2, topCategory) {
  // Simple random trends for demo (in real app, calculate actual trends)
  const totalChange = (Math.random() * 20 - 10).toFixed(1);
  const categoriesChange = (Math.random() * 15 - 7.5).toFixed(1);
  const co2Change = (Math.random() * 25 - 5).toFixed(1);

  updateTrendElement(totalTrend, totalChange);
  updateTrendElement(categoriesTrend, categoriesChange);
  updateTrendElement(co2Trend, co2Change);

  // Top category trend (always positive for demo)
  topCategoryTrend.className = "stat-trend positive";
  topCategoryTrend.innerHTML = '<i class="fas fa-star"></i><span>#1</span>';
}

// Update individual trend element
function updateTrendElement(element, change) {
  const isPositive = parseFloat(change) > 0;
  const isNegative = parseFloat(change) < 0;

  element.className = `stat-trend ${
    isPositive ? "positive" : isNegative ? "negative" : "neutral"
  }`;
  element.innerHTML = `<i class="fas fa-arrow-${
    isPositive ? "up" : isNegative ? "down" : "minus"
  }"></i><span>${Math.abs(change)}%</span>`;
}

// Update all charts
function updateCharts(entries) {
  updateTrendChart(entries);
  updateCategoryChart(entries);
  updateWeeklyChart(entries);
  updateMonthlyChart(entries);
  updateImpactChart(entries);
}

// Update trend chart (line/bar)
function updateTrendChart(entries) {
  const ctx = document.getElementById("trendChart").getContext("2d");

  // Destroy existing chart if it exists
  if (trendChart) {
    trendChart.destroy();
  }

  // Process data for trend chart
  const { labels, data } = processTrendData(entries);

  const chartConfig = {
    type: currentTrendType,
    data: {
      labels: labels,
      datasets: [
        {
          label: "Waste Items",
          data: data,
          borderColor: "#2E8B57",
          backgroundColor:
            currentTrendType === "line" ? "transparent" : "#2E8B57",
          borderWidth: 3,
          fill: currentTrendType === "line",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
          title: {
            display: true,
            text: "Number of Items",
          },
        },
        x: {
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
  };

  trendChart = new Chart(ctx, chartConfig);
}

// Process data for trend chart
function processTrendData(entries) {
  // Group entries by date
  const dateGroups = entries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = 0;
    }
    groups[date] += entry.quantity;
    return groups;
  }, {});

  // Sort dates and get last 15 entries for display
  const sortedDates = Object.keys(dateGroups).sort();
  const displayDates = sortedDates.slice(-15); // Show last 15 dates

  return {
    labels: displayDates.map((date) => formatChartDate(date)),
    data: displayDates.map((date) => dateGroups[date]),
  };
}

// Update category pie chart
function updateCategoryChart(entries) {
  const ctx = document.getElementById("categoryChart").getContext("2d");

  if (categoryChart) {
    categoryChart.destroy();
  }

  const categoryData = processCategoryData(entries);

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categoryData.labels,
      datasets: [
        {
          data: categoryData.data,
          backgroundColor: categoryData.colors,
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 12,
            padding: 15,
          },
        },
      },
      cutout: "60%",
    },
  });
}

// Process data for category chart
function processCategoryData(entries) {
  const categoryCounts = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.quantity;
    return acc;
  }, {});

  const labels = Object.keys(categoryCounts).map(
    (cat) => cat.charAt(0).toUpperCase() + cat.slice(1)
  );
  const data = Object.values(categoryCounts);
  const colors = Object.keys(categoryCounts).map((cat) => CATEGORY_COLORS[cat]);

  return { labels, data, colors };
}

// Update weekly pattern chart
function updateWeeklyChart(entries) {
  const ctx = document.getElementById("weeklyChart").getContext("2d");

  if (weeklyChart) {
    weeklyChart.destroy();
  }

  const weeklyData = processWeeklyData(entries);

  weeklyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Average Waste",
          data: weeklyData,
          backgroundColor: "#2E8B57",
          borderColor: "#1f6b3d",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

// Process weekly data
function processWeeklyData(entries) {
  const days = [0, 0, 0, 0, 0, 0, 0]; // Monday to Sunday
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Monday-based week
    days[dayOfWeek] += entry.quantity;
    dayCounts[dayOfWeek]++;
  });

  // Calculate averages
  return days.map((total, index) =>
    dayCounts[index] > 0 ? Math.round(total / dayCounts[index]) : 0
  );
}

// Update monthly comparison chart
function updateMonthlyChart(entries) {
  const ctx = document.getElementById("monthlyChart").getContext("2d");

  if (monthlyChart) {
    monthlyChart.destroy();
  }

  const monthlyData = processMonthlyData(entries);

  monthlyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: monthlyData.labels,
      datasets: [
        {
          label: "Current Period",
          data: monthlyData.current,
          backgroundColor: "#2E8B57",
          borderColor: "#1f6b3d",
          borderWidth: 1,
        },
        {
          label: "Previous Period",
          data: monthlyData.previous,
          backgroundColor: "#95a5a6",
          borderColor: "#7f8c8d",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

// Process monthly data (simplified for demo)
function processMonthlyData(entries) {
  // For demo purposes, generate random data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const current = months.map(() => Math.floor(Math.random() * 50) + 10);
  const previous = months.map(() => Math.floor(Math.random() * 50) + 10);

  return {
    labels: months,
    current: current,
    previous: previous,
  };
}

// Update environmental impact chart
function updateImpactChart(entries) {
  const ctx = document.getElementById("impactChart").getContext("2d");

  if (impactChart) {
    impactChart.destroy();
  }

  const impactData = processImpactData(entries);

  impactChart = new Chart(ctx, {
    type: "polarArea",
    data: {
      labels: impactData.labels,
      datasets: [
        {
          data: impactData.data,
          backgroundColor: impactData.colors,
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
        },
      },
    },
  });
}

// Process impact data
function processImpactData(entries) {
  const impactByCategory = entries.reduce((acc, entry) => {
    const co2 = entry.quantity * (CO2_FACTORS[entry.category] || 0.04);
    acc[entry.category] = (acc[entry.category] || 0) + co2;
    return acc;
  }, {});

  const labels = Object.keys(impactByCategory).map(
    (cat) => cat.charAt(0).toUpperCase() + cat.slice(1)
  );
  const data = Object.values(impactByCategory);
  const colors = Object.keys(impactByCategory).map(
    (cat) => CATEGORY_COLORS[cat]
  );

  return { labels, data, colors };
}

// Update insights and recommendations
function updateInsights(entries) {
  if (entries.length === 0) {
    positiveInsight.textContent =
      "Start logging your waste to get personalized insights!";
    warningInsight.textContent = "No data available yet.";
    tipInsight.textContent =
      "Try logging your first waste entry to begin tracking.";
    return;
  }

  const totalItems = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const avgPerDay =
    totalItems /
    (entries.length > 0 ? new Set(entries.map((e) => e.date)).size : 1);
  const categoryData = processCategoryData(entries);
  const topCategory = categoryData.labels[0];

  // Positive insight
  if (avgPerDay < 5) {
    positiveInsight.textContent =
      "Excellent! Your daily waste output is below average.";
  } else if (avgPerDay < 10) {
    positiveInsight.textContent =
      "Good progress! You're maintaining reasonable waste levels.";
  } else {
    positiveInsight.textContent =
      "You're consistently tracking your waste - great habit!";
  }

  // Warning insight
  warningInsight.textContent = `Your ${topCategory} waste is highest. Consider reduction strategies.`;

  // Tip insight
  const tips = [
    "Try composting organic waste to reduce landfill contribution.",
    "Consider reusable alternatives for your most common waste items.",
    "Recycling properly can significantly reduce your environmental impact.",
    "Buying in bulk reduces packaging waste and saves money.",
    "Repair instead of replace - extend the life of your items.",
  ];
  tipInsight.textContent = tips[Math.floor(Math.random() * tips.length)];
}

// Export data as CSV
function exportDataAsCSV() {
  const entries = getWasteEntries();
  if (entries.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = [
    "Date",
    "Category",
    "Quantity",
    "Description",
    "CO2 Saved (kg)",
  ];
  const csvContent = [
    headers.join(","),
    ...entries.map((entry) =>
      [
        entry.date,
        entry.category,
        entry.quantity,
        `"${entry.description || ""}"`,
        (entry.quantity * (CO2_FACTORS[entry.category] || 0.04)).toFixed(2),
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `warka-waste-data-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification("Data exported successfully as CSV!", "success");
}

// Export data as PDF (simulated)
function exportDataAsPDF() {
  showNotification("PDF export feature coming soon!", "info");
  // In a real application, you would use a library like jsPDF
  // to generate a proper PDF report
}

// Utility functions
function formatChartDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function showNotification(message, type = "info") {
  // Remove existing notification
  const existingNotification = document.querySelector(".global-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `global-notification notification-${type}`;
  notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;

  // Add styles
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

  // Add close button styles
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

  // Add close functionality
  closeBtn.addEventListener("click", () => {
    notification.remove();
  });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);

  document.body.appendChild(notification);
}

// Add CSS for animations
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

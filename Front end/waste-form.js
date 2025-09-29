
const wasteForm = document.getElementById('wasteForm');
const categoryInput = document.getElementById('category');
const quantityInput = document.getElementById('quantity');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const submitBtn = document.getElementById('btn');
const signoutBtn = document.getElementById('signout');
const clearHistoryBtn = document.getElementById('clearHistory');
const welcomeMessage = document.getElementById('welcomeMessage');
const todayWasteElement = document.getElementById('todayWaste');
const weekWasteElement = document.getElementById('weekWaste');
const totalWasteElement = document.getElementById('totalWaste');
const wasteEntriesContainer = document.getElementById('wasteEntries');


const WASTE_ENTRIES_KEY = 'warka_waste_entries';
const CURRENT_USER_KEY = 'currentUser';


document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    initializeForm();
    loadWasteEntries();
    updateStatistics();
});


function checkAuthentication() {
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUser) {
        window.location.href = 'signin.html';
        return;
    }

    
    try {
        const user = JSON.parse(currentUser);
        welcomeMessage.textContent = `Welcome back, ${user.name || 'User'}!`;
    } catch (error) {
        console.error('Error parsing user data:', error);
        welcomeMessage.textContent = 'Welcome back!';
    }

    
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;
}


function initializeForm() {
    wasteForm.addEventListener('submit', handleFormSubmit);
    signoutBtn.addEventListener('click', handleSignOut);
    clearHistoryBtn.addEventListener('click', handleClearHistory);

    
    quantityInput.addEventListener('input', validateQuantity);
    dateInput.addEventListener('change', validateDate);
}


function validateQuantity() {
    const quantity = parseInt(quantityInput.value);
    if (quantity < 1) {
        quantityInput.value = 1;
    } else if (quantity > 1000) {
        quantityInput.value = 1000;
    }
}


function validateDate() {
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
        dateInput.value = today.toISOString().split('T')[0];
        showNotification('Cannot select future dates. Using today\'s date.', 'warning');
    }
}


function handleFormSubmit(e) {
    e.preventDefault();

  
    if (!validateForm()) {
        return;
    }

 
    const wasteEntry = {
        id: generateId(),
        category: categoryInput.value,
        quantity: parseInt(quantityInput.value),
        description: descriptionInput.value.trim(),
        date: dateInput.value,
        timestamp: new Date().toISOString()
    };

  
    saveWasteEntry(wasteEntry);
    addWasteEntryToDOM(wasteEntry);
    updateStatistics();
    resetForm();
    showNotification('Waste entry added successfully!', 'success');
}

function validateForm() {
    let isValid = true;

  
    if (!categoryInput.value) {
        showInputError(categoryInput, 'Please select a waste category');
        isValid = false;
    } else {
        removeInputError(categoryInput);
    }

    if (!quantityInput.value || parseInt(quantityInput.value) < 1) {
        showInputError(quantityInput, 'Please enter a valid quantity');
        isValid = false;
    } else {
        removeInputError(quantityInput);
    }

    if (!dateInput.value) {
        showInputError(dateInput, 'Please select a date');
        isValid = false;
    } else {
        removeInputError(dateInput);
    }

    return isValid;
}

function showInputError(input, message) {
    const inputGroup = input.parentElement;
    input.classList.add('error');

    const existingError = inputGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    inputGroup.appendChild(errorElement);
}

function removeInputError(input) {
    const inputGroup = input.parentElement;
    input.classList.remove('error');

    const existingError = inputGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveWasteEntry(entry) {
    const entries = getWasteEntries();
    entries.push(entry);
    localStorage.setItem(WASTE_ENTRIES_KEY, JSON.stringify(entries));
}

function getWasteEntries() {
    const entries = localStorage.getItem(WASTE_ENTRIES_KEY);
    return entries ? JSON.parse(entries) : [];
}

function loadWasteEntries() {
    const entries = getWasteEntries();
    
    const emptyState = wasteEntriesContainer.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

   
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));


    entries.forEach(entry => addWasteEntryToDOM(entry));

    if (entries.length === 0) {
        showEmptyState();
    }
}


function addWasteEntryToDOM(entry) {
    
    const emptyState = wasteEntriesContainer.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const entryElement = document.createElement('div');
    entryElement.className = 'waste-entry';
    entryElement.innerHTML = `
        <div class="entry-info">
            <span class="entry-category category-${entry.category}">
                ${getCategoryDisplayName(entry.category)}
            </span>
            <div class="entry-details">
                <span class="entry-description">${entry.description || 'No description'}</span>
                <span class="entry-date">${formatDate(entry.date)}</span>
            </div>
        </div>
        <div class="entry-actions">
            <span class="entry-quantity">${entry.quantity} items</span>
            <button class="delete-entry" data-id="${entry.id}">🗑️</button>
        </div>
    `;
    const deleteBtn = entryElement.querySelector('.delete-entry');
    deleteBtn.addEventListener('click', () => deleteWasteEntry(entry.id));

    wasteEntriesContainer.appendChild(entryElement);
}

function getCategoryDisplayName(category) {
    const categoryNames = {
        plastic: '♻️ Plastic',
        paper: '📄 Paper',
        glass: '🥛 Glass',
        metal: '🔩 Metal',
        ewaste: '💻 E-waste',
        organic: '🍎 Organic',
        other: '📦 Other'
    };
    return categoryNames[category] || category;
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}


function deleteWasteEntry(entryId) {
    if (!confirm('Are you sure you want to delete this waste entry?')) {
        return;
    }

    const entries = getWasteEntries();
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    localStorage.setItem(WASTE_ENTRIES_KEY, JSON.stringify(filteredEntries));

    wasteEntriesContainer.innerHTML = '';
    loadWasteEntries();
    updateStatistics();
    showNotification('Waste entry deleted successfully!', 'success');
}

function updateStatistics() {
    const entries = getWasteEntries();
    const today = new Date().toISOString().split('T')[0];
    
    const todayWaste = entries
        .filter(entry => entry.date === today)
        .reduce((sum, entry) => sum + entry.quantity, 0);

    const weekWaste = calculateWeekWaste(entries);
    const totalWaste = entries.reduce((sum, entry) => sum + entry.quantity, 0);

    todayWasteElement.textContent = `${todayWaste} item${todayWaste !== 1 ? 's' : ''}`;
    weekWasteElement.textContent = `${weekWaste} item${weekWaste !== 1 ? 's' : ''}`;
    totalWasteElement.textContent = `${totalWaste} item${totalWaste !== 1 ? 's' : ''}`;
}

function calculateWeekWaste(entries) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return entries
        .filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startOfWeek;
        })
        .reduce((sum, entry) => sum + entry.quantity, 0);
}

function resetForm() {
    wasteForm.reset();
    
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    [categoryInput, quantityInput, dateInput].forEach(input => {
        removeInputError(input);
    });
}

function showEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = '<p>No waste entries yet. Start logging your waste above!</p>';
    wasteEntriesContainer.appendChild(emptyState);
}

function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('lastLogin');
        window.location.href = 'signin.html';
    }
}
function handleClearHistory() {
    if (!confirm('Are you sure you want to clear all waste entries? This action cannot be undone.')) {
        return;
    }

    localStorage.removeItem(WASTE_ENTRIES_KEY);
    wasteEntriesContainer.innerHTML = '';
    showEmptyState();
    updateStatistics();
    showNotification('All waste entries cleared successfully!', 'success');
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2E8B57' : type === 'warning' ? '#f39c12' : '#e74c3c'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;

    const closeBtn = notification.querySelector('.notification-close');
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

    closeBtn.addEventListener('click', () => {
        notification.remove();
    });

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);

    document.body.appendChild(notification);
}

const style = document.createElement('style');
style.textContent = `
    .error {
        border-color: #e74c3c !important;
        background-color: #fdf2f2 !important;
    }
    
    .error-message {
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 5px;
        text-align: left;
        width: 100%;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
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
    
    .entry-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .delete-entry {
        background: none;
        border: none;
        font-size: 1.1rem;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    .delete-entry:hover {
        background: #fdf2f2;
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);
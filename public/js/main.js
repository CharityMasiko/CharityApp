// Main JavaScript for landing page

// DOM Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loadingSpinner = document.getElementById('loadingSpinner');
const alertContainer = document.getElementById('alertContainer');

// Show login form
function showLoginForm() {
    registerModal.style.display = 'none';
    loginModal.style.display = 'block';
}

// Show register form
function showRegisterForm() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
}

// Switch to register form
function switchToRegister() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
}

// Switch to login form
function switchToLogin() {
    registerModal.style.display = 'none';
    loginModal.style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Show loading spinner
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Show alert
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

// API Helper Functions
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include', // Include cookies for session
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        showLoading();
        
        const response = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        if (response.success) {
            showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
});

// Register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const registerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    // Validate password confirmation
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword && registerData.password !== confirmPassword.value) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const response = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(registerData)
        });
        
        if (response.success) {
            showAlert('Registration successful! Please login.', 'success');
            switchToLogin();
            registerForm.reset();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeModal('loginModal');
    }
    if (e.target === registerModal) {
        closeModal('registerModal');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Check if user is already logged in
async function checkAuthStatus() {
    try {
        const response = await apiCall('/api/auth/me');
        if (response.success) {
            // User is logged in, redirect to dashboard
            window.location.href = '/dashboard';
        }
    } catch (error) {
        // User is not logged in, stay on landing page
        console.log('User not authenticated');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    
    // Set current date for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.value = today;
    });
    
    // Set current month for month inputs
    const currentMonth = new Date().toISOString().slice(0, 7);
    document.querySelectorAll('input[type="month"]').forEach(input => {
        input.value = currentMonth;
    });
    
    // Add password confirmation field to register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const passwordField = document.getElementById('registerPassword');
        if (passwordField && !document.getElementById('confirmPassword')) {
            const confirmPasswordDiv = document.createElement('div');
            confirmPasswordDiv.className = 'form-group';
            confirmPasswordDiv.innerHTML = `
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
            `;
            passwordField.parentNode.parentNode.insertBefore(confirmPasswordDiv, passwordField.parentNode.nextSibling);
        }
    }
});



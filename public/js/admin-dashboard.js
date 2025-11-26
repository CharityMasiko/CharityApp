// Admin Dashboard JavaScript

// Global variables
let currentUser = null;
let charts = {};

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.dashboard-section');
const userName = document.getElementById('userName');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
    await loadAdminData();
    setupEventListeners();
    setupNavigation();
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await apiCall('/api/auth/me');
        if (response.success) {
            currentUser = response.user;
            userName.textContent = currentUser.name;
            
            // Redirect non-admin users to user dashboard
            if (currentUser.role !== 'admin') {
                window.location.href = '/dashboard';
            }
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/';
    }
}

// Load admin data
async function loadAdminData() {
    try {
        await Promise.all([
            loadSystemStats(),
            loadUsers(),
            loadEducation(),
            loadNotifications()
        ]);
    } catch (error) {
        console.error('Error loading admin data:', error);
        showAlert('Error loading data', 'error');
    }
}

// Load system statistics
async function loadSystemStats() {
    try {
        const response = await apiCall('/api/admin/stats');
        updateSystemStats(response.stats);
        createSystemCharts(response.stats);
        loadRecentActivity(response.stats.recentActivity);
    } catch (error) {
        console.error('Error loading system stats:', error);
    }
}

// Update system statistics
function updateSystemStats(stats) {
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('activeUsers').textContent = stats.activeUsers;
    document.getElementById('totalExpenses').textContent = stats.totalExpenses;
    document.getElementById('totalIncome').textContent = stats.totalIncome;
    
    // Update minimized reports stats
    document.getElementById('totalUsersCount').textContent = stats.totalUsers;
    document.getElementById('activeUsersCount').textContent = stats.activeUsers;
    document.getElementById('totalExpensesCount').textContent = formatCurrency(stats.totalExpenses);
    document.getElementById('totalIncomeCount').textContent = formatCurrency(stats.totalIncome);
}

// Create system charts
function createSystemCharts(stats) {
    createTopCategoriesChart(stats.topCategories);
    createUserGrowthChart(stats);
    createSystemUsageChart(stats);
}

// Create top categories chart
function createTopCategoriesChart(data) {
    const ctx = document.getElementById('topCategoriesChart').getContext('2d');
    
    if (charts.topCategoriesChart) {
        charts.topCategoriesChart.destroy();
    }
    
    charts.topCategoriesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.category),
            datasets: [{
                label: 'Number of Transactions',
                data: data.map(item => item.count),
                backgroundColor: '#2563eb',
                borderColor: '#1d4ed8',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Create user growth chart
function createUserGrowthChart(stats) {
    const ctx = document.getElementById('userGrowthChart').getContext('2d');
    
    if (charts.userGrowthChart) {
        charts.userGrowthChart.destroy();
    }
    
    // Mock data for user growth - in real app, this would come from the API
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const userCounts = [10, 25, 45, 60, 80, stats.totalUsers];
    
    charts.userGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Total Users',
                data: userCounts,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Create system usage chart
function createSystemUsageChart(stats) {
    const ctx = document.getElementById('systemUsageChart').getContext('2d');
    
    if (charts.systemUsageChart) {
        charts.systemUsageChart.destroy();
    }
    
    charts.systemUsageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Expenses', 'Income', 'Budgets'],
            datasets: [{
                data: [stats.totalExpenses, stats.totalIncome, stats.totalUsers], // Using users as proxy for budgets
                backgroundColor: ['#2563eb', '#06b6d4', '#10b981'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load recent activity
function loadRecentActivity(activities) {
    const container = document.getElementById('recentActivityList');
    container.innerHTML = activities.slice(0, 10).map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${activity.type === 'expense' ? 'arrow-down' : 'arrow-up'}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.user_name}: ${activity.description}</h4>
                <p>${formatCurrency(activity.amount)} - ${formatDate(activity.date)}</p>
            </div>
        </div>
    `).join('');
}

// Load users
async function loadUsers() {
    try {
        const response = await apiCall('/api/admin/users');
        displayUsers(response.users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span class="badge badge-${user.role === 'admin' ? 'primary' : 'secondary'}">
                    ${user.role}
                </span>
            </td>
            <td>
                <span class="badge badge-${user.status === 'active' ? 'success' : 'danger'}">
                    ${user.status}
                </span>
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="resetUserPassword(${user.id})">
                    <i class="fas fa-key"></i>
                </button>
                <button class="btn btn-sm btn-${user.status === 'active' ? 'danger' : 'success'}" 
                        onclick="toggleUserStatus(${user.id}, '${user.status}')">
                    <i class="fas fa-${user.status === 'active' ? 'ban' : 'check'}"></i>
                </button>
                ${user.id !== currentUser.id ? `
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Load education content
async function loadEducation() {
    try {
        const response = await apiCall('/api/admin/education');
        displayEducation(response.education);
    } catch (error) {
        console.error('Error loading education:', error);
    }
}

// Display education content
function displayEducation(education) {
    const container = document.getElementById('educationGrid');
    container.innerHTML = education.map(item => `
        <div class="education-card">
            <h3>${item.title}</h3>
            <div class="education-content">
                <p>${item.content}</p>
            </div>
            <div class="education-meta">
                <span>By: ${item.created_by_name}</span>
                <span>${formatDate(item.created_at)}</span>
            </div>
            <div class="education-actions">
                <button class="btn btn-sm btn-secondary" onclick="editEducation(${item.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteEducation(${item.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Load notifications
async function loadNotifications() {
    try {
        const response = await apiCall('/api/admin/notifications');
        displayNotifications(response.notifications);
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Display notifications
function displayNotifications(notifications) {
    const container = document.getElementById('notificationsGrid');
    
    // Update notification stats
    document.getElementById('totalNotifications').textContent = notifications.length;
    const readCount = notifications.filter(n => n.read_count > 0).length;
    document.getElementById('readNotifications').textContent = readCount;
    
    container.innerHTML = notifications.map(notification => `
        <div class="notification-card">
            <div class="notification-header">
                <h4>${notification.message}</h4>
                <span class="badge badge-${notification.type}">${notification.type}</span>
            </div>
            <div class="notification-content">
                <p><strong>Message:</strong> ${notification.message}</p>
                <p><strong>Type:</strong> ${notification.type}</p>
                <p><strong>Created:</strong> ${formatDate(notification.created_at)}</p>
                ${notification.expires_at ? `<p><strong>Expires:</strong> ${formatDate(notification.expires_at)}</p>` : ''}
                <p><strong>Read by:</strong> ${notification.read_count || 0} users</p>
            </div>
            <div class="notification-actions">
                <button class="btn btn-sm btn-secondary" onclick="editNotification(${notification.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteNotification(${notification.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Add user form
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    
    // Notification recipients change
    document.getElementById('notificationRecipients').addEventListener('change', function() {
        const specificUserGroup = document.getElementById('specificUserGroup');
        if (this.value === 'specific' || this.value === 'both') {
            specificUserGroup.style.display = 'block';
            loadUsersForNotification();
        } else {
            specificUserGroup.style.display = 'none';
        }
    });
    
    // Edit user form
    document.getElementById('editUserForm').addEventListener('submit', handleEditUser);
    
    // Reset password form
    document.getElementById('resetPasswordForm').addEventListener('submit', handleResetPassword);
    
    // Add education form
    document.getElementById('addEducationForm').addEventListener('submit', handleAddEducation);
    
    // Edit education form
    document.getElementById('editEducationForm').addEventListener('submit', handleEditEducation);
    
    // Add notification form
    document.getElementById('addNotificationForm').addEventListener('submit', handleAddNotification);
    
    // Edit notification form
    document.getElementById('editNotificationForm').addEventListener('submit', handleEditNotification);
    
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', handleUpdateProfile);
    
    // Password form
    document.getElementById('passwordForm').addEventListener('submit', handleChangePassword);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Setup navigation
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.dataset.section;
            showSection(sectionId);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Show specific section
function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        document.getElementById('pageTitle').textContent = getSectionTitle(sectionId);
    }
}

// Get section title
function getSectionTitle(sectionId) {
    const titles = {
        overview: 'Admin Dashboard',
        users: 'User Management',
        education: 'Education Content',
        notifications: 'System Notifications',
        reports: 'System Reports',
        profile: 'Profile Settings'
    };
    return titles[sectionId] || 'Admin Dashboard';
}

// User Management Functions
function showAddUserForm() {
    document.getElementById('addUserModal').style.display = 'block';
}

async function editUser(userId) {
    try {
        const response = await apiCall(`/api/admin/users/${userId}`);
        if (response.success) {
            const user = response.user;
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editUserName').value = user.name;
            document.getElementById('editUserEmail').value = user.email;
            document.getElementById('editUserRole').value = user.role;
            document.getElementById('editUserStatus').value = user.status;
            document.getElementById('editUserModal').style.display = 'block';
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function resetUserPassword(userId) {
    document.getElementById('resetPasswordUserId').value = userId;
    document.getElementById('resetPasswordModal').style.display = 'block';
}

async function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
        showLoading();
        const response = await apiCall(`/api/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.success) {
            showAlert(`User ${newStatus} successfully`, 'success');
            await loadUsers();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
        showLoading();
        const response = await apiCall(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            showAlert('User deleted successfully', 'success');
            await loadUsers();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle add user
async function handleAddUser(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    try {
        showLoading();
        const response = await apiCall('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.success) {
            showAlert('User added successfully', 'success');
            closeModal('addUserModal');
            e.target.reset();
            await loadUsers();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle edit user
async function handleEditUser(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userId = formData.get('id');
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        status: formData.get('status')
    };
    
    try {
        showLoading();
        const response = await apiCall(`/api/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
        
        if (response.success) {
            showAlert('User updated successfully', 'success');
            closeModal('editUserModal');
            await loadUsers();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle reset password
async function handleResetPassword(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userId = formData.get('id');
    const passwordData = {
        newPassword: formData.get('newPassword')
    };
    
    try {
        showLoading();
        const response = await apiCall(`/api/admin/users/${userId}/reset-password`, {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
        
        if (response.success) {
            showAlert('Password reset successfully', 'success');
            closeModal('resetPasswordModal');
            e.target.reset();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Education Management Functions
function showAddEducationForm() {
    document.getElementById('addEducationModal').style.display = 'block';
}

async function editEducation(educationId) {
    try {
        const response = await apiCall(`/api/admin/education/${educationId}`);
        if (response.success) {
            const education = response.education;
            document.getElementById('editEducationId').value = education.id;
            document.getElementById('editEducationTitle').value = education.title;
            document.getElementById('editEducationContent').value = education.content;
            document.getElementById('editEducationModal').style.display = 'block';
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function deleteEducation(educationId) {
    if (!confirm('Are you sure you want to delete this education content?')) return;
    
    try {
        showLoading();
        const response = await apiCall(`/api/admin/education/${educationId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            showAlert('Education content deleted successfully', 'success');
            await loadEducation();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle add education
async function handleAddEducation(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const educationData = {
        title: formData.get('title'),
        content: formData.get('content')
    };
    
    if (!educationData.title || !educationData.content) {
        showAlert('Title and content are required', 'error');
        return;
    }
    
    try {
        showLoading();
        const response = await apiCall('/api/admin/education', {
            method: 'POST',
            body: JSON.stringify(educationData)
        });
        
        if (response.success) {
            showAlert('Education content added successfully', 'success');
            closeModal('addEducationModal');
            e.target.reset();
            await loadEducation();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle edit education
async function handleEditEducation(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const educationId = formData.get('id');
    const educationData = {
        title: formData.get('title'),
        content: formData.get('content')
    };
    
    try {
        showLoading();
        const response = await apiCall(`/api/admin/education/${educationId}`, {
            method: 'PUT',
            body: JSON.stringify(educationData)
        });
        
        if (response.success) {
            showAlert('Education content updated successfully', 'success');
            closeModal('editEducationModal');
            await loadEducation();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Notification Management Functions
function showAddNotificationForm() {
    // preload users list for specific selection
    try { loadUsersForNotification(); } catch (e) {}
    document.getElementById('addNotificationModal').style.display = 'block';
}

async function editNotification(notificationId) {
    try {
        // Load notification data
        const response = await apiCall(`/api/admin/notifications/${notificationId}`);
        const notification = response.notification;
        
        // Populate edit form
        document.getElementById('editNotificationMessage').value = notification.message;
        document.getElementById('editNotificationType').value = notification.type;
        document.getElementById('editNotificationExpires').value = notification.expires_at ? notification.expires_at.slice(0, 16) : '';
        
        // Store notification ID for update
        document.getElementById('editNotificationForm').dataset.notificationId = notificationId;
        
        // Show edit modal
        document.getElementById('editNotificationModal').style.display = 'block';
    } catch (error) {
        showAlert('Failed to load notification details', 'error');
    }
}

async function handleEditNotification(e) {
    e.preventDefault();
    
    const notificationId = e.target.dataset.notificationId;
    const formData = new FormData(e.target);
    const notificationData = {
        message: formData.get('message'),
        type: formData.get('type'),
        expires_at: formData.get('expires_at') || null
    };
    
    try {
        showLoading();
        const response = await apiCall(`/api/admin/notifications/${notificationId}`, {
            method: 'PUT',
            body: JSON.stringify(notificationData)
        });
        
        if (response.success) {
            showAlert('Notification updated successfully', 'success');
            closeModal('editNotificationModal');
            await loadNotifications();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function deleteNotification(notificationId) {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    try {
        showLoading();
        const response = await apiCall(`/api/admin/notifications/${notificationId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            showAlert('Notification deleted successfully', 'success');
            await loadNotifications();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle add notification
// Load users for notification dropdown
async function loadUsersForNotification() {
    try {
        const data = await apiCall('/api/admin/users');
        const list = Array.isArray(data) ? data : (data?.users || data?.data || []);
        const select = document.getElementById('specificUser');
        if (!select) return;
        select.innerHTML = '<option value="">Select a user...</option>';
        list.forEach(user => {
            if ((user?.role || '').toLowerCase() === 'user') {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.email})`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function handleAddNotification(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const recipients = formData.get('recipients');
    const userId = formData.get('user_id');
    
    const notificationData = {
        message: formData.get('message'),
        type: formData.get('type'),
        expires_at: formData.get('expires_at') || null,
        recipients: recipients,
        user_id: (recipients === 'specific' || recipients === 'both') ? userId : null
    };
    
    try {
        showLoading();
        const response = await apiCall('/api/admin/notifications', {
            method: 'POST',
            body: JSON.stringify(notificationData)
        });
        
        if (response.success) {
            showAlert('Notification sent successfully', 'success');
            closeModal('addNotificationModal');
            e.target.reset();
            document.getElementById('specificUserGroup').style.display = 'none';
            await loadNotifications();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Profile Management Functions
async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profileData = {
        name: formData.get('name'),
        email: formData.get('email')
    };
    
    try {
        showLoading();
        const response = await apiCall('/api/auth/me', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        
        if (response.success) {
            showAlert('Profile updated successfully', 'success');
            currentUser = { ...currentUser, ...profileData };
            userName.textContent = currentUser.name;
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleChangePassword(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const passwordData = {
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword')
    };
    
    if (passwordData.newPassword !== formData.get('confirmPassword')) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    try {
        showLoading();
        const response = await apiCall('/api/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
        
        if (response.success) {
            showAlert('Password changed successfully', 'success');
            e.target.reset();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Export functions
function exportSystemReport() {
    showAlert('System report export feature coming soon', 'info');
}

// Logout
async function logout() {
    try {
        await apiCall('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/';
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.getElementById('alertContainer').appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// API Helper Function
async function apiCall(url, options = {}) {
    try {
        console.log('Making API call to:', url, 'with options:', options);
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include',
            ...options
        });
        
        console.log('API Response status:', response.status);
        const data = await response.json();
        console.log('API Response data:', data);
        
        if (!response.ok) {
            console.error('API Error Response:', data);
            
            // If authentication error, redirect to login
            if (response.status === 401 || response.status === 403) {
                showAlert('Session expired. Please login again.', 'error');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                return;
            }
            
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}



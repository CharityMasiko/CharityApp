// User Dashboard JavaScript

// Global variables
let currentUser = null;
let charts = {};
let financialChatbot = null;

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.dashboard-section');
const userName = document.getElementById('userName');
const notificationBadge = document.getElementById('notificationBadge');
const notificationsPanel = document.getElementById('notificationsPanel');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
    await loadUserData();
    await loadOverviewData();
    setupEventListeners();
    setupNavigation();
    
    // Initialize chatbot
    initializeChatbot();
    
    // Initialize profile section
    initializeProfileSection();
    
    // Initialize notifications section
    initializeNotificationsSection();
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await apiCall('/api/auth/me');
        if (response.success) {
            currentUser = response.user;
            userName.textContent = currentUser.name;
            
            // Redirect admin users to admin dashboard
            if (currentUser.role === 'admin') {
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

// Load user data
async function loadUserData() {
    try {
        await Promise.all([
            loadNotifications(),
            loadExpenses(),
            loadIncome(),
            loadBudgets(),
            loadEducation()
        ]);
    } catch (error) {
        console.error('Error loading user data:', error);
        showAlert('Error loading data', 'error');
    }
}

// Load overview data
async function loadOverviewData() {
    try {
        const [spendingSummary, budgetAnalysis] = await Promise.all([
            apiCall('/api/user/reports/spending-summary'),
            apiCall('/api/user/reports/budget-analysis')
        ]);
        
        updateOverviewStats(spendingSummary.data);
        createCharts(spendingSummary.data, budgetAnalysis.budgetAnalysis || []);
        loadRecentActivity();
    } catch (error) {
        console.error('Error loading overview data:', error);
        // Initialize with empty data if API fails
        updateOverviewStats({
            totalIncome: 0,
            totalExpenses: 0,
            savings: 0,
            budgetAnalysis: []
        });
        createCharts({ expensesByCategory: [], spendingTrend: [] }, []);
    }
}

// Load reports data when reports section is accessed (stats only, no charts)
async function loadReportsData() {
    try {
        const [incomeRes, expensesRes, spendingSummaryRes] = await Promise.all([
            apiCall('/api/user/income'),
            apiCall('/api/user/expenses'),
            apiCall('/api/user/reports/spending-summary')
        ]);

        // Normalize possible response shapes
        const incomeArr = Array.isArray(incomeRes)
            ? incomeRes
            : (incomeRes?.income || incomeRes?.data || []);
        const expensesArr = Array.isArray(expensesRes)
            ? expensesRes
            : (expensesRes?.expenses || expensesRes?.data || []);
        const categoryData = spendingSummaryRes?.data?.expensesByCategory
            || spendingSummaryRes?.expensesByCategory
            || [];

        const totalIncome = (incomeArr || []).reduce((sum, it) => sum + Number(it?.amount || 0), 0);
        const totalExpenses = (expensesArr || []).reduce((sum, it) => sum + Number(it?.amount || 0), 0);
        const netSavings = totalIncome - totalExpenses;

        // Top category current month
        const categories = categoryData || [];
        const top = categories.slice().sort((a,b) => (Number(b?.total)||0) - (Number(a?.total)||0))[0];
        const topLabel = top ? `${top.category}: ${formatCurrency(top.total)}` : '—';

        const elIncome = document.getElementById('statsTotalIncome');
        const elExpenses = document.getElementById('statsTotalExpenses');
        const elSavings = document.getElementById('statsNetSavings');
        const elTopCategory = document.getElementById('statsTopCategory');
        if (elIncome) elIncome.textContent = formatCurrency(totalIncome);
        if (elExpenses) elExpenses.textContent = formatCurrency(totalExpenses);
        if (elSavings) elSavings.textContent = formatCurrency(netSavings);
        if (elTopCategory) elTopCategory.textContent = topLabel;
    } catch (error) {
        console.error('Error loading reports data:', error);
        showAlert('Error loading reports data', 'error');
    }
}

// Update overview statistics
function updateOverviewStats(data) {
    document.getElementById('totalIncome').textContent = formatCurrency(data.totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(data.totalExpenses);
    document.getElementById('savings').textContent = formatCurrency(data.savings);
    
    // Count budget alerts (over budget)
    const budgetAlerts = data.budgetAnalysis ? data.budgetAnalysis.filter(b => b.status === 'over').length : 0;
    document.getElementById('budgetAlerts').textContent = budgetAlerts;
}

// Create charts
function createCharts(spendingData, budgetData) {
    // Keep overview mini charts only; reports section uses stats now
    createCategoryChart(spendingData.expensesByCategory);
    createTrendChart(spendingData.spendingTrend);
}

// Create spending by category chart
function createCategoryChart(data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (charts.categoryChart) {
        charts.categoryChart.destroy();
    }
    
    charts.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(item => item.category),
            datasets: [{
                data: data.map(item => item.total),
                backgroundColor: [
                    '#2563eb', '#06b6d4', '#10b981', '#f59e0b',
                    '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'
                ],
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
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
                }
            }
        }
    });
}

// Create monthly trend chart
function createTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    if (charts.trendChart) {
        charts.trendChart.destroy();
    }
    
    charts.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.month),
            datasets: [{
                label: 'Monthly Spending',
                data: data.map(item => item.total),
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
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'KSh ' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const [expenses, income] = await Promise.all([
            apiCall('/api/user/expenses'),
            apiCall('/api/user/income')
        ]);
        
        const activities = [
            ...expenses.expenses.map(expense => ({
                type: 'expense',
                description: `${expense.category}: ${formatCurrency(expense.amount)}`,
                date: expense.date,
                icon: 'fas fa-arrow-down'
            })),
            ...income.income.map(inc => ({
                type: 'income',
                description: `${inc.source}: ${formatCurrency(inc.amount)}`,
                date: inc.date,
                icon: 'fas fa-arrow-up'
            }))
        ];
        
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const container = document.getElementById('recentActivityList');
        container.innerHTML = activities.slice(0, 10).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.description}</h4>
                    <p>${formatDate(activity.date)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

// Load expenses
async function loadExpenses() {
    try {
        const response = await apiCall('/api/user/expenses');
        displayExpenses(response.expenses);
        populateCategoryFilter(response.expenses);
    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}

// Display expenses in table
function displayExpenses(expenses) {
    const tbody = document.getElementById('expensesTableBody');
    tbody.innerHTML = expenses.map(expense => `
        <tr>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.category}</td>
            <td>${expense.description || '-'}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editExpense(${expense.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load income
async function loadIncome() {
    try {
        const response = await apiCall('/api/user/income');
        displayIncome(response.income);
    } catch (error) {
        console.error('Error loading income:', error);
    }
}

// Display income in table
function displayIncome(income) {
    const tbody = document.getElementById('incomeTableBody');
    tbody.innerHTML = income.map(inc => `
        <tr>
            <td>${formatDate(inc.date)}</td>
            <td>${inc.source}</td>
            <td>${inc.description || '-'}</td>
            <td>${formatCurrency(inc.amount)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editIncome(${inc.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteIncome(${inc.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load budgets
async function loadBudgets() {
    try {
        const response = await apiCall('/api/user/budgets');
        await displayBudgets(response.budgets);
    } catch (error) {
        console.error('Error loading budgets:', error);
    }
}

// Display budgets
async function displayBudgets(budgets) {
    const container = document.getElementById('budgetsGrid');
    
    // Get current month and year for budget analysis
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    try {
        // Get spending data for current month
        const spendingData = await apiCall(`/api/user/reports/spending-summary?month=${currentMonth}&year=${currentYear}`);
        const expensesByCategory = spendingData.data.expensesByCategory || [];
        
        container.innerHTML = budgets.map(budget => {
            // Find spending for this category
            const categorySpending = expensesByCategory.find(exp => exp.category === budget.category);
            const spent = categorySpending ? categorySpending.total : 0;
            const percentage = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;
            const status = percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good';
            
            return `
                <div class="budget-card">
                    <h3>${budget.category}</h3>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                        <div class="budget-amounts">
                            <span>Spent: ${formatCurrency(spent)}</span>
                            <span>Limit: ${formatCurrency(budget.limit_amount)}</span>
                        </div>
                    </div>
                    <div class="budget-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editBudget(${budget.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBudget(${budget.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading budget data:', error);
        // Fallback display without actual spending data
        container.innerHTML = budgets.map(budget => `
            <div class="budget-card">
                <h3>${budget.category}</h3>
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="budget-amounts">
                        <span>Spent: $0.00</span>
                        <span>Limit: ${formatCurrency(budget.limit_amount)}</span>
                    </div>
                </div>
                <div class="budget-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editBudget(${budget.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBudget(${budget.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Load education content
async function loadEducation() {
    try {
        const response = await apiCall('/api/user/education');
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
            <p>${item.content}</p>
            <div class="education-meta">
                <span>By: ${item.created_by_name}</span>
                <span>${formatDate(item.created_at)}</span>
            </div>
        </div>
    `).join('');
}

// Load notifications
async function loadNotifications() {
    try {
        const response = await apiCall('/api/user/notifications');
        displayNotifications(response.notifications);
        updateNotificationBadge(response.notifications);
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Display notifications
function displayNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    if (container) {
        // keep a local cache for safe detail rendering
        window.currentNotifications = notifications || [];
        container.innerHTML = (notifications || []).map(n => `
            <div class="notification-item ${n.read_status ? '' : 'unread'}"
                 data-id="${n.id}"
                 data-type="${n.type || 'info'}"
                 data-created="${n.created_at || ''}">
                <div class="notification-content">
                    <h4>${(n.message || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</h4>
                    <p class="notification-meta">
                        <span class="notification-type badge badge-${n.type || 'info'}">${(n.type || 'info')}</span>
                        <span class="notification-date">${formatDate(n.created_at)}</span>
                    </p>
                </div>
                ${!n.read_status ? '<div class="unread-indicator"></div>' : ''}
            </div>
        `).join('');
        // attach handlers
        container.querySelectorAll('.notification-item').forEach(el => {
            el.addEventListener('click', () => openNotificationDetailById(el.dataset.id));
        });
    }
}

// Mark notification as read
async function markNotificationRead(notificationId) {
    try {
        await apiCall(`/api/user/notifications/${notificationId}/read`, {
            method: 'POST'
        });
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Open detail modal and mark as read
function openNotificationDetailById(id) {
    const n = (window.currentNotifications || []).find(x => String(x.id) === String(id));
    if (!n) return;
    const type = n.type || 'info';
    const message = n.message || '';
    const createdAt = n.created_at || '';
    const modal = document.getElementById('notificationDetailModal');
    const title = 'Notification';
    document.getElementById('notificationDetailTitle').textContent = title;
    const body = document.getElementById('notificationDetailBody');
    body.textContent = message;
    document.getElementById('notificationDetailType').textContent = (type || 'INFO').toUpperCase();
    document.getElementById('notificationDetailDate').textContent = createdAt ? formatDate(createdAt) : '';
    modal.style.display = 'block';
    if (id) {
        markNotificationRead(id);
    }
}

// Mark all notifications as read
async function markAllAsRead() {
    try {
        await apiCall('/api/user/notifications/read-all', {
            method: 'POST'
        });
        loadNotifications();
        showAlert('All notifications marked as read', 'success');
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
}

// Update notification badge
function updateNotificationBadge(notifications) {
    const unreadCount = notifications.filter(n => !n.read_status).length;
    notificationBadge.textContent = unreadCount;
    notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
}

// Setup event listeners
function setupEventListeners() {
    // Add expense form
    document.getElementById('addExpenseForm').addEventListener('submit', handleAddExpense);
    
    // Add income form
    document.getElementById('addIncomeForm').addEventListener('submit', handleAddIncome);
    
    // Add budget form
    document.getElementById('addBudgetForm').addEventListener('submit', handleAddBudget);
    
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
        
        // Load specific data when switching sections
        if (sectionId === 'reports') {
            loadReportsData();
        } else if (sectionId === 'overview') {
            loadOverviewData();
        }
    }
}

// Get section title
function getSectionTitle(sectionId) {
    const titles = {
        overview: 'Dashboard Overview',
        expenses: 'Expense Management',
        income: 'Income Management',
        budgets: 'Budget Management',
        reports: 'Reports & Analytics',
        education: 'Financial Education',
        notifications: 'Notifications',
        profile: 'Profile Settings'
    };
    return titles[sectionId] || 'Dashboard';
}

// Show add expense form
function showAddExpenseForm() {
    document.getElementById('addExpenseModal').style.display = 'block';
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
}

// Show add income form
function showAddIncomeForm() {
    document.getElementById('addIncomeModal').style.display = 'block';
    document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
}

// Show add budget form
function showAddBudgetForm() {
    document.getElementById('addBudgetModal').style.display = 'block';
    const currentMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('budgetMonth').value = currentMonth;
}

// Handle add expense
async function handleAddExpense(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const expenseData = {
        category: formData.get('category'),
        amount: parseFloat(formData.get('amount')),
        description: formData.get('description'),
        date: formData.get('date')
    };
    
    try {
        showLoading();
        const response = await apiCall('/api/user/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData)
        });
        
        if (response.success) {
            showAlert('Expense added successfully', 'success');
            closeModal('addExpenseModal');
            e.target.reset();
            await loadExpenses();
            await loadOverviewData();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle add income
async function handleAddIncome(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const incomeData = {
        source: formData.get('source'),
        amount: parseFloat(formData.get('amount')),
        description: formData.get('description'),
        date: formData.get('date')
    };
    
    try {
        showLoading();
        const response = await apiCall('/api/user/income', {
            method: 'POST',
            body: JSON.stringify(incomeData)
        });
        
        if (response.success) {
            showAlert('Income added successfully', 'success');
            closeModal('addIncomeModal');
            e.target.reset();
            await loadIncome();
            await loadOverviewData();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle add budget
async function handleAddBudget(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const budgetData = {
        category: formData.get('category'),
        limit_amount: parseFloat(formData.get('limit_amount')),
        month: parseInt(formData.get('month').split('-')[1]),
        year: parseInt(formData.get('month').split('-')[0])
    };
    
    try {
        showLoading();
        const response = await apiCall('/api/user/budgets', {
            method: 'POST',
            body: JSON.stringify(budgetData)
        });
        
        if (response.success) {
            showAlert('Budget added successfully', 'success');
            closeModal('addBudgetModal');
            e.target.reset();
            await loadBudgets();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle update profile
async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profileData = {
        name: formData.get('name'),
        email: formData.get('email')
    };
    
    try {
        showLoading();
        const response = await apiCall('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        
        if (response.success) {
            showAlert('Profile updated successfully', 'success');
            currentUser = { ...currentUser, ...profileData };
            userName.textContent = currentUser.name;
            
            // Update localStorage
            const userData = JSON.parse(localStorage.getItem('userData')) || {};
            localStorage.setItem('userData', JSON.stringify({ ...userData, ...profileData }));
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle change password
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
    
    if (passwordData.newPassword.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
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

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        showLoading();
        const response = await apiCall(`/api/user/expenses/${id}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            showAlert('Expense deleted successfully', 'success');
            await loadExpenses();
            await loadOverviewData();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Delete income
async function deleteIncome(id) {
    if (!confirm('Are you sure you want to delete this income?')) return;
    
    try {
        showLoading();
        const response = await apiCall(`/api/user/income/${id}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            showAlert('Income deleted successfully', 'success');
            await loadIncome();
            await loadOverviewData();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Delete budget
async function deleteBudget(id) {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
        showLoading();
        const response = await apiCall(`/api/user/budgets/${id}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            showAlert('Budget deleted successfully', 'success');
            await loadBudgets();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Filter functions
function filterExpenses() {
    const category = document.getElementById('expenseCategoryFilter').value;
    const month = document.getElementById('expenseMonthFilter').value;
    
    // This would implement filtering logic
    console.log('Filter expenses:', { category, month });
}

function filterIncome() {
    const month = document.getElementById('incomeMonthFilter').value;
    console.log('Filter income:', { month });
}

function filterBudgets() {
    const month = document.getElementById('budgetMonthFilter').value;
    console.log('Filter budgets:', { month });
}

// Populate category filter
function populateCategoryFilter(expenses) {
    const categories = [...new Set(expenses.map(e => e.category))];
    const select = document.getElementById('expenseCategoryFilter');
    
    select.innerHTML = '<option value="">All Categories</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Export functions
function exportToCSV() {
    // Implementation for CSV export
    showAlert('CSV export feature coming soon', 'info');
}

function exportToPDF() {
    // Implementation for PDF export
    showAlert('PDF export feature coming soon', 'info');
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

// Export reports
async function exportReports(format) {
    try {
        // Get current data for export
        const [expenses, income, budgets] = await Promise.all([
            fetch('/api/expenses').then(res => res.json()),
            fetch('/api/income').then(res => res.json()),
            fetch('/api/budgets').then(res => res.json())
        ]);
        
        if (format === 'csv') {
            exportToCSV(expenses, income, budgets);
        } else if (format === 'pdf') {
            exportToPDF(expenses, income, budgets);
        }
    } catch (error) {
        console.error('Export error:', error);
        showAlert('Export failed', 'error');
    }
}

// Export to CSV
function exportToCSV(expenses, income, budgets) {
    let csvContent = "Type,Category,Amount,Date,Description\n";
    
    // Add expenses
    expenses.forEach(expense => {
        csvContent += `Expense,${expense.category},${expense.amount},${expense.date},${expense.description || ''}\n`;
    });
    
    // Add income
    income.forEach(inc => {
        csvContent += `Income,${inc.source},${inc.amount},${inc.date},${inc.description || ''}\n`;
    });
    
    // Add budgets
    budgets.forEach(budget => {
        csvContent += `Budget,${budget.category},${budget.limit_amount},${budget.month},Monthly Budget\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Export to PDF
function exportToPDF(expenses, income, budgets) {
    // Create a simple HTML table for PDF generation
    let htmlContent = `
        <html>
        <head>
            <title>Budget Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #2563eb; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .section { margin: 30px 0; }
            </style>
        </head>
        <body>
            <h1>My Budget Report - ${new Date().toLocaleDateString()}</h1>
            
            <div class="section">
                <h2>Expenses</h2>
                <table>
                    <tr><th>Category</th><th>Amount (KSh)</th><th>Date</th><th>Description</th></tr>
    `;
    
    expenses.forEach(expense => {
        htmlContent += `<tr><td>${expense.category}</td><td>${expense.amount}</td><td>${expense.date}</td><td>${expense.description || ''}</td></tr>`;
    });
    
    htmlContent += `
                </table>
            </div>
            
            <div class="section">
                <h2>Income</h2>
                <table>
                    <tr><th>Source</th><th>Amount (KSh)</th><th>Date</th><th>Description</th></tr>
    `;
    
    income.forEach(inc => {
        htmlContent += `<tr><td>${inc.source}</td><td>${inc.amount}</td><td>${inc.date}</td><td>${inc.description || ''}</td></tr>`;
    });
    
    htmlContent += `
                </table>
            </div>
            
            <div class="section">
                <h2>Budgets</h2>
                <table>
                    <tr><th>Category</th><th>Limit (KSh)</th><th>Month</th></tr>
    `;
    
    budgets.forEach(budget => {
        htmlContent += `<tr><td>${budget.category}</td><td>${budget.limit_amount}</td><td>${budget.month}</td></tr>`;
    });
    
    htmlContent += `
                </table>
            </div>
        </body>
        </html>
    `;
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
}

// ==================== NEW FUNCTIONALITY ====================

// Financial Chatbot Class
class FinancialChatbot {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.init();
    }

    init() {
        // Event listeners for chatbot
        document.getElementById('chatbotToggle').addEventListener('click', () => this.toggleChatbot());
        document.getElementById('chatbotClose').addEventListener('click', () => this.closeChatbot());
        document.getElementById('chatbotOverlay').addEventListener('click', () => this.closeChatbot());
        document.getElementById('chatbotSend').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatbotInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Load user data for personalized responses
        this.loadUserData();
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        document.getElementById('chatbotModal').style.display = 'block';
        document.getElementById('chatbotOverlay').style.display = 'block';
        this.isOpen = true;
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('chatbotInput').focus();
        }, 100);
    }

    closeChatbot() {
        document.getElementById('chatbotModal').style.display = 'none';
        document.getElementById('chatbotOverlay').style.display = 'none';
        this.isOpen = false;
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            this.removeTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage("I'm having trouble connecting right now. Please try again later.", 'bot');
            console.error('Chatbot error:', error);
        }
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = content;
        
        messageContent.appendChild(messageText);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to conversation history
        this.conversationHistory.push({ sender, content, timestamp: new Date() });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async getAIResponse(userMessage) {
        // Get user's financial data for context
        const userData = this.getUserFinancialData();
        
        // Simple rule-based AI for financial education
        // In a real application, you'd connect to an AI API like OpenAI
        const response = this.generateFinancialResponse(userMessage, userData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        return response;
    }

    getUserFinancialData() {
        // Get data from your budget app
        return {
            totalIncome: parseFloat(document.getElementById('totalIncome')?.textContent?.replace(/[^0-9.-]+/g, '') || 0),
            totalExpenses: parseFloat(document.getElementById('totalExpenses')?.textContent?.replace(/[^0-9.-]+/g, '') || 0),
            savings: parseFloat(document.getElementById('savings')?.textContent?.replace(/[^0-9.-]+/g, '') || 0),
            budgetAlerts: parseInt(document.getElementById('budgetAlerts')?.textContent || 0)
        };
    }

    generateFinancialResponse(message, userData) {
        const lowerMessage = message.toLowerCase();
        
        // Budgeting advice
        if (lowerMessage.includes('budget') || lowerMessage.includes('budgeting')) {
            if (userData.totalExpenses > userData.totalIncome) {
                return `I see your expenses (${formatCurrency(userData.totalExpenses)}) exceed your income (${formatCurrency(userData.totalIncome)}). Let's focus on creating a realistic budget. Start by tracking all expenses, categorizing them, and identifying areas where you can reduce spending. The 50/30/20 rule is a good guideline: 50% for needs, 30% for wants, and 20% for savings.`;
            }
            return "Budgeting is key to financial success! Start by tracking your income and expenses, then create categories. A popular method is the 50/30/20 rule: 50% for needs (rent, food), 30% for wants (entertainment), and 20% for savings and debt repayment. Would you like specific advice for your current situation?";
        }
        
        // Savings advice
        if (lowerMessage.includes('save') || lowerMessage.includes('saving') || lowerMessage.includes('savings')) {
            if (userData.savings <= 0) {
                return "It looks like you're not saving much right now. Start small - even saving 5-10% of your income can make a difference. Consider setting up automatic transfers to a savings account. Emergency funds should cover 3-6 months of expenses.";
            }
            return `Great job on saving ${formatCurrency(userData.savings)}! To boost your savings, consider: 1) Setting specific goals, 2) Automating transfers, 3) Reducing unnecessary expenses, and 4) Exploring high-yield savings accounts. What specific savings goals are you working towards?`;
        }
        
        // Debt advice
        if (lowerMessage.includes('debt') || lowerMessage.includes('loan') || lowerMessage.includes('credit card')) {
            return "Managing debt effectively is crucial. Two popular strategies are: 1) Snowball method - pay smallest debts first for quick wins, or 2) Avalanche method - pay highest interest debts first to save money. Always make minimum payments on all debts while focusing extra payments on your target debt.";
        }
        
        // Investment advice
        if (lowerMessage.includes('invest') || lowerMessage.includes('investment') || lowerMessage.includes('stock')) {
            return "Before investing, ensure you have an emergency fund covering 3-6 months of expenses. For beginners, consider low-cost index funds or ETFs that track the overall market. Remember the key principles: diversify your investments, think long-term, and don't try to time the market. Consider consulting a financial advisor for personalized advice.";
        }
        
        // Expense tracking
        if (lowerMessage.includes('expense') || lowerMessage.includes('spending') || lowerMessage.includes('track')) {
            return `Based on your current data, you've spent ${formatCurrency(userData.totalExpenses)} with ${formatCurrency(userData.savings)} saved. To better track expenses: 1) Review your spending weekly, 2) Use categories that make sense for your lifestyle, 3) Set realistic limits, and 4) Adjust as needed. Would you like help analyzing your spending patterns?`;
        }
        
        // General financial advice
        if (lowerMessage.includes('advice') || lowerMessage.includes('help') || lowerMessage.includes('tip')) {
            return "Here are key financial principles: 1) Spend less than you earn, 2) Build an emergency fund, 3) Pay off high-interest debt, 4) Invest for the long term, and 5) Continuously educate yourself about personal finance. What specific area would you like to focus on?";
        }
        
        // Default response
        return "I'm here to help with financial education! I can provide advice on budgeting, saving, investing, debt management, and expense tracking. What specific financial topic would you like to learn more about?";
    }

    loadUserData() {
        // Load any saved conversation history
        const savedHistory = localStorage.getItem('chatbotHistory');
        if (savedHistory) {
            this.conversationHistory = JSON.parse(savedHistory);
        }
    }

    saveConversation() {
        localStorage.setItem('chatbotHistory', JSON.stringify(this.conversationHistory));
    }
}

// Initialize chatbot
function initializeChatbot() {
    financialChatbot = new FinancialChatbot();
}

// Profile functionality
function initializeProfileSection() {
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    
    // Load profile data
    loadProfileData();
    
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });
}

function loadProfileData() {
    // Load from localStorage or API
    const userData = JSON.parse(localStorage.getItem('userData')) || {
        name: currentUser?.name || 'User',
        email: currentUser?.email || 'user@example.com'
    };
    
    document.getElementById('profileName').value = userData.name;
    document.getElementById('profileEmail').value = userData.email;
    document.getElementById('userName').textContent = userData.name;
}

function updateProfile() {
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    
    // Update in localStorage or via API
    const userData = { name, email };
    localStorage.setItem('userData', JSON.stringify(userData));
    document.getElementById('userName').textContent = name;
    
    showAlert('Profile updated successfully!', 'success');
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('Password must be at least 6 characters long!', 'error');
        return;
    }
    
    // In a real app, you'd verify current password with your backend
    showAlert('Password changed successfully!', 'success');
    document.getElementById('passwordForm').reset();
}

// Notifications functionality
function initializeNotificationsSection() {
    loadNotifications();
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
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include',
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
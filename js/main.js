import * as UI from './ui.js';
import * as API from './api.js';
import { showToast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIN MODAL & AUTH ---
    const loginButton = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeBtn = document.querySelector('.close-btn');
    const loginForm = document.getElementById('login-form');

    // --- THEME TOGGLE ---
    const themeBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Init Auth State
    const storedUser = localStorage.getItem('username');
    if (storedUser && loginButton) {
        loginButton.textContent = `Logged: ${storedUser}`;
        loginButton.classList.add('logged-in');
        loginButton.disabled = true;
    }

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            if (!localStorage.getItem('authToken')) {
                loginModal.classList.remove('hidden');
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            loginModal.classList.add('hidden');
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target == loginModal) {
            loginModal.classList.add('hidden');
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const submitBtn = loginForm.querySelector('.submit-btn');

            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            try {
                const result = await API.login(usernameInput.value, passwordInput.value);
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('username', result.username);

                showToast(`Welcome back, ${result.username}!`, 'success');
                loginModal.classList.add('hidden');

                loginButton.textContent = `Logged: ${result.username}`;
                loginButton.classList.add('logged-in');
                loginButton.disabled = true;
            } catch (error) {
                showToast(error.message || 'Login failed', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // --- SIDEBAR NAVIGATION ---
    const navItems = document.querySelectorAll('aside nav li');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add to clicked
            item.classList.add('active');

            const target = item.getAttribute('data-target');
            document.getElementById('page-title').textContent = item.textContent;

            // Clear potential previous intervals/listeners if any (not implemented yet but good practice)

            switch (target) {
                case 'dashboard': UI.renderDashboardPage(); break;
                case 'brm': UI.renderRawMaterialsPage(); break;
                case 'traceability': UI.renderBatchTraceabilityPage(); break;
                case 'suppliers': UI.renderSuppliersPage(); break;
                case 'bfg': UI.renderFinishedGoodsPage(); break;
                case 'qa': UI.renderQAPage(); break;
                case 'about': UI.renderAboutPage(); break;
                default:
                    UI.renderDashboardPage();
            }
        });
    });

    // Initial Load
    UI.renderDashboardPage();
});

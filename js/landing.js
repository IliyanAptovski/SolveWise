// Landing Page Logic
class LandingPage {
    constructor() {
        this.selectedRole = null;
        this.isLoginMode = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Role selection
        document.querySelectorAll('.select-role').forEach(button => {
            button.addEventListener('click', (e) => {
                this.selectRole(e.target.getAttribute('data-role'));
            });
        });

        // Form submission
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAuth();
            });
        }

        // Google auth
        const googleBtn = document.getElementById('googleAuthBtn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                this.handleGoogleAuth();
            });
        }

        // Switch between login/signup
        const switchLink = document.getElementById('switchToLogin');
        if (switchLink) {
            switchLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuthMode();
            });
        }

        // Modal close
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.hideModal();
            });
        }
    }

    selectRole(role) {
        this.selectedRole = role;
        
        // Update UI
        document.querySelectorAll('.role-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById(role + 'Card').classList.add('selected');

        // If teacher is selected, show coming soon message immediately
        if (role === 'teacher') {
            this.showMessage(
                'Функционалност в разработка', 
                'Регистрацията за учители ще бъде налична скоро. Благодарим за интереса!'
            );
            return;
        }

        // For student, show the auth section
        if (role === 'student') {
            // Show auth section
            document.getElementById('authSection').style.display = 'block';
            
            // Update auth title
            const action = this.isLoginMode ? 'Вход' : 'Регистрация';
            document.getElementById('authTitle').textContent = `${action} като ученик`;
            document.getElementById('submitBtn').textContent = this.isLoginMode ? 'Влез' : 'Регистрирай се';

            // Scroll to auth section
            document.getElementById('authSection').scrollIntoView({ behavior: 'smooth' });
        }
    }

    toggleAuthMode() {
        this.isLoginMode = !this.isLoginMode;
        
        const switchLink = document.getElementById('switchToLogin');
        const nameField = document.getElementById('name').parentElement;
        const submitBtn = document.getElementById('submitBtn');

        if (this.isLoginMode) {
            // Switch to login mode
            document.getElementById('authTitle').textContent = 'Вход като ученик';
            submitBtn.textContent = 'Влез';
            switchLink.textContent = 'Нямате профил? Регистрирайте се';
            nameField.style.display = 'none';
        } else {
            // Switch to signup mode
            document.getElementById('authTitle').textContent = 'Регистрация като ученик';
            submitBtn.textContent = 'Регистрирай се';
            switchLink.textContent = 'Вече имате профил? Влезте в акаунта си';
            nameField.style.display = 'block';
        }
    }

    async handleAuth() {
        // Only students can proceed with registration/login
        if (this.selectedRole !== 'student') {
            this.showMessage('Грешка', 'Моля, изберете ученик, за да продължите.');
            return;
        }

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Зареждане...';

        try {
            let result;
            
            if (this.isLoginMode) {
                result = await authManager.signIn(email, password);
            } else {
                if (!name.trim()) {
                    throw new Error('Моля, въведете вашето име.');
                }
                result = await authManager.signUp(email, password, name, 'student');
            }

            if (result.success) {
                // Student - redirect to home page
                window.location.href = 'home.html';
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showMessage('Грешка', this.translateError(error.message));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = this.isLoginMode ? 'Влез' : 'Регистрирай се';
        }
    }

    async handleGoogleAuth() {
        // Only students can proceed with Google auth
        if (this.selectedRole !== 'student') {
            this.showMessage('Грешка', 'Моля, изберете ученик, за да продължите.');
            return;
        }

        const googleBtn = document.getElementById('googleAuthBtn');
        googleBtn.disabled = true;
        googleBtn.innerHTML = '<span class="google-icon">G</span> Зареждане...';

        try {
            const result = await authManager.signInWithGoogle('student');
            
            if (result.success) {
                window.location.href = 'home.html';
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showMessage('Грешка', this.translateError(error.message));
        } finally {
            googleBtn.disabled = false;
            googleBtn.innerHTML = '<span class="google-icon">G</span> Продължи с Google';
        }
    }

    translateError(error) {
        const translations = {
            'auth/email-already-in-use': 'Този имейл вече се използва.',
            'auth/invalid-email': 'Невалиден имейл адрес.',
            'auth/weak-password': 'Паролата трябва да бъде поне 6 символа.',
            'auth/user-not-found': 'Няма потребител с този имейл.',
            'auth/wrong-password': 'Грешна парола.',
            'auth/network-request-failed': 'Грешка в мрежата. Моля, опитайте отново.'
        };
        
        return translations[error] || error;
    }

    showMessage(title, message) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('messageModal').style.display = 'flex';
    }

    hideModal() {
        document.getElementById('messageModal').style.display = 'none';
        
        // If teacher modal was shown, deselect the teacher card
        if (this.selectedRole === 'teacher') {
            document.getElementById('teacherCard').classList.remove('selected');
            this.selectedRole = null;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LandingPage();
});
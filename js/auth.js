// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCF99YpkKjxKCuotVbxb0kkP1d_kgmT5cs",
  authDomain: "solve-wise.firebaseapp.com",
  databaseURL: "https://solve-wise-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "solve-wise",
  storageBucket: "solve-wise.firebasestorage.app",
  messagingSenderId: "800061630250",
  appId: "1:800061630250:web:67fd3815d11ff2b34a6053"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();

// Auth State Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.init();
    }

    init() {
        // Check auth state
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.loadUserData(user.uid);
                this.updateNavigation(true);
                
                // Redirect from landing page if user is logged in
                if (window.location.pathname.includes('index.html')) {
                    window.location.href = 'home.html';
                }
            } else {
                this.currentUser = null;
                this.userData = null;
                this.updateNavigation(false);
                
                // Redirect to landing if on protected pages and not logged in
                const protectedPages = ['home.html', 'topics.html', 'quiz.html', 'summary.html'];
                const currentPage = window.location.pathname.split('/').pop();
                
                if (protectedPages.includes(currentPage)) {
                    window.location.href = 'index.html';
                }
            }
        });
    }

    async loadUserData(uid) {
        try {
            const snapshot = await database.ref('users/' + uid).once('value');
            this.userData = snapshot.val();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    updateNavigation(isLoggedIn) {
        const authNav = document.getElementById('authNav');
        if (!authNav) return;

        if (isLoggedIn && this.currentUser) {
            const displayName = this.userData?.name || this.currentUser.displayName || this.currentUser.email;
            const initial = displayName.charAt(0).toUpperCase();
            
            authNav.innerHTML = `
                <div class="user-info">
                    <div class="user-avatar">${initial}</div>
                    <span>${displayName}</span>
                </div>
                <button class="logout-btn" id="logoutBtn">Изход</button>
            `;

            // Add event listener for logout
            document.getElementById('logoutBtn').addEventListener('click', () => {
                this.signOut();
            });
        } else {
            authNav.innerHTML = '<a href="index.html" class="auth-link">Вход / Регистрация</a>';
        }
    }

    // Sign up with email/password
    async signUp(email, password, name, role) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update profile
            await user.updateProfile({
                displayName: name
            });

            // Save user data to database
            await database.ref('users/' + user.uid).set({
                role: role,
                name: name,
                email: email,
                createdAt: Date.now()
            });

            return { success: true, user: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Sign in with email/password
    async signIn(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Google authentication
    async signInWithGoogle(role) {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await auth.signInWithPopup(provider);
            const user = userCredential.user;

            // Check if user exists in database
            const userSnapshot = await database.ref('users/' + user.uid).once('value');
            
            if (!userSnapshot.exists()) {
                // New user - save to database
                await database.ref('users/' + user.uid).set({
                    role: role,
                    name: user.displayName,
                    email: user.email,
                    createdAt: Date.now()
                });
            }

            return { success: true, user: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Sign out
    async signOut() {
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    // Get current user data
    getUserData() {
        return this.userData;
    }

    // Check if user is student
    isStudent() {
        return this.userData?.role === 'student';
    }

    // Check if user is teacher
    isTeacher() {
        return this.userData?.role === 'teacher';
    }
}

// Initialize Auth Manager
const authManager = new AuthManager();
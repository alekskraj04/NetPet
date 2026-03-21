import request from './modules/fetchManager.mjs';

// --- I18n & L10n (Language Handling) ---
const translations = {
    no: {
        fillFields: "Vennligst fyll ut alle felt",
        userSaved: "Bruker lagret på Render!",
        saveError: "Kunne ikke lagre bruker til databasen. Sjekk konsollen.",
        confirmDelete: "Er du sikker på at du vil slette ",
        userNotFound: "Brukeren finnes ikke eller feil passord. Vennligst prøv igjen!",
        invalidLogin: "Ugyldig brukernavn eller passord.",
        connectionError: "Tilkoblingsfeil. Sjekk din BASE_URL i fetchManager.mjs"
    },
    en: {
        fillFields: "Please fill in all fields",
        userSaved: "User saved to Render!",
        saveError: "Could not save user to the database. Check console.",
        confirmDelete: "Are you sure you want to delete ",
        userNotFound: "User not found or incorrect password. Please try again!",
        invalidLogin: "Invalid username or password.",
        connectionError: "Connection error. Check your BASE_URL in fetchManager.mjs"
    }
};

const lang = navigator.language.startsWith('nb') || navigator.language.startsWith('no') ? 'no' : 'en';
const t = translations[lang];

class UserManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.users = []; 
    }

    async connectedCallback() {
        // Auto-login: Check if a user is already stored in the browser
        const savedUser = localStorage.getItem('netpet_user');

        if (savedUser) {
            console.log(`Welcome back, ${savedUser}!`);
            return this.showGameView(savedUser);
        }

        try {
            // Load the registration/login interface
            const response = await fetch('./views/UserView.html');
            this.shadowRoot.innerHTML = await response.text();
            this.setupEventListeners();
        } catch (error) {
            console.error("Could not load user interface:", error);
        }
    }

    setupEventListeners() {
        const createBtn = this.shadowRoot.querySelector('#create-btn');
        if (createBtn) createBtn.onclick = () => this.createUser();

        const loginBtn = this.shadowRoot.querySelector('#login-btn');
        if (loginBtn) loginBtn.onclick = () => this.loginUser();
    }

    async loginUser() {
        const usernameInput = this.shadowRoot.querySelector('#login-username');
        const passwordInput = this.shadowRoot.querySelector('#login-password');
        
        const username = usernameInput ? usernameInput.value.trim() : null;
        const password = passwordInput ? passwordInput.value : null;

        if (!username || !password) {
            return alert(t.fillFields);
        }

        try {
            // Fetch users to verify credentials
            const users = await request('/api/users', 'GET');
            
            const user = users.find(u => 
                u.username.toLowerCase() === username.toLowerCase() && 
                u.password === password
            );

            if (user) {
                localStorage.setItem('netpet_user', user.username);
                this.showGameView(user.username);
            } else {
                alert(t.invalidLogin);
            }
        } catch (error) {
            console.error("Login verification failed:", error);
            alert(t.connectionError);
        }
    }

    async createUser() {
        const usernameInput = this.shadowRoot.querySelector('#username');
        const passwordInput = this.shadowRoot.querySelector('#password');

        if (!usernameInput.value || !passwordInput.value) {
            return alert(t.fillFields);
        }

        // Include dummy email to satisfy backend requirements (prevents 400 error)
        const newUser = { 
            username: usernameInput.value, 
            password: passwordInput.value,
            email: `${usernameInput.value}@netpet.no` 
        };

        try {
            await request('/api/users', 'POST', newUser);
            localStorage.setItem('netpet_user', newUser.username);
            this.showGameView(newUser.username);
        } catch (error) {
            console.error(t.saveError, error);
            alert(t.saveError);
        }
    }

    async showGameView(username) {
        try {
            // Hide global elements for a focused game experience
            const elementsToHide = ['h1', 'body > img', 'footer'];
            elementsToHide.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) el.style.setProperty('display', 'none', 'important');
            });

            const response = await fetch('./views/GAMEVIEW.html');
            const html = await response.text();
            this.shadowRoot.innerHTML = html;
            
            const petTitle = this.shadowRoot.querySelector('#pet-name');
            if (petTitle) petTitle.innerText = `${username.toUpperCase()}'S PET`;

            // --- LOGOUT LOGIC ---
            const logoutBtn = this.shadowRoot.querySelector('#logout-btn');
            if (logoutBtn) {
                logoutBtn.onclick = () => {
                    localStorage.removeItem('netpet_user');
                    window.location.reload();
                };
            }
            
            console.log(`Game view active for: ${username}`);
        } catch (error) {
            console.error("Error loading GAMEVIEW:", error);
        }
    }
}

customElements.define('user-manager', UserManager);

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW registered!', reg))
        .catch(err => console.error('SW failed!', err));
    });
}
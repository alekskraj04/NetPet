import request from './modules/fetchManager.mjs';

// --- I18n & L10n (Language Handling) ---
const translations = {
    no: {
        fillFields: "Vennligst fyll ut alle felt",
        userSaved: "Bruker lagret på Render!",
        saveError: "Kunne ikke lagre bruker til databasen.",
        confirmDelete: "Er du sikker på at du vil slette ",
        userNotFound: "Brukeren finnes ikke eller feil passord. Vennligst prøv igjen!",
        invalidLogin: "Ugyldig brukernavn eller passord."
    },
    en: {
        fillFields: "Please fill in all fields",
        userSaved: "User saved to Render!",
        saveError: "Could not save user to the database.",
        confirmDelete: "Are you sure you want to delete ",
        userNotFound: "User not found or incorrect password. Please try again!",
        invalidLogin: "Invalid username or password."
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
        // Check if a user is already stored locally for auto-login
        const savedUser = localStorage.getItem('netpet_user');

        if (savedUser) {
            console.log(`Welcome back, ${savedUser}!`);
            return this.showGameView(savedUser);
        }

        try {
            // Fetch and render the login/registration interface
            const response = await fetch('./views/UserView.html');
            this.shadowRoot.innerHTML = await response.text();
            this.setupEventListeners();
        } catch (error) {
            console.error("Could not load user interface:", error);
        }
    }

    setupEventListeners() {
        // Attach event listeners for creation and login buttons
        const createBtn = this.shadowRoot.querySelector('#create-btn');
        if (createBtn) {
            createBtn.onclick = () => this.createUser();
        }

        const loginBtn = this.shadowRoot.querySelector('#login-btn');
        if (loginBtn) {
            loginBtn.onclick = () => this.loginUser();
        }
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
            // Fetch users from the backend
            const users = await request('/api/users', 'GET');
            
            // Validate both username and password
            const user = users.find(u => 
                u.username.toLowerCase() === username.toLowerCase() && 
                u.password === password
            );

            if (user) {
                // Login successful: persist and show game
                localStorage.setItem('netpet_user', user.username);
                this.showGameView(user.username);
            } else {
                // Login failed: show error
                alert(t.invalidLogin);
            }
        } catch (error) {
            console.error("Login verification failed:", error);
            alert("Connection error. Check your API URL or internet status.");
        }
    }

    async showGameView(username) {
        try {
            // Hide initial landing page elements
            const elementsToHide = ['h1', 'body > img', 'footer'];
            elementsToHide.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) el.style.setProperty('display', 'none', 'important');
            });

            // Load and display the game world
            const response = await fetch('./views/GAMEVIEW.html');
            const html = await response.text();
            
            this.shadowRoot.innerHTML = html;
            
            const petTitle = this.shadowRoot.querySelector('#pet-name');
            if (petTitle) {
                petTitle.innerText = `${username.toUpperCase()}'S PET`;
            }
            
            console.log(`Game view active for: ${username}`);
        } catch (error) {
            console.error("Error loading GAMEVIEW:", error);
        }
    }

    async createUser() {
        const usernameInput = this.shadowRoot.querySelector('#username');
        const passwordInput = this.shadowRoot.querySelector('#password');

        if (!usernameInput.value || !passwordInput.value) {
            return alert(t.fillFields);
        }

        // Added 'email' to satisfy backend requirements and avoid 400 error
        const newUser = { 
            username: usernameInput.value, 
            password: passwordInput.value,
            email: usernameInput.value + "@netpet.no" 
        };

        try {
            // Post new user credentials to Render
            const response = await request('/api/users', 'POST', newUser);
            console.log(t.userSaved, response);
            
            // Set local persistence and launch game
            localStorage.setItem('netpet_user', newUser.username);
            this.showGameView(newUser.username);
        } catch (error) {
            console.error(t.saveError, error);
            alert(t.saveError);
        }
    }

    async deleteUser(username) {
        if (!confirm(`${t.confirmDelete}${username}?`)) return;
        try {
            await request(`/api/users/${username}`, 'DELETE');
            localStorage.removeItem('netpet_user');
            window.location.reload(); 
        } catch (error) {
            console.error("Could not delete user:", error);
        }
    }
}

customElements.define('user-manager', UserManager);

// Service Worker Registration for PWA features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registered!', reg))
        .catch(err => console.error('Service Worker registration failed:', err));
    });
}
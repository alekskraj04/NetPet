import request from './modules/fetchManager.mjs';

// --- I18n & L10n (Language Handling) ---
const translations = {
    no: {
        fillFields: "Vennligst fyll ut alle felt",
        userSaved: "Bruker lagret på Render!",
        saveError: "Kunne ikke lagre bruker til databasen.",
        confirmDelete: "Er du sikker på at du vil slette ",
        userNotFound: "Brukeren finnes ikke. Vennligst lag en ny pet først!"
    },
    en: {
        fillFields: "Please fill in all fields",
        userSaved: "User saved to Render!",
        saveError: "Could not save user to the database.",
        confirmDelete: "Are you sure you want to delete ",
        userNotFound: "This user does not exist. Please create a new pet first!"
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
        // Check if a user is already stored in the browser
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
        // Listener for creating a new user
        const createBtn = this.shadowRoot.querySelector('#create-btn');
        if (createBtn) {
            createBtn.onclick = () => this.createUser();
        }

        // Listener for logging in existing user
        const loginBtn = this.shadowRoot.querySelector('#login-btn');
        if (loginBtn) {
            loginBtn.onclick = () => this.loginUser();
        }
    }

    async loginUser() {
        const usernameInput = this.shadowRoot.querySelector('#login-username');
        const username = usernameInput ? usernameInput.value.trim() : null;

        if (!username) {
            return alert(t.fillFields);
        }

        try {
            // Fetch the list of users from the server to verify existence
            const users = await request('/api/users', 'GET');
            
            // Check if the username exists (case-insensitive check)
            const userExists = users.find(u => u.username.toLowerCase() === username.toLowerCase());

            if (userExists) {
                // User found: Save to local storage and proceed to game
                localStorage.setItem('netpet_user', userExists.username);
                this.showGameView(userExists.username);
            } else {
                // User not found: Alert the user
                alert(t.userNotFound || "User not found. Please register first.");
            }
        } catch (error) {
            console.error("Login verification failed:", error);
            alert("Error connecting to server. Please try again.");
        }
    }

    async showGameView(username) {
        try {
            // Hide global elements in index.html for a clean game view
            const mainHeader = document.querySelector('h1');
            const initialGif = document.querySelector('body > img');
            const footer = document.querySelector('footer');

            if (mainHeader) mainHeader.style.setProperty('display', 'none', 'important');
            if (initialGif) initialGif.style.setProperty('display', 'none', 'important');
            if (footer) footer.style.setProperty('display', 'none', 'important');

            // Load game view HTML
            const response = await fetch('./views/GAMEVIEW.html');
            const html = await response.text();
            
            this.shadowRoot.innerHTML = html;
            
            // Set the personalized title in the Shadow DOM
            const petTitle = this.shadowRoot.querySelector('#pet-name');
            if (petTitle) {
                petTitle.innerText = `${username.toUpperCase()}'S PET`;
            }
            
            console.log(`Stable game view loaded for: ${username}`);
        } catch (error) {
            console.error("Error loading GAMEVIEW:", error);
        }
    }

    async createUser() {
        const usernameInput = this.shadowRoot.querySelector('#username');
        const emailInput = this.shadowRoot.querySelector('#email');

        if (!usernameInput.value || !emailInput.value) {
            return alert(t.fillFields);
        }

        const newUser = { 
            username: usernameInput.value, 
            email: emailInput.value 
        };

        try {
            // Send new user data to the Render backend
            const response = await request('/api/users', 'POST', newUser);
            console.log(t.userSaved, response);
            
            // Persist user locally and switch view
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
            // Delete user from database
            await request(`/api/users/${username}`, 'DELETE');
            // Clear local storage and reload to reset the app state
            localStorage.removeItem('netpet_user');
            window.location.reload(); 
        } catch (error) {
            console.error("Could not delete user:", error);
        }
    }
}

// Register the custom element
customElements.define('user-manager', UserManager);

// --- PWA: Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registered!', reg))
        .catch(err => console.error('Service Worker registration failed:', err));
    });
}
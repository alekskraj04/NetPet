import request from './modules/fetchManager.mjs';

// --- I18n & L10n (Language Handling) ---
const translations = {
    no: {
        fillFields: "Vennligst fyll ut alle felt",
        userSaved: "Bruker lagret på Render!",
        saveError: "Kunne ikke lagre bruker til databasen.",
        confirmDelete: "Er du sikker på at du vil slette "
    },
    en: {
        fillFields: "Please fill in all fields",
        userSaved: "User saved to Render!",
        saveError: "Could not save user to the database.",
        confirmDelete: "Are you sure you want to delete "
    }
};

// Determine user language (defaults to English if not Norwegian)
const lang = navigator.language.startsWith('nb') || navigator.language.startsWith('no') ? 'no' : 'en';
const t = translations[lang];

class UserManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.users = []; 
    }

    async connectedCallback() {
        try {
            // Start by loading the registration form
            const response = await fetch('./views/UserView.html');
            this.shadowRoot.innerHTML = await response.text();
            this.setupEventListeners();
        } catch (error) {
            console.error("Could not load user interface:", error);
        }
    }

    setupEventListeners() {
        const createBtn = this.shadowRoot.querySelector('#create-btn');
        if (createBtn) {
            createBtn.onclick = () => this.createUser();
        }
    }

    // Function that clears the page and displays the game
    async showGameView(username) {
        try {
            // Safe method: Hide elements in index.html instead of removing them
            const mainHeader = document.querySelector('h1');
            const initialGif = document.querySelector('body > img');
            const footer = document.querySelector('footer');

            if (mainHeader) mainHeader.style.setProperty('display', 'none', 'important');
            if (initialGif) initialGif.style.setProperty('display', 'none', 'important');
            if (footer) footer.style.setProperty('display', 'none', 'important');

            // Fetch the game HTML
            const response = await fetch('./views/GAMEVIEW.html');
            const html = await response.text();
            
            // Replace content in shadowRoot
            this.shadowRoot.innerHTML = html;
            
            // Update the pet name in the game
            const petTitle = this.shadowRoot.querySelector('#pet-name');
            if (petTitle) {
                petTitle.innerText = `${username}'s NetPet`;
            }
            
            console.log(`Stable game view loaded for: ${username}`);
        } catch (error) {
            console.error("Error loading GAMEVIEW:", error);
        }
    }

    async createUser() {
        const usernameInput = this.shadowRoot.querySelector('#username');
        const emailInput = this.shadowRoot.querySelector('#email');

        // Use translation instead of hardcoded strings
        if (!usernameInput.value || !emailInput.value) {
            return alert(t.fillFields);
        }

        const newUser = { 
            username: usernameInput.value, 
            email: emailInput.value 
        };

        try {
            const response = await request('/api/users', 'POST', newUser);
            console.log(t.userSaved, response);
            
            // Switch view immediately
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
        } catch (error) {
            console.error("Could not delete user:", error);
        }
    }
}

customElements.define('user-manager', UserManager);

// --- PWA: SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registered!', reg))
        .catch(err => console.error('Service Worker registration failed:', err));
    });
}
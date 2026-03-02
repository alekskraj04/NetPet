import request from './modules/fetchManager.mjs';

class UserManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.users = []; 
    }

    async connectedCallback() {
        try {
            // Starter med å laste registreringsskjemaet
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

    // FUNKSJON SOM RYDDER SIDEN OG VISER SPILLET
    async showGameView(username) {
        try {
            // 1. Skjul elementer i index.html (viktig å bruke 'important' for å tvinge frem endringen)
            const mainHeader = document.querySelector('h1');
            const initialGif = document.querySelector('body > img'); // Treffer gifen i body
            const footer = document.querySelector('footer');

            if (mainHeader) mainHeader.style.setProperty('display', 'none', 'important');
            if (initialGif) initialGif.style.setProperty('display', 'none', 'important');
            if (footer) footer.style.setProperty('display', 'none', 'important');

            // 2. Hent spillets HTML
            const response = await fetch('./views/GAMEVIEW.html');
            const html = await response.text();
            
            // 3. Bytt ut innholdet i shadowRoot
            this.shadowRoot.innerHTML = html;
            
            // 4. Oppdater navnet i spillet
            const petTitle = this.shadowRoot.querySelector('#pet-name');
            if (petTitle) {
                petTitle.innerText = `${username}'s NetPet`;
            }
            
            console.log(`Clean game view loaded for: ${username}`);
        } catch (error) {
            console.error("Error loading GAMEVIEW:", error);
        }
    }

    async createUser() {
        const usernameInput = this.shadowRoot.querySelector('#username');
        const emailInput = this.shadowRoot.querySelector('#email');

        if (!usernameInput.value || !emailInput.value) {
            return alert("Please fill in all fields");
        }

        const newUser = { 
            username: usernameInput.value, 
            email: emailInput.value 
        };

        try {
            const response = await request('/api/users', 'POST', newUser);
            console.log("User saved to Render!", response);
            
            // Bytt visning umiddelbart
            this.showGameView(newUser.username);
        } catch (error) {
            console.error("Error saving to database:", error);
            alert("Could not save user.");
        }
    }

    // Admin-funksjoner (valgfritt å beholde)
    async deleteUser(username) {
        if (!confirm(`Are you sure you want to delete ${username}?`)) return;
        try {
            await request(`/api/users/${username}`, 'DELETE');
        } catch (error) {
            console.error("Could not delete user:", error);
        }
    }
}

customElements.define('user-manager', UserManager);
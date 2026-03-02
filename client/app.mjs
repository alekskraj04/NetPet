import request from './modules/fetchManager.mjs';

class UserManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.users = []; 
    }

    async connectedCallback() {
        try {
            // Start by loading the registration form (UserView)
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

    // NEW FUNCTION: Switches the content to the actual game
    async showGameView(username) {
        try {
            // Fetching the GAMEVIEW.html file
            const response = await fetch('./views/GAMEVIEW.html');
            const html = await response.text();
            
            // Replacing the entire content of shadowRoot with the GameView code
            this.shadowRoot.innerHTML = html;
            
            // Dynamically update the pet's name in the game
            const petTitle = this.shadowRoot.querySelector('#pet-name');
            if (petTitle) {
                petTitle.innerText = `${username}'s NetPet`;
            }
            
            console.log(`Switched to game mode for: ${username}`);
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
            // Send data to your Render server
            const response = await request('/api/users', 'POST', newUser);
            console.log("User successfully saved to PostgreSQL on Render!", response);
            
            // Instead of just adding to a list, we jump straight to the game!
            this.showGameView(newUser.username);

        } catch (error) {
            console.error("Error saving to database:", error);
            alert("Could not save user to the database.");
        }
    }

    // Keep these functions for potential future admin features
    async deleteUser(username) {
        if (!confirm(`Are you sure you want to delete ${username}?`)) return;
        try {
            await request(`/api/users/${username}`, 'DELETE');
            const userElement = this.shadowRoot.querySelector(`#user-${username}`);
            if (userElement) userElement.remove();
        } catch (error) {
            console.error("Could not delete user:", error);
        }
    }

    async editUser(username) {
        const newEmail = prompt(`Update email for ${username}:`);
        if (newEmail) {
            try {
                await request(`/api/users/${username}`, 'PUT', { email: newEmail });
                this.shadowRoot.querySelector(`#email-${username}`).textContent = newEmail;
            } catch (error) {
                console.error("Could not update user:", error);
            }
        }
    }
}

customElements.define('user-manager', UserManager);
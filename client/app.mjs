import request from './modules/fetchManager.mjs';

class UserManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // Vi beholder denne listen for å oppdatere UI-et lokalt etter lagring
        this.users = []; 
    }

    async connectedCallback() {
        try {
            // VIKTIG: Her henter vi selve HTML-malen (View-et)
            const response = await fetch('./views/UserView.html');
            this.shadowRoot.innerHTML = await response.text();
            this.setupEventListeners();
        } catch (error) {
            console.error("Kunne ikke laste inn brukergrensesnitt:", error);
        }
    }

    setupEventListeners() {
        const createBtn = this.shadowRoot.querySelector('#create-btn');
        if (createBtn) {
            createBtn.onclick = () => this.createUser();
        }
    }

    // 1. CREATE USER (Nå koblet til Render API og Database)
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
            // Sender data til din Render-server
            const response = await request('/api/users', 'POST', newUser);
            console.log("User successfully saved to PostgreSQL on Render!", response);
            
            // Oppdaterer listen på nettsiden
            this.users.push(newUser);
            this.renderUserList(newUser.username, newUser.email);

            // Tømmer feltene
            usernameInput.value = '';
            emailInput.value = '';
        } catch (error) {
            console.error("Feil ved lagring i database:", error);
            alert("Kunne ikke lagre bruker i databasen. Sjekk Render-loggen.");
        }
    }

    // 2. DELETE USER (Ekte API-kall)
    async deleteUser(username) {
        if (!confirm(`Are you sure you want to delete ${username}?`)) return;

        try {
            await request(`/api/users/${username}`, 'DELETE');
            this.users = this.users.filter(u => u.username !== username);
            const userElement = this.shadowRoot.querySelector(`#user-${username}`);
            if (userElement) userElement.remove();
            console.log(`User ${username} deleted from database`);
        } catch (error) {
            console.error("Kunne ikke slette bruker:", error);
        }
    }

    // 3. EDIT USER (Ekte API-kall)
    async editUser(username) {
        const newEmail = prompt(`Update email for ${username}:`);
        
        if (newEmail) {
            try {
                await request(`/api/users/${username}`, 'PUT', { email: newEmail });
                const user = this.users.find(u => u.username === username);
                if (user) user.email = newEmail;
                this.shadowRoot.querySelector(`#email-${username}`).textContent = newEmail;
                console.log(`User ${username} updated in database`);
            } catch (error) {
                console.error("Kunne ikke oppdatere bruker:", error);
            }
        }
    }

    renderUserList(username, email) {
        const list = this.shadowRoot.querySelector('#user-list');
        if (!list) return;

        list.innerHTML += `
            <div class="user-item" id="user-${username}" style="margin-top: 10px; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
                <span><strong>${username}</strong> (<span id="email-${username}">${email}</span>)</span>
                <div style="margin-top: 5px;">
                    <button onclick="this.getRootNode().host.editUser('${username}')">Edit</button>
                    <button onclick="this.getRootNode().host.deleteUser('${username}')" style="color: red;">Delete</button>
                </div>
            </div>
        `;
    }
}

customElements.define('user-manager', UserManager);
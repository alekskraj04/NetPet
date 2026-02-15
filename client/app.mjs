import request from './modules/fetchManager.mjs';

class UserManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.users = []; // Lokal lagring av data for å unngå duplisering
    }

    async connectedCallback() {
        // Bruker relativ URL for å hente UI-malen
        const response = await fetch('./views/UserView.html');
        this.shadowRoot.innerHTML = await response.text();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.shadowRoot.querySelector('#create-btn').onclick = () => this.createUser();
    }

    // 1. CREATE USER
    async createUser() {
        const username = this.shadowRoot.querySelector('#username').value;
        const email = this.shadowRoot.querySelector('#email').value;
        
        // Overholder "single fetch call"-regelen via request-modulen
        try {
            const result = await request('/api/users', 'POST', { username, email, consentToToS: true });
            console.log("User created:", result);
            this.renderUserList(username, email); 
        } catch (error) {
            console.error("Kunne ikke opprette bruker:", error);
        }
    }

    // 2. DELETE USER
    async deleteUser(username) {
        try {
            await request(`/api/users/${username}`, 'DELETE');
            alert(`User ${username} deleted`);
            // Oppdaterer UI ved å fjerne elementet
            this.shadowRoot.querySelector(`#user-${username}`).remove();
        } catch (error) {
            console.error("Sletting feilet:", error);
        }
    }

    // 3. EDIT USER (Dette er det nye punktet du trengte!)
    async editUser(username) {
        const newEmail = prompt(`Oppdater e-post for ${username}:`);
        
        if (newEmail) {
            try {
                // Sender en PUT-forespørsel via fetchManager
                const result = await request(`/api/users/${username}`, 'PUT', { email: newEmail });
                alert("Bruker oppdatert!");
                console.log("Update success:", result);
                
                // Oppdaterer e-postvisningen i UI-en
                this.shadowRoot.querySelector(`#email-${username}`).textContent = newEmail;
            } catch (error) {
                console.error("Redigering feilet:", error);
            }
        }
    }

    renderUserList(username, email) {
        const list = this.shadowRoot.querySelector('#user-list');
        // Legger til en unik ID per bruker-rad så vi enkelt kan slette/redigere
        list.innerHTML += `
            <div class="user-item" id="user-${username}" style="margin-top: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                <span><strong>${username}</strong> (<span id="email-${username}">${email}</span>)</span>
                <div>
                    <button onclick="this.getRootNode().host.editUser('${username}')">Edit</button>
                    <button onclick="this.getRootNode().host.deleteUser('${username}')" style="color: red;">Delete</button>
                </div>
            </div>
        `;
    }
}

customElements.define('user-manager', UserManager);
import request from './modules/fetchManager.mjs';

class UserManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.users = []; // Local storage of data to avoid duplication
    }

    async connectedCallback() {
        // Use relative URL to fetch the UI template
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
        
        // Complies with the "single fetch call" rule via the request module
        try {
            const result = await request('/api/users', 'POST', { username, email, consentToToS: true });
            console.log("User created:", result);
            this.renderUserList(username, email); 
        } catch (error) {
            console.error("Could not create user:", error);
        }
    }

    // 2. DELETE USER
    async deleteUser(username) {
        try {
            await request(`/api/users/${username}`, 'DELETE');
            alert(`User ${username} deleted`);
            // Update UI by removing the element
            this.shadowRoot.querySelector(`#user-${username}`).remove();
        } catch (error) {
            console.error("Deletion failed:", error);
        }
    }

    // 3. EDIT USER 
    async editUser(username) {
        const newEmail = prompt(`Update email for ${username}:`);
        
        if (newEmail) {
            try {
                // Send a PUT request via fetchManager
                const result = await request(`/api/users/${username}`, 'PUT', { email: newEmail });
                alert("User updated!");
                console.log("Update success:", result);
                
                // Update the email display in the UI
                this.shadowRoot.querySelector(`#email-${username}`).textContent = newEmail;
            } catch (error) {
                console.error("Editing failed:", error);
            }
        }
    }

    renderUserList(username, email) {
        const list = this.shadowRoot.querySelector('#user-list');
        // Add a unique ID per user row for easy deletion/editing
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
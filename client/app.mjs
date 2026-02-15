import request from './modules/fetchManager.mjs';

class UserManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // We use this array to simulate a database since we don't have a server yet
        this.users = []; 
    }

    async connectedCallback() {
        // Load the UI template using a relative URL
        const response = await fetch('./views/UserView.html');
        this.shadowRoot.innerHTML = await response.text();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.shadowRoot.querySelector('#create-btn').onclick = () => this.createUser();
    }

    // 1. CREATE USER (Simulated)
    async createUser() {
        const usernameInput = this.shadowRoot.querySelector('#username');
        const emailInput = this.shadowRoot.querySelector('#email');

        if (!usernameInput.value || !emailInput.value) return alert("Please fill in all fields");

        const newUser = { 
            username: usernameInput.value, 
            email: emailInput.value 
        };

        // Here we simulate the API call. 
        // In a real app, we would wait for: await request('/api/users', 'POST', newUser);
        console.log("Simulating API POST request to /api/users...", newUser);
        
        this.users.push(newUser);
        this.renderUserList(newUser.username, newUser.email);

        // Clear inputs
        usernameInput.value = '';
        emailInput.value = '';
    }

    // 2. DELETE USER (Simulated)
    async deleteUser(username) {
        // Simulate: await request(`/api/users/${username}`, 'DELETE');
        console.log(`Simulating API DELETE request for: ${username}`);
        
        this.users = this.users.filter(u => u.username !== username);
        this.shadowRoot.querySelector(`#user-${username}`).remove();
        alert(`User ${username} deleted from local memory`);
    }

    // 3. EDIT USER (Simulated)
    async editUser(username) {
        const newEmail = prompt(`Update email for ${username}:`);
        
        if (newEmail) {
            // Simulate: await request(`/api/users/${username}`, 'PUT', { email: newEmail });
            console.log(`Simulating API PUT request for: ${username}`);
            
            const user = this.users.find(u => u.username === username);
            if (user) user.email = newEmail;

            this.shadowRoot.querySelector(`#email-${username}`).textContent = newEmail;
        }
    }

    renderUserList(username, email) {
        const list = this.shadowRoot.querySelector('#user-list');
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
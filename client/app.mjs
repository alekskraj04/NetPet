import request from './modules/fetchManager.mjs';

class UserManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        // Last inn HTML-malen fra views-mappen (Relative URL-regel overholdt)
        const response = await fetch('./views/UserView.html');
        const html = await response.text();
        this.shadowRoot.innerHTML = html;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const createBtn = this.shadowRoot.querySelector('#create-btn');
        createBtn.addEventListener('click', () => this.createUser());
    }

    async createUser() {
        const username = this.shadowRoot.querySelector('#username').value;
        const email = this.shadowRoot.querySelector('#email').value;

        const userData = { username, email, consentToToS: true };

        try {
            // Bruker vår sentrale fetchManager for å overholde "Single fetch call"-regelen
            const result = await request('/api/users', 'POST', userData);
            alert(result.message);
            console.log("Success:", result);
        } catch (error) {
            alert("Failed to create user");
        }
    }
}

customElements.define('user-manager', UserManager);